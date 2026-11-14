export default function Loader({ fullPage = false, label = 'Loading' }) {
  return (
    <div className={fullPage ? 'loader-page' : 'loader-inline'} role="status" aria-label={label}>
      <span className="loader-ring" />
    </div>
  );
}

export function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="pc">
      <Skeleton className="sk-img" />
      <Skeleton className="sk-line mt-3" style={{ width: '70%' }} />
      <Skeleton className="sk-line" style={{ width: '40%' }} />
    </div>
  );
}
