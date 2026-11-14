import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { COLOR_MAP } from '../../data/staticData';
import { GENDERS } from '../../utils/constants';
import { formatPrice } from '../../utils/helpers';

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="f-sec">
      <button type="button" className="f-head" onClick={() => setOpen(!open)} aria-expanded={open}>{title}<FiChevronDown className={open ? 'rot' : ''} /></button>
      {open && <div className="f-body">{children}</div>}
    </div>
  );
}

export default function ProductFilters({ filters, onChange, onClear, facets, maxPrice = 10000 }) {
  const toggle = (key, val) => {
    const cur = filters[key] || [];
    onChange({ [key]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] });
  };
  const maxVal = filters.maxPrice ? Number(filters.maxPrice) : maxPrice;
  return (
    <div className="filters">
      <div className="f-top"><h6>Filters</h6><button type="button" className="link-btn" onClick={onClear}>Clear all</button></div>

      {/* <Section title="Gender">
        {['all', ...GENDERS.filter((g) => g !== 'unisex')].map((g) => (
          <label key={g} className="f-check"><input type="radio" name="gender" checked={(filters.gender || 'all') === g} onChange={() => onChange({ gender: g })} /><span className="text-capitalize">{g}</span></label>
        ))}
      </Section> */}

      <Section title="Category">
        {facets.categories.map((c) => (
          <label key={c.slug} className="f-check"><input type="checkbox" checked={(filters.categories || []).includes(c.slug)} onChange={() => toggle('categories', c.slug)} /><span>{c.name}</span></label>
        ))}
      </Section>

      <Section title="Price">
        <input type="range" className="f-range" min={0} max={maxPrice} step={100} value={maxVal} onChange={(e) => onChange({ maxPrice: e.target.value })} aria-label="Maximum price" />
        <div className="f-price"><span>{formatPrice(filters.minPrice || 0)}</span><span>{formatPrice(maxVal)}</span></div>
        <div className="f-price-in">
          <input type="number" min="0" placeholder="Min" value={filters.minPrice || ''} onChange={(e) => onChange({ minPrice: e.target.value })} />
          <input type="number" min="0" placeholder="Max" value={filters.maxPrice || ''} onChange={(e) => onChange({ maxPrice: e.target.value })} />
        </div>
      </Section>

      <Section title="Size">
        <div className="f-chips">
          {facets.sizes.map((s) => <button type="button" key={s} className={`chip ${(filters.sizes || []).includes(s) ? 'on' : ''}`} onClick={() => toggle('sizes', s)}>{s}</button>)}
        </div>
      </Section>

      <Section title="Colour">
        <div className="f-swatches">
          {facets.colors.map((c) => (
            <button type="button" key={c} title={c} aria-label={c} className={`swatch ${(filters.colors || []).includes(c) ? 'on' : ''}`} style={{ background: COLOR_MAP[c] || '#ccc' }} onClick={() => toggle('colors', c)} />
          ))}
        </div>
      </Section>

      <Section title="Brand" defaultOpen={false}>
        {facets.brands.map((b) => (
          <label key={b} className="f-check"><input type="checkbox" checked={(filters.brands || []).includes(b)} onChange={() => toggle('brands', b)} /><span>{b}</span></label>
        ))}
      </Section>

      <Section title="Availability">
        <label className="f-check"><input type="checkbox" checked={!!filters.inStock} onChange={(e) => onChange({ inStock: e.target.checked })} /><span>In stock only</span></label>
        <label className="f-check"><input type="checkbox" checked={!!filters.onSale} onChange={(e) => onChange({ onSale: e.target.checked })} /><span>On sale</span></label>
      </Section>
    </div>
  );
}
