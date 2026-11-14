import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../redux/slices/authSlice';
import { isEmail } from '../../utils/helpers';
import Button from '../../components/common/Button';

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.auth.loading);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(email)) return setError('Enter a valid email address');
    setError('');
    const res = await dispatch(forgotPassword({ email }));
    if (forgotPassword.rejected.match(res)) return setError(res.payload || 'Could not send the reset link. Try again.');
    return setSent(true);
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit} noValidate>
        <Link to="/" className="logo">BRO FUSION</Link>
        <h1>Forgot password</h1>
        {sent ? (
          <>
            <div className="alert-v alert-ok">If an account exists for <b>{email}</b>, a reset link has been sent.</div>
            <p className="small text-muted">Demo mode: no email is sent. Use the link below to continue.</p>
            <Button to={`/reset-password?email=${encodeURIComponent(email)}&token=demo`} block>Open reset link</Button>
          </>
        ) : (
          <>
            <p className="auth-sub">Enter your email and we&apos;ll send you a link to reset your password.</p>
            <label className="fld">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={error ? 'bad' : ''} />{error && <div className="field-err">{error}</div>}</label>
            <Button type="submit" block size="lg" loading={loading}>Send reset link</Button>
          </>
        )}
        <p className="auth-foot"><Link to="/login">Back to sign in</Link></p>
      </form>
    </div>
  );
}
