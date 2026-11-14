import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiSearch } from 'react-icons/fi';
import { formatPrice, effectivePrice } from '../../utils/helpers';
import SmartImage from './SmartImage';

export default function SearchBar({ onDone, placeholder = 'Search for shirts, dresses, jackets…' }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const products = useSelector((s) => s.products.items);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const suggestions = q.trim().length >= 2
    ? products.filter((p) => p.isActive && `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5)
    : [];

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
    setOpen(false); setQ(''); onDone?.();
  };

  return (
    <div className="search-wrap" ref={ref}>
      <form className="search-box" onSubmit={submit} role="search">
        <FiSearch className="search-ico" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={placeholder} aria-label="Search products" />
      </form>
      {open && suggestions.length > 0 && (
        <ul className="search-suggest">
          {suggestions.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => { navigate(`/product/${p.slug}`); setOpen(false); setQ(''); onDone?.(); }}>
                <SmartImage src={p.images[0]} alt="" />
                <span><b>{p.name}</b><small>{formatPrice(effectivePrice(p))}</small></span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
