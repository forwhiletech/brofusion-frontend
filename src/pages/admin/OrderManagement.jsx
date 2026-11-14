import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEye, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { cancelOrder, fetchAdminOrders, updateOrderStatus, updatePaymentStatus } from '../../redux/slices/orderSlice';
import { CANCELLABLE_STATUSES, ORDER_STATUSES, PAYMENT_STATUSES } from '../../utils/constants';
import { formatDate, formatPrice } from '../../utils/helpers';
import PageHeader from '../../components/admin/PageHeader';
import Button from '../../components/common/Button';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import SmartImage from '../../components/common/SmartImage';
import Loader from '../../components/common/Loader';
import { AddressText } from '../../components/common/AddressForm';
import { Tracker } from '../customer/OrderDetails';

const PER = 10;

export default function OrderManagement() {
  const dispatch = useDispatch();
  const { admin: orders, adminStatus, adminError } = useSelector((s) => s.orders);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [pay, setPay] = useState('all');
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  useEffect(() => { dispatch(fetchAdminOrders()); }, [dispatch]);

  const list = useMemo(() => orders.filter((o) =>
    (status === 'all' || o.orderStatus === status) && (pay === 'all' || o.paymentStatus === pay)
    && (!q || `${o.orderNumber} ${o.customer.name} ${o.customer.email}`.toLowerCase().includes(q.toLowerCase()))), [orders, q, status, pay]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  const view = orders.find((o) => o.id === viewId);

  // The server restores stock/coupon usage and issues refunds when an order is cancelled.
  const report = (r, ok) => { if (r.error) toast.error(r.payload || 'Action failed'); else toast.success(ok); };
  const doCancel = async (o) => { const r = await dispatch(cancelOrder({ id: o.id })); report(r, `Order ${o.orderNumber} cancelled`); setCancelId(null); };
  const changeStatus = async (o, next) => {
    if (next === 'cancelled') return setCancelId(o.id);
    const r = await dispatch(updateOrderStatus({ id: o.id, status: next }));
    return report(r, `Order ${o.orderNumber} marked ${ORDER_STATUSES.find((s) => s.value === next).label}`);
  };

  return (
    <>
      <PageHeader title="Orders" subtitle={`${orders.length} orders`} />
      <section className="panel">
        <div className="toolbar">
          <label className="mini-search"><FiSearch /><input placeholder="Search order, customer" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
          <select className="select-v" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Order status filter"><option value="all">All statuses</option>{ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
          {/* <select className="select-v" value={pay} onChange={(e) => { setPay(e.target.value); setPage(1); }} aria-label="Payment status filter"><option value="all">All payments</option>{PAYMENT_STATUSES.map((s) => <option key={s} value={s} className="text-capitalize">{s}</option>)}</select> */}
        </div>
        {adminStatus === 'loading' && orders.length === 0 ? <Loader /> : adminStatus === 'failed' && orders.length === 0 ? <p className="text-danger py-3">{adminError || 'Could not load orders'} <button className="btn btn-link p-0" onClick={() => dispatch(fetchAdminOrders())}>Retry</button></p> : (
        <div className="table-responsive">
          <table className="table-v">
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th>
            <th>Payment</th>
            <th>Status</th><th className="text-end">View</th></tr></thead>
            <tbody>
              {list.slice((cur - 1) * PER, cur * PER).map((o) => (
                <tr key={o.id}>
                  <td><b>{o.orderNumber}</b></td>
                  <td>{o.customer.name}<small className="d-block text-muted">{o.customer.email}</small></td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                  <td>{formatPrice(o.totalAmount)}</td>
                  <td>
                    {/* <span className="text-uppercase small">{o.paymentMethod}</span>  */}
                  <StatusBadge status={o.paymentStatus} /></td>
                  <td>
                    <select className="select-v select-sm" value={o.orderStatus} disabled={['cancelled', 'delivered'].includes(o.orderStatus)} onChange={(e) => changeStatus(o, e.target.value)} aria-label={`Status for ${o.orderNumber}`}>
                      {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="text-end"><button className="icon-btn" title="View details" onClick={() => setViewId(o.id)}><FiEye /></button></td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={8} className="text-center text-muted py-4">No orders match your filters</td></tr>}
            </tbody>
          </table>
        </div>)}
        <Pagination page={cur} totalPages={pages} onChange={setPage} />
      </section>

      <Modal show={!!view} onClose={() => setViewId(null)} title={view ? `Order ${view.orderNumber}` : ''} size="lg"
        footer={view && <>
          {CANCELLABLE_STATUSES.includes(view.orderStatus) && <Button variant="danger" onClick={() => setCancelId(view.id)}>Cancel order</Button>}
          <Button variant="outline" onClick={() => setViewId(null)}>Close</Button></>}>
        {view && (
          <div className="row g-4">
            <div className="col-md-6">
              <h6>Customer</h6><p className="mb-3">{view.customer.name}<br />{view.customer.email}<br />{view.customer.phone}</p>
              <h6>Shipping address</h6><AddressText a={view.shippingAddress} />
              <h6 className="mt-3">Payment</h6>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* <span className="text-uppercase small">{view.paymentMethod}</span> */}
                <StatusBadge status={view.paymentStatus} />
                <select className="select-v select-sm" value={view.paymentStatus} onChange={async (e) => report(await dispatch(updatePaymentStatus({ id: view.id, paymentStatus: e.target.value })), 'Payment status updated')} aria-label="Payment status">{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
              {view.paymentReference && <small className="text-muted">Ref: {view.paymentReference}</small>}
              <h6 className="mt-3">Update status</h6>
              <select className="select-v" value={view.orderStatus} disabled={['cancelled', 'delivered'].includes(view.orderStatus)} onChange={(e) => changeStatus(view, e.target.value)} aria-label="Order status">
                {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {view.trackingNumber && <p className="small mt-2 mb-0">Tracking: <b>{view.trackingNumber}</b></p>}
            </div>
            <div className="col-md-6"><h6>Timeline</h6><Tracker order={view} /></div>
            <div className="col-12">
              <h6>Items</h6>
              {view.items.map((i, k) => <div className="mini-item" key={k}><SmartImage src={i.image} alt="" /><div><b>{i.name}</b><small>{i.sku} · {i.size}/{i.color} · Qty {i.qty}</small></div><span>{formatPrice(i.price * i.qty)}</span></div>)}
              <div className="text-end mt-2">Subtotal {formatPrice(view.subtotal)} · Discount -{formatPrice(view.discount)} · Shipping {formatPrice(view.shippingCharge)} · Tax {formatPrice(view.tax)}<br /><b>Total {formatPrice(view.totalAmount)}</b></div>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmModal show={!!cancelId} onClose={() => setCancelId(null)} title="Cancel this order?" message="The customer will be notified and stock will be restored." confirmText="Cancel order" onConfirm={() => { doCancel(orders.find((o) => o.id === cancelId)); }} />
    </>
  );
}
