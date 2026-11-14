import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiAlertTriangle, FiBox, FiDownload, FiSearch, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { fetchInventory } from '../../redux/slices/adminSlice';
import { setVariantStock } from '../../redux/slices/productSlice';
import Loader from '../../components/common/Loader';
import { downloadFile, toCSV } from '../../utils/helpers';
import { LOW_STOCK } from './Dashboard';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';

const PER = 12;

export default function InventoryManagement() {
  const dispatch = useDispatch();
  const { inventory, inventoryStatus } = useSelector((s) => s.admin);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [edits, setEdits] = useState({});
  useEffect(() => { dispatch(fetchInventory()); }, [dispatch]);

  const rows = useMemo(() => inventory?.rows || [], [inventory]);
  const filtered = useMemo(() => rows.filter((r) =>
    (filter === 'all' || (filter === 'out' && r.stock === 0) || (filter === 'low' && r.stock > 0 && r.stock <= 5))
    && (!q || `${r.name} ${r.sku}`.toLowerCase().includes(q.toLowerCase()))), [rows, q, filter]);
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const cur = Math.min(page, pages);
  const units = inventory?.summary.totalUnits || 0;

  const save = async (r) => {
    const val = edits[r.sku];
    if (val === undefined || val === '' || Number(val) < 0) return toast.error('Enter a valid stock quantity');
    const res = await dispatch(setVariantStock({ productId: r.productId, sku: r.sku, stock: Number(val) }));
    if (res.error) return toast.error(res.payload || 'Could not update stock');
    dispatch(fetchInventory());
    setEdits((e) => { const n = { ...e }; delete n[r.sku]; return n; });
    return toast.success(`Stock updated for ${r.sku}`);
  };
  const exportCsv = () => {
    downloadFile('inventory-report.csv', toCSV([['SKU', 'Product', 'Category', 'Size', 'Colour', 'Stock'], ...rows.map((r) => [r.sku, r.name, r.category, r.size, r.color, r.stock])]), 'text/csv');
    toast.success('Inventory report exported');
  };

  if (!inventory) return <Loader />;
  return (
    <>
      <PageHeader title="Inventory" subtitle="Stock levels by variant (SKU)" actions={<Button variant="outline" onClick={exportCsv}><FiDownload /> Export CSV</Button>} />
      <div className="stat-grid stat-grid-3">
        <StatCard icon={<FiBox />} label="Total units" value={units} hint={`${rows.length} SKUs`} />
        <StatCard icon={<FiAlertTriangle />} label="Low stock SKUs" value={inventory?.summary.lowStockSkus ?? 0} tone="warn" hint={`Products ≤ ${LOW_STOCK} units: ${inventory?.summary.lowStockProducts ?? 0}`} />
        <StatCard icon={<FiXCircle />} label="Out of stock SKUs" value={inventory?.summary.outOfStockSkus ?? 0} tone="bad" />
      </div>
      <section className="panel mt-4">
        <div className="toolbar">
          <label className="mini-search"><FiSearch /><input placeholder="Search product or SKU" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
          <div className="tabs-pill">{[['all', 'All'], ['low', 'Low (≤5)'], ['out', 'Out of stock']].map(([v, l]) => <button key={v} className={filter === v ? 'on' : ''} onClick={() => { setFilter(v); setPage(1); }}>{l}</button>)}</div>
        </div>
        <div className="table-responsive">
          <table className="table-v">
            <thead><tr><th>SKU</th><th>Product</th><th>Size</th><th>Colour</th><th>Stock</th><th style={{ width: 190 }}>Update</th></tr></thead>
            <tbody>
              {filtered.slice((cur - 1) * PER, cur * PER).map((r) => (
                <tr key={r.sku}>
                  <td><code>{r.sku}</code></td><td>{r.name}</td><td>{r.size}</td><td>{r.color}</td>
                  <td><span className={`sbadge sbadge-${r.stock === 0 ? 'bad' : r.stock <= 5 ? 'warn' : 'ok'}`}>{r.stock}</span></td>
                  <td><div className="d-flex gap-2"><input type="number" min="0" className="cell-input" placeholder={String(r.stock)} aria-label={`Stock for ${r.sku}`} value={edits[r.sku] ?? ''} onChange={(e) => setEdits({ ...edits, [r.sku]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && save(r)} /><Button size="sm" variant="outline" disabled={edits[r.sku] === undefined} onClick={() => save(r)}>Save</Button></div></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">No variants match</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={cur} totalPages={pages} onChange={setPage} />
      </section>
    </>
  );
}
