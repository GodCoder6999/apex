import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { color, radius } from '../theme';
import { Icon } from '../icons';
import { Container, Btn, Pill } from '../ui';
import { ProductCard } from '../components/ProductCard';
import { inStock, byCategory, categoryBySlug, brands as allBrands } from '../data/catalog';
import { discountPct } from '../format';
import type { Product } from '../data/types';

type Sort = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'discount';
const sorts: { id: Sort; label: string }[] = [
  { id: 'relevance', label: 'Relevance' }, { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' }, { id: 'newest', label: 'Newest' }, { id: 'discount', label: 'Biggest discount' },
];

export function Shop() {
  const { slug } = useParams();
  const cat = slug ? categoryBySlug(slug) : null;
  const base = cat ? byCategory(cat.id) : inStock();

  const [brandSel, setBrandSel] = useState<string[]>([]);
  const [avail, setAvail] = useState<'all' | 'in' | 'few'>('all');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<Sort>('relevance');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brandList = useMemo(() => {
    const set = new Set(base.map((p) => p.brand));
    return allBrands.filter((b) => set.has(b.name));
  }, [base]);
  const priceMax = useMemo(() => Math.max(...base.map((p) => p.price), 1000), [base]);

  const list = useMemo(() => {
    let r: Product[] = base.filter((p) =>
      (!brandSel.length || brandSel.includes(p.brand)) &&
      (avail === 'all' || (avail === 'in' && p.stock > 3) || (avail === 'few' && p.stock > 0 && p.stock <= 3)) &&
      p.rating >= minRating &&
      (maxPrice == null || p.price <= maxPrice));
    switch (sort) {
      case 'price-asc': r = [...r].sort((a, b) => a.price - b.price); break;
      case 'price-desc': r = [...r].sort((a, b) => b.price - a.price); break;
      case 'newest': r = [...r].sort((a, b) => Number(!!b.newArrival) - Number(!!a.newArrival)); break;
      case 'discount': r = [...r].sort((a, b) => discountPct(b.price, b.mrp) - discountPct(a.price, a.mrp)); break;
    }
    return r;
  }, [base, brandSel, avail, minRating, maxPrice, sort]);

  const toggleBrand = (n: string) => setBrandSel((s) => s.includes(n) ? s.filter((x) => x !== n) : [...s, n]);
  const clearAll = () => { setBrandSel([]); setAvail('all'); setMinRating(0); setMaxPrice(null); };
  const activeCount = brandSel.length + (avail !== 'all' ? 1 : 0) + (minRating ? 1 : 0) + (maxPrice ? 1 : 0);

  const Filters = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <FilterBlock title="Brand">
        {brandList.map((b) => (
          <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer' }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${brandSel.includes(b.name) ? color.blue : color.line}`, background: brandSel.includes(b.name) ? color.blue : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {brandSel.includes(b.name) && <Icon name="check" size={13} stroke="#fff" sw={3} />}
            </span>
            <input type="checkbox" checked={brandSel.includes(b.name)} onChange={() => toggleBrand(b.name)} style={{ display: 'none' }} />
            <span style={{ fontSize: 14 }}>{b.name}</span>
          </label>
        ))}
      </FilterBlock>
      <FilterBlock title="Availability">
        {([['all', 'All'], ['in', 'In stock'], ['few', 'Only a few left']] as const).map(([v, l]) => (
          <Radio key={v} label={l} checked={avail === v} onChange={() => setAvail(v)} />
        ))}
      </FilterBlock>
      <FilterBlock title="Max price">
        <input type="range" min={1000} max={priceMax} step={1000} value={maxPrice ?? priceMax} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: '100%', accentColor: color.blue }} />
        <div style={{ fontSize: 13, color: color.body }}>Up to ₹{(maxPrice ?? priceMax).toLocaleString('en-IN')}</div>
      </FilterBlock>
      <FilterBlock title="Rating">
        {[4, 3, 0].map((r) => <Radio key={r} label={r ? `${r}★ & up` : 'Any rating'} checked={minRating === r} onChange={() => setMinRating(r)} />)}
      </FilterBlock>
      {activeCount > 0 && <Btn variant="ghost" onClick={clearAll} style={{ justifyContent: 'flex-start', color: color.red }}>Clear all filters</Btn>}
    </div>
  );

  return (
    <Container style={{ paddingTop: 30 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 className="display" style={{ margin: 0, fontSize: 34, fontWeight: 600, letterSpacing: '-0.03em' }}>{cat ? cat.name : 'All products'}</h1>
        <div style={{ color: color.muted, fontSize: 14, marginTop: 4 }}>{list.length} products</div>
      </div>

      {/* toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFiltersOpen(true)} className="mob-only" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 42, padding: '0 16px', borderRadius: 999, border: `1.5px solid ${color.line}`, background: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          <Icon name="filter" size={18} /> Filters {activeCount > 0 && <Pill bg={color.blue} fg="#fff">{activeCount}</Pill>}
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="desk-only" style={{ fontSize: 13.5, color: color.muted }}>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} style={{ height: 42, padding: '0 14px', borderRadius: 999, border: `1.5px solid ${color.line}`, background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            {sorts.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* active chips */}
      {activeCount > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {brandSel.map((b) => <Chip key={b} label={b} onX={() => toggleBrand(b)} />)}
          {avail !== 'all' && <Chip label={avail === 'in' ? 'In stock' : 'Few left'} onX={() => setAvail('all')} />}
          {minRating > 0 && <Chip label={`${minRating}★ & up`} onX={() => setMinRating(0)} />}
          {maxPrice && <Chip label={`≤ ₹${maxPrice.toLocaleString('en-IN')}`} onX={() => setMaxPrice(null)} />}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 30, alignItems: 'start' }}>
        <aside className="desk-only" style={{ position: 'sticky', top: 130, display: 'block' }}>{Filters}</aside>
        <div>
          {list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 20px', background: '#fff', borderRadius: radius.lg, border: `1px solid ${color.line}` }}>
              <div className="display" style={{ fontSize: 20, fontWeight: 600 }}>No products match</div>
              <div style={{ color: color.muted, marginTop: 6 }}>Try clearing some filters.</div>
              <Btn variant="outline" onClick={clearAll} style={{ marginTop: 16 }}>Clear filters</Btn>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18 }}>
              {list.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      {filtersOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 250 }}>
          <div onClick={() => setFiltersOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(11,16,32,0.5)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '85vh', overflowY: 'auto', background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, animation: 'sdSlideUp .3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="display" style={{ fontSize: 19, fontWeight: 600 }}>Filters</div>
              <button onClick={() => setFiltersOpen(false)} style={{ width: 38, height: 38, borderRadius: 999, background: color.surface, border: 0 }}><Icon name="x" size={18} /></button>
            </div>
            {Filters}
            <Btn full size="lg" style={{ marginTop: 20 }} onClick={() => setFiltersOpen(false)}>Show {list.length} products</Btn>
          </div>
        </div>
      )}
    </Container>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 8 }}>{title}</div>{children}</div>;
}
function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer' }} onClick={onChange}>
      <span style={{ width: 18, height: 18, borderRadius: 999, border: `1.5px solid ${checked ? color.blue : color.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {checked && <span style={{ width: 9, height: 9, borderRadius: 999, background: color.blue }} />}
      </span>
      <span style={{ fontSize: 14 }}>{label}</span>
    </label>
  );
}
function Chip({ label, onX }: { label: string; onX: () => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: color.blueSoft, color: color.blue, borderRadius: 999, padding: '6px 8px 6px 12px', fontSize: 13, fontWeight: 600 }}>
      {label}<button onClick={onX} style={{ background: 'rgba(26,77,240,0.15)', border: 0, borderRadius: 999, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.blue }}><Icon name="x" size={12} sw={2.4} /></button>
    </span>
  );
}
