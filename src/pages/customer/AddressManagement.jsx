import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit2, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { addAddress, deleteAddress, setDefaultAddress, updateAddress } from '../../redux/slices/authSlice';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import AddressForm, { AddressText, emptyAddress, validateAddress } from '../../components/common/AddressForm';

/** Reusable address manager (used on the Addresses page and inside Profile). */
export function AddressManager() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const addresses = user.addresses || [];
  const [editing, setEditing] = useState(null); // address object or {} for new
  const [errors, setErrors] = useState({});
  const [toDelete, setToDelete] = useState(null);

  const openNew = () => { setErrors({}); setEditing({ ...emptyAddress, name: user.name, phone: user.phone || '' }); };
  const [busy, setBusy] = useState(false);
  const run = async (thunk, okMsg) => {
    setBusy(true);
    const res = await dispatch(thunk);
    setBusy(false);
    if (res.error) { toast.error(res.payload || 'Something went wrong'); return false; }
    toast.success(okMsg);
    return true;
  };
  const save = async () => {
    const e = validateAddress(editing);
    setErrors(e);
    if (Object.keys(e).length) return;
    const ok = editing.id ? await run(updateAddress(editing), 'Address updated') : await run(addAddress(editing), 'Address added');
    if (ok) setEditing(null);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Saved addresses</h5>
        <Button size="sm" onClick={openNew}><FiPlus /> Add address</Button>
      </div>
      {addresses.length === 0 ? (
        <EmptyState icon={<FiMapPin />} title="No saved addresses" message="Add an address for faster checkout." actionText="Add address" onAction={openNew} />
      ) : (
        <div className="row g-3">
          {addresses.map((a) => (
            <div className="col-md-6" key={a.id}>
              <div className={`addr-card ${a.isDefault ? 'default' : ''}`}>
                <div className="mb-2"><span className="tag tag-light">{a.label}</span>{a.isDefault && <span className="tag tag-dark ms-1">Default</span>}</div>
                <AddressText a={a} />
                <div className="addr-actions">
                  <button onClick={() => { setErrors({}); setEditing(a); }}><FiEdit2 /> Edit</button>
                  <button onClick={() => setToDelete(a)}><FiTrash2 /> Delete</button>
                  {!a.isDefault && <button onClick={() => run(setDefaultAddress(a.id), 'Default address updated')}>Set as default</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal show={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit address' : 'Add new address'} size="lg"
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={busy}>Save address</Button></>}>
        {editing && <AddressForm value={editing} onChange={setEditing} errors={errors} showDefault />}
      </Modal>
      <ConfirmModal show={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => run(deleteAddress(toDelete.id), 'Address deleted')} title="Delete address?" message="This address will be removed from your account." confirmText="Delete" />
    </>
  );
}

export default function AddressManagement() {
  return (
    <div className="container page-pad">
      <Breadcrumb items={[{ label: 'Profile', to: '/profile' }, { label: 'Addresses' }]} />
      <h1 className="page-title">Address Book</h1>
      <AddressManager />
    </div>
  );
}
