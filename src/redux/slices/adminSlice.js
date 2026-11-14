import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiDelete, apiGet, apiPost, apiPut } from '../../services/api';
import { entityToFormData } from '../../services/formData';

const initialState = {
  categories: [], banners: [], coupons: [],
  catalogStatus: 'idle', // categories + banners (public data, loaded on app start)
  couponStatus: 'idle',
  dashboard: null, dashboardStatus: 'idle', dashboardError: null,
  sales: null, salesStatus: 'idle', salesError: null,
  inventory: null, inventoryStatus: 'idle',
};
const msg = (e) => e?.message || 'Something went wrong';
const guard = (fn) => async (arg, { rejectWithValue }) => { try { return await fn(arg); } catch (e) { return rejectWithValue(msg(e)); } };

/* ---- storefront data: active only; admin screens pass all=true to also get hidden ones ---- */
export const fetchCategories = createAsyncThunk('admin/fetchCategories', guard((all) => apiGet('/categories', { params: all ? { all: true } : {} })));
export const fetchBanners = createAsyncThunk('admin/fetchBanners', guard((all) => apiGet('/banners', { params: all ? { all: true } : {} })));
export const fetchCoupons = createAsyncThunk('admin/fetchCoupons', guard(() => apiGet('/coupons')));

export const saveCategory = createAsyncThunk('admin/saveCategory', guard((c) => {
  const form = entityToFormData(c, ['name', 'description', 'isActive']);
  return c.id ? apiPut(`/categories/${c.id}`, form) : apiPost('/categories', form);
}));
export const deleteCategory = createAsyncThunk('admin/deleteCategory', guard(async (id) => { await apiDelete(`/categories/${id}`); return id; }));

export const saveBanner = createAsyncThunk('admin/saveBanner', guard((x) => {
  const form = entityToFormData(x, ['title', 'subtitle', 'link', 'displayOrder', 'isActive']);
  return x.id ? apiPut(`/banners/${x.id}`, form) : apiPost('/banners', form);
}));
export const deleteBanner = createAsyncThunk('admin/deleteBanner', guard(async (id) => { await apiDelete(`/banners/${id}`); return id; }));

export const saveCoupon = createAsyncThunk('admin/saveCoupon', guard((c) => {
  const body = { code: c.code, discountType: c.discountType, discountValue: c.discountValue, minimumOrderAmount: c.minimumOrderAmount, maximumDiscount: c.maximumDiscount, startDate: c.startDate, expiryDate: c.expiryDate, usageLimit: c.usageLimit, isActive: c.isActive };
  return c.id ? apiPut(`/coupons/${c.id}`, body) : apiPost('/coupons', body);
}));
export const deleteCoupon = createAsyncThunk('admin/deleteCoupon', guard(async (id) => { await apiDelete(`/coupons/${id}`); return id; }));

/** Flip isActive on a category / banner / coupon. */
export const toggleActive = createAsyncThunk('admin/toggleActive', async ({ list, id }, { getState, rejectWithValue }) => {
  try {
    const item = getState().admin[list].find((x) => x.id === id);
    const path = { categories: 'categories', banners: 'banners', coupons: 'coupons' }[list];
    const updated = await apiPut(`/${path}/${id}`, { isActive: !item.isActive });
    return { list, updated };
  } catch (e) { return rejectWithValue(msg(e)); }
});

export const fetchDashboard = createAsyncThunk('admin/fetchDashboard', guard(() => apiGet('/admin/dashboard')));
export const fetchSalesReport = createAsyncThunk('admin/fetchSales', guard((range = '30') => apiGet('/admin/sales-report', { params: { range } })));
export const fetchInventory = createAsyncThunk('admin/fetchInventory', guard(() => apiGet('/admin/inventory-report')));

const upsert = (list, item) => { const i = list.findIndex((x) => x.id === item.id); if (i >= 0) list[i] = item; else list.push(item); };

const slice = createSlice({
  name: 'admin',
  initialState,
  reducers: { clearAdminData(state) { state.coupons = []; state.couponStatus = 'idle'; state.dashboard = null; state.sales = null; state.inventory = null; } },
  extraReducers: (b) => {
    b.addCase(fetchCategories.fulfilled, (s, { payload }) => { s.categories = payload; s.catalogStatus = 'succeeded'; })
      .addCase(fetchCategories.rejected, (s) => { s.catalogStatus = 'failed'; })
      .addCase(fetchBanners.fulfilled, (s, { payload }) => { s.banners = payload; })
      .addCase(fetchCoupons.pending, (s) => { s.couponStatus = 'loading'; })
      .addCase(fetchCoupons.fulfilled, (s, { payload }) => { s.coupons = payload; s.couponStatus = 'succeeded'; })
      .addCase(fetchCoupons.rejected, (s) => { s.couponStatus = 'failed'; })
      .addCase(saveCategory.fulfilled, (s, { payload }) => upsert(s.categories, payload))
      .addCase(deleteCategory.fulfilled, (s, { payload }) => { s.categories = s.categories.filter((c) => c.id !== payload); })
      .addCase(saveBanner.fulfilled, (s, { payload }) => upsert(s.banners, payload))
      .addCase(deleteBanner.fulfilled, (s, { payload }) => { s.banners = s.banners.filter((x) => x.id !== payload); })
      .addCase(saveCoupon.fulfilled, (s, { payload }) => upsert(s.coupons, payload))
      .addCase(deleteCoupon.fulfilled, (s, { payload }) => { s.coupons = s.coupons.filter((x) => x.id !== payload); })
      .addCase(toggleActive.fulfilled, (s, { payload }) => upsert(s[payload.list], payload.updated))
      .addCase(fetchDashboard.pending, (s) => { s.dashboardStatus = 'loading'; s.dashboardError = null; })
      .addCase(fetchDashboard.fulfilled, (s, { payload }) => { s.dashboard = payload; s.dashboardStatus = 'succeeded'; })
      .addCase(fetchDashboard.rejected, (s, { payload }) => { s.dashboardStatus = 'failed'; s.dashboardError = payload; })
      .addCase(fetchSalesReport.pending, (s) => { s.salesStatus = 'loading'; s.salesError = null; })
      .addCase(fetchSalesReport.fulfilled, (s, { payload }) => { s.sales = payload; s.salesStatus = 'succeeded'; })
      .addCase(fetchSalesReport.rejected, (s, { payload }) => { s.salesStatus = 'failed'; s.salesError = payload; })
      .addCase(fetchInventory.pending, (s) => { s.inventoryStatus = 'loading'; })
      .addCase(fetchInventory.fulfilled, (s, { payload }) => { s.inventory = payload; s.inventoryStatus = 'succeeded'; })
      .addCase(fetchInventory.rejected, (s) => { s.inventoryStatus = 'failed'; });
  },
});

export const { clearAdminData } = slice.actions;
export default slice.reducer;
