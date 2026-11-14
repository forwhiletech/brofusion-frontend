import { useState } from 'react';
import { FiClock, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { isEmail } from '../../utils/helpers';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';

const FAQ = [
  ['How long does delivery take?', 'Standard delivery takes 4-6 business days and express takes 1-2 business days within metro cities.'],
  ['What is your return policy?', 'Unworn items with tags can be returned or exchanged within 14 days of delivery.'],
  ['How do I find my size?', 'Each product lists available sizes. If you are between sizes we recommend sizing up for relaxed fits.'],
  ['Can I cancel my order?', 'Yes. Orders can be cancelled from My Orders until they are shipped.'],
];

export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(0);

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (f.name.trim().length < 2) err.name = 'Enter your name';
    if (!isEmail(f.email)) err.email = 'Enter a valid email';
    if (!f.subject.trim()) err.subject = 'Enter a subject';
    if (f.message.trim().length < 10) err.message = 'Message must be at least 10 characters';
    setErrors(err);
    if (Object.keys(err).length) return;
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setF({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container page-pad">
      <Breadcrumb items={[{ label: 'Contact' }]} />
      <h1 className="page-title">Get in touch</h1>
      <div className="row g-4">
        <div className="col-lg-7">
          <form className="panel" onSubmit={submit} noValidate>
            <div className="row g-3">
              <div className="col-md-6"><label className="fld">Name<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={errors.name ? 'bad' : ''} />{errors.name && <div className="field-err">{errors.name}</div>}</label></div>
              <div className="col-md-6"><label className="fld">Email<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={errors.email ? 'bad' : ''} />{errors.email && <div className="field-err">{errors.email}</div>}</label></div>
              <div className="col-12"><label className="fld">Subject<input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} className={errors.subject ? 'bad' : ''} />{errors.subject && <div className="field-err">{errors.subject}</div>}</label></div>
              <div className="col-12"><label className="fld">Message<textarea rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className={errors.message ? 'bad' : ''} />{errors.message && <div className="field-err">{errors.message}</div>}</label></div>
            </div>
            <Button type="submit">Send message</Button>
          </form>
        </div>
        <div className="col-lg-5">
          <div className="panel info-list">
            <div><FiMapPin /><span>BRO FUSION, pattapan school, Junction Main Rd, opposite tharamangalam, Tharamangalam, Tamil Nadu 636502</span></div>
            <div><FiPhone /><a href="tel:+919025553064">+91 90255 53064</a></div>
            <div><FiMail /><a href="mailto:brofusion2026@gmail.com">brofusion2026@gmail.com</a></div>
            <div><FiClock /><span>Mon-Sun, 9:30am - 10:00pm IST</span></div>
          </div>
        </div>
      </div>
      <section className="section">
        <div className="section-head"><h2>Frequently asked</h2></div>
        <div className="faq">
          {FAQ.map(([q, a], i) => (
            <div key={q} className={`faq-item ${open === i ? 'open' : ''}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>{q}<span>{open === i ? '−' : '+'}</span></button>
              {open === i && <p>{a}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
