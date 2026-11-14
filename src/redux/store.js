import { configureStore } from '@reduxjs/toolkit';
import authReducer, { sessionExpired, sessionRefreshed } from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer, { resetCart } from './slices/cartSlice';
import wishlistReducer, { resetWishlist } from './slices/wishlistSlice';
import orderReducer, { clearOrders } from './slices/orderSlice';
import adminReducer from './slices/adminSlice';
import { STORAGE_KEYS } from '../utils/constants';
import { saveState } from '../utils/helpers';
import { setAuthHandlers } from '../services/api';

const store = configureStore({
  reducer: { auth: authReducer, products: productReducer, cart: cartReducer, wishlist: wishlistReducer, orders: orderReducer, admin: adminReducer },
});

// The axios layer tells the store when the session can no longer be refreshed.
setAuthHandlers({
  expired: () => { store.dispatch(sessionExpired()); store.dispatch(resetCart()); store.dispatch(resetWishlist()); store.dispatch(clearOrders()); },
  refreshed: (data) => store.dispatch(sessionRefreshed(data)),
});

/**
 * Local persistence is only for GUEST data (cart + wishlist) so a visitor keeps their bag across reloads.
 * Once signed in, the server owns both and nothing is kept locally (avoids double-merging stale lines).
 */
let prev = {};
store.subscribe(() => {
  const s = store.getState();
  const signedIn = !!s.auth.user;
  if (s.cart !== prev.cart || s.auth.user !== prev.user) saveState(STORAGE_KEYS.cart, signedIn ? { items: [], coupon: null } : { items: s.cart.items, coupon: s.cart.coupon });
  if (s.wishlist !== prev.wishlist || s.auth.user !== prev.user) saveState(STORAGE_KEYS.wishlist, signedIn ? [] : s.wishlist.ids);
  prev = { cart: s.cart, wishlist: s.wishlist, user: s.auth.user };
});

export default store;
