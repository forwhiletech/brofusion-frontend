import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Button from './Button';

export default function Modal({ show, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!show) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [show, onClose]);

  if (!show) return null;
  return (
    <div className="modal-v-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-v modal-v-${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-v-head">
          <h5>{title}</h5>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><FiX /></button>
        </div>
        <div className="modal-v-body">{children}</div>
        {footer && <div className="modal-v-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({ show, onClose, onConfirm, title = 'Are you sure?', message, confirmText = 'Confirm', danger = true }) {
  return (
    <Modal
      show={show} onClose={onClose} title={title} size="sm"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant={danger ? 'danger' : 'dark'} onClick={() => { onConfirm(); onClose(); }}>{confirmText}</Button></>}
    >
      <p className="mb-0 text-muted">{message}</p>
    </Modal>
  );
}
