import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiCheckCircle, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { clearLocalCart } from '../../redux/slices/cartSlice';
import { orderUpdated, placeOrder } from '../../redux/slices/orderSlice';
import { addAddress } from '../../redux/slices/authSlice';
import { payForOrder } from '../../services/payment';
import { computeTotals, formatPrice, isEmail, isPhone } from '../../utils/helpers';
import { DELIVERY_METHODS, FREE_SHIPPING_THRESHOLD, TAX_RATE } from '../../utils/constants';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import AddressForm, { AddressText, emptyAddress, validateAddress } from '../../components/common/AddressForm';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import { sendWhatsAppOrder } from '../../services/whatsapp';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { items, coupon } = useSelector((s) => s.cart);
  const placedRef = useRef(false);

  const saved = user.addresses || [];
  const [contact, setContact] = useState({ name: user.name, email: user.email, phone: user.phone || '' });
  const [addrId, setAddrId] = useState(saved.find((a) => a.isDefault)?.id || saved[0]?.id || 'new');
  const [newAddr, setNewAddr] = useState({ ...emptyAddress, name: user.name, phone: user.phone || '' });
  const [saveAddr, setSaveAddr] = useState(true);
  const [sameBilling, setSameBilling] = useState(true);
  const [billing, setBilling] = useState({ ...emptyAddress, name: user.name });
  const [delivery, setDelivery] = useState('standard');
  const [payment, setPayment] = useState('cod');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!items.length && !placedRef.current) navigate('/cart', { replace: true }); }, [items.length, navigate]);

  const method = DELIVERY_METHODS.find((d) => d.id === delivery);
  const totals = useMemo(() => computeTotals({
    items, coupon, shippingCharge: method.charge, taxRate: TAX_RATE,
    freeShippingThreshold: delivery === 'standard' ? FREE_SHIPPING_THRESHOLD : Infinity,
  }), [items, coupon, method, delivery]);

  if (!items.length) return <div className="container page-pad"><EmptyState title="Your cart is empty" actionText="Back to shop" actionTo="/shop" /></div>;

  const shippingAddress = addrId === 'new' ? newAddr : saved.find((a) => a.id === addrId);

  const validate = () => {
    const e = {};
    if (contact.name.trim().length < 2) e.cName = 'Enter your name';
    if (!isEmail(contact.email)) e.cEmail = 'Enter a valid email';
    if (!isPhone(contact.phone)) e.cPhone = 'Enter a valid 10-digit mobile number';
    if (addrId === 'new') Object.entries(validateAddress(newAddr)).forEach(([k, v]) => { e[`s_${k}`] = v; });
    if (!sameBilling) Object.entries(validateAddress(billing)).forEach(([k, v]) => { e[`b_${k}`] = v; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const prefix = (p, errs) => Object.fromEntries(Object.entries(errs).filter(([k]) => k.startsWith(p)).map(([k, v]) => [k.slice(p.length), v]));

  const buildBody = () => {
    const ship = addrId === 'new' ? { ...newAddr } : null;
    return {
      items: items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, quantity: i.qty })),
      deliveryMethod: delivery, paymentMethod: payment, couponCode: coupon?.code || undefined, customerPhone: contact.phone,
      ...(addrId === 'new' ? { shippingAddress: ship } : { addressId: addrId }),
      sameBilling, ...(!sameBilling && { billingAddress: billing }),
    };
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!validate()) { toast.error('Please fix the highlighted fields'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setBusy(true);
    let order;
    try {
      // The server re-prices every line, re-validates the coupon and reserves stock atomically.
      order = await dispatch(placeOrder(buildBody())).unwrap();
    } catch (message) {
      setBusy(false);
      toast.error(message || 'Could not place your order');
      return;
    }
    placedRef.current = true;
    dispatch(clearLocalCart()); // the server already emptied the account cart
    if (addrId === 'new' && saveAddr) dispatch(addAddress({ ...newAddr, isDefault: saved.length === 0 }));

    // if (payment === 'online') {
    //   try {
    //     const result = await payForOrder(order);
    //     if (result.status === 'paid') { dispatch(orderUpdated(result.order)); toast.success('Payment successful'); }
    //     else if (result.status === 'failed') toast.error('Payment failed. You can retry from your order page.');
    //     else toast.info('Payment not completed. You can finish it from your order page.');
    //   } catch (err2) {
    //     toast.error(`${err2.message.replace(/\.$/, "")}. Your order is saved - you can retry payment from your order page.`);
    //   }
    // }

    const address = addrId === 'new'
    ? newAddr
    : saved.find((a) => a.id === addrId);

    sendWhatsAppOrder({
      items,
      customer: contact,
      address,
      totals: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        total: totals.total,
      },
    });
    
    navigate(`/order-success/${order.id}`, { replace: true });
  };

  const err = (k) => errors[k] && <div className="field-err">{errors[k]}</div>;

  return (
    <div className="container page-pad">
      <Breadcrumb items={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="page-title">Checkout</h1>
      <form onSubmit={submit} noValidate>
        <div className="row g-4">
          <div className="col-lg-7 d-grid gap-4 align-content-start">
            <section className="panel">
              <h5><span className="step-no">1</span> Customer information</h5>
              <div className="row g-3">
                <div className="col-md-4"><label className="fld">Full name<input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className={errors.cName ? 'bad' : ''} />{err('cName')}</label></div>
                <div className="col-md-4"><label className="fld">Email<input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className={errors.cEmail ? 'bad' : ''} />{err('cEmail')}</label></div>
                <div className="col-md-4"><label className="fld">Mobile<input maxLength={10} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value.replace(/\D/g, '') })} className={errors.cPhone ? 'bad' : ''} />{err('cPhone')}</label></div>
              </div>
            </section>

            <section className="panel">
              <h5><span className="step-no">2</span> Shipping address</h5>
              {saved.map((a) => (
                <label key={a.id} className={`opt-card ${addrId === a.id ? 'on' : ''}`}>
                  <input type="radio" name="addr" checked={addrId === a.id} onChange={() => setAddrId(a.id)} />
                  <div><span className="tag tag-light">{a.label}</span>{a.isDefault && <span className="tag tag-dark ms-1">Default</span>}<AddressText a={a} /></div>
                </label>
              ))}
              <label className={`opt-card ${addrId === 'new' ? 'on' : ''}`}>
                <input type="radio" name="addr" checked={addrId === 'new'} onChange={() => setAddrId('new')} /><div><b>Use a new address</b></div>
              </label>
              {addrId === 'new' && (
                <div className="mt-3">
                  <AddressForm value={newAddr} onChange={setNewAddr} errors={prefix('s_', errors)} />
                  <label className="f-check mt-3"><input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} /><span>Save this address to my account</span></label>
                </div>
              )}
              <label className="f-check mt-3"><input type="checkbox" checked={sameBilling} onChange={(e) => setSameBilling(e.target.checked)} /><span>Billing address same as shipping</span></label>
              {!sameBilling && <div className="mt-3"><h6>Billing address</h6><AddressForm value={billing} onChange={setBilling} errors={prefix('b_', errors)} showLabel={false} /></div>}
            </section>

            {/* <section className="panel">
              <h5><span className="step-no">3</span> Delivery method</h5>
              {DELIVERY_METHODS.map((d) => (
                <label key={d.id} className={`opt-card ${delivery === d.id ? 'on' : ''}`}>
                  <input type="radio" name="delivery" checked={delivery === d.id} onChange={() => setDelivery(d.id)} />
                  <div className="flex-grow-1"><b>{d.label}</b><div className="small text-muted">{d.eta}</div></div>
                  <b>{d.id === 'standard' && totals.subtotal - totals.discount >= FREE_SHIPPING_THRESHOLD ? 'Free' : formatPrice(d.charge)}</b>
                </label>
              ))}
            </section> */}

            {/* <section className="panel">
              <h5><span className="step-no">4</span> Payment</h5>
              <label className={`opt-card ${payment === 'cod' ? 'on' : ''}`}>
                <input type="radio" name="pay" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
                <FiDollarSign /><div><b>Cash on Delivery</b><div className="small text-muted">Pay when your order arrives</div></div>
              </label>
              <label className={`opt-card ${payment === 'online' ? 'on' : ''}`}>
                <input type="radio" name="pay" checked={payment === 'online'} onChange={() => setPayment('online')} />
                <FiCreditCard /><div><b>Pay online</b><div className="small text-muted">UPI, cards, net banking (Razorpay)</div></div>
              </label>
            </section> */}
          </div>

          <div className="col-lg-5">
            <CartSummary totals={totals} shippingLabel={`Shipping (${method.label})`}>
              <div className="co-items">{items.map((i) => <CartItem key={i.key} item={i} readOnly />)}</div>
              <Button type="submit" block size="lg" loading={busy}><FiCheckCircle /> {payment === 'online' ? `Pay ${formatPrice(totals.total)}` : `Place order · ${formatPrice(totals.total)}`}</Button>
              <p className="small text-muted text-center mt-2 mb-0">By placing your order you agree to our terms. <Link to="/cart">Edit cart</Link></p>
            </CartSummary>
          </div>
        </div>
      </form>

    </div>
  );
}
