import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiMenu, FiPackage, FiShoppingBag, FiUser, FiX, FiLogOut, FiGrid, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { logout } from '../../redux/slices/authSlice';
import SearchBar from './SearchBar';

const ANNOUNCEMENTS = [
  'Free shipping on orders above ₹1,999',
  'Use code WELCOME10 for 10% off your first order',
  'Easy 14-day returns on all full-price styles',
];

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector((s) => s.auth.user);
  const cartCount = useSelector((s) => s.cart.items.reduce((n, i) => n + i.qty, 0));
  const wishCount = useSelector((s) => s.wishlist.ids.length);
  const categories = useSelector((s) => s.admin.categories.filter((c) => c.isActive));
  const [menu, setMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [shopMenu, setShopMenu] = useState(false);
  const [msg, setMsg] = useState(0);

  useEffect(() => { setMenu(false); setUserMenu(false); setShopMenu(false); }, [pathname]);
  useEffect(() => { const t = setInterval(() => setMsg((m) => (m + 1) % ANNOUNCEMENTS.length), 4000); return () => clearInterval(t); }, []);

  const doLogout = () => { dispatch(logout()); toast.success('Signed out'); navigate('/'); };

  return (
    <>
      <div className="announce"><span key={msg}>{ANNOUNCEMENTS[msg]}</span></div>
      <header className="site-header">
        <div className="container hdr-row">
          <button className="icon-btn d-lg-none" onClick={() => setMenu(true)} aria-label="Open menu"><FiMenu /></button>
          <Link to="/" className="logo" aria-label="BRO FUSION home">BRO FUSION</Link>

          <nav className="main-nav d-none d-lg-flex" aria-label="Main">
            <NavLink to="/" end>Home</NavLink>
            <div className="nav-drop" onMouseEnter={() => setShopMenu(true)} onMouseLeave={() => setShopMenu(false)}>
              <NavLink to="/shop" end>Shop</NavLink>
              {shopMenu && (
                <div className="mega">
                  <div>
                    <h6>Categories</h6>
                    {categories.map((c) => <Link key={c.id} to={`/shop?category=${c.slug}`}>{c.name}</Link>)}
                  </div>
                  <div>
                    <h6>Shop by</h6>
                    {/* <Link to="/shop?gender=women">Women</Link>
                    <Link to="/shop?gender=men">Men</Link> */}
                    <Link to="/shop?sort=newest">New Arrivals</Link>
                    <Link to="/shop?sort=popularity">Best Sellers</Link>
                    <Link to="/shop?sale=1">Sale</Link>
                  </div>
                </div>
              )}
            </div>
            {/* <NavLink to="/shop?gender=women">Women</NavLink>
            <NavLink to="/shop?gender=men">Men</NavLink> */}
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          <div className="hdr-search d-none d-md-block"><SearchBar /></div>

          <div className="hdr-icons">
            <div className="user-drop">
              <button className="icon-btn" aria-label="Account" onClick={() => setUserMenu((o) => !o)}><FiUser /></button>
              {userMenu && (
                <div className="user-menu" onMouseLeave={() => setUserMenu(false)}>
                  {user ? (
                    <>
                      <div className="um-head"><b>{user.name}</b><small>{user.email}</small></div>
                      {user.role === 'admin' && <Link to="/admin"><FiGrid /> Admin Panel</Link>}
                      <Link to="/profile"><FiUser /> My Profile</Link>
                      <Link to="/orders"><FiPackage /> My Orders</Link>
                      <Link to="/addresses"><FiMapPin /> Addresses</Link>
                      <button onClick={doLogout}><FiLogOut /> Sign out</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login">Sign in</Link>
                      <Link to="/register">Create account</Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist"><FiHeart />{wishCount > 0 && <span className="count">{wishCount}</span>}</Link>
            <Link to="/cart" className="icon-btn" aria-label="Cart"><FiShoppingBag />{cartCount > 0 && <span className="count">{cartCount}</span>}</Link>
          </div>
        </div>
        <div className="container d-md-none pb-2"><SearchBar /></div>
      </header>

      {menu && <div className="drawer-backdrop" onClick={() => setMenu(false)} />}
      <aside className={`drawer ${menu ? 'open' : ''}`} aria-hidden={!menu}>
        <div className="drawer-head">
          <span className="logo">BRO FUSION</span>
          <button className="icon-btn" onClick={() => setMenu(false)} aria-label="Close menu"><FiX /></button>
        </div>
        <nav className="drawer-nav">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop All</Link>
          {/* <Link to="/shop?gender=women">Women</Link>
          <Link to="/shop?gender=men">Men</Link> */}
          <h6>Categories</h6>
          {categories.map((c) => <Link key={c.id} to={`/shop?category=${c.slug}`}>{c.name}</Link>)}
          <h6>Help</h6>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {user ? <><Link to="/orders">My Orders</Link><button onClick={doLogout}>Sign out</button></> : <Link to="/login">Sign in / Register</Link>}
        </nav>
      </aside>
    </>
  );
}
