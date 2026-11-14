import { slugify } from '../utils/helpers';

const U = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/* Image pools (Unsplash). SmartImage falls back to a branded placeholder if any fail. */
const POOL = {
  women: ['1515886657613-9f3515b0c78f', '1496747611176-843222e1e57c', '1539109136881-3be0616acf4b', '1469334031218-e382a71b716b', '1572804013309-59a88b7e92f1', '1445205170230-053b83016050', '1483985988355-763728e1935b', '1509631179647-0177331693ae'],
  men: ['1489987707025-afc232f7ea0f', '1507679799987-c73779587ccf', '1617137968427-85924c800a22', '1552374196-1ab2a1c593e8', '1516826957135-700dedea698c', '1488161628813-04466f872be2', '1480455624313-e29b44bbfde1', '1519085360753-af0119f7cbe7'],
  tee: ['1576566588028-4147f3842f27', '1583743814966-8936f5b7be1a', '1521572163474-6864f9cf17ab', '1503342217505-b0a15ec3261c'],
  jacket: ['1591047139829-d91aecb6caea', '1551028719-00167b16eac5', '1544022613-e87ca75a784a', '1548883354-94bcfe321cbb'],
  store: ['1441986300917-64674bd600d8', '1523381210434-271e8be1f52b', '1434389677669-e08b4cac3105', '1490481651871-ab68de25d43d'],
};
const pick = (pool, i, n = 3) => Array.from({ length: n }, (_, k) => U(POOL[pool][(i + k * 2) % POOL[pool].length]));

export const COLOR_MAP = {
  Black: '#16161a', White: '#f7f5f0', Beige: '#d8c8b0', Navy: '#1f2a44', Olive: '#6b6b3a', Grey: '#8b8b8b',
  Rust: '#a4502d', Sage: '#9caf88', Indigo: '#2f3e6b', Cream: '#f1e7d3', Burgundy: '#6d1f2f', Camel: '#b98a55',
  Sky: '#a9c7dd', Blush: '#e7c4bf', Charcoal: '#3a3a3d',
};
const col = (...names) => names.map((name) => ({ name, hex: COLOR_MAP[name] }));
const S_ALL = ['XS', 'S', 'M', 'L', 'XL'];
const S_MEN = ['S', 'M', 'L', 'XL', 'XXL'];
const S_JEANS = ['28', '30', '32', '34', '36'];

export const mockCategories = [
  { id: 'cat1', name: 'T-Shirts', slug: 't-shirts', description: 'Everyday tees in premium cotton.', image: U('1576566588028-4147f3842f27', 700), isActive: true },
  { id: 'cat2', name: 'Shirts', slug: 'shirts', description: 'Linen and cotton shirts, tailored.', image: U('1489987707025-afc232f7ea0f', 700), isActive: true },
  { id: 'cat3', name: 'Dresses', slug: 'dresses', description: 'Fluid silhouettes for every occasion.', image: U('1496747611176-843222e1e57c', 700), isActive: true },
  { id: 'cat4', name: 'Jeans & Trousers', slug: 'jeans-trousers', description: 'Denim and tailored bottoms.', image: U('1542272604-787c3835535d', 700), isActive: true },
  { id: 'cat5', name: 'Jackets & Coats', slug: 'jackets-coats', description: 'Outerwear built for layering.', image: U('1591047139829-d91aecb6caea', 700), isActive: true },
  { id: 'cat6', name: 'Knitwear', slug: 'knitwear', description: 'Soft knits and cardigans.', image: U('1620799140408-edc6dcb6d633', 700), isActive: true },
  { id: 'cat7', name: 'Activewear', slug: 'activewear', description: 'Performance pieces that move with you.', image: U('1518611012118-696072aa579a', 700), isActive: true },
  { id: 'cat8', name: 'Ethnic Wear', slug: 'ethnic-wear', description: 'Contemporary kurtas and co-ords.', image: U('1583391733956-6c78276477e2', 700), isActive: true },
];

/* [name, category, gender, brand, price, discountPrice, imagePool, colors, sizes, tags, flags] */
const RAW = [
  ['Essential Heavyweight Tee', 't-shirts', 'unisex', 'VESTRA', 1299, 999, 'tee', col('Black', 'White', 'Beige'), S_MEN, ['basics', 'cotton'], { n: 1, f: 1, sold: 940, r: 4.6 }],
  ['Boxy Graphic Tee', 't-shirts', 'men', 'Northline', 1499, 1199, 'tee', col('Charcoal', 'Cream'), S_MEN, ['graphic', 'oversized'], { n: 1, sold: 610, r: 4.3 }],
  ['Ribbed Baby Tee', 't-shirts', 'women', 'Aurelia', 899, 0, 'women', col('White', 'Blush', 'Black'), S_ALL, ['ribbed', 'cropped'], { sold: 720, r: 4.5 }],
  ['Oxford Linen Shirt', 'shirts', 'men', 'VESTRA', 2499, 1899, 'men', col('Sky', 'White', 'Sage'), S_MEN, ['linen', 'formal'], { f: 1, sold: 520, r: 4.7 }],
  ['Relaxed Poplin Shirt', 'shirts', 'women', 'Aurelia', 2199, 0, 'women', col('White', 'Sky'), S_ALL, ['poplin', 'work'], { n: 1, sold: 340, r: 4.4 }],
  ['Cuban Collar Shirt', 'shirts', 'men', 'Northline', 1999, 1499, 'men', col('Rust', 'Olive', 'Cream'), S_MEN, ['resort', 'summer'], { sold: 410, r: 4.2 }],
  ['Satin Slip Dress', 'dresses', 'women', 'Aurelia', 3499, 2799, 'women', col('Burgundy', 'Black', 'Cream'), S_ALL, ['evening', 'satin'], { f: 1, n: 1, sold: 880, r: 4.8 }],
  ['Tiered Cotton Midi Dress', 'dresses', 'women', 'VESTRA', 2999, 0, 'women', col('Sage', 'Blush'), S_ALL, ['midi', 'summer'], { sold: 450, r: 4.5 }],
  ['Wrap Linen Dress', 'dresses', 'women', 'VESTRA Studio', 3799, 2999, 'women', col('Rust', 'Navy', 'Beige'), S_ALL, ['linen', 'wrap'], { n: 1, sold: 300, r: 4.6 }],
  ['Straight Fit Selvedge Jeans', 'jeans-trousers', 'men', 'Kinfolk Denim', 3299, 2599, 'men', col('Indigo', 'Black'), S_JEANS, ['denim', 'straight'], { f: 1, sold: 760, r: 4.7 }],
  ['High-Rise Wide Leg Jeans', 'jeans-trousers', 'women', 'Kinfolk Denim', 2999, 0, 'women', col('Indigo', 'Grey'), ['26', '28', '30', '32', '34'], ['denim', 'wide-leg'], { sold: 690, r: 4.6 }],
  ['Pleated Tailored Trousers', 'jeans-trousers', 'unisex', 'VESTRA Studio', 2799, 2199, 'men', col('Charcoal', 'Camel', 'Navy'), S_JEANS, ['tailored', 'pleated'], { n: 1, sold: 280, r: 4.4 }],
  ['Wool Blend Overcoat', 'jackets-coats', 'men', 'VESTRA Studio', 8999, 6999, 'jacket', col('Camel', 'Charcoal'), S_MEN, ['wool', 'winter'], { f: 1, sold: 190, r: 4.9 }],
  ['Quilted Utility Jacket', 'jackets-coats', 'unisex', 'Northline', 4999, 3999, 'jacket', col('Olive', 'Black'), S_MEN, ['quilted', 'utility'], { sold: 360, r: 4.5 }],
  ['Cropped Trench Coat', 'jackets-coats', 'women', 'Aurelia', 6499, 0, 'jacket', col('Beige', 'Black'), S_ALL, ['trench', 'classic'], { n: 1, sold: 220, r: 4.7 }],
  ['Merino Crew Sweater', 'knitwear', 'unisex', 'VESTRA', 3999, 3199, 'women', col('Cream', 'Navy', 'Burgundy'), S_ALL, ['merino', 'winter'], { f: 1, sold: 540, r: 4.8 }],
  ['Chunky Cable Cardigan', 'knitwear', 'women', 'Aurelia', 4299, 0, 'women', col('Cream', 'Sage'), S_ALL, ['cable', 'cozy'], { sold: 260, r: 4.5 }],
  ['Half-Zip Knit Pullover', 'knitwear', 'men', 'Northline', 3499, 2799, 'men', col('Grey', 'Navy', 'Olive'), S_MEN, ['half-zip', 'knit'], { sold: 330, r: 4.3 }],
  ['Seamless Training Leggings', 'activewear', 'women', 'Northline', 1999, 1599, 'women', col('Black', 'Charcoal', 'Sage'), S_ALL, ['gym', 'seamless'], { sold: 980, r: 4.6 }],
  ['Dry-Fit Performance Tee', 'activewear', 'men', 'Northline', 1199, 899, 'tee', col('Black', 'Navy', 'Grey'), S_MEN, ['running', 'dry-fit'], { n: 1, sold: 870, r: 4.4 }],
  ['Fleece Track Jacket', 'activewear', 'unisex', 'Northline', 3299, 0, 'jacket', col('Grey', 'Black'), S_MEN, ['fleece', 'track'], { sold: 400, r: 4.5, out: true }],
  ['Chikankari Cotton Kurta', 'ethnic-wear', 'women', 'VESTRA Studio', 2599, 1999, 'women', col('White', 'Blush', 'Sky'), S_ALL, ['kurta', 'handcrafted'], { f: 1, sold: 500, r: 4.8 }],
  ['Mandarin Collar Kurta Set', 'ethnic-wear', 'men', 'VESTRA Studio', 3299, 2699, 'men', col('Cream', 'Navy', 'Olive'), S_MEN, ['kurta', 'festive'], { n: 1, sold: 310, r: 4.6 }],
  ['Printed Co-ord Set', 'ethnic-wear', 'women', 'Aurelia', 3999, 0, 'women', col('Rust', 'Sage'), S_ALL, ['co-ord', 'festive'], { sold: 270, r: 4.4 }],
];

const DAY = 86400000;
export const mockProducts = RAW.map((r, idx) => {
  const [name, category, gender, brand, price, discountPrice, pool, colors, sizes, tags, o = {}] = r;
  const id = `p${idx + 1}`;
  const variants = [];
  sizes.forEach((size, si) =>
    colors.forEach((c, ci) => {
      const stock = o.out ? 0 : (idx * 7 + si * 3 + ci * 5) % 11 === 0 ? 0 : ((idx + si * 2 + ci * 3) % 14) + 1;
      variants.push({ sku: `VST-${String(idx + 1).padStart(3, '0')}-${size}-${c.name.slice(0, 3).toUpperCase()}`, size, color: c.name, stock });
    }));
  return {
    id, name, slug: slugify(name),
    description: `${name} from ${brand}. Designed with considered proportions, soft-hand fabric and clean finishing so it works hard in a modern wardrobe. Machine washable, made with responsibly sourced materials.`,
    category, gender, brand, images: pick(pool, idx, 4), price, discountPrice, sizes, colors, variants,
    totalStock: variants.reduce((s, v) => s + v.stock, 0), tags,
    isFeatured: !!o.f, isNew: !!o.n, isActive: true,
    averageRating: o.r || 4.3, reviewCount: 8 + ((idx * 13) % 90), sold: o.sold || 100,
    createdAt: new Date(Date.now() - (o.n ? (idx % 9) + 2 : 30 + idx * 6) * DAY).toISOString(),
  };
});

export const mockBanners = [
  { id: 'b1', title: 'The Autumn Edit', subtitle: 'Layered knits, tailored coats and warm neutrals.', image: U('1483985988355-763728e1935b', 1600), link: '/shop?category=knitwear', isActive: true, displayOrder: 1 },
  { id: 'b2', title: 'Linen Season Sale', subtitle: 'Up to 30% off shirts and dresses.', image: U('1496747611176-843222e1e57c', 1600), link: '/shop?sale=1', isActive: true, displayOrder: 2 },
  { id: 'b3', title: 'New: Studio Tailoring', subtitle: 'Sharp trousers and coats for work and weekend.', image: U('1507679799987-c73779587ccf', 1600), link: '/shop?search=tailored', isActive: true, displayOrder: 3 },
];

export const mockCoupons = [
  { id: 'cp1', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minimumOrderAmount: 999, maximumDiscount: 500, startDate: '2026-01-01', expiryDate: '2027-12-31', usageLimit: 1000, usedCount: 214, isActive: true },
  { id: 'cp2', code: 'FLAT300', discountType: 'fixed', discountValue: 300, minimumOrderAmount: 2499, maximumDiscount: 300, startDate: '2026-01-01', expiryDate: '2027-12-31', usageLimit: 500, usedCount: 87, isActive: true },
  { id: 'cp3', code: 'FESTIVE25', discountType: 'percentage', discountValue: 25, minimumOrderAmount: 3999, maximumDiscount: 1500, startDate: '2026-10-01', expiryDate: '2026-12-31', usageLimit: 200, usedCount: 45, isActive: true },
  { id: 'cp4', code: 'OLDSALE', discountType: 'percentage', discountValue: 15, minimumOrderAmount: 0, maximumDiscount: 400, startDate: '2025-01-01', expiryDate: '2025-06-30', usageLimit: 100, usedCount: 100, isActive: false },
];

const addr = (id, label, name, phone, line1, city, state, pincode, isDefault = false) => ({ id, label, name, phone, line1, line2: '', city, state, pincode, isDefault });

export const mockUsers = [
  { id: 'u1', name: 'Store Admin', email: 'admin@vestra.com', password: 'Admin@123', phone: '9800000001', role: 'admin', profileImage: '', addresses: [], isActive: true, createdAt: '2026-01-02T09:00:00.000Z' },
  { id: 'u2', name: 'Aarav Sharma', email: 'customer@vestra.com', password: 'Customer@123', phone: '9876543210', role: 'customer', profileImage: '', addresses: [addr('a1', 'Home', 'Aarav Sharma', '9876543210', '12, Lake View Apartments, MG Road', 'Bengaluru', 'Karnataka', '560001', true), addr('a2', 'Office', 'Aarav Sharma', '9876543210', 'Tower B, Tech Park, Whitefield', 'Bengaluru', 'Karnataka', '560066')], isActive: true, createdAt: '2026-02-11T10:30:00.000Z' },
  ...[
    ['Priya Nair', 'priya@example.com', 'Kochi', 'Kerala', '682001'], ['Rohan Mehta', 'rohan@example.com', 'Mumbai', 'Maharashtra', '400001'],
    ['Ishita Verma', 'ishita@example.com', 'Delhi', 'Delhi', '110001'], ['Karthik Iyer', 'karthik@example.com', 'Chennai', 'Tamil Nadu', '600001'],
    ['Sneha Reddy', 'sneha@example.com', 'Hyderabad', 'Telangana', '500001'], ['Vikram Singh', 'vikram@example.com', 'Jaipur', 'Rajasthan', '302001'],
    ['Ananya Das', 'ananya@example.com', 'Kolkata', 'West Bengal', '700001'], ['Meera Patel', 'meera@example.com', 'Ahmedabad', 'Gujarat', '380001'],
  ].map(([name, email, city, state, pin], i) => ({
    id: `u${i + 3}`, name, email, password: 'Customer@123', phone: `98765${String(10000 + i * 137).slice(0, 5)}`, role: 'customer', profileImage: '',
    addresses: [addr(`a${i + 3}`, 'Home', name, `98765${String(10000 + i * 137).slice(0, 5)}`, `${i + 21}, Rose Street`, city, state, pin, true)],
    isActive: i !== 6, createdAt: new Date(Date.now() - (20 + i * 17) * DAY).toISOString(),
  })),
];

/* Deterministic generated orders spread over ~6 months for dashboard/report charts */
const STATUS_CYCLE = ['delivered', 'delivered', 'delivered', 'shipped', 'delivered', 'packed', 'delivered', 'cancelled', 'confirmed', 'delivered', 'placed', 'out_for_delivery'];
const NEXT_LABEL = { placed: 'Order placed', confirmed: 'Order confirmed', packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' };
const FLOW = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export const makeHistory = (status, createdAt) => {
  const base = new Date(createdAt).getTime();
  if (status === 'cancelled') return [{ status: 'placed', date: createdAt, note: NEXT_LABEL.placed }, { status: 'cancelled', date: new Date(base + 3600e3 * 5).toISOString(), note: 'Cancelled by customer' }];
  const upto = FLOW.indexOf(status);
  return FLOW.slice(0, upto + 1).map((s, i) => ({ status: s, date: new Date(base + i * 3600e3 * 18).toISOString(), note: NEXT_LABEL[s] }));
};

export const mockOrders = Array.from({ length: 44 }, (_, i) => {
  const user = mockUsers[1 + (i % 9)];
  const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
  const createdAt = new Date(Date.now() - (i * 4 + (i % 3)) * DAY - i * 3600e3).toISOString();
  const items = [0, 1].slice(0, 1 + (i % 2)).map((k) => {
    const p = mockProducts[(i * 5 + k * 7) % mockProducts.length];
    const v = p.variants[(i + k) % p.variants.length];
    return { productId: p.id, name: p.name, sku: v.sku, image: p.images[0], size: v.size, color: v.color, price: p.discountPrice || p.price, qty: 1 + ((i + k) % 2) };
  });
  const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
  const discount = i % 4 === 0 ? Math.min(300, Math.round(subtotal * 0.1)) : 0;
  const shippingCharge = subtotal - discount >= 1999 ? 0 : 99;
  const tax = Math.round((subtotal - discount) * 0.05);
  const address = user.addresses[0] || addr('x', 'Home', user.name, user.phone, '1 Main Street', 'Pune', 'Maharashtra', '411001');
  const online = i % 3 !== 0;
  return {
    id: `o${i + 1}`, orderNumber: `VST-${26000 + i + 1}`, userId: user.id,
    customer: { name: user.name, email: user.email, phone: user.phone },
    items, shippingAddress: address, billingAddress: address, subtotal, discount, shippingCharge, tax,
    totalAmount: subtotal - discount + shippingCharge + tax,
    paymentMethod: online ? 'online' : 'cod',
    paymentStatus: status === 'cancelled' ? (online ? 'refunded' : 'pending') : status === 'delivered' || online ? 'paid' : 'pending',
    paymentReference: online ? `pay_${(900000 + i * 731).toString(36)}` : '',
    orderStatus: status, trackingNumber: ['shipped', 'out_for_delivery', 'delivered'].includes(status) ? `TRK${7700000 + i * 19}` : '',
    deliveryMethod: i % 5 === 0 ? 'express' : 'standard',
    statusHistory: makeHistory(status, createdAt), createdAt,
  };
});

export const mockReviews = [
  { id: 'r1', user: 'Priya N.', rating: 5, title: 'Exactly what I wanted', comment: 'Beautiful fabric and the fit is true to size. Already ordered a second colour.', date: '2026-09-18' },
  { id: 'r2', user: 'Rohan M.', rating: 4, title: 'Great quality', comment: 'Feels premium for the price. Stitching is clean. Runs slightly generous.', date: '2026-09-02' },
  { id: 'r3', user: 'Ishita V.', rating: 5, title: 'Love it', comment: 'Washed it a few times and it still looks brand new. Delivery was quick too.', date: '2026-08-21' },
  { id: 'r4', user: 'Karthik I.', rating: 4, title: 'Good everyday piece', comment: 'Comfortable and versatile. The colour is slightly deeper than in the photos.', date: '2026-08-05' },
  { id: 'r5', user: 'Sneha R.', rating: 3, title: 'Decent', comment: 'Nice material but I would size down. Customer support helped with the exchange.', date: '2026-07-14' },
];

export const mockCollections = [
  { title: 'Linen Edit', subtitle: 'Breathable, relaxed, effortless', image: U('1469334031218-e382a71b716b', 900), link: '/shop?search=linen' },
  { title: 'Studio Tailoring', subtitle: 'Sharp lines for work & weekend', image: U('1594938298603-c8148c4dae35', 900), link: '/shop?search=tailored' },
  { title: 'Move Collection', subtitle: 'Performance meets style', image: U('1518611012118-696072aa579a', 900), link: '/shop?category=activewear' },
];

export const heroImages = { store: U('1441986300917-64674bd600d8', 1400), about: U('1523381210434-271e8be1f52b', 1400), contact: U('1490481651871-ab68de25d43d', 1400) };
export const BRANDS = [...new Set(RAW.map((r) => r[3]))];
