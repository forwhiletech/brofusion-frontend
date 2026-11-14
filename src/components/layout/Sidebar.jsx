import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiBarChart2, FiBox, FiFileText, FiGrid, FiImage, FiLogOut, FiPercent, FiPlusSquare, FiShoppingCart, FiTag, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { logout } from '../../redux/slices/authSlice';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: <FiGrid />, end: true },
  { to: '/admin/products', label: 'Products', icon: <FiBox />, end: true },
  { to: '/admin/products/add', label: 'Add Product', icon: <FiPlusSquare /> },
  { to: '/admin/categories', label: 'Categories', icon: <FiTag /> },
  { to: '/admin/orders', label: 'Orders', icon: <FiShoppingCart /> },
  { to: '/admin/customers', label: 'Customers', icon: <FiUsers /> },
  { to: '/admin/coupons', label: 'Coupons', icon: <FiPercent /> },
  { to: '/admin/banners', label: 'Banners', icon: <FiImage /> },
  { to: '/admin/inventory', label: 'Inventory', icon: <FiBarChart2 /> },
  { to: '/admin/reports', label: 'Sales Reports', icon: <FiFileText /> },
];

export default function Sidebar({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const doLogout = () => { dispatch(logout()); toast.success('Signed out'); navigate('/admin/login'); };
  return (
    <>
      {open && <div className="drawer-backdrop d-lg-none" onClick={onClose} />}
      <aside className={`admin-side ${open ? 'open' : ''}`}>
        <div className="admin-logo">BRO FUSION<small>Admin</small></div>
        <nav>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={onClose}>{l.icon}<span>{l.label}</span></NavLink>
          ))}
        </nav>
        <button className="admin-logout" onClick={doLogout}><FiLogOut /><span>Logout</span></button>
      </aside>
    </>
  );
}
