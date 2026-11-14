import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../components/common/Loader';

/** Requires a signed-in admin. Customers are sent to the home page. */
export default function AdminRoute() {
  const { user, initialized } = useSelector((s) => s.auth);
  if (!initialized) return <Loader fullPage />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
