import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';

export default function MainLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main"><Outlet /></main>
      <Footer />
    </div>
  );
}
