import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../components/common/Loader';

/** Requires a signed-in user; remembers where they were headed. */
export default function ProtectedRoute() {
  const { user, initialized } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!initialized) return <Loader fullPage />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}
