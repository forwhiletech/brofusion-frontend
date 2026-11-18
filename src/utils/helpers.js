import { CURRENCY } from './constants';

export const formatPrice = (n) => `${CURRENCY}${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const effectivePrice = (p) => (p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price);

export const discountPercent = (p) =>
  p.discountPrice && p.discountPrice < p.price ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;

export const formatDate = (d, withTime = false) => {
  if (!d) return '-';
  const date = new Date(d);
  const opts = { day: '2-digit', month: 'short', year: 'numeric' };
  if (withTime) Object.assign(opts, { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleString('en-IN', opts);
};

export const slugify = (s) =>
  String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export const debounce = (fn, ms = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const saveState = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full - ignore */
  }
};

/* ---------- Validation ---------- */
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
export const isPhone = (v) => /^[6-9]\d{9}$/.test(v || '');
export const isPincode = (v) => /^\d{6}$/.test(v || '');
export const passwordIssues = (v = '') => {
  const issues = [];
  if (v.length < 8) issues.push('at least 8 characters');
  if (!/[A-Z]/.test(v)) issues.push('an uppercase letter');
  if (!/[0-9]/.test(v)) issues.push('a number');
  return issues;
};
export const passwordStrength = (v = '') => {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return s; // 0-4
};

/* ---------- Pricing ---------- */
export const couponDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  if (subtotal < (coupon.minimumOrderAmount || 0)) return 0;
  let d = coupon.discountType === 'percentage' ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
  if (coupon.maximumDiscount) d = Math.min(d, coupon.maximumDiscount);
  return Math.round(Math.min(d, subtotal));
};

export const computeTotals = ({ items, coupon, shippingCharge, freeShippingThreshold, taxRate }) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = couponDiscount(coupon, subtotal);
  const shipping = items.length === 0 || subtotal - discount >= freeShippingThreshold ? 0 : shippingCharge;
  const tax = Math.round((subtotal - discount) * taxRate);
  return { subtotal, discount, total: subtotal - discount };
};

/* ---------- Product filtering / sorting ---------- */
export const productStock = (p) => (p.variants || []).reduce((s, v) => s + v.stock, 0);

export const filterProducts = (products, f) => {
  let list = products.filter((p) => p.isActive !== false);
  if (f.search) {
    const q = f.search.toLowerCase();
    list = list.filter((p) =>
      [p.name, p.brand, p.category, p.gender, ...(p.tags || [])].join(' ').toLowerCase().includes(q));
  }
  if (f.categories?.length) list = list.filter((p) => f.categories.includes(p.category));
  if (f.gender && f.gender !== 'all') list = list.filter((p) => p.gender === f.gender || p.gender === 'unisex');
  if (f.brands?.length) list = list.filter((p) => f.brands.includes(p.brand));
  if (f.sizes?.length) list = list.filter((p) => p.variants.some((v) => f.sizes.includes(v.size) && v.stock > 0));
  if (f.colors?.length) list = list.filter((p) => p.colors.some((c) => f.colors.includes(c.name)));
  if (f.minPrice) list = list.filter((p) => effectivePrice(p) >= Number(f.minPrice));
  if (f.maxPrice) list = list.filter((p) => effectivePrice(p) <= Number(f.maxPrice));
  if (f.inStock) list = list.filter((p) => productStock(p) > 0);
  if (f.onSale) list = list.filter((p) => discountPercent(p) > 0);
  const sorters = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    'price-asc': (a, b) => effectivePrice(a) - effectivePrice(b),
    'price-desc': (a, b) => effectivePrice(b) - effectivePrice(a),
    popularity: (a, b) => b.sold - a.sold,
    rating: (a, b) => b.averageRating - a.averageRating,
  };
  return [...list].sort(sorters[f.sort] || sorters.newest);
};

/* ---------- Files ---------- */
export const downloadFile = (filename, content, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const toCSV = (rows) =>
  rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

export const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export const invoiceHTML = (o) => `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${o.orderNumber}</title>
<style>body{font-family:Arial,sans-serif;color:#111;max-width:760px;margin:30px auto;padding:0 20px}h1{letter-spacing:6px;margin:0}
table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left;font-size:14px}
.r{text-align:right}.muted{color:#666;font-size:13px}</style></head><body>
<h1>BRO FUSION</h1><p class="muted">Tax Invoice</p><hr/>
<p><b>Invoice for order:</b> ${o.orderNumber}<br/><b>Date:</b> ${formatDate(o.createdAt)}<br/><b>Payment:</b> ${o.paymentMethod.toUpperCase()} (${o.paymentStatus})</p>
<p><b>Ship to:</b><br/>${o.shippingAddress.name}<br/>${o.shippingAddress.line1}${o.shippingAddress.line2 ? ', ' + o.shippingAddress.line2 : ''}<br/>${o.shippingAddress.city}, ${o.shippingAddress.state} - ${o.shippingAddress.pincode}</p>
<table><thead><tr><th>Item</th><th>SKU</th><th>Size/Colour</th><th class="r">Qty</th><th class="r">Price</th></tr></thead><tbody>
${o.items.map((i) => `<tr><td>${i.name}</td><td>${i.sku}</td><td>${i.size} / ${i.color}</td><td class="r">${i.qty}</td><td class="r">${formatPrice(i.price * i.qty)}</td></tr>`).join('')}
</tbody></table>
<p class="r">Subtotal: ${formatPrice(o.subtotal)}<br/>Discount: -${formatPrice(o.discount)}<br/>Shipping: ${formatPrice(o.shippingCharge)}<br/>Tax: ${formatPrice(o.tax)}<br/><b>Total: ${formatPrice(o.totalAmount)}</b></p>
<p class="muted">Thank you for shopping with BRO FUSION.</p></body></html>`;
