import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { clearCart } from '../../redux/slices/cartSlice';
import { computeTotals } from '../../utils/helpers';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING, TAX_RATE } from '../../utils/constants';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';

export default function Cart() {
  const { items, coupon } = useSelector((s) => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const totals = computeTotals({ items, coupon, shippingCharge: STANDARD_SHIPPING, freeShippingThreshold: FREE_SHIPPING_THRESHOLD, taxRate: TAX_RATE });

  if (!items.length) {
    return <div className="container page-pad"><EmptyState icon={<FiShoppingBag />} title="Your cart is empty" message="Looks like you haven't added anything yet." actionText="Start shopping" actionTo="/shop" /></div>;
  }
  return (
    <div className="container page-pad">
      <Breadcrumb items={[{ label: 'Cart' }]} />
      <h1 className="page-title">Shopping Cart <small>({items.reduce((n, i) => n + i.qty, 0)} items)</small></h1>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="cart-list">{items.map((i) => <CartItem key={i.key} item={i} />)}</div>
          <div className="d-flex justify-content-between mt-3 flex-wrap gap-2">
            <Button to="/shop" variant="outline">Continue shopping</Button>
            <Button variant="ghost" onClick={() => dispatch(clearCart())}>Clear cart</Button>
          </div>
        </div>
        <div className="col-lg-4">
          <CartSummary totals={totals}>
            <Button block size="lg" onClick={() => navigate('/checkout')}>Proceed to checkout</Button>
          </CartSummary>
        </div>
      </div>
    </div>
  );
}
