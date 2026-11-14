import { INDIAN_STATES } from '../../utils/constants';
import { isPhone, isPincode } from '../../utils/helpers';

export const emptyAddress = { label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: 'Karnataka', pincode: '', isDefault: false };

export const validateAddress = (a) => {
  const e = {};
  if (!a.name?.trim()) e.name = 'Full name is required';
  if (!isPhone(a.phone)) e.phone = 'Enter a valid 10-digit mobile number';
  if (!a.line1?.trim()) e.line1 = 'Address is required';
  if (!a.city?.trim()) e.city = 'City is required';
  if (!a.state) e.state = 'Select a state';
  if (!isPincode(a.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
  return e;
};

export default function AddressForm({ value, onChange, errors = {}, showLabel = true, showDefault = false }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  const field = (k, label, props = {}) => (
    <label className="fld">{label}
      <input value={value[k] || ''} onChange={(e) => set(k, e.target.value)} className={errors[k] ? 'bad' : ''} {...props} />
      {errors[k] && <div className="field-err">{errors[k]}</div>}
    </label>
  );
  return (
    <div className="row g-3">
      <div className="col-md-6">{field('name', 'Full name', { autoComplete: 'name' })}</div>
      <div className="col-md-6">{field('phone', 'Mobile number', { inputMode: 'numeric', maxLength: 10, autoComplete: 'tel' })}</div>
      <div className="col-12">{field('line1', 'Address line 1', { autoComplete: 'address-line1' })}</div>
      <div className="col-12">{field('line2', 'Address line 2 (optional)', { autoComplete: 'address-line2' })}</div>
      <div className="col-md-4">{field('city', 'City')}</div>
      <div className="col-md-4">
        <label className="fld">State
          <select value={value.state} onChange={(e) => set('state', e.target.value)} className={errors.state ? 'bad' : ''}>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select>
          {errors.state && <div className="field-err">{errors.state}</div>}
        </label>
      </div>
      <div className="col-md-4">{field('pincode', 'Pincode', { inputMode: 'numeric', maxLength: 6 })}</div>
      {showLabel && (
        <div className="col-md-6">
          <label className="fld">Address type
            <select value={value.label} onChange={(e) => set('label', e.target.value)}><option>Home</option><option>Office</option><option>Other</option></select>
          </label>
        </div>
      )}
      {showDefault && <div className="col-md-6 d-flex align-items-end"><label className="f-check mb-2"><input type="checkbox" checked={!!value.isDefault} onChange={(e) => set('isDefault', e.target.checked)} /><span>Make this my default address</span></label></div>}
    </div>
  );
}

export function AddressText({ a }) {
  return (
    <address className="addr-text">
      <b>{a.name}</b><br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}, {a.state} - {a.pincode}<br />Phone: {a.phone}
    </address>
  );
}
