import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { apiGet, apiPost, apiPut, unwrapFull } from '../../services/api';

const initialState = {
  orders: [], status: 'idle', error: null, // the signed-in customer's orders
  admin: [], adminStatus: 'idle', adminError: null, // every order (admin only)
  lastOrderId: null,
};
const msg = (e) => e?.message || 'Something went wrong';

export const fetchMyOrders = createAsyncThunk('orders/fetchMine', async (_, { rejectWithValue }) => {
  try { return await apiGet('/orders/my-orders', { params: { limit: 100 } }); } catch (e) { return rejectWithValue(msg(e)); }
});
export const fetchAdminOrders = createAsyncThunk('orders/fetchAdmin', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/orders', { params: { limit: 500 } }); return unwrapFull(res).data; } catch (e) { return rejectWithValue(msg(e)); }
});
export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try { return await apiGet(`/orders/${id}`); } catch (e) { return rejectWithValue({ message: msg(e), status: e.status }); }
});
/** Server recalculates prices, shipping, tax and coupon; the client only sends what the customer chose. */
export const placeOrder = createAsyncThunk('orders/place', async (body, { rejectWithValue }) => {
  try { return await apiPost('/orders', body); } catch (e) { return rejectWithValue(msg(e)); }
});
export const cancelOrder = createAsyncThunk('orders/cancel', async ({ id }, { rejectWithValue }) => {
  try { return await apiPut(`/orders/${id}/cancel`, {}); } catch (e) { return rejectWithValue(msg(e)); }
});
export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status, note, trackingNumber }, { rejectWithValue }) => {
  try { return await apiPut(`/orders/${id}/status`, { status, ...(note && { note }), ...(trackingNumber && { trackingNumber }) }); } catch (e) { return rejectWithValue(msg(e)); }
});
export const updatePaymentStatus = createAsyncThunk('orders/updatePayment', async ({ id, paymentStatus }, { rejectWithValue }) => {
  try { return await apiPut(`/orders/${id}/payment-status`, { paymentStatus }); } catch (e) { return rejectWithValue(msg(e)); }
});

const upsert = (list, o) => { const i = list.findIndex((x) => x.id === o.id); if (i >= 0) list[i] = o; else list.unshift(o); };
const replaceIfPresent = (list, o) => { const i = list.findIndex((x) => x.id === o.id); if (i >= 0) list[i] = o; };

const slice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    /** Used after a payment verification so every view shows the confirmed order. */
    orderUpdated(state, { payload }) { upsert(state.orders, payload); replaceIfPresent(state.admin, payload); },
    clearOrders(state) { state.orders = []; state.admin = []; state.status = 'idle'; state.adminStatus = 'idle'; state.lastOrderId = null; },
  },
  extraReducers: (b) => {
    const changed = (s, { payload }) => { replaceIfPresent(s.orders, payload); replaceIfPresent(s.admin, payload); };
    b.addCase(fetchMyOrders.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchMyOrders.fulfilled, (s, { payload }) => { s.status = 'succeeded'; s.orders = payload; })
      .addCase(fetchMyOrders.rejected, (s, { payload }) => { s.status = 'failed'; s.error = payload; })
      .addCase(fetchAdminOrders.pending, (s) => { s.adminStatus = 'loading'; s.adminError = null; })
      .addCase(fetchAdminOrders.fulfilled, (s, { payload }) => { s.adminStatus = 'succeeded'; s.admin = payload; })
      .addCase(fetchAdminOrders.rejected, (s, { payload }) => { s.adminStatus = 'failed'; s.adminError = payload; })
      .addCase(fetchOrder.fulfilled, (s, { payload }) => { upsert(s.orders.some((o) => o.id === payload.id) || !s.orders.length || s.orders[0]?.userId === payload.userId ? s.orders : s.admin, payload); })
      .addCase(placeOrder.fulfilled, (s, { payload }) => { upsert(s.orders, payload); s.lastOrderId = payload.id; })
      .addCase(cancelOrder.fulfilled, changed).addCase(updateOrderStatus.fulfilled, changed).addCase(updatePaymentStatus.fulfilled, changed);
  },
});

export const { orderUpdated, clearOrders } = slice.actions;
export default slice.reducer;
