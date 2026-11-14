import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { apiDelete, apiGet, apiPost } from '../../services/api';
import { STORAGE_KEYS } from '../../utils/constants';
import { loadState } from '../../utils/helpers';

const slice = createSlice({
  name: 'wishlist',
  initialState: { ids: loadState(STORAGE_KEYS.wishlist, []), items: [] },
  reducers: {
    guestToggle(state, { payload }) { state.ids = state.ids.includes(payload) ? state.ids.filter((i) => i !== payload) : [...state.ids, payload]; },
    guestRemove(state, { payload }) { state.ids = state.ids.filter((i) => i !== payload); },
    setWishlist(state, { payload }) { state.items = payload; state.ids = payload.map((p) => p.id); },
    resetWishlist(state) { state.ids = []; state.items = []; },
  },
});

export const { resetWishlist } = slice.actions;
const { guestToggle, guestRemove, setWishlist } = slice.actions;
const isAuthed = (getState) => !!getState().auth.user;

export const loadServerWishlist = createAsyncThunk('wishlist/load', async (_, { dispatch }) => { dispatch(setWishlist(await apiGet('/wishlist'))); });

export const mergeGuestWishlist = createAsyncThunk('wishlist/merge', async (_, { getState, dispatch }) => {
  const ids = getState().wishlist.ids;
  if (!ids.length) return dispatch(loadServerWishlist());
  dispatch(setWishlist(await apiPost('/wishlist/merge', { productIds: ids })));
  return null;
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { getState, dispatch }) => {
  if (!isAuthed(getState)) { dispatch(guestToggle(productId)); return true; }
  try {
    const has = getState().wishlist.ids.includes(productId);
    dispatch(setWishlist(has ? await apiDelete(`/wishlist/${productId}`) : await apiPost('/wishlist', { productId })));
    return true;
  } catch (e) { toast.error(e.message); return false; }
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, { getState, dispatch }) => {
  if (!isAuthed(getState)) { dispatch(guestRemove(productId)); return true; }
  try { dispatch(setWishlist(await apiDelete(`/wishlist/${productId}`))); return true; } catch (e) { toast.error(e.message); return false; }
});

export default slice.reducer;
