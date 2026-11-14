import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSalesReport } from '../../redux/slices/adminSlice';
import Loader from '../../components/common/Loader';
import { FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { downloadFile, formatDate, formatPrice, toCSV } from '../../utils/helpers';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import { DonutChart, LineChart } from '../../components/admin/Charts';
import Button from '../../components/common/Button';

const RANGES = [['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['all', 'All time']];

export default function SalesReports() {
  const dispatch = useDispatch();
  const { sales: rep, salesStatus, salesError: error } = useSelector((s) => s.admin);
  const [range, setRange] = useState('30');
  useEffect(() => { dispatch(fetchSalesReport(range)); }, [dispatch, range]);

  const r = useMemo(() => rep && ({
    ...rep,
    days: rep.daily.map((d) => ({ label: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), value: d.value })),
    cats: rep.byCategory, top: rep.topProducts, inRange: rep.orderRows,
  }), [rep]);

  const exportCsv = () => {
    downloadFile(`sales-report-${range}.csv`, toCSV([['Order', 'Date', 'Customer', 'Payment', 'Payment status', 'Order status', 'Total'], ...r.inRange.map((o) => [o.orderNumber, formatDate(o.createdAt), o.customer?.name, o.paymentMethod, o.paymentStatus, o.orderStatus, o.totalAmount])]), 'text/csv');
    toast.success('Sales report exported');
  };

  const body = !r ? (salesStatus === 'failed' ? <p className="text-danger">{error || 'Could not load the report'}</p> : <Loader />) : null;
  return (
    <>
      <PageHeader title="Sales reports" subtitle="Revenue, products and payments" actions={<>
        <select className="select-v" value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range">{RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <Button variant="outline" onClick={exportCsv} disabled={!r}><FiDownload /> Export CSV</Button></>} />
      {body || (<>
      <div className="stat-grid stat-grid-4">
        <StatCard label="Revenue" value={formatPrice(r.revenue)} icon="₹" />
        <StatCard label="Orders" value={r.orders} icon="#" hint={`${r.cancelledOrders} cancelled`} />
        <StatCard label="Avg. order value" value={formatPrice(r.averageOrderValue)} icon="Ø" />
        <StatCard label="Units sold" value={r.unitsSold} icon="∑" />
      </div>
      <div className="row g-4 mt-1">
        <div className="col-xl-8"><section className="panel h-100"><h5>Daily revenue</h5>{r.days.length ? <LineChart data={r.days} /> : <p className="text-muted">No sales in this period.</p>}</section></div>
        {/* <div className="col-xl-4"><section className="panel h-100"><h5>Payment methods</h5><DonutChart data={[{ label: 'Online', value: r.payments.online, color: '#111' }, { label: 'Cash on delivery', value: r.payments.cod, color: '#b08968' }]} /></section></div> */}
      </div>
      <div className="row g-4 mt-1">
        <div className="col-lg-6"><section className="panel"><h5>Sales by category</h5>
          <table className="table-v"><thead><tr><th>Category</th><th>Units</th><th>Revenue</th></tr></thead><tbody>{r.cats.map((c) => <tr key={c.name}><td>{c.name}</td><td>{c.units}</td><td>{formatPrice(c.revenue)}</td></tr>)}{!r.cats.length && <tr><td colSpan={3} className="text-muted">No data</td></tr>}</tbody></table></section></div>
        <div className="col-lg-6"><section className="panel"><h5>Top products</h5>
          <table className="table-v"><thead><tr><th>Product</th><th>Units</th><th>Revenue</th></tr></thead><tbody>{r.top.map((c) => <tr key={c.name}><td>{c.name}</td><td>{c.units}</td><td>{formatPrice(c.revenue)}</td></tr>)}{!r.top.length && <tr><td colSpan={3} className="text-muted">No data</td></tr>}</tbody></table></section></div>
      </div>
      </>)}
    </>
  );
}
