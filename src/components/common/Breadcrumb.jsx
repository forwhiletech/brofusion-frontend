import { Link } from 'react-router-dom';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="breadcrumb" className="crumbs">
      <Link to="/">Home</Link>
      {items.map((it, i) => (
        <span key={i}>
          <span className="crumb-sep">/</span>
          {it.to && i < items.length - 1 ? <Link to={it.to}>{it.label}</Link> : <span className="crumb-current">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}
