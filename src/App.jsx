import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { fetchProducts } from './redux/slices/productSlice';
import { fetchBanners, fetchCategories } from './redux/slices/adminSlice';
import { bootstrapAuth } from './redux/slices/authSlice';

export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(bootstrapAuth()); // restore the session from the refresh cookie (if any)
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchBanners());
  }, [dispatch]);
  return <AppRoutes />;
}
