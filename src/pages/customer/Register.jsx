import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { clearAuthError, registerUser } from '../../redux/slices/authSlice';
import { isEmail, isPhone, passwordIssues, passwordStrength } from '../../utils/helpers';
import Button from '../../components/common/Button';
import PasswordInput from '../../components/common/PasswordInput';

const STRENGTH = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);
  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (f.name.trim().length < 2) err.name = 'Enter your full name';
    if (!isEmail(f.email)) err.email = 'Enter a valid email address';
    if (!isPhone(f.phone)) err.phone = 'Enter a valid 10-digit mobile number';
    const issues = passwordIssues(f.password);
    if (issues.length) err.password = `Password needs ${issues.join(', ')}`;
    if (f.confirm !== f.password) err.confirm = 'Passwords do not match';
    if (!f.terms) err.terms = 'Please accept the terms to continue';
    setErrors(err);
    if (Object.keys(err).length) return;
    const res = await dispatch(registerUser({ name: f.name.trim(), email: f.email.trim(), phone: f.phone, password: f.password }));
    if (registerUser.fulfilled.match(res)) toast.success('Account created. Welcome to BRO FUSION!');
  };

  const strength = passwordStrength(f.password);
  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit} noValidate>
        <Link to="/" className="logo">BRO FUSION</Link>
        <h1>Create account</h1>
        <p className="auth-sub">Join us for faster checkout and order tracking.</p>
        {error && <div className="alert-v alert-bad" role="alert">{error}</div>}
        <label className="fld">Full name<input value={f.name} onChange={(e) => set('name', e.target.value)} className={errors.name ? 'bad' : ''} autoComplete="name" />{errors.name && <div className="field-err">{errors.name}</div>}</label>
        <label className="fld">Email<input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} className={errors.email ? 'bad' : ''} autoComplete="email" />{errors.email && <div className="field-err">{errors.email}</div>}</label>
        <label className="fld">Mobile number<input inputMode="numeric" maxLength={10} value={f.phone} onChange={(e) => set('phone', e.target.value.replace(/\D/g, ''))} className={errors.phone ? 'bad' : ''} autoComplete="tel" />{errors.phone && <div className="field-err">{errors.phone}</div>}</label>
        <label className="fld">Password<PasswordInput value={f.password} onChange={(e) => set('password', e.target.value)} invalid={!!errors.password} autoComplete="new-password" />
          {f.password && <div className="strength"><span className={`s${strength}`} style={{ width: `${(strength / 4) * 100}%` }} /><small>{STRENGTH[strength]}</small></div>}
          {errors.password && <div className="field-err">{errors.password}</div>}</label>
        <label className="fld">Confirm password<PasswordInput value={f.confirm} onChange={(e) => set('confirm', e.target.value)} invalid={!!errors.confirm} autoComplete="new-password" />{errors.confirm && <div className="field-err">{errors.confirm}</div>}</label>
        <label className="f-check mb-1"><input type="checkbox" checked={f.terms} onChange={(e) => set('terms', e.target.checked)} /><span>I agree to the Terms &amp; Privacy Policy</span></label>
        {errors.terms && <div className="field-err mb-2">{errors.terms}</div>}
        <Button type="submit" block size="lg" loading={loading} className="mt-2">Create account</Button>
        <p className="auth-foot">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
