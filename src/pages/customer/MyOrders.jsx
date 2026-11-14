import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../redux/slices/orderSlice';
import Loader from '../../components/common/Loader';
import { FiPackage, FiSearch } from 'react-icons/fi';
import { formatDate, formatPrice } from '../../utils/helpers';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import SmartImage from '../../components/common/SmartImage';
import StatusBadge from '../../components/common/StatusBadge';

const FILTERS = [['all', 'All'], ['active', 'In progress'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']];
const PER_PAGE = 5;

export function OrderList({ orders, compact = false }) {
  return orders.map((o) => (
    <article className="order-card" key={o.id}>
      <header>
        <div><b>{o.orderNumber}</b><small>Placed {formatDate(o.createdAt)}</small></div>
        {/* <StatusBadge status={o.orderStatus} /> */}
      </header>
      <div className="order-items">
        {o.items.slice(0, compact ? 3 : 4).map((i, k) => <SmartImage key={k} src={i.image} alt={i.name} title={i.name} />)}
        <span className="small text-muted">{o.items.reduce((n, i) => n + i.qty, 0)} item(s)</span>
      </div>
      <footer><b>{formatPrice(o.totalAmount)}</b>
      {/* <Button to={`/orders/${o.id}`} size="sm" variant="outline">View details</Button> */}
      </footer>
    </article>
  ));
}

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
