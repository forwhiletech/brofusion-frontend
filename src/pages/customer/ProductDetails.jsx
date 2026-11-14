import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiMinus, FiPlus, FiRefreshCw, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { addReview, fetchProducts, fetchProductBySlug, fetchReviews } from '../../redux/slices/productSlice';
import { discountPercent, effectivePrice, formatDate, formatPrice } from '../../utils/helpers';
import Breadcrumb from '../../components/common/Breadcrumb';
import Rating from '../../components/common/Rating';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import ProductGallery from '../../components/products/ProductGallery';
import SizeSelector from '../../components/products/SizeSelector';
import ColorSelector from '../../components/products/ColorSelector';
import ProductGrid from '../../components/products/ProductGrid';

export default function ProductDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, status, reviews: reviewMap } = useSelector((s) => s.products);
  const user = useSelector((s) => s.auth.user);
  const categories = useSelector((s) => s.admin.categories);
  const product = products.find((p) => p.slug === slug);
  const wished = useSelector((s) => (product ? s.wishlist.ids.includes(product.id) : false));

  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [review, setReview] = useState({ rating: 0, title: '', comment: '' });
  const [errors, setErrors] = useState({});
  const [lookup, setLookup] = useState('idle'); // direct fetch when the product is not in the cached catalogue
  const [adding, setAdding] = useState(false);
  const [posting, setPosting] = useState(false);
  const productId = product?.id;

  useEffect(() => {
    if (status === 'succeeded' && !product && lookup === 'idle') {
      setLookup('loading');
      dispatch(fetchProductBySlug(slug)).finally(() => setLookup('done'));
    }
  }, [status, product, lookup, slug, dispatch]);
  useEffect(() => { setLookup('idle'); setSize(''); setColor(''); setQty(1); }, [slug]);
  useEffect(() => { if (productId) dispatch(fetchReviews(productId)); }, [productId, dispatch]);

  const variant = product?.variants.find((v) => v.size === size && v.color === color);
  const stock = variant ? variant.stock : null;
  const related = useMemo(() => (product ? products.filter((p) => p.isActive && p.category === product.category && p.id !== product.id).slice(0, 4) : []), [products, product]);
  const reviewState = (product && reviewMap[product.id]) || { items: [], status: 'idle' };
  const reviews = reviewState.items;

  if (status === 'loading' || status === 'idle' || (!product && lookup !== 'done')) return <Loader fullPage />;
  if (status === 'failed' && !product) return <div className="container page-pad"><EmptyState title="Could not load this product" message="Please check your connection and try again." actionText="Retry" onAction={() => dispatch(fetchProducts())} /></div>;
  if (!product) return <div className="container page-pad"><EmptyState title="Product not found" message="This product may have been removed." actionText="Back to shop" actionTo="/shop" /></div>;

  const off = discountPercent(product);
  const price = effectivePrice(product);
  const categoryName = categories.find((c) => c.slug === product.category)?.name || product.category;
  const sizeAvailable = (s) => product.variants.some((v) => v.size === s && (!color || v.color === color) && v.stock > 0);
  const totalStock = product.variants.reduce((n, v) => n + v.stock, 0);

  const validate = () => {
    const err = {};
    if (!size) err.size = 'Please select a size';
    if (!color) err.color = 'Please select a colour';
    setErrors(err);
    if (Object.keys(err).length) { toast.error(err.size || err.color); return false; }
    if (!variant || variant.stock < 1) { toast.error('This combination is out of stock'); return false; }
    return true;
  };

  const add = async (goCheckout = false) => {
    if (!validate() || adding) return;
    setAdding(true);
    const res = await dispatch(addToCart({ productId: product.id, sku: variant.sku, name: product.name, slug: product.slug, image: product.images[0], price, mrp: product.price, size, color, qty, stock: variant.stock }));
    setAdding(false);
    if (!res.payload) return; // the thunk already showed the error
    if (goCheckout) navigate('/checkout');
    else toast.success('Added to cart', { onClick: () => navigate('/cart') });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.info('Please sign in to write a review'); navigate('/login', { state: { from: `/product/${slug}` } }); return; }
    if (!review.rating) return toast.error('Please select a rating');
    if (review.comment.trim().length < 10) return toast.error('Review must be at least 10 characters');
    setPosting(true);
    const res = await dispatch(addReview({ productId: product.id, ...review }));
    setPosting(false);
    if (addReview.rejected.match(res)) return toast.error(res.payload || 'Could not submit your review');
    setReview({ rating: 0, title: '', comment: '' });
    return toast.success('Thanks for your review!');
  };

  return (
    <div className="container page-pad">
      <Breadcrumb items={[{ label: 'Shop', to: '/shop' }, { label: categoryName, to: `/shop?category=${product.category}` }, { label: product.name }]} />
      <div className="row g-4 g-xl-5">
        <div className="col-lg-7"><ProductGallery images={product.images} name={product.name} /></div>
        <div className="col-lg-5">
          <div className="pd-info">
            <div className="pc-brand">{product.brand}</div>
            <h1>{product.name}</h1>
            <div className="d-flex align-items-center gap-2 mb-3">
              <Rating value={product.averageRating} count={product.reviewCount} size={15} />
              <a href="#reviews" onClick={() => setTab('reviews')} className="small text-muted">Read reviews</a>
            </div>
            <div className="pd-price"><b>{formatPrice(price)}</b>{off > 0 && <><s>{formatPrice(product.price)}</s><span className="tag tag-accent">{off}% OFF</span></>}</div>
            <small className="text-muted">Inclusive of all taxes</small>

            <div className="pd-opt">
              <div className="pd-label">Colour{color && <span>: {color}</span>}</div>
              <ColorSelector colors={product.colors} selected={color} onSelect={(c) => { setColor(c); setErrors((e) => ({ ...e, color: '' })); if (size && !product.variants.some((v) => v.size === size && v.color === c && v.stock > 0)) setSize(''); }} />
              {errors.color && <div className="field-err">{errors.color}</div>}
            </div>
            <div className="pd-opt">
              <div className="pd-label">Size{size && <span>: {size}</span>}</div>
              <SizeSelector sizes={product.sizes} selected={size} onSelect={(s) => { setSize(s); setErrors((e) => ({ ...e, size: '' })); }} isAvailable={sizeAvailable} />
              {errors.size && <div className="field-err">{errors.size}</div>}
            </div>

            <div className="pd-stock">
              {totalStock === 0 ? <span className="text-danger">Out of stock</span>
                : stock === null ? <span className="text-muted">Select size and colour to see availability</span>
                  : stock === 0 ? <span className="text-danger">Out of stock in this size/colour</span>
                    : stock <= 5 ? <span className="text-warning-emphasis">Only {stock} left - order soon</span> : <span className="text-success">In stock</span>}
            </div>

            <div className="pd-actions">
              <div className="qty qty-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} aria-label="Decrease quantity"><FiMinus /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(stock || 10, qty + 1))} disabled={qty >= (stock || 10)} aria-label="Increase quantity"><FiPlus /></button>
              </div>
              <Button size="lg" className="flex-grow-1" onClick={() => add(false)} disabled={totalStock === 0}><FiShoppingBag /> Add to cart</Button>
              <button className={`wish-lg ${wished ? 'on' : ''}`} aria-label="Toggle wishlist" onClick={() => dispatch(toggleWishlist(product.id)).then((r) => r.payload && toast.info(wished ? 'Removed from wishlist' : 'Added to wishlist'))}>{wished ? <FaHeart /> : <FiHeart />}</button>
            </div>
            <Button variant="outline" size="lg" block onClick={() => add(true)} disabled={totalStock === 0}>Buy now</Button>

            <ul className="pd-perks">
              <li><FiTruck /> Free shipping on orders above ₹1,999</li>
              <li><FiRefreshCw /> 14-day easy returns &amp; exchanges</li>
            </ul>
            <div className="pd-meta">Category: <Link to={`/shop?category=${product.category}`}>{categoryName}</Link>{variant && <> · SKU: {variant.sku}</>}</div>
          </div>
        </div>
      </div>

      <section className="pd-tabs" id="reviews">
        <div className="tabs-v" role="tablist">
          <button role="tab" aria-selected={tab === 'description'} className={tab === 'description' ? 'on' : ''} onClick={() => setTab('description')}>Description</button>
          <button role="tab" aria-selected={tab === 'reviews'} className={tab === 'reviews' ? 'on' : ''} onClick={() => setTab('reviews')}>Reviews ({Math.max(product.reviewCount, reviews.length)})</button>
        </div>
        {tab === 'description' ? (
          <div className="tab-body"><p>{product.description}</p><ul><li>Gender: <span className="text-capitalize">{product.gender}</span></li><li>Fabric care: machine wash cold, do not bleach</li>{product.tags.length > 0 && <li>Tags: {product.tags.join(', ')}</li>}</ul></div>
        ) : (
          <div className="tab-body row g-4">
            <div className="col-lg-7">
              {reviewState.status === 'loading' && !reviews.length && <Loader />}
              {reviewState.status === 'failed' && <p className="text-muted">Could not load reviews.</p>}
              {reviewState.status === 'succeeded' && !reviews.length && <p className="text-muted">No reviews yet. Be the first to share your thoughts.</p>}
              {reviews.map((r) => (
                <div className="review" key={r.id}>
                  <div className="d-flex justify-content-between"><b>{r.user?.name || 'Customer'}{r.verifiedPurchase && <small className="text-success ms-2">Verified purchase</small>}</b><small className="text-muted">{formatDate(r.createdAt)}</small></div>
                  <Rating value={r.rating} size={13} />
                  {r.title && <h6 className="mt-2 mb-1">{r.title}</h6>}
                  <p className="mb-0">{r.comment}</p>
                </div>
              ))}
            </div>
            <div className="col-lg-5">
              <form className="review-form" onSubmit={submitReview} noValidate>
                <h6>Write a review</h6>
                <Rating value={review.rating} size={22} onChange={(r) => setReview({ ...review, rating: r })} />
                <input placeholder="Title (optional)" value={review.title} onChange={(e) => setReview({ ...review, title: e.target.value })} />
                <textarea rows={4} placeholder="Share your experience with this product" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
                <Button type="submit" loading={posting}>Submit review</Button>
              </form>
            </div>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>You may also like</h2></div>
          <ProductGrid products={related} cols="col-6 col-lg-3" />
        </section>
      )}
    </div>
  );
}
