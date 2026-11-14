import ProductCard from '../common/ProductCard';
import { ProductCardSkeleton } from '../common/Loader';
import EmptyState from '../common/EmptyState';
import { FiSearch } from 'react-icons/fi';

export default function ProductGrid({ products, loading = false, skeletons = 8, cols = 'col-6 col-md-4 col-xl-3', emptyAction }) {
  if (loading) {
    return <div className="row g-3 g-md-4">{Array.from({ length: skeletons }, (_, i) => <div key={i} className={cols}><ProductCardSkeleton /></div>)}</div>;
  }
  if (!products.length) {
    return <EmptyState icon={<FiSearch />} title="No products found" message="Try adjusting your filters or search term." actionText={emptyAction ? 'Clear filters' : undefined} onAction={emptyAction} />;
  }
  return <div className="row g-3 g-md-4">{products.map((p) => <div key={p.id} className={cols}><ProductCard product={p} /></div>)}</div>;
}
