import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { loadServerWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { discountPercent, effectivePrice, formatPrice, productStock } from '../../utils/helpers';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import SmartImage from '../../components/common/SmartImage';
import SizeSelector from '../../components/products/SizeSelector';
import ColorSelector from '../../components/products/ColorSelector';

export default function Wishlist() {
  const dispatch = useDispatch();
  const ids = useSelector((s) => s.wishlist.ids);
  const user = useSelector((s) => s.auth.user);
  const serverItems = useSelector((s) => s.wishlist.items);
  const catalogue = useSelector((s) => s.products.items);
  const products = user ? serverItems : catalogue.filter((p) => ids.includes(p.id));
  useEffect(() => { if (user) dispatch(loadServerWishlist()); }, [user, dispatch]);
  const [pick, setPick] = useState(null); // product being moved to cart
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');

  const open = (p) => { setPick(p); setSize(''); setColor(''); };
  const variant = pick?.variants.find((v) => v.size === size && v.color === color);

  const move = async () => {
    if (!size || !color) return toast.error('Please select a size and colour');
    if (!variant || variant.stock < 1) return toast.error('This combination is out of stock');
    const res = await dispatch(addToCart({ productId: pick.id, sku: variant.sku, name: pick.name, slug: pick.slug, image: pick.images[0], price: effectivePrice(pick), mrp: pick.price, size, color, qty: 1, stock: variant.stock }));
    if (!res.payload) return null;
    await dispatch(removeFromWishlist(pick.id));
    toast.success('Moved to cart');
    return setPick(null);
  };

  if (!products.length) {
    return <div className="container page-pad"><EmptyState icon={<FiHeart />} title="Your wishlist is empty" message="Tap the heart on any product to save it here." actionText="Discover products" actionTo="/shop" /></div>;
  }
  return (
    <div className="container page-pad">
      <Breadcrumb items={[{ label: 'Wishlist' }]} />
      <h1 className="page-title">My Wishlist <small>({products.length})</small></h1>
      <div className="row g-3 g-md-4">
        {products.map((p) => {
          const stock = productStock(p);
          const off = discountPercent(p);
          return (
            <div className="col-6 col-md-4 col-xl-3" key={p.id}>
              <article className="pc">
                <Link to={`/product/${p.slug}`} className="pc-media"><SmartImage src={p.images[0]} alt={p.name} className="pc-img" /></Link>
                <button className="pc-wish on" aria-label="Remove from wishlist" onClick={() => dispatch(removeFromWishlist(p.id)).then((r) => r.payload && toast.info('Removed from wishlist'))}><FiX /></button>
                <div className="pc-body">
                  <div className="pc-brand">{p.brand}</div>
                  <Link to={`/product/${p.slug}`} className="pc-name">{p.name}</Link>
                  <div className="pc-price"><b>{formatPrice(effectivePrice(p))}</b>{off > 0 && <s>{formatPrice(p.price)}</s>}</div>
                  <div className={`small mb-2 ${stock ? 'text-success' : 'text-danger'}`}>{stock ? 'In stock' : 'Out of stock'}</div>
                  <Button block size="sm" disabled={!stock} onClick={() => open(p)}><FiShoppingBag /> Move to cart</Button>
                </div>
              </article>
            </div>
          );
        })}
      </div>
      <Modal show={!!pick} onClose={() => setPick(null)} title={pick ? `Select options · ${pick.name}` : ''} size="sm"
        footer={<><Button variant="outline" onClick={() => setPick(null)}>Cancel</Button><Button onClick={move}>Move to cart</Button></>}>
        {pick && (
          <>
            <div className="pd-label">Colour{color && <span>: {color}</span>}</div>
            <ColorSelector colors={pick.colors} selected={color} onSelect={(c) => { setColor(c); if (size && !pick.variants.some((v) => v.size === size && v.color === c && v.stock > 0)) setSize(''); }} />
            <div className="pd-label mt-3">Size{size && <span>: {size}</span>}</div>
            <SizeSelector sizes={pick.sizes} selected={size} onSelect={setSize} isAvailable={(s) => pick.variants.some((v) => v.size === s && (!color || v.color === color) && v.stock > 0)} />
          </>
        )}
      </Modal>
    </div>
  );
}
