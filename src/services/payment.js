import { apiPost } from './api';

const SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let sdkPromise = null;

/** Loads Razorpay's checkout script once, on demand. */
export const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SDK_URL; s.async = true;
      s.onload = () => resolve(true);
      s.onerror = () => { sdkPromise = null; s.remove(); reject(new Error('Could not load the payment window. Check your connection and try again.')); };
      document.body.appendChild(s);
    });
  }
  return sdkPromise;
};

/**
 * Runs the full online-payment flow for an existing unpaid order.
 * The amount is never sent from here: the server derives it from the stored order.
 * Resolves with { status: 'paid', order } | { status: 'failed' } | { status: 'dismissed' }.
 */
export const payForOrder = async (order, brand = 'VESTRA') => {
  await loadRazorpay();
  const session = await apiPost('/payments/create-order', { orderId: order.id });

  return new Promise((resolve, reject) => {
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };

    const rzp = new window.Razorpay({
      key: session.keyId,
      order_id: session.razorpayOrderId,
      amount: session.amount,
      currency: session.currency,
      name: brand,
      description: `Order ${session.orderNumber}`,
      prefill: session.prefill,
      theme: { color: '#1c1c1c' },
      modal: { ondismiss: () => done({ status: 'dismissed' }) },
      handler: async (response) => {
        try {
          const paid = await apiPost('/payments/verify', {
            orderId: order.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          done({ status: 'paid', order: paid });
        } catch (e) { settled = true; reject(e); }
      },
    });

    rzp.on('payment.failed', async (resp) => {
      try { await apiPost('/payments/failed', { orderId: order.id, reason: resp?.error?.description }); } catch { /* best effort */ }
      done({ status: 'failed', reason: resp?.error?.description });
    });
    rzp.open();
  });
};
