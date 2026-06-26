import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { useIsMobile } from '../components/useViewport';
import { rupee } from '../format';
import { useStore } from '../store';
import { inStock, categories, categoryBySlug, search as searchFn } from '../data/catalog';
import { productById } from '../data/catalog';
import type { Product } from '../data/types';

const SORTS: [string, string][] = [['relevance', 'Relevance'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['discount', 'Biggest discount'], ['rating', 'Top rated']];

export function Listing() {
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const loc = useLocation();
  const { slug } = useParams();
  const [sp] = useSearchParams();
  const { wish } = useStore();

  const mode = loc.pathname.startsWith('/c/') ? 'category'
    : loc.pathname.startsWith('/search') ? 'search'
    : loc.pathname.startsWith('/deals') ? 'deals'
    : loc.pathname.startsWith('/brands') ? 'brands'
    : loc.pathname.startsWith('/wishlist') ? 'wishlist' : 'all';
  const q = sp.get('q') || '';
  const brandParam = sp.get('b') || '';

  const [fBrands, setFBrands] = useState<string[]>([]);
  const [fAvail, setFAvail] = useState(false);
  const [fMaxPrice, setFMaxPrice] = useState(0);
  const [sort, setSort] = useState('relevance');
  const [filterOpen, setFilterOpen] = useState(false);

  const { base, eyebrow, title, sub } = useMemo(() => {
    const all = inStock();
    if (mode === 'search') { const b = searchFn(q); return { base: b, eyebrow: 'Search', title: `Results for "${q}"`, sub: `${b.length} product${b.length === 1 ? '' : 's'} found` }; }
    if (mode === 'deals') { const b = all.filter((p) => p.deal); return { base: b, eyebrow: 'Save big', title: 'Deals of the week', sub: 'Genuine products at their best prices — limited time.' }; }
    if (mode === 'wishlist') { const b = Object.keys(wish).map((id) => productById(id)).filter(Boolean) as Product[]; return { base: b, eyebrow: 'Saved', title: 'Your wishlist', sub: 'Items you saved for later.' }; }
    if (mode === 'brands') { const b = brandParam ? all.filter((p) => p.brand === brandParam) : all; return { base: b, eyebrow: 'Brand', title: brandParam || 'All brands', sub: `Genuine ${brandParam || ''} products in stock.` }; }
    if (mode === 'category') { const c = categoryBySlug(slug || ''); const b = c ? all.filter((p) => p.categoryId === c.id) : all; return { base: b, eyebrow: 'Category', title: c?.name || 'All products', sub: c ? `Genuine ${c.name.toLowerCase()} with full warranty.` : 'Everything in stock, ready to deliver.' }; }
    return { base: all, eyebrow: 'Category', title: 'All products', sub: 'Everything in stock, ready to deliver.' };
  }, [mode, q, brandParam, slug, wish]);

  const brandsIn = useMemo(() => [...new Set(base.map((p) => p.brand))].sort(), [base]);
  const priceCap = useMemo(() => Math.max(1, ...base.map((p) => p.price)), [base]);
  const curMax = fMaxPrice > 0 ? fMaxPrice : priceCap;

  const list = useMemo(() => {
    let l = base.filter((p) => (fBrands.length === 0 || fBrands.includes(p.brand)) && p.price <= curMax && (!fAvail || p.stock > 0));
    const fn: Record<string, (a: Product, b: Product) => number> = {
      relevance: (a, b) => ((b.bestSeller ? 2 : 0) + (b.newArrival ? 1 : 0)) - ((a.bestSeller ? 2 : 0) + (a.newArrival ? 1 : 0)) || b.rating - a.rating,
      'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price,
      discount: (a, b) => (1 - b.price / (b.mrp || b.price)) - (1 - a.price / (a.mrp || a.price)), rating: (a, b) => b.rating - a.rating,
    };
    return [...l].sort(fn[sort] || (() => 0));
  }, [base, fBrands, curMax, fAvail, sort]);

  const toggleBrand = (b: string) => setFBrands((c) => c.includes(b) ? c.filter((x) => x !== b) : [...c, b]);
  const clear = () => { setFBrands([]); setFAvail(false); setFMaxPrice(0); };
  const chips: { label: string; onRemove: () => void }[] = [
    ...fBrands.map((b) => ({ label: b, onRemove: () => toggleBrand(b) })),
    ...(fAvail ? [{ label: 'In stock only', onRemove: () => setFAvail(false) }] : []),
    ...(fMaxPrice > 0 && fMaxPrice < priceCap ? [{ label: `Under ${rupee(fMaxPrice)}`, onRemove: () => setFMaxPrice(0) }] : []),
  ];

  const aside = (
    <aside style={isMobile
      ? (filterOpen ? { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 150, background: '#fff', borderRadius: '22px 22px 0 0', maxHeight: '82vh', overflowY: 'auto', padding: '20px 18px calc(20px + env(safe-area-inset-bottom))', boxShadow: '0 -20px 50px rgba(11,16,32,0.25)', animation: 'sdSheet .3s cubic-bezier(.22,1,.36,1)' } : { display: 'none' })
      : { position: 'sticky', top: 88, background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 18, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 17 }}>Filters</span><button onClick={clear} style={{ border: 0, background: 'transparent', color: '#1A4DF0', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Reset</button></div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid rgba(11,16,32,0.07)' }}>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>In stock only</span>
        <button onClick={() => setFAvail((v) => !v)} style={{ width: 42, height: 24, border: 0, borderRadius: 999, background: fAvail ? '#1A4DF0' : 'rgba(11,16,32,0.14)', position: 'relative', cursor: 'pointer', transition: 'background .2s' }}><span style={{ position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'transform .2s', transform: fAvail ? 'translateX(18px)' : 'translateX(0)' }} /></button>
      </div>
      <div style={{ padding: '14px 0', borderTop: '1px solid rgba(11,16,32,0.07)' }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12 }}>Max price</div>
        <input type="range" min={0} max={priceCap} value={curMax} onChange={(e) => setFMaxPrice(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: '#1A4DF0', cursor: 'pointer' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8A93A6', marginTop: 8 }}><span>₹0</span><span style={{ fontWeight: 700, color: '#0B1020' }}>{rupee(curMax)}</span></div>
      </div>
      <div style={{ padding: '14px 0 4px', borderTop: '1px solid rgba(11,16,32,0.07)' }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12 }}>Brand</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {brandsIn.map((b) => { const on = fBrands.includes(b); return (
            <button key={b} onClick={() => toggleBrand(b)} style={{ display: 'flex', alignItems: 'center', gap: 11, border: 0, background: 'transparent', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
              <span style={{ width: 20, height: 20, flex: 'none', borderRadius: 6, border: `2px solid ${on ? '#1A4DF0' : 'rgba(11,16,32,0.18)'}`, background: on ? '#1A4DF0' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>}</span>
              <span style={{ flex: 1, fontSize: 13.5, color: '#0B1020' }}>{b}</span><span style={{ fontSize: 12, color: '#A8AEBD' }}>{base.filter((p) => p.brand === b).length}</span>
            </button>
          ); })}
        </div>
      </div>
      {filterOpen && <button onClick={() => setFilterOpen(false)} style={{ width: '100%', height: 50, marginTop: 18, border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 13, fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>Show {list.length} results</button>}
    </aside>
  );

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '22px clamp(16px,4vw,40px) 0', animation: 'sdFade .35s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8A93A6', marginBottom: 16 }}>
        <button onClick={() => nav('/')} style={{ border: 0, background: 'transparent', color: '#8A93A6', cursor: 'pointer', padding: 0, fontSize: 13 }}>Home</button>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>
        <span style={{ color: '#0B1020', fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        <div><span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.08em', color: '#1A4DF0', textTransform: 'uppercase' }}>{eyebrow}</span><h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(26px,4vw,38px)', letterSpacing: '-0.02em', margin: '8px 0 6px' }}>{title}</h1><p style={{ fontSize: 14, color: '#5B6478', margin: 0 }}>{sub}</p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isMobile && <button onClick={() => setFilterOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 16px', background: '#fff', border: '1.5px solid rgba(11,16,32,0.12)', borderRadius: 13, fontSize: 13.5, fontWeight: 600, color: '#0B1020', cursor: 'pointer' }}><svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4" /></svg>Filters</button>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 6px 0 14px', background: '#fff', border: '1.5px solid rgba(11,16,32,0.12)', borderRadius: 13 }}><span style={{ fontSize: 13, color: '#8A93A6', whiteSpace: 'nowrap' }}>Sort</span><select value={sort} onChange={(e) => setSort(e.target.value)} style={{ border: 0, background: 'transparent', outline: 'none', fontSize: 13.5, fontWeight: 600, color: '#0B1020', cursor: 'pointer', height: 42, paddingRight: 6 }}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        </div>
      </div>

      {chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, alignItems: 'center', marginBottom: 18 }}>
          {chips.map((ch, i) => <button key={i} onClick={ch.onRemove} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 8px 0 13px', background: '#EAF0FF', border: 0, borderRadius: 999, fontSize: 12.5, fontWeight: 600, color: '#1A4DF0', cursor: 'pointer' }}>{ch.label}<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg></button>)}
          <button onClick={clear} style={{ border: 0, background: 'transparent', color: '#8A93A6', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Clear all</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '248px 1fr', gap: 24, alignItems: 'start', paddingBottom: 40 }}>
        {isMobile && filterOpen && <div onClick={() => setFilterOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 149, background: 'rgba(11,16,32,0.45)' }} />}
        {aside}
        <div>
          {list.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '70px 24px', textAlign: 'center', background: '#fff', border: '1px dashed rgba(11,16,32,0.14)', borderRadius: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: 22, background: '#F1F2F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><svg width="38" height="38" fill="none" stroke="#C2C8D4" strokeWidth="1.6" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg></div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{mode === 'wishlist' ? 'You haven’t saved anything yet.' : base.length === 0 ? 'Nothing here yet — check back soon.' : 'No products match these filters.'}</div>
              <div style={{ fontSize: 13.5, color: '#8A93A6', marginBottom: 20, maxWidth: 280 }}>Try removing a filter, or explore another category.</div>
              <button onClick={() => mode === 'wishlist' ? nav('/shop') : clear()} style={{ height: 46, padding: '0 22px', border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 13, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{mode === 'wishlist' ? 'Browse products' : 'Clear filters'}</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 16 }}>
              {list.map((p) => <Reveal key={p.id}><ProductCard p={p} /></Reveal>)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
