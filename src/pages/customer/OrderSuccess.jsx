import { Link, useParams } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { formatDate, formatPrice } from '../../utils/helpers';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { AddressText } from '../../components/common/AddressForm';
import SmartImage from '../../components/common/SmartImage';
import Loader from '../../components/common/Loader';
import useOrder from '../../hooks/useOrder';

export default function OrderSuccess() {
  const { id } = useParams();
  const { order, loading, error } = useOrder(id);
  if (loading) return <Loader fullPage />;
  if (error) return <div className="container page-pad"><EmptyState title="Could not load your order" message={error} actionText="My orders" actionTo="/orders" /></div>;
  if (!order) return <div className="container page-pad"><EmptyState title="Order not found" actionText="My orders" actionTo="/orders" /></div>;

  return (
    <div className="container page-pad">
      <div className="success-card">
        <div className="success-ico"><FiCheck /></div>
        <h1>{order.paymentMethod === 'online' && order.paymentStatus !== 'paid' ? 'Order received - payment pending' : 'Thank you for your order!'}</h1>
        <p>Your order <b>{order.orderNumber}</b> has been placed in whatsapp on {formatDate(order.createdAt)}.</p>
        {order.paymentStatus === 'paid' && <p className="text-success mb-0">Payment received · Ref {order.paymentReference}</p>}
        {order.paymentMethod === 'online' && order.paymentStatus !== 'paid' && order.orderStatus !== 'cancelled' && <p className="text-danger mb-0">We have not received your payment yet. Open the order to complete it - unpaid orders are released automatically after 30 minutes.</p>}
        <div className="success-grid">
          <div>
            <h6>Items</h6>
            {order.items.map((i, k) => (
              <div className="mini-item" key={k}><SmartImage src={i.image} alt="" /><div><b>{i.name}</b><small>{i.size} / {i.color} · Qty {i.qty}</small></div><span>{formatPrice(i.price * i.qty)}</span></div>
            ))}
          </div>
          <div>
            <h6>Delivering to</h6><AddressText a={order.shippingAddress} />
            {/* <h6 className="mt-3">Payment</h6><p className="mb-0">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid online'} · <b>{formatPrice(order.totalAmount)}</b></p> */}
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          {/* <Button to={`/orders/${order.id}`}>Track order</Button> */}
          <Button to="/shop" variant="outline">Continue shopping</Button>
        </div>
        <p className="small mt-3 mb-0"><Link to="/orders">View all orders</Link></p>
      </div>
    </div>
  );
}
