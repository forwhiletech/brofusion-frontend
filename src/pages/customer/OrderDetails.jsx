import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiCheck, FiDownload, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { cancelOrder, orderUpdated } from '../../redux/slices/orderSlice';
import { payForOrder } from '../../services/payment';
import useOrder from '../../hooks/useOrder';
import Loader from '../../components/common/Loader';
import { CANCELLABLE_STATUSES, ORDER_STATUSES } from '../../utils/constants';
import { downloadFile, formatDate, formatPrice, invoiceHTML } from '../../utils/helpers';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/Modal';
import { AddressText } from '../../components/common/AddressForm';
import SmartImage from '../../components/common/SmartImage';
import StatusBadge from '../../components/common/StatusBadge';

const FLOW = ORDER_STATUSES.filter((s) => s.value !== 'cancelled');

export function Tracker({ order }) {
  if (order.orderStatus === 'cancelled') {
    return <ol className="tracker tracker-cancelled">{order.statusHistory.map((h, i) => <li key={i} className="done"><span className="dot">{h.status === 'cancelled' ? <FiX /> : <FiCheck />}</span><div><b>{ORDER_STATUSES.find((s) => s.value === h.status)?.label}</b><small>{formatDate(h.date, true)}</small></div></li>)}</ol>;
  }
  const idx = FLOW.findIndex((s) => s.value === order.orderStatus);
  return (
    <ol className="tracker">
      {FLOW.map((s, i) => {
        const h = order.statusHistory.find((x) => x.status === s.value);
        return <li key={s.value} className={i <= idx ? 'done' : ''}><span className="dot">{i <= idx ? <FiCheck /> : i + 1}</span><div><b>{s.label}</b><small>{h ? formatDate(h.date, true) : 'Pending'}</small></div></li>;
      })}
    </ol>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order, loading, error } = useOrder(id);
  const [confirm, setConfirm] = useState(false);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (loading) return <Loader fullPage />;
  if (error) return <div className="container page-pad"><EmptyState title="Could not load this order" message={error} actionText="My orders" actionTo="/orders" /></div>;
  if (!order) {
    return <div className="container page-pad"><EmptyState title="Order not found" message="We couldn't find this order in your account." actionText="My orders" actionTo="/orders" /></div>;
  }
  const canCancel = CANCELLABLE_STATUSES.includes(order.orderStatus);
  const needsPayment = order.paymentMethod === 'online' && ['pending', 'failed'].includes(order.paymentStatus) && order.orderStatus !== 'cancelled';

  const doCancel = async () => {
    setCancelling(true);
    try {
      await dispatch(cancelOrder({ id: order.id })).unwrap();
      toast.success(order.paymentStatus === 'paid' ? 'Order cancelled. Refund will be processed in 5-7 days.' : 'Order cancelled');
    } catch (message) { toast.error(message || 'Could not cancel this order'); } finally { setCancelling(false); setConfirm(false); }
  };

  const payNow = async () => {
    setPaying(true);
    try {
      const r = await payForOrder(order);
      if (r.status === 'paid') { dispatch(orderUpdated(r.order)); toast.success('Payment successful'); }
      else if (r.status === 'failed') toast.error('Payment failed. Please try again.');
      else toast.info('Payment window closed');
    } catch (e) { toast.error(e.message); } finally { setPaying(false); }
  };

  return (
    <div className="container page-pad">
      <Breadcrumb items={[{ label: 'My Orders', to: '/orders' }, { label: order.orderNumber }]} />
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div><h1 className="page-title mb-1">Order {order.orderNumber}</h1><span className="text-muted">Placed on {formatDate(order.createdAt, true)} · </span><StatusBadge status={order.orderStatus} /></div>
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => { downloadFile(`invoice-${order.orderNumber}.html`, invoiceHTML(order), 'text/html'); toast.success('Invoice downloaded'); }}><FiDownload /> Download invoice</Button>
          {needsPayment && <Button loading={paying} onClick={payNow}>Pay {formatPrice(order.totalAmount)}</Button>}
          {canCancel && <Button variant="danger" loading={cancelling} onClick={() => setConfirm(true)}>Cancel order</Button>}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8 d-grid gap-4 align-content-start">
          <section className="panel">
            <h5>Order tracking</h5>
            {order.trackingNumber && <p className="small">Tracking number: <b>{order.trackingNumber}</b></p>}
            <Tracker order={order} />
          </section>
          <section className="panel">
            <h5>Items</h5>
            {order.items.map((i, k) => (
              <div className="mini-item mini-item-lg" key={k}>
                <SmartImage src={i.image} alt="" />
                <div><b>{i.name}</b><small>SKU {i.sku} · {i.size} / {i.color} · Qty {i.qty}</small></div>
                <span>{formatPrice(i.price * i.qty)}</span>
              </div>
            ))}
          </section>
        </div>
        <div className="col-lg-4 d-grid gap-4 align-content-start">
          <section className="panel">
            <h5>Summary</h5>
            <dl className="sum-rows">
              <div><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="text-success"><dt>Discount</dt><dd>-{formatPrice(order.discount)}</dd></div>}
              <div><dt>Shipping</dt><dd>{order.shippingCharge ? formatPrice(order.shippingCharge) : 'Free'}</dd></div>
              <div><dt>Tax</dt><dd>{formatPrice(order.tax)}</dd></div>
              <div className="sum-total"><dt>Total</dt><dd>{formatPrice(order.totalAmount)}</dd></div>
            </dl>
            <div className="small">Payment: <b>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</b> · <StatusBadge status={order.paymentStatus} /></div>
          </section>
          <section className="panel"><h5>Shipping address</h5><AddressText a={order.shippingAddress} /></section>
          <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
        </div>
      </div>
      <ConfirmModal show={confirm} onClose={() => setConfirm(false)} onConfirm={doCancel} title="Cancel this order?" message="This action cannot be undone. Items will be returned to stock." confirmText="Yes, cancel order" />
    </div>
  );
}
