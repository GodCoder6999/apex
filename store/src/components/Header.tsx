import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { color, font, radius, shadow } from '../theme';
import { Icon } from '../icons';
import { Container } from '../ui';
import { categories } from '../data/catalog';
import { search } from '../data/catalog';
import { rupee } from '../format';
import { useStore } from '../store';

export function Header() {
  const nav = useNavigate();
  const { count, openDrawer } = useStore();
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const results = useMemo(() => (q.trim() ? search(q).slice(0, 6) : []), [q]);

  const go = (term?: string) => { const t = (term ?? q).trim(); if (t) { nav(`/search?q=${encodeURIComponent(t)}`); setQ(''); setMobOpen(false); } };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* announcement */}
      <div style={{ background: color.ink, color: '#fff', fontSize: 12.5, fontWeight: 500 }}>
        <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 36, textAlign: 'center' }}>
          <Icon name="truck" size={15} stroke="#5B8CFF" />
          <span>Free home delivery by our team · Genuine products with GST invoice</span>
        </Container>
      </div>

      {/* main bar */}
      <div style={{ background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${color.line}` }}>
        <Container style={{ display: 'flex', alignItems: 'center', gap: 18, height: 70 }}>
          <button onClick={() => setMobOpen(true)} className="mob-only" style={iconBtn}><Icon name="menu" size={22} /></button>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="S&D Solution" style={{ height: 38 }} />
            <span className="display desk-only" style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em' }}>S&amp;D Solution</span>
          </Link>

          {/* search (desktop) */}
          <div className="desk-only" style={{ flex: 1, position: 'relative', maxWidth: 560, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: color.surface, border: `1.5px solid ${color.line}`,
              borderRadius: radius.pill, height: 46, padding: '0 8px 0 16px' }}>
              <Icon name="search" size={18} stroke={color.muted} />
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()}
                placeholder="Search laptops, CCTV, components…" style={{ flex: 1, border: 0, background: 'transparent', fontSize: 14.5, outline: 'none' }} />
              <button onClick={() => go()} className="btnBlue" style={{ height: 34, padding: '0 16px', borderRadius: 999, background: color.blue, color: '#fff', border: 0, fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>Search</button>
            </div>
            {results.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#fff', borderRadius: radius.md,
                boxShadow: shadow.pop, border: `1px solid ${color.line}`, overflow: 'hidden', zIndex: 50 }}>
                {results.map((p) => (
                  <Link key={p.id} to={`/p/${p.slug}`} onClick={() => setQ('')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${color.lineSoft}` }}>
                    <img src={p.images[0]} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 12, color: color.muted }}>{p.brand}</div></div>
                    <span className="display" style={{ fontSize: 14, fontWeight: 600 }}>{rupee(p.price)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <Link to="/account" className="desk-only" style={iconBtn}><Icon name="user" size={21} /></Link>
            <button onClick={openDrawer} style={{ ...iconBtn, position: 'relative' }} aria-label="Cart">
              <Icon name="cart" size={21} />
              {count > 0 && <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, padding: '0 4px',
                background: color.blue, color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
            </button>
          </div>
        </Container>

        {/* category nav (desktop) */}
        <div className="desk-only" style={{ borderTop: `1px solid ${color.lineSoft}` }}>
          <Container style={{ display: 'flex', alignItems: 'center', gap: 4, height: 46 }}
            >
            <button onMouseEnter={() => setMenuOpen(true)} onMouseLeave={() => setMenuOpen(false)} onClick={() => nav('/shop')}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 0, cursor: 'pointer', fontWeight: 600, fontSize: 14, padding: '0 14px', height: '100%' }}>
              <Icon name="grid" size={17} stroke={color.blue} /> All categories
              {menuOpen && <MegaMenu />}
            </button>
            {categories.map((c) => (
              <Link key={c.id} to={`/c/${c.slug}`} className="underline-hover" style={{ fontSize: 14, fontWeight: 500, color: color.body, padding: '0 12px' }}>{c.name}</Link>
            ))}
            <Link to="/enquiry" style={{ marginLeft: 'auto', fontSize: 13.5, fontWeight: 600, color: color.blue }}>Bulk / B2B enquiry →</Link>
          </Container>
        </div>
      </div>

      {/* mobile menu drawer */}
      {mobOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div onClick={() => setMobOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(11,16,32,0.5)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 300, maxWidth: '85vw', background: '#fff', padding: 18, animation: 'sdFadeIn .2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" style={{ height: 34 }} />
              <button onClick={() => setMobOpen(false)} style={iconBtn}><Icon name="x" size={22} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: color.surface, borderRadius: radius.pill, height: 44, padding: '0 14px', marginBottom: 16 }}>
              <Icon name="search" size={18} stroke={color.muted} />
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} placeholder="Search…" style={{ flex: 1, border: 0, background: 'transparent', fontSize: 14.5, outline: 'none' }} />
            </div>
            {categories.map((c) => (
              <Link key={c.id} to={`/c/${c.slug}`} onClick={() => setMobOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 4px', borderBottom: `1px solid ${color.lineSoft}`, fontWeight: 600 }}>
                {c.name}<Icon name="cright" size={18} stroke={color.muted} />
              </Link>
            ))}
            <Link to="/enquiry" onClick={() => setMobOpen(false)} style={{ display: 'block', marginTop: 16, color: color.blue, fontWeight: 600 }}>Bulk / B2B enquiry →</Link>
            <Link to="/account" onClick={() => setMobOpen(false)} style={{ display: 'block', marginTop: 12, fontWeight: 600 }}>My account</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function MegaMenu() {
  return (
    <div onMouseEnter={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '100%', left: 0, width: 560, background: '#fff',
      borderRadius: radius.md, boxShadow: shadow.pop, border: `1px solid ${color.line}`, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, cursor: 'default', zIndex: 60 }}>
      {categories.map((c) => (
        <Link key={c.id} to={`/c/${c.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.sm }}
          onMouseEnter={(e) => (e.currentTarget.style.background = color.surface)} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
          <span style={{ width: 40, height: 40, borderRadius: 10, background: color.blueSoft, color: color.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={(c.icon as any)} size={20} stroke={color.blue} />
          </span>
          <div style={{ fontWeight: 600, fontSize: 14, fontFamily: font.body }}>{c.name}</div>
        </Link>
      ))}
    </div>
  );
}

const iconBtn: React.CSSProperties = { width: 42, height: 42, borderRadius: 999, background: 'transparent', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.ink };
