import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { deleteCoupon, fetchCoupons, saveCoupon, toggleActive } from '../../redux/slices/adminSlice';
import { formatDate, formatPrice } from '../../utils/helpers';
import PageHeader from '../../components/admin/PageHeader';
import Button from '../../components/common/Button';
import Modal, { ConfirmModal } from '../../components/common/Modal';

const EMPTY = { code: '', discountType: 'percentage', discountValue: '', minimumOrderAmount: 0, maximumDiscount: '', startDate: new Date().toISOString().slice(0, 10), expiryDate: '', usageLimit: 100, isActive: true };

export default function CouponManagement() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(fetchCoupons()); }, [dispatch]);
  const coupons = useSelector((s) => s.admin.coupons);
  const [edit, setEdit] = useState(null);
  const [errors, setErrors] = useState({});
  const [del, setDel] = useState(null);
  const today = new Date().toISOString().slice(0, 10);

  const done = (r, ok) => { if (r.error) { toast.error(r.payload || 'Action failed'); return false; } toast.success(ok); return true; };
  const save = async () => {
    const e = {};
    const code = edit.code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,15}$/.test(code)) e.code = 'Use 4-15 letters/numbers';
    if (coupons.some((c) => c.id !== edit.id && c.code === code)) e.code = 'Code already exists';
    const val = Number(edit.discountValue);
    if (!val || val <= 0) e.discountValue = 'Enter a discount value';
    if (edit.discountType === 'percentage' && val > 100) e.discountValue = 'Cannot exceed 100%';
    if (!edit.expiryDate) e.expiryDate = 'Pick an expiry date';
    if (edit.expiryDate && edit.expiryDate < edit.startDate) e.expiryDate = 'Expiry must be after start';
    if (Number(edit.usageLimit) < 1) e.usageLimit = 'Must be at least 1';
    setErrors(e);
    if (Object.keys(e).length) return;
    const r = await dispatch(saveCoupon({ ...edit, code, discountValue: val, minimumOrderAmount: Number(edit.minimumOrderAmount) || 0, maximumDiscount: Number(edit.maximumDiscount) || 0, usageLimit: Number(edit.usageLimit) }));
    if (done(r, edit.id ? 'Coupon updated' : 'Coupon created')) setEdit(null);
  };
  const set = (k, v) => setEdit({ ...edit, [k]: v });
  const err = (k) => errors[k] && <div className="field-err">{errors[k]}</div>;

  return (
    <>
      <PageHeader title="Coupons" subtitle="Create and manage discount codes" actions={<Button onClick={() => { setErrors({}); setEdit({ ...EMPTY }); }}><FiPlus /> Add coupon</Button>} />
      <section className="panel">
        <div className="table-responsive">
          <table className="table-v">
            <thead><tr><th>Code</th><th>Discount</th><th>Min order</th><th>Validity</th><th>Usage</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {coupons.map((c) => {
                const expired = c.expiryDate < today;
                return (
                  <tr key={c.id}>
                    <td><b className="coupon-code">{c.code}</b></td>
                    <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : formatPrice(c.discountValue)}{c.maximumDiscount > 0 && <small className="d-block text-muted">max {formatPrice(c.maximumDiscount)}</small>}</td>
                    <td>{formatPrice(c.minimumOrderAmount)}</td>
                    <td>{formatDate(c.startDate)} - {formatDate(c.expiryDate)}</td>
                    <td>{c.usedCount} / {c.usageLimit}</td>
                    <td>{expired ? <span className="sbadge sbadge-bad">Expired</span> : <button className={`sbadge sbadge-${c.isActive ? 'ok' : 'muted'} as-btn`} onClick={async () => { const r = await dispatch(toggleActive({ list: 'coupons', id: c.id })); if (r.error) toast.error(r.payload); }}>{c.isActive ? 'Active' : 'Disabled'}</button>}</td>
                    <td className="text-end"><button className="icon-btn" title="Edit" onClick={() => { setErrors({}); setEdit(c); }}><FiEdit2 /></button><button className="icon-btn text-danger" title="Delete" onClick={() => setDel(c)}><FiTrash2 /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <Modal show={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit coupon' : 'New coupon'} size="lg" footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save coupon</Button></>}>
        {edit && (
          <div className="row g-3">
            <div className="col-md-6"><label className="fld">Code<input value={edit.code} onChange={(e) => set('code', e.target.value.toUpperCase())} className={errors.code ? 'bad' : ''} />{err('code')}</label></div>
            <div className="col-md-6"><label className="fld">Type<select value={edit.discountType} onChange={(e) => set('discountType', e.target.value)}><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></label></div>
            <div className="col-md-4"><label className="fld">Value {edit.discountType === 'percentage' ? '(%)' : '(₹)'}<input type="number" min="0" value={edit.discountValue} onChange={(e) => set('discountValue', e.target.value)} className={errors.discountValue ? 'bad' : ''} />{err('discountValue')}</label></div>
            <div className="col-md-4"><label className="fld">Min order (₹)<input type="number" min="0" value={edit.minimumOrderAmount} onChange={(e) => set('minimumOrderAmount', e.target.value)} /></label></div>
            <div className="col-md-4"><label className="fld">Max discount (₹)<input type="number" min="0" value={edit.maximumDiscount} onChange={(e) => set('maximumDiscount', e.target.value)} /></label></div>
            <div className="col-md-4"><label className="fld">Start date<input type="date" value={edit.startDate} onChange={(e) => set('startDate', e.target.value)} /></label></div>
            <div className="col-md-4"><label className="fld">Expiry date<input type="date" value={edit.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} className={errors.expiryDate ? 'bad' : ''} />{err('expiryDate')}</label></div>
            <div className="col-md-4"><label className="fld">Usage limit<input type="number" min="1" value={edit.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} className={errors.usageLimit ? 'bad' : ''} />{err('usageLimit')}</label></div>
            <div className="col-12"><label className="f-check"><input type="checkbox" checked={edit.isActive} onChange={(e) => set('isActive', e.target.checked)} /><span>Active</span></label></div>
          </div>
        )}
      </Modal>
      <ConfirmModal show={!!del} onClose={() => setDel(null)} title="Delete coupon?" message={`Code ${del?.code} will be removed.`} confirmText="Delete" onConfirm={async () => { done(await dispatch(deleteCoupon(del.id)), 'Coupon deleted'); setDel(null); }} />
    </>
  );
}
