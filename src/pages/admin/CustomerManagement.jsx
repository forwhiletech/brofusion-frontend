import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEye, FiSearch, FiSlash, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { fetchAdminOrders } from '../../redux/slices/orderSlice';
import Loader from '../../components/common/Loader';
import { fetchCustomers, toggleUserActive } from '../../redux/slices/authSlice';
import { formatDate, formatPrice } from '../../utils/helpers';
import PageHeader from '../../components/admin/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import { AddressText } from '../../components/common/AddressForm';

const PER = 8;

export default function CustomerManagement() {
  const dispatch = useDispatch();
  const { customers: users, customersStatus } = useSelector((s) => s.auth);
  const orders = useSelector((s) => s.orders.admin);
  const [q, setQ] = useState('');
  const [state, setState] = useState('all');
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState(null);
  useEffect(() => { dispatch(fetchCustomers()); dispatch(fetchAdminOrders()); }, [dispatch]);

  const stats = (id) => { const o = orders.filter((x) => (x.userId?.id || x.userId) === id); return { count: o.length, spent: o.filter((x) => x.orderStatus !== 'cancelled').reduce((s, x) => s + x.totalAmount, 0) }; };
  const list = useMemo(() => users.filter((u) => (state === 'all' || (state === 'active') === u.isActive) && (!q || `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q.toLowerCase()))), [users, q, state]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  const view = users.find((u) => u.id === viewId);
  const toggle = async (u) => { const r = await dispatch(toggleUserActive(u.id)); if (r.error) toast.error(r.payload || 'Could not update customer'); else toast.success(u.isActive ? `${u.name} blocked` : `${u.name} unblocked`); };

  return (
    <>
      <PageHeader title="Customers" subtitle={`${users.length} registered customers`} />
      <section className="panel">
        <div className="toolbar">
          <label className="mini-search"><FiSearch /><input placeholder="Search name, email, phone" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
          <select className="select-v" value={state} onChange={(e) => { setState(e.target.value); setPage(1); }} aria-label="Filter customers"><option value="all">All customers</option><option value="active">Active</option><option value="blocked">Blocked</option></select>
        </div>
        {customersStatus === 'loading' && users.length === 0 ? <Loader /> : (
        <div className="table-responsive">
          <table className="table-v">
            <thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Orders</th><th>Spent</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {list.slice((cur - 1) * PER, cur * PER).map((u) => {
                const st = stats(u.id);
                return (
                  <tr key={u.id}>
                    <td><div className="cell-prod"><span className="avatar">{u.name[0]}</span><div><b>{u.name}</b><small>{u.email}</small></div></div></td>
                    <td>{u.phone}</td><td>{formatDate(u.createdAt)}</td><td>{st.count}</td><td>{formatPrice(st.spent)}</td>
                    <td><StatusBadge status={u.isActive ? 'active' : 'blocked'} /></td>
                    <td className="text-end">
                      <button className="icon-btn" title="View" onClick={() => setViewId(u.id)}><FiEye /></button>
                      <button className={`icon-btn ${u.isActive ? 'text-danger' : 'text-success'}`} title={u.isActive ? 'Block' : 'Unblock'} onClick={() => toggle(u)}>{u.isActive ? <FiSlash /> : <FiCheckCircle />}</button>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-4">No customers found</td></tr>}
            </tbody>
          </table>
        </div>)}
        <Pagination page={cur} totalPages={pages} onChange={setPage} />
      </section>
      <Modal show={!!view} onClose={() => setViewId(null)} title={view?.name || ''} footer={view && <><Button variant={view.isActive ? 'danger' : 'dark'} onClick={() => toggle(view)}>{view.isActive ? 'Block customer' : 'Unblock customer'}</Button><Button variant="outline" onClick={() => setViewId(null)}>Close</Button></>}>
        {view && (
          <>
            <p className="mb-2">{view.email}<br />{view.phone}<br />Joined {formatDate(view.createdAt)}</p>
            <p>Orders: <b>{stats(view.id).count}</b> · Spent: <b>{formatPrice(stats(view.id).spent)}</b></p>
            <h6>Addresses</h6>
            {view.addresses?.length ? view.addresses.map((a) => <AddressText key={a.id} a={a} />) : <p className="text-muted">No saved addresses</p>}
          </>
        )}
      </Modal>
    </>
  );
}
