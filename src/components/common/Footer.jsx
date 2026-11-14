import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaPinterestP, FaXTwitter } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="logo logo-light">BRO FUSION</div>
            <p className="foot-about">A modern wardrobe of considered essentials. Quality fabrics, honest prices and timeless silhouettes.</p>
            <div className="socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest"><FaPinterestP /></a>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X"><FaXTwitter /></a>
            </div>
          </div>
          <div className="col-6 col-lg-2">
            <h6>Shop</h6>
            {/* <Link to="/shop?gender=women">Women</Link>
            <Link to="/shop?gender=men">Men</Link> */}
            <Link to="/shop?sort=newest">New Arrivals</Link>
            <Link to="/shop?sale=1">Sale</Link>
          </div>
          <div className="col-6 col-lg-2">
            <h6>Help</h6>
            <Link to="/orders">Track Order</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/contact">Shipping &amp; Returns</Link>
            <Link to="/contact">Size Guide</Link>
          </div>
          <div className="col-6 col-lg-2">
            <h6>Company</h6>
            <Link to="/about">About BRO FUSION</Link>
            <Link to="/profile">My Account</Link>
            <Link to="/admin/login">Admin</Link>
          </div>
          <div className="col-6 col-lg-2">
            <h6>We accept</h6>
            <p className="foot-about mb-1">UPI · Cards · Net Banking</p>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} BRO FUSION. All rights reserved.</span>
          <span>Crafted for a better wardrobe.</span>
        </div>
      </div>
    </footer>
  );
}
