import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { ALL_SIZES, GENDERS } from '../../utils/constants';
import { COLOR_MAP } from '../../data/staticData';
import ImageUploader from './ImageUploader';
import Button from '../common/Button';

const EXTRA_SIZES = ['28', '30', '32', '34', '36', '26'];

export default function ProductForm({ initial, onSubmit, submitLabel = 'Save product', onCancel, saving = false }) {
  const categories = useSelector((s) => s.admin.categories);
  const [f, setF] = useState(() => ({
    name: '', description: '', category: categories[0]?.slug || '', gender: 'unisex', brand: 'VESTRA', price: '', discountPrice: '',
    images: [], sizes: [], colors: [], isFeatured: false, isActive: true, ...initial,
    tags: Array.isArray(initial?.tags) ? initial.tags.join(', ') : initial?.tags || '',
  }));
  const [stock, setStock] = useState(() => Object.fromEntries((initial?.variants || []).map((v) => [`${v.size}|${v.color}`, v.stock])));
  const [errors, setErrors] = useState({});
  const [newColor, setNewColor] = useState({ name: '', hex: '#999999' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggleSize = (s) => set('sizes', f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s]);

  const addColor = () => {
    const name = newColor.name.trim();
    if (!name) return toast.error('Enter a colour name');
    if (f.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) return toast.error('Colour already added');
    set('colors', [...f.colors, { name, hex: COLOR_MAP[name] || newColor.hex }]);
    return setNewColor({ name: '', hex: '#999999' });
  };

  const variantRows = useMemo(() => f.sizes.flatMap((s) => f.colors.map((c) => ({ size: s, color: c.name }))), [f.sizes, f.colors]);

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!f.name.trim()) err.name = 'Product name is required';
    if (!f.description.trim()) err.description = 'Description is required';
    if (!f.price || Number(f.price) <= 0) err.price = 'Enter a valid price';
    if (f.discountPrice && Number(f.discountPrice) >= Number(f.price)) err.discountPrice = 'Must be lower than the price';
    if (!f.images.length) err.images = 'Add at least one image';
    if (!f.sizes.length) err.sizes = 'Select at least one size';
    if (!f.colors.length) err.colors = 'Add at least one colour';
    setErrors(err);
    if (Object.keys(err).length) return toast.error('Please fix the highlighted fields');
    const code = String(initial?.id || Date.now()).replace(/\D/g, '').slice(-3).padStart(3, '0');
    const variants = variantRows.map((v) => ({
      sku: initial?.variants?.find((x) => x.size === v.size && x.color === v.color)?.sku || `VST-${code}-${v.size}-${v.color.slice(0, 3).toUpperCase()}`,
      size: v.size, color: v.color, stock: Math.max(0, Number(stock[`${v.size}|${v.color}`]) || 0),
    }));
    return onSubmit({
      ...f, name: f.name.trim(), price: Number(f.price), discountPrice: f.discountPrice ? Number(f.discountPrice) : 0,
      tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean), variants,
    });
  };

  const err = (k) => errors[k] && <div className="field-err">{errors[k]}</div>;

  return (
    <form onSubmit={submit} className="row g-4" noValidate>
      <div className="col-lg-8 d-grid gap-4 align-content-start">
        <section className="panel">
          <h5>Basic information</h5>
          <label className="fld">Product name<input className={errors.name ? 'bad' : ''} value={f.name} onChange={(e) => set('name', e.target.value)} />{err('name')}</label>
          <label className="fld">Description<textarea rows={5} className={errors.description ? 'bad' : ''} value={f.description} onChange={(e) => set('description', e.target.value)} />{err('description')}</label>
          <div className="row g-3">
            <div className="col-md-4"><label className="fld">Category<select value={f.category} onChange={(e) => set('category', e.target.value)}>{categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></label></div>
            {/* <div className="col-md-4"><label className="fld">Gender<select value={f.gender} onChange={(e) => set('gender', e.target.value)}>{GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}</select></label></div> */}
            <div className="col-md-4"><label className="fld">Brand<input value={f.brand} onChange={(e) => set('brand', e.target.value)} /></label></div>
          </div>
          <label className="fld">Tags (comma separated)<input value={f.tags} onChange={(e) => set('tags', e.target.value)} placeholder="linen, summer, formal" /></label>
        </section>

        <section className="panel">
          <h5>Images</h5>
          <ImageUploader images={f.images} onChange={(v) => set('images', v)} />
          {err('images')}
        </section>

        <section className="panel">
          <h5>Sizes &amp; colours</h5>
          <div className="fld">Sizes
            <div className="f-chips">{[...ALL_SIZES, ...EXTRA_SIZES].map((s) => <button type="button" key={s} className={`chip ${f.sizes.includes(s) ? 'on' : ''}`} onClick={() => toggleSize(s)}>{s}</button>)}</div>
            {err('sizes')}
          </div>
          <div className="fld">Colours
            <div className="color-tags">
              {f.colors.map((c) => <span key={c.name} className="color-tag"><i style={{ background: c.hex }} />{c.name}<button type="button" aria-label={`Remove ${c.name}`} onClick={() => set('colors', f.colors.filter((x) => x.name !== c.name))}><FiX /></button></span>)}
            </div>
            <div className="color-add">
              <input placeholder="Colour name (e.g. Olive)" value={newColor.name} onChange={(e) => setNewColor({ ...newColor, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())} />
              <input type="color" aria-label="Pick colour" value={COLOR_MAP[newColor.name] || newColor.hex} onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })} />
              <Button variant="outline" size="sm" onClick={addColor}><FiPlus /> Add</Button>
            </div>
            {err('colors')}
          </div>
        </section>

        <section className="panel">
          <h5>Stock by variant</h5>
          {variantRows.length === 0 ? <p className="text-muted mb-0">Select sizes and colours to manage stock per variant.</p> : (
            <div className="table-responsive">
              <table className="table-v">
                <thead><tr><th>Size</th><th>Colour</th><th style={{ width: 140 }}>Stock</th></tr></thead>
                <tbody>
                  {variantRows.map((v) => {
                    const k = `${v.size}|${v.color}`;
                    return <tr key={k}><td>{v.size}</td><td>{v.color}</td><td><input type="number" min="0" className="cell-input" value={stock[k] ?? 0} onChange={(e) => setStock({ ...stock, [k]: e.target.value })} /></td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="col-lg-4 d-grid gap-4 align-content-start">
        <section className="panel">
          <h5>Pricing</h5>
          <label className="fld">Price (₹)<input type="number" min="0" className={errors.price ? 'bad' : ''} value={f.price} onChange={(e) => set('price', e.target.value)} />{err('price')}</label>
          <label className="fld">Discount price (₹)<input type="number" min="0" className={errors.discountPrice ? 'bad' : ''} value={f.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} />{err('discountPrice')}</label>
        </section>
        <section className="panel">
          <h5>Visibility</h5>
          <label className="f-check"><input type="checkbox" checked={f.isActive} onChange={(e) => set('isActive', e.target.checked)} /><span>Active (visible in store)</span></label>
          <label className="f-check"><input type="checkbox" checked={f.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} /><span>Featured product</span></label>
        </section>
        <div className="d-flex gap-2">
          <Button type="submit" block disabled={saving}>{saving ? 'Saving…' : submitLabel}</Button>
          {onCancel && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
        </div>
      </div>
    </form>
  );
}
