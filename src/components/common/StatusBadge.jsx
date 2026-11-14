import { ORDER_STATUSES } from '../../utils/constants';

const TONE = {
  placed: 'info', confirmed: 'info', packed: 'warn', shipped: 'warn', out_for_delivery: 'warn', delivered: 'ok', cancelled: 'bad',
  paid: 'ok', pending: 'warn', failed: 'bad', refunded: 'muted', active: 'ok', inactive: 'muted', blocked: 'bad',
};

export default function StatusBadge({ status }) {
  const label = ORDER_STATUSES.find((s) => s.value === status)?.label || status;
  return <span className={`sbadge sbadge-${TONE[status] || 'muted'}`}>{label}</span>;
}
