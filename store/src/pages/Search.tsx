import { useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { color, radius } from '../theme';
import { Icon } from '../icons';
import { Container, Btn } from '../ui';
import { ProductCard } from '../components/ProductCard';
import { search, categories, brands } from '../data/catalog';

export function Search() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const q = params.get('q') ?? '';
  const [term, setTerm] = useState(q);
  const results = useMemo(() => search(q), [q]);

  const go = () => { const t = term.trim(); if (t) nav(`/search?q=${encodeURIComponent(t)}`); };

  return (
    <Container style={{ paddingTop: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: `1.5px solid ${color.line}`, borderRadius: radius.pill, height: 52, padding: '0 8px 0 18px', maxWidth: 620, marginBottom: 26 }}>
        <Icon name="search" size={20} stroke={color.muted} />
        <input value={term} autoFocus onChange={(e) => setTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} placeholder="Search products, brands, categories…" style={{ flex: 1, border: 0, background: 'transparent', fontSize: 15.5, outline: 'none' }} />
        <Btn onClick={go}>Search</Btn>
      </div>

      {q ? (
        <>
          <h1 className="display" style={{ fontSize: 26, fontWeight: 600, marginBottom: 4 }}>{results.length} result{results.length !== 1 ? 's' : ''} for "{q}"</h1>
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="display" style={{ fontSize: 20, fontWeight: 600 }}>Nothing found</div>
              <div style={{ color: color.muted, margin: '6px 0 18px' }}>Try a brand or category instead.</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {brands.slice(0, 6).map((b) => <Link key={b.id} to={`/search?q=${b.name}`} style={pill}>{b.name}</Link>)}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18, marginTop: 20 }}>
              {results.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </>
      ) : (
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Popular categories</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {categories.map((c) => <Link key={c.id} to={`/c/${c.slug}`} style={pill}>{c.name}</Link>)}
          </div>
        </div>
      )}
    </Container>
  );
}
const pill: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', background: color.surface, border: `1px solid ${color.line}`, borderRadius: 999, padding: '9px 16px', fontWeight: 600, fontSize: 14 };
