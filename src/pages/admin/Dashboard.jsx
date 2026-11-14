import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../../redux/slices/adminSlice';
import Loader from '../../components/common/Loader';
import { FiAlertTriangle, FiBox, FiClock, FiDollarSign, FiShoppingCart, FiTruck, FiUsers } from 'react-icons/fi';
import { formatDate, formatPrice, productStock } from '../../utils/helpers';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import { BarChart, DonutChart } from '../../components/admin/Charts';
import StatusBadge from '../../components/common/StatusBadge';
import SmartImage from '../../components/common/SmartImage';

export const LOW_STOCK = 10;

export default function Dashboard() {
  const dispatch = useDispatch();
  const { dashboard: d, dashboardStatus: status, dashboardError: error } = useSelector((s) => s.admin);
  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);
  if (!d && status === 'failed') return <><PageHeader title="Dashboard" subtitle="Overview of store performance" /><p className="text-danger">{error || 'Could not load the dashboard'} <button className="btn btn-link p-0" onClick={() => dispatch(fetchDashboard())}>Retry</button></p></>;
  if (!d) return <Loader />;
  const { recentOrders: recent, topProducts: top, lowStockProducts: lowStock } = d;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of store performance" />
      <div className="stat-grid">
        <StatCard icon={<FiDollarSign />} label="Total revenue" value={formatPrice(d.totalRevenue)} hint="Paid, excluding cancelled" />
        <StatCard icon={<FiShoppingCart />} label="Total orders" value={d.totalOrders} />
        <StatCard icon={<FiUsers />} label="Customers" value={d.totalCustomers} />
        <StatCard icon={<FiBox />} label="Products" value={d.totalProducts} />
        <StatCard icon={<FiClock />} label="Pending orders" value={d.pendingOrders} tone="warn" />
        <StatCard icon={<FiTruck />} label="Delivered orders" value={d.deliveredOrders} tone="ok" />
        <StatCard icon={<FiAlertTriangle />} label="Low stock products" value={d.lowStockCount} tone="bad" hint={`≤ ${LOW_STOCK} units`} />
      </div>

      <div className="row g-4 mt-1">
        <div className="col-xl-8"><section className="panel h-100"><h5>Monthly revenue</h5><BarChart data={d.monthlyRevenue} /></section></div>
        <div className="col-xl-4"><section className="panel h-100"><h5>Order status</h5><DonutChart data={d.orderStatus} /></section></div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-xl-7">
          <section className="panel">
            <div className="d-flex justify-content-between"><h5>Recent orders</h5><Link to="/admin/orders" className="small">View all</Link></div>
            <div className="table-responsive">
              <table className="table-v">
                <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>{recent.length === 0 && <tr><td colSpan={5} className="text-muted">No orders yet</td></tr>}{recent.map((o) => <tr key={o.id}><td><b>{o.orderNumber}</b></td><td>{o.customer.name}</td><td>{formatDate(o.createdAt)}</td><td>{formatPrice(o.totalAmount)}</td><td><StatusBadge status={o.orderStatus} /></td></tr>)}</tbody>
              </table>
            </div>
          </section>
        </div>
        <div className="col-xl-5">
          <section className="panel mb-4">
            <h5>Top-selling products</h5>
            {top.length === 0 && <p className="text-muted mb-0">No sales yet.</p>}{top.map((p, i) => (
              <div className="mini-item" key={p.id}><span className="rank">{i + 1}</span><SmartImage src={p.images[0]} alt="" /><div><b>{p.name}</b><small>{p.sold} sold</small></div></div>
            ))}
          </section>
          <section className="panel">
            <div className="d-flex justify-content-between"><h5>Low stock</h5><Link to="/admin/inventory" className="small">Manage</Link></div>
            {lowStock.length === 0 ? <p className="text-muted mb-0">All products are well stocked.</p> : lowStock.slice(0, 5).map((p) => (
              <div className="mini-item" key={p.id}><SmartImage src={p.images[0]} alt="" /><div><b>{p.name}</b><small>{productStock(p)} units left</small></div></div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
