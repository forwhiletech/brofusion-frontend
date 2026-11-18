import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../redux/slices/orderSlice';
import Loader from '../../components/common/Loader';
import { FiPackage, FiSearch, FiX, FiRotateCcw, FiMessageCircle } from 'react-icons/fi';
import { formatDate, formatPrice } from '../../utils/helpers';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import SmartImage from '../../components/common/SmartImage';
import StatusBadge from '../../components/common/StatusBadge';

const FILTERS = [['all', 'All'], ['active', 'In progress'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']];
const PER_PAGE = 5;

const WHATSAPP_NUMBER = '9025553064';


function ReturnModal({ order, item, onClose }) {
  const [reason, setReason] = useState('');
  const [quantity, setQuantity] = useState(1);

  const orderedQty = Number(item.qty) || 1;
  const unitPrice = Number(item.price) || 0;

  // Calculate return amount dynamically
  const returnAmount = unitPrice * quantity;

  const decreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQty = () => {
    setQuantity((prev) => Math.min(orderedQty, prev + 1));
  };

  const handleConfirm = (e) => {
    e.preventDefault();

    if (!reason.trim() || reason.trim().length < 5) {
      return;
    }

    const message = `
Hello, I would like to request a product return.

Order Details:
Order Number: ${order.orderNumber}
Order Date: ${formatDate(order.createdAt)}

Product Details:
Product Name: ${item.name}
Ordered Quantity: ${orderedQty}
Return Quantity: ${quantity}
Unit Price: ${formatPrice(unitPrice)}
Total Return Amount: ${formatPrice(returnAmount)}

Return Reason:
${reason.trim()}

Please help me with the return process.

Thank you.
    `.trim();

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    onClose();
  };

  return (
    <div className="return-modal-overlay" onClick={onClose}>
      <div
        className="return-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="return-modal-header">
          <h3>Return Product</h3>

          <button type="button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Product Details */}
        <div className="return-product-details">
          <SmartImage
            src={item.image}
            alt={item.name}
            title={item.name}
          />

          <div>
            <h4>{item.name}</h4>
            <p>Order: {order.orderNumber}</p>
            <p>Ordered Quantity: {orderedQty}</p>
            <p>Price per item: {formatPrice(unitPrice)}</p>
          </div>
        </div>

        <form onSubmit={handleConfirm}>

          {/* Quantity Selection */}
          <div className="return-form-group">
            <label>Return Quantity</label>

            <div className="return-quantity-selector">
              <button
                type="button"
                onClick={decreaseQty}
                disabled={quantity <= 1}
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={increaseQty}
                disabled={quantity >= orderedQty}
              >
                +
              </button>
            </div>

            <small>
              Maximum return quantity: {orderedQty}
            </small>
          </div>

          {/* Return Amount */}
          <div className="return-amount-box">
            <span>Return Amount</span>
            <b>{formatPrice(returnAmount)}</b>
            <small>
              {quantity} × {formatPrice(unitPrice)}
            </small>
          </div>

          {/* Return Reason */}
          <div className="return-form-group">
            <label>
              Reason for Return <span>*</span>
            </label>

            <textarea
              placeholder="Please explain why you want to return this product..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={5}
              rows={4}
            />

            <small>Return reason is mandatory.</small>
          </div>

          {/* Actions */}
          <div className="return-modal-actions">
            <button
              type="button"
              className="return-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="return-confirm-btn"
              disabled={reason.trim().length < 5}
            >
              <FiMessageCircle />
              Confirm Return
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export function OrderList({ orders, compact = false }) {
  const [selectedReturn, setSelectedReturn] = useState(null);

  return (
    <>
      {orders.map((o) => (
        <article className="order-card" key={o.id}>
          <header>
            <div>
              <b>{o.orderNumber}</b>
              <small>Placed {formatDate(o.createdAt)}</small>
            </div>
          </header>

          <div className="order-items">
            {o.items.map((item, index) => (
              <div className="order-item-return" key={item._id || index}>
                <SmartImage
                  src={item.image}
                  alt={item.name}
                  title={item.name}
                />

                <button
                  type="button"
                  className="return-product-btn"
                  onClick={() =>
                    setSelectedReturn({
                      order: o,
                      item,
                    })
                  }
                  title="Return this product"
                >
                  <FiRotateCcw />
                  <span>Return</span>
                </button>
              </div>
            ))}

            <span className="small text-muted">
              {o.items.reduce((n, i) => n + i.qty, 0)} item(s)
            </span>
          </div>

          <footer>
            <b>{formatPrice(o.totalAmount)}</b>
          </footer>
        </article>
      ))}

      {selectedReturn && (
        <ReturnModal
          order={selectedReturn.order}
          item={selectedReturn.item}
          onClose={() => setSelectedReturn(null)}
        />
      )}
    </>
  );
}

// export function OrderList({ orders, compact = false }) {
//   return orders.map((o) => (
//     <article className="order-card" key={o.id}>
//       <header>
//         <div><b>{o.orderNumber}</b><small>Placed {formatDate(o.createdAt)}</small></div>
//         {/* <StatusBadge status={o.orderStatus} /> */}
//       </header>
//       <div className="order-items">
//         {o.items.slice(0, compact ? 3 : 4).map((i, k) => <SmartImage key={k} src={i.image} alt={i.name} title={i.name} />)}
//         <span className="small text-muted">{o.items.reduce((n, i) => n + i.qty, 0)} item(s)</span>
//       </div>
//       <footer><b>{formatPrice(o.totalAmount)}</b>
//       {/* <Button to={`/orders/${o.id}`} size="sm" variant="outline">View details</Button> */}
//       </footer>
//     </article>
//   ));
// }

export default function MyOrders() {
  const dispatch = useDispatch();
  const all = useSelector((s) => s.orders.orders);
  const { status, error } = useSelector((s) => s.orders);
  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const orders = useMemo(() => all.filter((o) => {
    if (filter === 'active' && ['delivered', 'cancelled'].includes(o.orderStatus)) return false;
    if (['delivered', 'cancelled'].includes(filter) && o.orderStatus !== filter) return false;
    return !q || o.orderNumber.toLowerCase().includes(q.toLowerCase());
  }), [all, filter, q]);
  const pages = Math.max(1, Math.ceil(orders.length / PER_PAGE));
  const current = Math.min(page, pages);

  return (
    <div className="container page-pad">
      <Breadcrumb items={[{ label: 'My Orders' }]} />
      <h1 className="page-title">My Orders</h1>
      {status === 'loading' && all.length === 0 ? <Loader /> : status === 'failed' && all.length === 0 ? (
        <EmptyState title="Could not load your orders" message={error} actionText="Try again" onAction={() => dispatch(fetchMyOrders())} />
      ) : all.length === 0 ? (
        <EmptyState icon={<FiPackage />} title="No orders yet" message="When you place an order it will appear here." actionText="Start shopping" actionTo="/shop" />
      ) : (
        <>
          <div className="toolbar">
            {/* <div className="tabs-pill">{FILTERS.map(([v, l]) => <button key={v} className={filter === v ? 'on' : ''} onClick={() => { setFilter(v); setPage(1); }}>{l}</button>)}</div> */}
            <label className="mini-search"><FiSearch /><input placeholder="Search order number" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
          </div>
          {orders.length === 0 ? <EmptyState title="No matching orders" message={<>Try another filter or <Link to="/shop">keep shopping</Link>.</>} /> : (
            <div className="order-list"><OrderList orders={orders.slice((current - 1) * PER_PAGE, current * PER_PAGE)} /></div>
          )}
          <Pagination page={current} totalPages={pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
