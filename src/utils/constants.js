export const BRAND = 'BRO FUSION';
export const CURRENCY = '₹';
export const FREE_SHIPPING_THRESHOLD = 1999;
export const STANDARD_SHIPPING = 99;
export const EXPRESS_SHIPPING = 199;
export const TAX_RATE = 0.05;
export const PAGE_SIZE = 8;

export const STORAGE_KEYS = {
  cart: 'BRO_FUSION_cart',
  wishlist: 'BRO_FUSION_wishlist',
  auth: 'BRO_FUSION_auth',
  orders: 'BRO_FUSION_orders',
  products: 'BRO_FUSION_products',
  admin: 'BRO_FUSION_admin',
};

export const ORDER_STATUSES = [
  { value: 'placed', label: 'Order Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];
export const CANCELLABLE_STATUSES = ['placed', 'confirmed', 'packed'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const GENDERS = ['men', 'women', 'unisex'];

export const DELIVERY_METHODS = [
  { id: 'standard', label: 'Standard Delivery', eta: '4-6 business days', charge: STANDARD_SHIPPING },
  { id: 'express', label: 'Express Delivery', eta: '1-2 business days', charge: EXPRESS_SHIPPING },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Customer Rating' },
];
