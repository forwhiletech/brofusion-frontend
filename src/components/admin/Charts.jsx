import { formatPrice } from '../../utils/helpers';

const short = (n) => (n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${n}`);

/** Simple SVG bar chart. data: [{ label, value }] */
export function BarChart({ data, height = 240, color = '#111', money = true }) {
  const w = 560; const pad = { t: 16, r: 8, b: 28, l: 44 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = (w - pad.l - pad.r) / data.length;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="chart" role="img" aria-label="Bar chart">
      {ticks.map((t) => {
        const y = pad.t + (height - pad.t - pad.b) * (1 - t);
        return <g key={t}><line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#e8e2d8" /><text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#8a8478">{short(Math.round(max * t))}</text></g>;
      })}
      {data.map((d, i) => {
        const h = ((height - pad.t - pad.b) * d.value) / max;
        const x = pad.l + i * bw + bw * 0.18;
        return (
          <g key={d.label}>
            <rect x={x} y={height - pad.b - h} width={bw * 0.64} height={h} rx="3" fill={color}><title>{`${d.label}: ${money ? formatPrice(d.value) : d.value}`}</title></rect>
            <text x={x + bw * 0.32} y={height - 10} textAnchor="middle" fontSize="11" fill="#6b655a">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Line chart for time series. data: [{ label, value }] */
export function LineChart({ data, height = 240, color = '#b08968' }) {
  const w = 560; const pad = { t: 16, r: 12, b: 28, l: 44 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = data.length > 1 ? (w - pad.l - pad.r) / (data.length - 1) : 0;
  const pts = data.map((d, i) => [pad.l + i * step, pad.t + (height - pad.t - pad.b) * (1 - d.value / max)]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = pts.length ? `${path} L${pts[pts.length - 1][0]},${height - pad.b} L${pts[0][0]},${height - pad.b} Z` : '';
  const every = Math.ceil(data.length / 8);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="chart" role="img" aria-label="Line chart">
      {[0, 0.5, 1].map((t) => {
        const y = pad.t + (height - pad.t - pad.b) * (1 - t);
        return <g key={t}><line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#e8e2d8" /><text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#8a8478">{short(Math.round(max * t))}</text></g>;
      })}
      <path d={area} fill={color} opacity="0.12" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3" fill={color}><title>{`${data[i].label}: ${formatPrice(data[i].value)}`}</title></circle>
          {i % every === 0 && <text x={p[0]} y={height - 10} textAnchor="middle" fontSize="10" fill="#6b655a">{data[i].label}</text>}
        </g>
      ))}
    </svg>
  );
}

/** Donut chart. data: [{ label, value, color }] */
export function DonutChart({ data, size = 190 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 70; const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="Donut chart">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#efe9df" strokeWidth="26" />
        {total > 0 && data.map((d) => {
          const len = (d.value / total) * c;
          const el = <circle key={d.label} cx="100" cy="100" r={r} fill="none" stroke={d.color} strokeWidth="26" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 100 100)"><title>{`${d.label}: ${d.value}`}</title></circle>;
          offset += len;
          return el;
        })}
        <text x="100" y="98" textAnchor="middle" fontSize="26" fontWeight="600" fill="#111">{total}</text>
        <text x="100" y="118" textAnchor="middle" fontSize="11" fill="#8a8478">orders</text>
      </svg>
      <ul className="donut-legend">
        {data.map((d) => <li key={d.label}><i style={{ background: d.color }} />{d.label}<b>{d.value}</b></li>)}
      </ul>
    </div>
  );
}
