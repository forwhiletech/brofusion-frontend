import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiRefreshCw, FiShield, FiTruck, FiHeadphones } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { collections } from '../../data/staticData';
import { isEmail } from '../../utils/helpers';
import Button from '../../components/common/Button';
import SmartImage from '../../components/common/SmartImage';
import ProductGrid from '../../components/products/ProductGrid';

function Section({ title, subtitle, to, children }) {
  return (
    <section className="section container">
      <div className="section-head">
        <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        {to && <Link to={to} className="link-arrow">View all <FiArrowRight /></Link>}
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const products = useSelector((s) => s.products.items);
  const status = useSelector((s) => s.products.status);
  const categories = useSelector((s) => s.admin.categories.filter((c) => c.isActive));
  const banners = useSelector((s) => s.admin.banners.filter((b) => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder));
  const [slide, setSlide] = useState(0);
  const [email, setEmail] = useState('');
  const loading = status !== 'succeeded';

  useEffect(() => {
    if (banners.length < 2) return undefined;
    const t = setInterval(() => setSlide((s) => (s + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);

  const active = useMemo(() => products.filter((p) => p.isActive), [products]);
  const newArrivals = useMemo(() => [...active].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4), [active]);
  const bestSellers = useMemo(() => [...active].sort((a, b) => b.sold - a.sold).slice(0, 4), [active]);
  const trending = useMemo(() => active.filter((p) => p.isFeatured).slice(0, 4), [active]);
  const hero = banners[slide % Math.max(banners.length, 1)];

  const subscribe = (e) => {
    e.preventDefault();
    if (!isEmail(email)) return toast.error('Please enter a valid email address');
    toast.success('Thanks for subscribing! Check your inbox for 10% off.');
    return setEmail('');
  };

  return (
    <>
      {hero && (
        <section className="hero">
          <SmartImage key={hero.id} src={hero.image} alt="" className="hero-img" loading="eager" />
          <div className="hero-shade" />
          <div className="container hero-inner">
            <span className="eyebrow">New season</span>
            <h1>{hero.title}</h1>
            <p>{hero.subtitle}</p>
            <div className="d-flex gap-3 flex-wrap">
              <Button to={hero.link} variant="light" size="lg">Shop now</Button>
              <Button to="/shop?sort=newest" variant="ghost-light" size="lg">New arrivals</Button>
            </div>
          </div>
          {banners.length > 1 && (
            <div className="hero-ctrl">
              <button onClick={() => setSlide((slide - 1 + banners.length) % banners.length)} aria-label="Previous slide"><FiChevronLeft /></button>
              {banners.map((b, i) => <i key={b.id} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} />)}
              <button onClick={() => setSlide((slide + 1) % banners.length)} aria-label="Next slide"><FiChevronRight /></button>
            </div>
          )}
        </section>
      )}

      <div className="perks container">
        <div><FiTruck /><span><b>Free shipping</b> over ₹1,999</span></div>
        <div><FiRefreshCw /><span><b>14-day</b> easy returns</span></div>
        <div><FiShield /><span><b>Secure</b> payments</span></div>
        <div><FiHeadphones /><span><b>Support</b> 7 days a week</span></div>
      </div>

      <Section title="Shop by Category" subtitle="Find your next favourite piece">
        <div className="cat-grid">
          {categories.map((c) => (
            <Link key={c.id} to={`/shop?category=${c.slug}`} className="cat-tile">
              <SmartImage src={c.image} alt={c.name} />
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="New Arrivals" subtitle="Just landed this week" to="/shop?sort=newest">
        <ProductGrid products={newArrivals} loading={loading} skeletons={4} cols="col-6 col-lg-3" />
      </Section>

      <section className="section container">
        <div className="promo-row">
          <Link to="/shop?sale=1" className="promo promo-dark">
            <span className="eyebrow">Limited time</span><h3>Up to 30% off</h3><p>Linen shirts, dresses &amp; more</p><span className="link-arrow">Shop sale <FiArrowRight /></span>
          </Link>
          <Link to="/shop?gender=men" className="promo promo-sand">
            <span className="eyebrow">Just in</span><h3>men&apos;s edit</h3><p>Fluid silhouettes in soft neutrals</p><span className="link-arrow">Explore <FiArrowRight /></span>
          </Link>
        </div>
      </section>

      <Section title="Best Sellers" subtitle="Our most-loved pieces" to="/shop?sort=popularity">
        <ProductGrid products={bestSellers} loading={loading} skeletons={4} cols="col-6 col-lg-3" />
      </Section>

      <Section title="Featured Collections" subtitle="Curated looks for the season">
        <div className="row g-3 g-md-4">
          {collections.map((c) => (
            <div className="col-md-4" key={c.title}>
              <Link to={c.link} className="collection">
                <SmartImage src={c.image} alt={c.title} />
                <div className="collection-cap"><h4>{c.title}</h4><span>{c.subtitle}</span></div>
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Trending Now" subtitle="What everyone is wearing" to="/shop">
        <ProductGrid products={trending} loading={loading} skeletons={4} cols="col-6 col-lg-3" />
      </Section>

      <section className="newsletter">
        <div className="container">
          <h2>Join the BRO FUSION list</h2>
          <p>Get early access to new drops and 10% off your first order.</p>
          <form onSubmit={subscribe} className="nl-form" noValidate>
            <input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" />
            <Button type="submit" variant="light">Subscribe</Button>
          </form>
        </div>
      </section>
    </>
  );
}
