import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { removeFromCart, updateQty } from '../../redux/slices/cartSlice';
import { formatPrice } from '../../utils/helpers';
import SmartImage from '../common/SmartImage';

export default function CartItem({ item, readOnly = false }) {
  const dispatch = useDispatch();
  return (
    <div className="cart-item">
      <Link to={`/product/${item.slug}`} className="ci-img"><SmartImage src={item.image} alt={item.name} /></Link>
      <div className="ci-info">
        <Link to={`/product/${item.slug}`} className="ci-name">{item.name}</Link>
        <div className="ci-meta">Size: <b>{item.size}</b> · Colour: <b>{item.color}</b></div>
        <div className="ci-unit">{formatPrice(item.price)}{item.mrp > item.price && <s>{formatPrice(item.mrp)}</s>}</div>
        {readOnly ? <div className="ci-meta">Qty: {item.qty}</div> : (
          <div className="qty">
            <button onClick={() => dispatch(updateQty({ key: item.key, qty: item.qty - 1 }))} disabled={item.qty <= 1} aria-label="Decrease quantity"><FiMinus /></button>
            <span>{item.qty}</span>
            <button onClick={() => dispatch(updateQty({ key: item.key, qty: item.qty + 1 }))} disabled={item.qty >= item.stock} aria-label="Increase quantity"><FiPlus /></button>
          </div>
        )}
        {!readOnly && item.qty >= item.stock && <small className="text-danger">Only {item.stock} in stock</small>}
      </div>
      <div className="ci-side">
        <b>{formatPrice(item.price * item.qty)}</b>
        {!readOnly && <button className="icon-btn" aria-label="Remove item" onClick={() => dispatch(removeFromCart(item.key)).then((r) => r.payload && toast.info('Item removed from cart'))}><FiTrash2 /></button>}
      </div>
    </div>
  );
}
