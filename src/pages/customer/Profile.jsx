import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiCamera, FiLock, FiMapPin, FiPackage, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { changePassword, logout, updateProfile } from '../../redux/slices/authSlice';
import { fetchMyOrders } from '../../redux/slices/orderSlice';
import { isEmail, isPhone, passwordIssues } from '../../utils/helpers';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import PasswordInput from '../../components/common/PasswordInput';
import EmptyState from '../../components/common/EmptyState';
import { AddressManager } from './AddressManagement';
import { OrderList } from './MyOrders';

const TABS = [['profile', 'Personal info', <FiUser key="u" />], ['password', 'Password', <FiLock key="l" />], ['addresses', 'Addresses', <FiMapPin key="m" />], ['orders', 'Order history', <FiPackage key="p" />]];

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'profile';
  const user = useSelector((s) => s.auth.user);
  const orders = useSelector((s) => s.orders.orders);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (tab === 'orders') dispatch(fetchMyOrders()); }, [tab, dispatch]);
  const [f, setF] = useState({ name: user.name, email: user.email, phone: user.phone || '' });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const saveProfile = async (e) => {
    e.preventDefault();
    const err = {};
    if (f.name.trim().length < 2) err.name = 'Enter your name';
    if (!isEmail(f.email)) err.email = 'Enter a valid email';
    if (!isPhone(f.phone)) err.phone = 'Enter a valid 10-digit mobile number';
    setErrors(err);
    if (Object.keys(err).length) return;
    setSaving(true);
    const res = await dispatch(updateProfile({ name: f.name.trim(), email: f.email.trim(), phone: f.phone }));
    setSaving(false);
    if (updateProfile.rejected.match(res)) { setErrors({ email: /email/i.test(res.payload) ? res.payload : undefined }); toast.error(res.payload || 'Could not update profile'); } else toast.success('Profile updated');
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const err = {};
    if (!pw.current) err.current = 'Enter your current password';
    const issues = passwordIssues(pw.next);
    if (issues.length) err.next = `Password needs ${issues.join(', ')}`;
    if (pw.next !== pw.confirm) err.confirm = 'Passwords do not match';
    setErrors(err);
    if (Object.keys(err).length) return;
    setSaving(true);
    const res = await dispatch(changePassword({ currentPassword: pw.current, newPassword: pw.next }));
    setSaving(false);
    if (changePassword.rejected.match(res)) { setErrors({ current: /current/i.test(res.payload) ? res.payload : undefined }); toast.error(res.payload || 'Could not change password'); return; }
    setPw({ current: '', next: '', confirm: '' });
    toast.success('Password changed');
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    const res = await dispatch(updateProfile({ file }));
    return updateProfile.rejected.match(res) ? toast.error(res.payload || 'Upload failed') : toast.success('Profile photo updated');
  };

  const go = (t) => { setErrors({}); setParams({ tab: t }); };

  return (
    <div className="container page-pad">
      <Breadcrumb items={[{ label: 'My Account' }]} />
      <div className="row g-4">
        <div className="col-lg-3">
          <div className="panel text-center profile-side">
            <label className="avatar-lg">
              {user.profileImage ? <img src={user.profileImage} alt="" /> : <span>{user.name[0]}</span>}
              <i><FiCamera /></i>
              <input type="file" accept="image/*" hidden onChange={onPhoto} />
            </label>
            <h6 className="mt-3 mb-0">{user.name}</h6><small className="text-muted">{user.email}</small>
            <nav className="side-tabs">
              {TABS.map(([v, l, ic]) => <button key={v} className={tab === v ? 'on' : ''} onClick={() => go(v)}>{ic}{l}</button>)}
              <button onClick={() => { dispatch(logout()); toast.success('Signed out'); navigate('/'); }}>Sign out</button>
            </nav>
          </div>
        </div>
        <div className="col-lg-9">
          <div className="panel">
            {tab === 'profile' && (
              <form onSubmit={saveProfile} noValidate>
                <h5>Personal information</h5>
                <div className="row g-3">
                  <div className="col-md-6"><label className="fld">Full name<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={errors.name ? 'bad' : ''} />{errors.name && <div className="field-err">{errors.name}</div>}</label></div>
                  <div className="col-md-6"><label className="fld">Mobile<input value={f.phone} maxLength={10} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '') })} className={errors.phone ? 'bad' : ''} />{errors.phone && <div className="field-err">{errors.phone}</div>}</label></div>
                  <div className="col-12"><label className="fld">Email<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={errors.email ? 'bad' : ''} />{errors.email && <div className="field-err">{errors.email}</div>}</label></div>
                </div>
                <Button type="submit" className="mt-2" loading={saving}>Save changes</Button>
              </form>
            )}
            {tab === 'password' && (
              <form onSubmit={savePassword} noValidate style={{ maxWidth: 440 }}>
                <h5>Change password</h5>
                <label className="fld">Current password<PasswordInput value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} invalid={!!errors.current} autoComplete="current-password" />{errors.current && <div className="field-err">{errors.current}</div>}</label>
                <label className="fld">New password<PasswordInput value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} invalid={!!errors.next} autoComplete="new-password" />{errors.next && <div className="field-err">{errors.next}</div>}</label>
                <label className="fld">Confirm new password<PasswordInput value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} invalid={!!errors.confirm} autoComplete="new-password" />{errors.confirm && <div className="field-err">{errors.confirm}</div>}</label>
                <Button type="submit" loading={saving}>Update password</Button>
              </form>
            )}
            {tab === 'addresses' && <AddressManager />}
            {tab === 'orders' && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="mb-0">Order history</h5><Link to="/orders" className="small">Open full order page</Link></div>
                {orders.length === 0 ? <EmptyState icon={<FiPackage />} title="No orders yet" actionText="Start shopping" actionTo="/shop" /> : <div className="order-list"><OrderList orders={orders.slice(0, 5)} compact /></div>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
