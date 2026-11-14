import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { apiDelete, apiGet, apiPost, apiPut, refreshSession, setAccessToken, unwrapFull } from '../../services/api';
import { loadState, saveState } from '../../utils/helpers';
import { STORAGE_KEYS } from '../../utils/constants';
import { loadServerCart, mergeGuestCart, resetCart } from './cartSlice';
import { clearOrders } from './orderSlice';
import { clearAdminData } from './adminSlice';
import { loadServerWishlist, mergeGuestWishlist, resetWishlist } from './wishlistSlice';

// Only a non-sensitive hint is stored locally: whether a session probably exists (avoids a pointless refresh call for guests).
const HINT_KEY = STORAGE_KEYS.auth;
const setHint = (v) => saveState(HINT_KEY, { hasSession: !!v });
const hadSession = () => !!loadState(HINT_KEY, {}).hasSession;

const initialState = {
  user: null,
  initialized: !hadSession(), // when no session hint exists there is nothing to restore
  loading: false,
  error: null,
  customers: [], customersStatus: 'idle', customersPagination: null,
};

const msg = (e) => e?.message || 'Something went wrong';

/** After any successful authentication: pull the server cart/wishlist and merge what the guest collected. */
const hydrateAccount = (dispatch) => Promise.allSettled([dispatch(mergeGuestCart()), dispatch(mergeGuestWishlist())]);

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { dispatch, rejectWithValue }) => {
  if (!hadSession()) return null;
  try {
    const { user } = await refreshSession();
    await Promise.allSettled([dispatch(loadServerCart()), dispatch(loadServerWishlist())]);
    return user;
  } catch (e) {
    setHint(false);
    return rejectWithValue(null);
  }
});

export const loginUser = createAsyncThunk('auth/login', async ({ email, password, adminOnly }, { dispatch, rejectWithValue }) => {
  try {
    const data = await apiPost('/auth/login', { email: email.trim(), password, adminOnly: !!adminOnly });
    setAccessToken(data.accessToken); setHint(true);
    await hydrateAccount(dispatch);
    return data;
  } catch (e) { return rejectWithValue(msg(e)); }
});

export const registerUser = createAsyncThunk('auth/register', async (body, { dispatch, rejectWithValue }) => {
  try {
    const data = await apiPost('/auth/register', body);
    setAccessToken(data.accessToken); setHint(true);
    await hydrateAccount(dispatch);
    return data;
  } catch (e) { return rejectWithValue(msg(e)); }
});

export const forgotPassword = createAsyncThunk('auth/forgot', async ({ email }, { rejectWithValue }) => {
  try { await apiPost('/auth/forgot-password', { email: email.trim() }); return email; } catch (e) { return rejectWithValue(msg(e)); }
});

export const resetPassword = createAsyncThunk('auth/reset', async ({ email, token, password }, { rejectWithValue }) => {
  try { await apiPost('/auth/reset-password', { email, token, password }); return true; } catch (e) { return rejectWithValue(msg(e)); }
});

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try { await api.post('/auth/logout'); } catch { /* the local session is cleared regardless */ }
  setAccessToken(null); setHint(false);
  dispatch(resetCart()); dispatch(resetWishlist()); dispatch(clearOrders()); dispatch(clearAdminData());
});

/** Profile / avatar. Accepts plain fields and an optional `file` (multipart). */
export const updateProfile = createAsyncThunk('auth/updateProfile', async ({ file, ...fields }, { rejectWithValue }) => {
  try {
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v); });
    if (file) form.append('profileImage', file);
    return await apiPut('/users/profile', form);
  } catch (e) { return rejectWithValue(msg(e)); }
});

export const changePassword = createAsyncThunk('auth/changePassword', async ({ currentPassword, newPassword }, { rejectWithValue }) => {
  try {
    const data = await apiPut('/users/change-password', { currentPassword, newPassword });
    setAccessToken(data.accessToken);
    return true;
  } catch (e) { return rejectWithValue(msg(e)); }
});

const addressThunk = (name, fn) => createAsyncThunk(`auth/${name}`, async (arg, { rejectWithValue }) => {
  try { return await fn(arg); } catch (e) { return rejectWithValue(msg(e)); }
});
const cleanAddr = ({ id, _id, ...a }) => a;
export const addAddress = addressThunk('addAddress', (a) => apiPost('/users/addresses', cleanAddr(a)));
export const updateAddress = addressThunk('updateAddress', (a) => apiPut(`/users/addresses/${a.id}`, cleanAddr(a)));
export const deleteAddress = addressThunk('deleteAddress', (id) => apiDelete(`/users/addresses/${id}`));
export const setDefaultAddress = createAsyncThunk('auth/setDefaultAddress', async (id, { getState, rejectWithValue }) => {
  try {
    const a = getState().auth.user.addresses.find((x) => x.id === id);
    return await apiPut(`/users/addresses/${id}`, { ...cleanAddr(a), isDefault: true });
  } catch (e) { return rejectWithValue(msg(e)); }
});

export const fetchCustomers = createAsyncThunk('auth/fetchCustomers', async (params = {}, { rejectWithValue }) => {
  try { const res = await api.get('/users', { params: { limit: 500, ...params } }); return unwrapFull(res); } catch (e) { return rejectWithValue(msg(e)); }
});
export const toggleUserActive = createAsyncThunk('auth/toggleUserActive', async (id, { rejectWithValue }) => {
  try { return await apiPut(`/users/${id}/status`, {}); } catch (e) { return rejectWithValue(msg(e)); }
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) { state.error = null; },
    /** Called by the axios layer when refresh fails: drop the session without another network call. */
    sessionExpired(state) { state.user = null; setHint(false); },
    sessionRefreshed(state, { payload }) { if (payload?.user) state.user = payload.user; },
  },
  extraReducers: (b) => {
    const pending = (s) => { s.loading = true; s.error = null; };
    const authed = (s, { payload }) => { s.loading = false; s.user = payload.user; s.initialized = true; };
    const failed = (s, { payload, error }) => { s.loading = false; s.error = payload || error.message; };
    const setAddresses = (s, { payload }) => { if (s.user) s.user.addresses = payload; };
    b.addCase(bootstrapAuth.fulfilled, (s, { payload }) => { s.user = payload; s.initialized = true; })
      .addCase(bootstrapAuth.rejected, (s) => { s.user = null; s.initialized = true; })
      .addCase(loginUser.pending, pending).addCase(loginUser.fulfilled, authed).addCase(loginUser.rejected, failed)
      .addCase(registerUser.pending, pending).addCase(registerUser.fulfilled, authed).addCase(registerUser.rejected, failed)
      .addCase(forgotPassword.pending, pending).addCase(forgotPassword.fulfilled, (s) => { s.loading = false; }).addCase(forgotPassword.rejected, failed)
      .addCase(resetPassword.pending, pending).addCase(resetPassword.fulfilled, (s) => { s.loading = false; }).addCase(resetPassword.rejected, failed)
      .addCase(logout.fulfilled, (s) => { s.user = null; s.customers = []; })
      .addCase(updateProfile.fulfilled, (s, { payload }) => { s.user = { ...s.user, ...payload }; })
      .addCase(addAddress.fulfilled, setAddresses).addCase(updateAddress.fulfilled, setAddresses)
      .addCase(deleteAddress.fulfilled, setAddresses).addCase(setDefaultAddress.fulfilled, setAddresses)
      .addCase(fetchCustomers.pending, (s) => { s.customersStatus = 'loading'; })
      .addCase(fetchCustomers.fulfilled, (s, { payload }) => { s.customersStatus = 'succeeded'; s.customers = payload.data; s.customersPagination = payload.pagination; })
      .addCase(fetchCustomers.rejected, (s) => { s.customersStatus = 'failed'; })
      .addCase(toggleUserActive.fulfilled, (s, { payload }) => { const i = s.customers.findIndex((u) => u.id === payload.id); if (i >= 0) s.customers[i] = payload; });
  },
});

export const { clearAuthError, sessionExpired, sessionRefreshed } = slice.actions;
export default slice.reducer;
