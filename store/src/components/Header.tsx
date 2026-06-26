import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { catMetaForProduct, catMetaBySlug } from '../data/catmeta';
import { categories, inStock, search } from '../data/catalog';
import { rupee } from '../format';
import { useStore } from '../store';

const POPULAR = ['Laptops', 'CCTV camera', 'MacBook', 'SSD', 'Wi-Fi router', 'Gaming PC'];

export function Header({ isMobile, scrolled }: { isMobile: boolean; scrolled: boolean }) {
  const nav = useNavigate();
  const { count, openDrawer, wish } = useStore();
  const [q, setQ] = useState('');
  const [mega, setMega] = useState(false);
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cats = useMemo(() => categories.map((c) => ({ ...c, count: inStock().filter((p) => p.categoryId === c.id).length, meta: catMetaBySlug(c.slug) })), []);
  const results = useMemo(() => (q.trim() ? search(q).slice(0, 6) : []), [q]);
  const wishCount = Object.keys(wish).length;

  useEffect(() => { const on = () => setSearchOpen(true); window.addEventListener('sd-open-search', on); return () => window.removeEventListener('sd-open-search', on); }, []);

  const go = (path: string) => { setMega(false); setMenu(false); setSearchOpen(false); nav(path); };
  const submit = () => { if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`); };
  const headerH = scrolled ? 62 : 72;

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: `rgba(255,255,255,${scrolled ? 0.95 : 0.85})`, backdropFilter: 'blur(16px)', borderBottom: `1px solid rgba(11,16,32,${scrolled ? 0.08 : 0.05})`, transition: 'background .3s, border-color .3s' }}>
      <Announcement />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)', display: 'flex', alignItems: 'center', gap: 18, height: headerH, transition: 'height .3s cubic-bezier(.22,1,.36,1)' }}>
        {isMobile && (
          <button onClick={() => setMenu(true)} aria-label="Menu" style={iconBtnPlain}><svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg></button>
        )}

        <button onClick={() => go('/')} aria-label="S&D Solution home" style={{ display: 'flex', alignItems: 'center', border: 0, background: 'transparent', cursor: 'pointer', flex: 'none', padding: 0 }}>
          <Logo wordmark={!isMobile} />
        </button>

        {!isMobile && (<>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 'none', marginLeft: 8 }}>
            <button onClick={() => setMega((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 13px', border: 0, background: mega ? '#F1F2F6' : 'transparent', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#0B1020', cursor: 'pointer', transition: 'background .2s' }}>
              Categories <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ transition: 'transform .25s', transform: `rotate(${mega ? 180 : 0}deg)` }}><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <button onClick={() => go('/deals')} style={navBtn}>Deals <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#E8112D', padding: '2px 5px', borderRadius: 5, letterSpacing: '0.03em' }}>HOT</span></button>
            <button onClick={() => go('/brands')} style={navBtn}>Brands</button>
            <button onClick={() => go('/track')} style={navBtn}>Track order</button>
          </nav>

          <div style={{ flex: 1, position: 'relative', maxWidth: 440, margin: '0 auto' }}>
            <div className="sd-searchbox" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44, background: '#F1F2F6', border: '1.5px solid transparent', borderRadius: 13, padding: '0 14px' }}>
              <svg width="18" height="18" fill="none" stroke="#8A93A6" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Search laptops, CCTV, brands…" style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 'none', fontSize: 14, color: '#0B1020' }} />
              {q && <button onClick={() => setQ('')} style={{ border: 0, background: 'transparent', color: '#8A93A6', cursor: 'pointer', display: 'flex', padding: 2 }}><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg></button>}
            </div>
            {q.trim() && (
              <div style={{ position: 'absolute', top: 52, left: 0, right: 0, background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 16, boxShadow: '0 24px 60px -16px rgba(11,16,32,0.28)', padding: 8, zIndex: 60, animation: 'sdPop .22s cubic-bezier(.22,1,.36,1)' }}>
                {results.length > 0 ? (<>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#A8AEBD', textTransform: 'uppercase', padding: '8px 10px 6px' }}>Products</div>
                  {results.map((p) => { const m = catMetaForProduct(p); return (
                    <button key={p.id} onClick={() => { setQ(''); go(`/p/${p.slug}`); }} style={srow}>
                      <div style={{ width: 42, height: 42, flex: 'none', borderRadius: 10, background: m.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <svg width="22" height="22" fill="none" stroke={m.accent} strokeWidth="1.6" viewBox="0 0 24 24"><path d={m.icon} /></svg>}</div>
                      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div><div style={{ fontSize: 12, color: '#8A93A6' }}>{p.brand}</div></div>
                      <span style={{ fontSize: 13.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{rupee(p.price)}</span>
                    </button>
                  ); })}
                  <button onClick={submit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', marginTop: 6, height: 40, border: 0, background: '#F1F2F6', borderRadius: 11, fontSize: 13, fontWeight: 600, color: '#1A4DF0', cursor: 'pointer' }}>See all results for "{q}" <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg></button>
                </>) : (
                  <div style={{ padding: '26px 16px', textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No matches for "{q}"</div><div style={{ fontSize: 12.5, color: '#8A93A6' }}>Try a brand like Dell or a category like CCTV.</div></div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
            <button onClick={() => go('/account')} aria-label="Account" className="sd-hbtn" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 12px', border: 0, background: 'transparent', borderRadius: 11, cursor: 'pointer', color: '#0B1020' }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg><span style={{ fontSize: 13.5, fontWeight: 500 }}>Sign in</span></button>
            <button onClick={() => go('/wishlist')} aria-label="Wishlist" className="sd-hbtn" style={{ position: 'relative', width: 40, height: 40, border: 0, background: 'transparent', borderRadius: 11, cursor: 'pointer', color: '#0B1020', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>{wishCount > 0 && <span style={{ position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8, background: '#E8112D', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wishCount}</span>}</button>
            <button id="sdCartBtn" onClick={openDrawer} aria-label="Cart" className="btnBlue" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 16px 0 14px', border: 0, background: '#1A4DF0', borderRadius: 13, cursor: 'pointer', color: '#fff', boxShadow: '0 8px 20px -8px #1A4DF0' }}><svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12zM6 6 5 3H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></svg><span style={{ fontSize: 13.5, fontWeight: 600 }}>Cart</span>{count > 0 && <span style={{ minWidth: 20, height: 20, padding: '0 5px', borderRadius: 10, background: '#fff', color: '#1A4DF0', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}</button>
          </div>
        </>)}

        {isMobile && (<>
          <div style={{ flex: 1 }} />
          <button onClick={() => setSearchOpen(true)} aria-label="Search" style={{ width: 42, height: 42, border: 0, background: '#F1F2F6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B1020', cursor: 'pointer' }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg></button>
          <button id="sdCartBtnM" onClick={openDrawer} aria-label="Cart" style={{ position: 'relative', width: 42, height: 42, border: 0, background: '#1A4DF0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12zM6 6 5 3H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></svg>{count > 0 && <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 19, height: 19, padding: '0 4px', borderRadius: 10, background: '#E8112D', color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{count}</span>}</button>
        </>)}
      </div>

      {!isMobile && mega && (
        <div style={{ borderTop: '1px solid rgba(11,16,32,0.07)', background: '#fff', animation: 'sdPop .2s cubic-bezier(.22,1,.36,1)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '22px clamp(16px,4vw,40px)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr) 1.3fr', gap: 14 }}>
            {cats.map((c) => (
              <button key={c.id} onClick={() => go(`/c/${c.slug}`)} className="sd-megacard" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px', border: '1px solid rgba(11,16,32,0.07)', background: '#fff', borderRadius: 13, cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 38, height: 38, flex: 'none', borderRadius: 11, background: c.meta.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" fill="none" stroke={c.meta.accent} strokeWidth="1.7" viewBox="0 0 24 24"><path d={c.meta.icon} /></svg></div>
                <div><div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 11.5, color: '#8A93A6' }}>{c.count} products</div></div>
              </button>
            ))}
            <div onClick={() => go('/deals')} style={{ gridRow: '1 / span 2', borderRadius: 15, background: 'linear-gradient(135deg,#0B1020,#1A2A55)', color: '#fff', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle,rgba(91,124,255,.5),transparent 70%)', top: -30, right: -30 }} />
              <div style={{ position: 'relative' }}><span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: '#5B8CFF' }}>THIS WEEK</span><div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 21, lineHeight: 1.15, marginTop: 8 }}>Up to 22% off<br />laptops & CCTV</div></div>
              <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#fff' }}>Shop deals <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg></span>
            </div>
          </div>
        </div>
      )}

      {isMobile && searchOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: '#fff', display: 'flex', flexDirection: 'column', animation: 'sdPop .2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid rgba(11,16,32,0.08)' }}>
            <button onClick={() => { setSearchOpen(false); setQ(''); }} style={{ width: 38, height: 38, border: 0, background: '#F1F2F6', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B1020', cursor: 'pointer' }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg></button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, height: 44, background: '#F1F2F6', borderRadius: 12, padding: '0 13px' }}><svg width="18" height="18" fill="none" stroke="#8A93A6" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Search products, brands…" style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 15 }} /></div>
          </div>
          <div className="sd-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
            {q.trim() ? results.map((p) => { const m = catMetaForProduct(p); return (
              <button key={p.id} onClick={() => { setSearchOpen(false); setQ(''); go(`/p/${p.slug}`); }} style={{ ...srow, padding: 11 }}>
                <div style={{ width: 48, height: 48, flex: 'none', borderRadius: 12, background: m.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <svg width="24" height="24" fill="none" stroke={m.accent} strokeWidth="1.6" viewBox="0 0 24 24"><path d={m.icon} /></svg>}</div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div><div style={{ fontSize: 12.5, color: '#8A93A6' }}>{p.brand}</div></div>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{rupee(p.price)}</span>
              </button>
            ); }) : (<>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#A8AEBD', textTransform: 'uppercase', padding: '14px 8px 10px' }}>Popular searches</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, padding: '0 6px' }}>{POPULAR.map((t) => <button key={t} onClick={() => setQ(t)} style={{ padding: '9px 15px', border: '1px solid rgba(11,16,32,0.1)', background: '#fff', borderRadius: 999, fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>{t}</button>)}</div>
            </>)}
          </div>
        </div>
      )}

      {isMobile && menu && (
        <div onClick={() => setMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 130, background: 'rgba(11,16,32,0.5)', backdropFilter: 'blur(2px)' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '84%', maxWidth: 340, background: '#fff', display: 'flex', flexDirection: 'column', animation: 'sdSlideL .3s cubic-bezier(.22,1,.36,1)', boxShadow: '0 0 60px rgba(0,0,0,.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 18px 14px', borderBottom: '1px solid rgba(11,16,32,0.07)' }}>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: 18 }}>S&amp;D <span style={{ color: '#1A4DF0' }}>Solution</span></span>
              <button onClick={() => setMenu(false)} style={{ width: 34, height: 34, border: 0, background: '#F1F2F6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><svg width="18" height="18" fill="none" stroke="#0B1020" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
            </div>
            <div className="sd-scroll" style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#A8AEBD', textTransform: 'uppercase', padding: '6px 8px 8px' }}>Categories</div>
              {cats.map((c) => (
                <button key={c.id} onClick={() => go(`/c/${c.slug}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 10px', border: 0, background: 'transparent', borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}><div style={{ width: 36, height: 36, flex: 'none', borderRadius: 10, background: c.meta.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="19" height="19" fill="none" stroke={c.meta.accent} strokeWidth="1.7" viewBox="0 0 24 24"><path d={c.meta.icon} /></svg></div><span style={{ fontSize: 14.5, fontWeight: 600 }}>{c.name}</span></button>
              ))}
              <div style={{ height: 1, background: 'rgba(11,16,32,0.07)', margin: '12px 8px' }} />
              {([['Deals', '/deals'], ['Brands', '/brands'], ['Track order', '/track'], ['Bulk / B2B enquiry', '/enquiry'], ['Sign in', '/account'], ['Contact us', '/contact']] as const).map(([l, h]) => (
                <button key={l} onClick={() => go(h)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '13px 10px', border: 0, background: 'transparent', fontSize: 14.5, fontWeight: 500, color: '#0B1020', cursor: 'pointer', textAlign: 'left' }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Announcement() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  const items = [
    { icon: 'M5 18 3 6h18l-2 9H6M9 21a1 1 0 1 0 0-.01M18 21a1 1 0 1 0 0-.01', t: 'Free same-week delivery across the city' },
    { icon: 'M20 6 9 17l-5-5', t: 'Pay on delivery — cash or online' },
    { icon: 'M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z', t: '100% genuine · GST invoice' },
  ];
  return (
    <div style={{ background: '#0B1020', color: '#fff', fontSize: 12.5, fontWeight: 500, letterSpacing: '0.01em', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, height: 38, padding: '0 44px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {items.map((it, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            {i > 0 && <span style={{ opacity: 0.35, marginRight: 21 }}>•</span>}
            <svg width="14" height="14" fill="none" stroke="#5B7CFF" strokeWidth="2" viewBox="0 0 24 24"><path d={it.icon} /></svg>{it.t}
          </span>
        ))}
      </div>
      <button onClick={() => setOpen(false)} aria-label="Dismiss" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, border: 0, background: 'transparent', color: 'rgba(255,255,255,.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
    </div>
  );
}

const iconBtnPlain: React.CSSProperties = { width: 40, height: 40, flex: 'none', border: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B1020', cursor: 'pointer' };
const navBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 13px', border: 0, background: 'transparent', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#0B1020', cursor: 'pointer', transition: 'background .2s' };
const srow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '8px 10px', border: 0, background: 'transparent', borderRadius: 11, cursor: 'pointer', textAlign: 'left' };
