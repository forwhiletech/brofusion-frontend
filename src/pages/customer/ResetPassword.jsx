import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { resetPassword } from '../../redux/slices/authSlice';
import { passwordIssues } from '../../utils/helpers';
import Button from '../../components/common/Button';
import PasswordInput from '../../components/common/PasswordInput';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.auth.loading);
  const email = params.get('email');
  const token = params.get('token');
  const [f, setF] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    const issues = passwordIssues(f.password);
    if (issues.length) err.password = `Password needs ${issues.join(', ')}`;
    if (f.confirm !== f.password) err.confirm = 'Passwords do not match';
    setErrors(err);
    if (Object.keys(err).length) return;
    const res = await dispatch(resetPassword({ email, token, password: f.password }));
    if (resetPassword.rejected.match(res)) { toast.error(res.payload || 'Could not reset your password'); return; }
    toast.success('Password updated. Please sign in.');
    navigate('/login');
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit} noValidate>
        <Link to="/" className="logo">BRO FUSION</Link>
        <h1>Reset password</h1>
        {!token || !email ? (
          <><div className="alert-v alert-bad">This reset link is invalid or has expired.</div><Button to="/forgot-password" block>Request a new link</Button></>
        ) : (
          <>
            <p className="auth-sub">Choose a new password for <b>{email}</b>.</p>
            <label className="fld">New password<PasswordInput value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} invalid={!!errors.password} autoComplete="new-password" />{errors.password && <div className="field-err">{errors.password}</div>}</label>
            <label className="fld">Confirm password<PasswordInput value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} invalid={!!errors.confirm} autoComplete="new-password" />{errors.confirm && <div className="field-err">{errors.confirm}</div>}</label>
            <Button type="submit" block size="lg" loading={loading}>Update password</Button>
          </>
        )}
      </form>
    </div>
  );
}
