import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiSliders, FiX } from 'react-icons/fi';
import { filterProducts } from '../../utils/helpers';
import { ALL_SIZES, PAGE_SIZE } from '../../utils/constants';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import ProductFilters from '../../components/products/ProductFilters';
import ProductSort from '../../components/products/ProductSort';
import ProductGrid from '../../components/products/ProductGrid';

const list = (v) => (v ? v.split(',').filter(Boolean) : []);

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const products = useSelector((s) => s.products.items);
  const status = useSelector((s) => s.products.status);
  const categories = useSelector((s) => s.admin.categories.filter((c) => c.isActive));

  const filters = useMemo(() => ({
    search: params.get('search') || '', categories: list(params.get('category')), gender: params.get('gender') || 'all',
    sizes: list(params.get('sizes')), colors: list(params.get('colors')), brands: list(params.get('brands')),
    minPrice: params.get('min') || '', maxPrice: params.get('max') || '', inStock: params.get('stock') === '1', onSale: params.get('sale') === '1',
    sort: params.get('sort') || 'newest',
  }), [params]);
  const page = Math.max(1, Number(params.get('page')) || 1);

  const facets = useMemo(() => {
    const active = products.filter((p) => p.isActive);
    const sizeSet = new Set(active.flatMap((p) => p.sizes));
    const ordered = [...ALL_SIZES.filter((s) => sizeSet.has(s)), ...[...sizeSet].filter((s) => !ALL_SIZES.includes(s)).sort()];
    return {
      categories, sizes: ordered,
      colors: [...new Set(active.flatMap((p) => p.colors.map((c) => c.name)))].sort(),
      brands: [...new Set(active.map((p) => p.brand))].sort(),
    };
  }, [products, categories]);

  const KEY = { search: 'search', categories: 'category', gender: 'gender', sizes: 'sizes', colors: 'colors', brands: 'brands', minPrice: 'min', maxPrice: 'max', inStock: 'stock', onSale: 'sale', sort: 'sort' };
  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      const key = KEY[k];
      const empty = v === '' || v === false || v == null || (Array.isArray(v) && !v.length) || v === 'all';
      if (empty) next.delete(key);
      else next.set(key, Array.isArray(v) ? v.join(',') : v === true ? '1' : v);
    });
    next.delete('page');
    setParams(next, { replace: true });
  };
  const clear = () => setParams({}, { replace: true });
  const setPage = (p) => { const n = new URLSearchParams(params); n.set('page', p); setParams(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const results = useMemo(() => filterProducts(products, filters), [products, filters]);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const activeTags = [
    ...filters.categories.map((c) => ({ label: categories.find((x) => x.slug === c)?.name || c, remove: () => update({ categories: filters.categories.filter((x) => x !== c) }) })),
    ...(filters.gender !== 'all' ? [{ label: filters.gender, remove: () => update({ gender: 'all' }) }] : []),
    ...filters.sizes.map((s) => ({ label: `Size ${s}`, remove: () => update({ sizes: filters.sizes.filter((x) => x !== s) }) })),
    ...filters.colors.map((s) => ({ label: s, remove: () => update({ colors: filters.colors.filter((x) => x !== s) }) })),
    ...filters.brands.map((s) => ({ label: s, remove: () => update({ brands: filters.brands.filter((x) => x !== s) }) })),
    ...(filters.search ? [{ label: `“${filters.search}”`, remove: () => update({ search: '' }) }] : []),
    ...(filters.onSale ? [{ label: 'On sale', remove: () => update({ onSale: false }) }] : []),
    ...(filters.inStock ? [{ label: 'In stock', remove: () => update({ inStock: false }) }] : []),
  ];

  return (
    <div className="container page-pad">
      <Breadcrumb items={[{ label: 'Shop' }]} />
      <div className="shop-head">
        <h1>{filters.search ? `Results for “${filters.search}”` : 'Shop All'}</h1>
        <p>{status === 'succeeded' ? `${results.length} products` : 'Loading…'}</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-3">
          <div className={`filter-panel ${showFilters ? 'open' : ''}`}>
            <div className="d-lg-none filter-close"><b>Filters</b><button className="icon-btn" onClick={() => setShowFilters(false)} aria-label="Close filters"><FiX /></button></div>
            <ProductFilters filters={filters} onChange={update} onClear={clear} facets={facets} />
            <div className="d-lg-none p-3"><Button block onClick={() => setShowFilters(false)}>Show {results.length} results</Button></div>
          </div>
          {showFilters && <div className="drawer-backdrop d-lg-none" onClick={() => setShowFilters(false)} />}
        </div>
        <div className="col-lg-9">
          <div className="toolbar">
            <Button variant="outline" size="sm" className="d-lg-none" onClick={() => setShowFilters(true)}><FiSliders /> Filters</Button>
            <div className="active-tags">{activeTags.map((t, i) => <button key={i} className="tag-x" onClick={t.remove}>{t.label}<FiX /></button>)}</div>
            <ProductSort value={filters.sort} onChange={(v) => update({ sort: v })} />
          </div>
          <ProductGrid products={paged} loading={status !== 'succeeded'} emptyAction={clear} cols="col-6 col-xl-4" skeletons={6} />
          <Pagination page={current} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
