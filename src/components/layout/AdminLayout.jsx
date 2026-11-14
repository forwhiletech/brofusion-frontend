import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiExternalLink, FiMenu } from 'react-icons/fi';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const user = useSelector((s) => s.auth.user);
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return (
    <div className="admin-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="admin-body">
        <header className="admin-top">
          <button className="icon-btn d-lg-none" onClick={() => setOpen(true)} aria-label="Open sidebar"><FiMenu /></button>
          <div className="ms-auto d-flex align-items-center gap-3">
            <Link to="/" className="admin-visit" target="_blank"><FiExternalLink /> View store</Link>
            <div className="admin-user"><span className="avatar">{user?.name?.[0] || 'A'}</span><span className="d-none d-sm-inline">{user?.name}</span></div>
          </div>
        </header>
        <div className="admin-content"><Outlet /></div>
      </div>
    </div>
  );
}
