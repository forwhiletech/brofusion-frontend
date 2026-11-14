export default function StatCard({ icon, label, value, hint, tone = 'default' }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-ico">{icon}</div>
      <div><div className="stat-label">{label}</div><div className="stat-value">{value}</div>{hint && <div className="stat-hint">{hint}</div>}</div>
    </div>
  );
}
