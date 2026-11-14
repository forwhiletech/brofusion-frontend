import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { discountPercent, effectivePrice, formatPrice, productStock } from '../../utils/helpers';
import SmartImage from './SmartImage';
import Rating from './Rating';

export default function ProductCard({ product: p }) {
  const dispatch = useDispatch();
  const wished = useSelector((s) => s.wishlist.ids.includes(p.id));
  const off = discountPercent(p);
  const soldOut = productStock(p) === 0;

  const onWish = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist(p.id)).then((r) => r.payload && toast.info(wished ? 'Removed from wishlist' : 'Added to wishlist'));
  };

  return (
    <article className="pc">
      <Link to={`/product/${p.slug}`} className="pc-media" aria-label={p.name}>
        <SmartImage src={p.images[0]} alt={p.name} className="pc-img" />
        {p.images[1] && <SmartImage src={p.images[1]} alt="" className="pc-img pc-img-alt" />}
        <div className="pc-badges">
          {soldOut ? <span className="tag tag-dark">Sold out</span> : (
            <>
              {p.isNew && <span className="tag tag-light">New</span>}
              {off > 0 && <span className="tag tag-accent">-{off}%</span>}
            </>
          )}
        </div>
        <button className={`pc-wish ${wished ? 'on' : ''}`} onClick={onWish} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}>
          {wished ? <FaHeart /> : <FiHeart />}
        </button>
      </Link>
      <div className="pc-body">
        <div className="pc-brand">{p.brand}</div>
        <Link to={`/product/${p.slug}`} className="pc-name">{p.name}</Link>
        <div className="pc-price">
          <b>{formatPrice(effectivePrice(p))}</b>
          {off > 0 && <s>{formatPrice(p.price)}</s>}
        </div>
        <div className="pc-foot">
          <div className="pc-swatches">{p.colors.slice(0, 4).map((c) => <i key={c.name} title={c.name} style={{ background: c.hex }} />)}</div>
          <Rating value={p.averageRating} size={11} />
        </div>
      </div>
    </article>
  );
}
