import { Link } from 'react-router-dom';

/** variant: dark | light | outline | ghost | danger   size: sm | md | lg */
export default function Button({ variant = 'dark', size = 'md', loading = false, block = false, to, className = '', children, disabled, type = 'button', ...rest }) {
  const cls = `v-btn v-btn-${variant} v-btn-${size} ${block ? 'w-100' : ''} ${className}`;
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading && <span className="btn-spin" />}
      {children}
    </button>
  );
}
