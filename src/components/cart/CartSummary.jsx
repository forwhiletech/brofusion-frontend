import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiTag, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { removeCoupon, validateCoupon } from '../../redux/slices/cartSlice';
import { formatPrice } from '../../utils/helpers';
import { FREE_SHIPPING_THRESHOLD } from '../../utils/constants';
import Button from '../common/Button';

export default function CartSummary({ totals, showCoupon = true, children, shippingLabel }) {
  const dispatch = useDispatch();
  const coupon = useSelector((s) => s.cart.coupon);
  const user = useSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const apply = async (e) => {
    e.preventDefault();
    if (!user) { toast.info('Please sign in to use a coupon'); navigate('/login', { state: { from: '/cart' } }); return; }
    setBusy(true);
    try {
      const { discount, coupon: c } = await dispatch(validateCoupon(code.trim())).unwrap();
      setCode('');
      toast.success(`Coupon ${c.code} applied - you saved ${formatPrice(discount)}`);
    } catch (message) { toast.error(message || 'Invalid coupon code'); } finally { setBusy(false); }
  };

  const toFree = FREE_SHIPPING_THRESHOLD - (totals.subtotal - totals.discount);
  return (
    <aside className="summary-card">
      <h5>Order Summary</h5>
      {showCoupon && (
        coupon ? (
          <div className="coupon-applied"><FiTag /> <b>{coupon.code}</b> applied<button className="icon-btn" aria-label="Remove coupon" onClick={() => dispatch(removeCoupon())}><FiX /></button></div>
        ) : (
          <form className="coupon-form" onSubmit={apply}>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" />
            <Button type="submit" variant="outline" size="sm" disabled={!code.trim()} loading={busy}>Apply</Button>
          </form>
        )
      )}
      <dl className="sum-rows">
        <div><dt>Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
        {totals.discount > 0 && <div className="text-success"><dt>Discount</dt><dd>-{formatPrice(totals.discount)}</dd></div>}
        {/* <div><dt>{shippingLabel || 'Shipping'}</dt><dd>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</dd></div> */}
        {/* <div><dt>Tax (5% GST)</dt><dd>{formatPrice(totals.tax)}</dd></div> */}
        <div className="sum-total"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
      </dl>
      {/* {toFree > 0 && totals.subtotal > 0 && <p className="free-ship">Add {formatPrice(toFree)} more for free shipping</p>} */}
      {children}
    </aside>
  );
}
