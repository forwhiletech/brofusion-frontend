import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { clearAuthError, loginUser } from '../../redux/slices/authSlice';
import { isEmail } from '../../utils/helpers';
import Button from '../../components/common/Button';
import PasswordInput from '../../components/common/PasswordInput';

export default function Login({ admin = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const from = location.state?.from;

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);
  useEffect(() => {
    if (user) navigate(user.role === 'admin' && (admin || !from) ? '/admin' : from || '/', { replace: true });
  }, [user, admin, from, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!isEmail(form.email)) err.email = 'Enter a valid email address';
    if (!form.password) err.password = 'Password is required';
    setErrors(err);
    if (Object.keys(err).length) return;
    const res = await dispatch(loginUser({ ...form, adminOnly: admin }));
    if (loginUser.fulfilled.match(res)) toast.success(`Welcome back, ${res.payload.user.name.split(' ')[0]}!`);
  };

  const fill = (email, password) => setForm({ email, password });

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit} noValidate>
        <Link to="/" className="logo">BRO FUSION</Link>
        <h1>{admin ? 'Admin sign in' : 'Welcome back'}</h1>
        <p className="auth-sub">{admin ? 'Sign in to manage your store.' : 'Sign in to access your orders and wishlist.'}</p>
        {error && <div className="alert-v alert-bad" role="alert">{error}</div>}
        <label className="fld">Email<input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={errors.email ? 'bad' : ''} />{errors.email && <div className="field-err">{errors.email}</div>}</label>
        <label className="fld">Password<PasswordInput autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} invalid={!!errors.password} />{errors.password && <div className="field-err">{errors.password}</div>}</label>
        <div className="text-end mb-3"><Link to="/forgot-password" className="small">Forgot password?</Link></div>
        <Button type="submit" block size="lg" loading={loading}>Sign in</Button>
        {!admin && <p className="auth-foot">New to BRO FUSION? <Link to="/register">Create an account</Link></p>}
        {/* {import.meta.env.DEV && <div className="demo-box">
          <small>Demo accounts</small>
          {admin ? <button type="button" onClick={() => fill('admin@vestra.com', 'Admin@123')}>Use admin demo login</button> : (
            <><button type="button" onClick={() => fill('customer@vestra.com', 'Customer@123')}>Use customer demo login</button>
              <button type="button" onClick={() => fill('admin@vestra.com', 'Admin@123')}>Use admin demo login</button></>
          )}
        </div>} */}
      </form>
    </div>
  );
}
