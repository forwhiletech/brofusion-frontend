import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

/** Password field with visibility toggle. */
export default function PasswordInput({ value, onChange, placeholder, id, autoComplete, invalid = false }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-field">
      <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} className={invalid ? 'bad' : ''} />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <FiEyeOff /> : <FiEye />}</button>
    </div>
  );
}
