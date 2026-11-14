import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { apiDelete, apiGet, apiPatch, apiPost, apiPut, unwrapFull } from '../../services/api';
import { productToFormData } from '../../services/formData';

const initialState = {
  items: [], status: 'idle', error: null, // public catalogue (active products) - used for facets, home, search suggestions
  adminItems: [], adminStatus: 'idle', // every product incl. hidden ones, admin only
  shop: { items: [], pagination: null, status: 'idle', error: null },
  reviews: {}, // productId -> { items, status }
};
const msg = (e) => e?.message || 'Something went wrong';

export const fetchProducts = createAsyncThunk('products/fetch', async (_, { rejectWithValue }) => {
  try { return await apiGet('/products', { params: { limit: 200 } }); } catch (e) { return rejectWithValue(msg(e)); }
});

export const fetchAdminProducts = createAsyncThunk('products/fetchAdmin', async (_, { rejectWithValue }) => {
  try { return await apiGet('/products', { params: { limit: 200, includeInactive: true } }); } catch (e) { return rejectWithValue(msg(e)); }
});

export const fetchShop = createAsyncThunk('products/fetchShop', async (params, { rejectWithValue, signal }) => {
  try { const res = await api.get('/products', { params, signal }); return unwrapFull(res); } catch (e) { return rejectWithValue(msg(e)); }
});

export const fetchProductBySlug = createAsyncThunk('products/fetchBySlug', async (slug, { rejectWithValue }) => {
  try { return await apiGet(`/products/slug/${encodeURIComponent(slug)}`); } catch (e) { return rejectWithValue({ message: msg(e), status: e.status }); }
});

export const fetchReviews = createAsyncThunk('products/fetchReviews', async (productId, { rejectWithValue }) => {
  try { return { productId, items: await apiGet(`/reviews/product/${productId}`, { params: { limit: 50 } }) }; } catch (e) { return rejectWithValue(msg(e)); }
});

export const addReview = createAsyncThunk('products/addReview', async ({ productId, rating, title, comment, files = [] }, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append('productId', productId); f.append('rating', rating); f.append('title', title || ''); f.append('comment', comment);
    files.forEach((file) => f.append('images', file));
    return { productId, review: await apiPost('/reviews', f) };
  } catch (e) { return rejectWithValue(msg(e)); }
});

export const createProduct = createAsyncThunk('products/create', async (data, { rejectWithValue }) => {
  try { return await apiPost('/products', productToFormData(data)); } catch (e) { return rejectWithValue(msg(e)); }
});
export const updateProduct = createAsyncThunk('products/update', async ({ id, ...data }, { rejectWithValue }) => {
  try { return await apiPut(`/products/${id}`, productToFormData(data, { isUpdate: true })); } catch (e) { return rejectWithValue(msg(e)); }
});
export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try { await apiDelete(`/products/${id}`); return id; } catch (e) { return rejectWithValue(msg(e)); }
});
export const toggleProductActive = createAsyncThunk('products/toggleActive', async (id, { getState, rejectWithValue }) => {
  try {
    const p = getState().products.adminItems.find((x) => x.id === id);
    return await apiPut(`/products/${id}`, { isActive: !p.isActive });
  } catch (e) { return rejectWithValue(msg(e)); }
});
export const setVariantStock = createAsyncThunk('products/setStock', async ({ productId, sku, stock }, { rejectWithValue }) => {
  try { return await apiPatch(`/products/${productId}/variants/${encodeURIComponent(sku)}/stock`, { stock: Number(stock) }); } catch (e) { return rejectWithValue(msg(e)); }
});

const upsert = (list, p) => { const i = list.findIndex((x) => x.id === p.id); if (i >= 0) list[i] = p; else list.unshift(p); };
const publicOnly = (list, p) => { if (p.isActive) upsert(list, p); else { const i = list.findIndex((x) => x.id === p.id); if (i >= 0) list.splice(i, 1); } };

const slice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    const saved = (s, { payload }) => { upsert(s.adminItems, payload); publicOnly(s.items, payload); };
    b.addCase(fetchProducts.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, { payload }) => { s.status = 'succeeded'; s.items = payload; })
      .addCase(fetchProducts.rejected, (s, { payload, error }) => { s.status = 'failed'; s.error = payload || error.message; })
      .addCase(fetchAdminProducts.pending, (s) => { s.adminStatus = 'loading'; })
      .addCase(fetchAdminProducts.fulfilled, (s, { payload }) => { s.adminStatus = 'succeeded'; s.adminItems = payload; })
      .addCase(fetchAdminProducts.rejected, (s) => { s.adminStatus = 'failed'; })
      .addCase(fetchShop.pending, (s) => { s.shop.status = 'loading'; s.shop.error = null; })
      .addCase(fetchShop.fulfilled, (s, { payload }) => { s.shop = { items: payload.data, pagination: payload.pagination, status: 'succeeded', error: null }; })
      .addCase(fetchShop.rejected, (s, { payload, meta }) => { if (meta.aborted) return; s.shop.status = 'failed'; s.shop.error = payload || 'Could not load products'; })
      .addCase(fetchProductBySlug.fulfilled, (s, { payload }) => { if (!s.items.some((p) => p.id === payload.id)) s.items.push(payload); })
      .addCase(fetchReviews.pending, (s, { meta }) => { s.reviews[meta.arg] = { items: s.reviews[meta.arg]?.items || [], status: 'loading' }; })
      .addCase(fetchReviews.fulfilled, (s, { payload }) => { s.reviews[payload.productId] = { items: payload.items, status: 'succeeded' }; })
      .addCase(fetchReviews.rejected, (s, { meta }) => { s.reviews[meta.arg] = { items: [], status: 'failed' }; })
      .addCase(addReview.fulfilled, (s, { payload }) => {
        const cur = s.reviews[payload.productId] || { items: [], status: 'succeeded' };
        s.reviews[payload.productId] = { ...cur, items: [payload.review, ...cur.items] };
      })
      .addCase(createProduct.fulfilled, saved).addCase(updateProduct.fulfilled, saved)
      .addCase(toggleProductActive.fulfilled, saved).addCase(setVariantStock.fulfilled, saved)
      .addCase(deleteProduct.fulfilled, (s, { payload }) => { s.adminItems = s.adminItems.filter((p) => p.id !== payload); s.items = s.items.filter((p) => p.id !== payload); });
  },
});

export default slice.reducer;
