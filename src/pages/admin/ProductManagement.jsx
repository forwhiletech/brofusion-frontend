import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit2, FiEye, FiEyeOff, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { deleteProduct, fetchAdminProducts, toggleProductActive } from '../../redux/slices/productSlice';
import { effectivePrice, formatPrice, productStock } from '../../utils/helpers';
import PageHeader from '../../components/admin/PageHeader';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { ConfirmModal } from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import SmartImage from '../../components/common/SmartImage';
import Loader from '../../components/common/Loader';

const PER = 8;

export default function ProductManagement() {
  const dispatch = useDispatch();
  const { adminItems: products, adminStatus } = useSelector((s) => s.products);
  const categories = useSelector((s) => s.admin.categories);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  useEffect(() => { dispatch(fetchAdminProducts()); }, [dispatch]);

  const list = useMemo(() => products.filter((p) => (cat === 'all' || p.category === cat) && (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase()))), [products, q, cat]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);

  return (
    <>
      <PageHeader title="Products" subtitle={`${products.length} products in catalogue`} actions={<Button to="/admin/products/add"><FiPlus /> Add product</Button>} />
      <section className="panel">
        <div className="toolbar">
          <label className="mini-search"><FiSearch /><input placeholder="Search products" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
          <select className="select-v" value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }} aria-label="Filter by category">
            <option value="all">All categories</option>{categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        {adminStatus === 'loading' && products.length === 0 ? <Loader /> : adminStatus === 'failed' && products.length === 0 ? <EmptyState title="Could not load products" actionText="Retry" onAction={() => dispatch(fetchAdminProducts())} /> : list.length === 0 ? <EmptyState title="No products found" actionText="Add product" actionTo="/admin/products/add" /> : (
          <div className="table-responsive">
            <table className="table-v">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {list.slice((cur - 1) * PER, cur * PER).map((p) => {
                  const stock = productStock(p);
                  return (
                    <tr key={p.id}>
                      <td><div className="cell-prod"><SmartImage src={p.images[0]} alt="" /><div><b>{p.name}</b><small>{p.brand} · {p.variants.length} variants</small></div></div></td>
                      <td>{categories.find((c) => c.slug === p.category)?.name || p.category}</td>
                      <td>{formatPrice(effectivePrice(p))}{p.discountPrice > 0 && <small className="d-block text-muted"><s>{formatPrice(p.price)}</s></small>}</td>
                      <td><span className={stock === 0 ? 'text-danger' : stock <= 10 ? 'text-warning-emphasis' : ''}>{stock}</span></td>
                      <td><span className={`sbadge sbadge-${p.isActive ? 'ok' : 'muted'}`}>{p.isActive ? 'Active' : 'Hidden'}</span></td>
                      <td className="text-end">
                        <button className="icon-btn" title={p.isActive ? 'Hide' : 'Show'} onClick={async () => { const r = await dispatch(toggleProductActive(p.id)); if (toggleProductActive.fulfilled.match(r)) toast.info(p.isActive ? 'Product hidden' : 'Product visible'); else toast.error(r.payload); }}>{p.isActive ? <FiEyeOff /> : <FiEye />}</button>
                        <Link className="icon-btn" title="Edit" to={`/admin/products/edit/${p.id}`}><FiEdit2 /></Link>
                        <button className="icon-btn text-danger" title="Delete" onClick={() => setToDelete(p)}><FiTrash2 /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={cur} totalPages={pages} onChange={setPage} />
      </section>
      <ConfirmModal show={!!toDelete} onClose={() => setToDelete(null)} title="Delete product?" message={`“${toDelete?.name}” will be permanently removed from the catalogue.`} confirmText="Delete" onConfirm={async () => { const r = await dispatch(deleteProduct(toDelete.id)); setToDelete(null); if (deleteProduct.fulfilled.match(r)) toast.success('Product deleted'); else toast.error(r.payload || 'Could not delete'); }} />
    </>
  );
}
