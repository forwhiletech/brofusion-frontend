import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { apiDelete, apiGet, apiPost, apiPut } from '../../services/api';
import { STORAGE_KEYS } from '../../utils/constants';
import { loadState } from '../../utils/helpers';

const saved = loadState(STORAGE_KEYS.cart, {});
const initialState = { items: saved.items || [], coupon: saved.coupon || null, syncing: false, loaded: false };
export const cartKey = (productId, size, color) => `${productId}__${size}__${color}`;
const isAuthed = (getState) => !!getState().auth.user;

/**
 * Cart works in two modes:
 *  - guest: lines live in Redux/localStorage only
 *  - signed in: the server cart is the source of truth (prices and stock are always current)
 */
const guest = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    guestAdd(state, { payload }) {
      const key = cartKey(payload.productId, payload.size, payload.color);
      const existing = state.items.find((i) => i.key === key);
      if (existing) existing.qty = Math.min(existing.qty + payload.qty, payload.stock);
      else state.items.push({ ...payload, key, qty: Math.min(payload.qty, payload.stock) });
    },
    guestQty(state, { payload: { key, qty } }) {
      const item = state.items.find((i) => i.key === key);
      if (item) item.qty = Math.max(1, Math.min(qty, item.stock));
    },
    guestRemove(state, { payload }) { state.items = state.items.filter((i) => i.key !== payload); },
    setItems(state, { payload }) { state.items = payload; state.loaded = true; },
    applyCoupon(state, { payload }) { state.coupon = payload; },
    removeCoupon(state) { state.coupon = null; },
    resetCart(state) { state.items = []; state.coupon = null; state.loaded = false; },
    clearLocalCart(state) { state.items = []; state.coupon = null; },
  },
});

export const { applyCoupon, removeCoupon, resetCart, clearLocalCart } = guest.actions;
const { guestAdd, guestQty, guestRemove, setItems } = guest.actions;

const fail = (e) => { toast.error(e.message); return false; };

export const loadServerCart = createAsyncThunk('cart/load', async (_, { dispatch }) => {
  const data = await apiGet('/cart');
  dispatch(setItems(data.items));
});

export const mergeGuestCart = createAsyncThunk('cart/merge', async (_, { getState, dispatch }) => {
  const lines = getState().cart.items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, quantity: i.qty }));
  if (!lines.length) { await dispatch(loadServerCart()); return; }
  const res = await apiPost('/cart/merge', { items: lines });
  dispatch(setItems(res.items));
  if (res.skipped?.length) toast.info(`${res.skipped.length} item(s) from your bag are no longer available`);
});

/** payload: { productId, name, slug, image, price, mrp, size, color, qty, stock, sku } */
export const addToCart = createAsyncThunk('cart/add', async (payload, { getState, dispatch }) => {
  if (!isAuthed(getState)) { dispatch(guestAdd(payload)); return true; }
  try {
    const data = await apiPost('/cart', { productId: payload.productId, size: payload.size, color: payload.color, quantity: payload.qty });
    dispatch(setItems(data.items));
    return true;
  } catch (e) { return fail(e); }
});

export const updateQty = createAsyncThunk('cart/updateQty', async ({ key, qty }, { getState, dispatch }) => {
  if (!isAuthed(getState)) { dispatch(guestQty({ key, qty })); return true; }
  const item = getState().cart.items.find((i) => i.key === key);
  if (!item?.id) return false;
  try {
    const data = await apiPut(`/cart/${item.id}`, { quantity: Math.max(1, qty) });
    dispatch(setItems(data.items));
    return true;
  } catch (e) { return fail(e); }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (key, { getState, dispatch }) => {
  if (!isAuthed(getState)) { dispatch(guestRemove(key)); return true; }
  const item = getState().cart.items.find((i) => i.key === key);
  if (!item?.id) return false;
  try {
    const data = await apiDelete(`/cart/${item.id}`);
    dispatch(setItems(data.items));
    return true;
  } catch (e) { return fail(e); }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { getState, dispatch }) => {
  if (isAuthed(getState)) { try { await apiDelete('/cart'); } catch (e) { return fail(e); } }
  dispatch(clearLocalCart());
  return true;
});

export const validateCoupon = createAsyncThunk('cart/validateCoupon', async (code, { getState, dispatch, rejectWithValue }) => {
  const subtotal = getState().cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  try {
    const data = await apiPost('/coupons/validate', { code, subtotal });
    dispatch(applyCoupon(data.coupon));
    return data;
  } catch (e) { return rejectWithValue(e.message); }
});

export default guest.reducer;
