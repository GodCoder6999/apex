import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useIsMobile, useScrolled } from '../components/useViewport';
import { catMetaForProduct } from '../data/catmeta';
import { bySlug, related as relatedFn, categoryName, categories } from '../data/catalog';
import { rupee, discountPct } from '../format';
import { useStore } from '../store';

const DEFAULT_BOX = ['Product unit', 'Power adapter / cable', 'Warranty card'];

export function Product() {
  const { slug } = useParams();
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const scrolled = useScrolled(470);
  const { add, toggleWish, wish, pushRecent, recent } = useStore();
  const [qty, setQty] = useState(1);
  const [gIdx, setGIdx] = useState(0);
  const zoomRef = useRef<HTMLDivElement>(null);

  const p = bySlug(slug || '');
  useEffect(() => { if (p) { setQty(1); setGIdx(0); pushRecent(p.slug); } /* eslint-disable-next-line */ }, [slug]);
  if (!p) return <section style={{ maxWidth: 760, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}><h1 className="display" style={{ fontSize: 26 }}>Product not found</h1><button onClick={() => nav('/shop')} style={cta}>Browse products</button></section>;

  const m = catMetaForProduct(p);
  const off = discountPct(p.price, p.mrp);
  const out = p.stock <= 0; const low = p.stock > 0 && p.stock <= 3;
  const wished = !!wish[p.id];
  const cat = categoryName(p.categoryId);
  const box = p.box && p.box.length ? p.box : DEFAULT_BOX;

  // gallery: real images if present, else 4 gradient variants of the category tile
  const variants = [m.grad, m.grad.replace('155deg', '35deg'), 'linear-gradient(155deg,#0B1020,#1E2A52)', m.grad.replace('155deg', '95deg')];
  const useImgs = p.images && p.images.length > 0;
  const thumbs = useImgs ? p.images : variants;
  const mainImg = useImgs ? p.images[Math.min(gIdx, p.images.length - 1)] : null;

  const onZoomMove = (e: React.MouseEvent) => { const box2 = e.currentTarget as HTMLElement; const inner = zoomRef.current; if (!inner) return; const r = box2.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * 100; const y = ((e.clientY - r.top) / r.height) * 100; inner.style.transformOrigin = `${x}% ${y}%`; inner.style.transform = 'scale(1.85)'; };
  const onZoomLeave = () => { const inner = zoomRef.current; if (inner) { inner.style.transformOrigin = '50% 50%'; inner.style.transform = 'scale(1)'; } };

  const onAdd = (e?: React.MouseEvent) => { if (out) nav(`/enquiry?product=${encodeURIComponent(p.name)}`); else add(p.id, qty, e); };
  const buyNow = () => { if (out) { nav(`/enquiry?product=${encodeURIComponent(p.name)}`); return; } add(p.id, qty); nav('/checkout'); };

  const rel = relatedFn(p);
  const recItems = recent.map((s) => bySlug(s)).filter((x): x is NonNullable<typeof x> => !!x && x.slug !== p.slug).slice(0, 5);
  const relRef = 'row-rel';
  const scrollRel = (dir: number) => { const el = document.getElementById(relRef); if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.82, 720), behavior: 'smooth' }); };

  const stock = { bg: out ? '#F1F2F5' : low ? '#FFF6E6' : '#E7F8F0', color: out ? '#8A93A6' : low ? '#B45309' : '#0E9F6E', dot: out ? '#8A93A6' : low ? '#F59E0B' : '#0E9F6E', label: out ? 'Out of stock' : low ? `Only ${p.stock} left in stock` : 'In stock — ready to deliver' };

  return (
    <>
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '22px clamp(16px,4vw,40px) 0', animation: 'sdFade .35s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8A93A6', marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => nav('/')} style={crumb}>Home</button><Chev />
          <button onClick={() => nav(`/c/${catSlug(p.categoryId)}`)} style={crumb}>{cat}</button><Chev />
          <span style={{ color: '#0B1020', fontWeight: 600 }}>{p.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.05fr) minmax(0,0.95fr)', gap: 'clamp(24px,4vw,52px)', alignItems: 'start' }}>
          {/* GALLERY */}
          <div style={isMobile ? undefined : { position: 'sticky', top: 90 }}>
            <div onMouseMove={onZoomMove} onMouseLeave={onZoomLeave} style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: 24, background: useImgs ? '#F6F7FB' : variants[gIdx] || variants[0], overflow: 'hidden', cursor: 'zoom-in', border: '1px solid rgba(11,16,32,0.06)' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.5, background: 'radial-gradient(110% 80% at 80% 8%,rgba(255,255,255,.7),transparent 55%)' }} />
              <div ref={zoomRef} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .25s ease-out', transformOrigin: '50% 50%' }}>
                {mainImg ? <img src={mainImg} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <svg width="190" height="190" fill="none" stroke={gIdx === 2 ? '#5B8CFF' : m.accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 16px 30px rgba(11,16,32,0.18))' }}><path d={m.icon} /></svg>}
              </div>
              <span style={{ position: 'absolute', top: 14, left: 14, fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 14, color: 'rgba(11,16,32,0.5)' }}>{p.brand}</span>
              <span style={{ position: 'absolute', bottom: 14, right: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'rgba(11,16,32,0.5)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(6px)', padding: '6px 11px', borderRadius: 999 }}><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" /></svg>Hover to zoom</span>
            </div>
            <div style={{ display: 'flex', gap: 11, marginTop: 13 }}>
              {thumbs.map((t, i) => (
                <button key={i} onClick={() => setGIdx(i)} style={{ flex: 1, aspectRatio: '1 / 1', borderRadius: 14, background: useImgs ? '#F6F7FB' : (t as string), border: `2px solid ${i === gIdx ? m.accent : 'rgba(11,16,32,0.1)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transition: 'border-color .2s' }}>
                  {useImgs ? <img src={t as string} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <svg width="40" height="40" fill="none" stroke={i === 2 ? '#5B8CFF' : m.accent} strokeWidth="1.4" viewBox="0 0 24 24"><path d={m.icon} /></svg>}
                </button>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}><span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#1A4DF0' }}>{p.brand}</span><span style={{ width: 4, height: 4, borderRadius: '50%', background: '#C2C8D4' }} /><span style={{ fontSize: 12.5, color: '#8A93A6' }}>{cat}</span></div>
            <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(24px,3.2vw,34px)', lineHeight: 1.12, letterSpacing: '-0.02em', margin: '0 0 14px' }}>{p.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{[1, 2, 3, 4, 5].map((i) => <svg key={i} width="17" height="17" fill={i <= Math.round(p.rating) ? '#F5A623' : '#DDE1EA'} stroke="none" viewBox="0 0 24 24"><path d="M12 2l3 6.5 7 .9-5.2 4.8L18.2 22 12 18.3 5.8 22 7.2 14.2 2 9.4l7-.9z" /></svg>)}</div>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{p.rating.toFixed(1)}</span><span style={{ fontSize: 13.5, color: '#8A93A6' }}>{p.reviews} reviews</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#C2C8D4' }} /><span style={{ fontSize: 13, color: '#0E9F6E', fontWeight: 600 }}>Sold by S&amp;D Solution</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 13, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: 'clamp(30px,4vw,40px)', letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums' }}>{rupee(p.price)}</span>
              {!!p.mrp && p.mrp > p.price && <><span style={{ fontSize: 17, color: '#8A93A6', textDecoration: 'line-through', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>{rupee(p.mrp)}</span><span style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: '#E8112D', padding: '5px 10px', borderRadius: 8, marginBottom: 7 }}>{off}% off</span></>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#5B6478', marginBottom: 18 }}><span>Inclusive of all taxes · GST invoice</span>{!!p.mrp && p.mrp > p.price && <span style={{ color: '#0E9F6E', fontWeight: 600 }}>You save {rupee(p.mrp - p.price)}</span>}</div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '9px 14px', borderRadius: 12, background: stock.bg, color: stock.color, fontSize: 13.5, fontWeight: 600, marginBottom: 22 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: stock.dot, animation: 'sdDot 2s infinite' }} />{stock.label}</div>

            {p.highlights.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 24 }}>{p.highlights.map((h, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}><svg width="19" height="19" fill="none" stroke="#0E9F6E" strokeWidth="2.2" viewBox="0 0 24 24" style={{ flex: 'none' }}><path d="M5 13l4 4L19 7" /></svg><span style={{ fontSize: 14.5, color: '#27314A' }}>{h}</span></div>)}</div>}

            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid rgba(11,16,32,0.14)', borderRadius: 13, overflow: 'hidden', height: 54 }}><button onClick={() => setQty((q) => Math.max(1, q - 1))} style={qbtn}>−</button><span style={{ minWidth: 42, textAlign: 'center', fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{qty}</span><button onClick={() => setQty((q) => q + 1)} style={qbtn}>+</button></div>
              <button onClick={onAdd} className="btnBlue" style={{ flex: 1, minWidth: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, height: 54, border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 14, fontSize: 15.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 12px 28px -10px #1A4DF0' }}><svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12zM6 6 5 3H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></svg>{out ? 'Enquire about this product' : 'Add to cart'}</button>
              <button onClick={() => toggleWish(p.id)} aria-label="Wishlist" style={{ width: 54, height: 54, flex: 'none', border: '1.5px solid rgba(11,16,32,0.14)', background: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: wished ? '#E8112D' : '#0B1020' }}><svg width="22" height="22" fill={wished ? '#E8112D' : 'none'} stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg></button>
            </div>
            <button onClick={buyNow} style={{ width: '100%', height: 54, border: '1.5px solid #0B1020', background: '#0B1020', color: '#fff', borderRadius: 14, fontSize: 15.5, fontWeight: 600, cursor: 'pointer', marginBottom: 22 }}>{out ? 'Notify me when available' : 'Buy now'}</button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 13, background: '#F6F7FB', borderRadius: 14 }}><div style={{ width: 38, height: 38, flex: 'none', borderRadius: 11, background: '#E7F8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="19" height="19" fill="none" stroke="#0E9F6E" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7M7 18a2 2 0 1 1-4 0M19 18a2 2 0 1 1-4 0" /></svg></div><div style={{ lineHeight: 1.3 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Delivered by our team</div><div style={{ fontSize: 11.5, color: '#8A93A6' }}>Pay on delivery · 2–3 days</div></div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 13, background: '#F6F7FB', borderRadius: 14 }}><div style={{ width: 38, height: 38, flex: 'none', borderRadius: 11, background: '#F3ECFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="19" height="19" fill="none" stroke="#7C3AED" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M12 2l8 4v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6zM9 12l2 2 4-4" /></svg></div><div style={{ lineHeight: 1.3 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Brand warranty</div><div style={{ fontSize: 11.5, color: '#8A93A6' }}>{p.warranty || '1 year warranty'}</div></div></div>
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.25fr 1fr', gap: 24, marginTop: 'clamp(40px,5vw,64px)', alignItems: 'start' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(11,16,32,0.07)' }}><span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 18 }}>Specifications</span></div>
            <div>{p.specs.map((sp, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, padding: '13px 22px', background: i % 2 ? '#FAFBFD' : '#fff' }}><span style={{ fontSize: 13.5, color: '#8A93A6' }}>{sp.k}</span><span style={{ fontSize: 13.5, fontWeight: 600, color: '#0B1020' }}>{sp.v}</span></div>)}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 20, padding: 22 }}>
              <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 18, marginBottom: 16 }}>What's in the box</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{box.map((b, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}><div style={{ width: 30, height: 30, flex: 'none', borderRadius: 9, background: '#EAF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="16" height="16" fill="none" stroke="#1A4DF0" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 8v13H3V8M1 3h22v5H1zM12 3v18" /></svg></div><span style={{ fontSize: 14, color: '#27314A' }}>{b}</span></div>)}</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,#EAF0FF,#F4F6FF)', border: '1px solid rgba(26,77,240,0.12)', borderRadius: 20, padding: 22, display: 'flex', gap: 14 }}><div style={{ width: 44, height: 44, flex: 'none', borderRadius: 13, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" fill="none" stroke="#1A4DF0" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M12 2l8 4v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6zM9 12l2 2 4-4" /></svg></div><div><div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Genuine with full warranty</div><div style={{ fontSize: 13, color: '#5B6478', lineHeight: 1.5 }}>{p.warranty || '1 year warranty'}. Sealed brand-new unit with GST invoice issued on delivery.</div></div></div>
          </div>
        </div>

        {/* RELATED */}
        {rel.length > 0 && (
          <div style={{ marginTop: 'clamp(44px,6vw,68px)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}><h2 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(22px,3vw,30px)', letterSpacing: '-0.02em', margin: 0 }}>You might also like</h2><div style={{ display: 'flex', gap: 9 }}><button onClick={() => scrollRel(-1)} style={relArrow}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg></button><button onClick={() => scrollRel(1)} style={relArrow}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg></button></div></div>
            <div id={relRef} className="sd-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '4px 2px 8px', margin: '0 -2px' }}>{rel.map((x) => <div key={x.id} style={{ flex: 'none', width: isMobile ? '70vw' : 250, scrollSnapAlign: 'start' }}><ProductCard p={x} /></div>)}</div>
          </div>
        )}
        {recItems.length > 0 && (
          <div style={{ marginTop: 'clamp(40px,5vw,60px)', paddingBottom: 20 }}>
            <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(22px,3vw,30px)', letterSpacing: '-0.02em', margin: '0 0 20px' }}>Recently viewed</h2>
            <div className="sd-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '4px 2px 8px', margin: '0 -2px' }}>{recItems.map((x) => <div key={x.id} style={{ flex: 'none', width: isMobile ? '70vw' : 250, scrollSnapAlign: 'start' }}><ProductCard p={x} /></div>)}</div>
          </div>
        )}
      </section>

      {/* STICKY ADD BAR */}
      {scrolled && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: isMobile ? 66 : 0, zIndex: 95, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(14px)', borderTop: '1px solid rgba(11,16,32,0.08)', boxShadow: '0 -8px 30px -12px rgba(11,16,32,0.18)', animation: 'sdSheet .3s cubic-bezier(.22,1,.36,1)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px clamp(14px,4vw,40px)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, flex: 'none', borderRadius: 12, background: useImgs ? '#F6F7FB' : variants[0], display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{useImgs ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <svg width="26" height="26" fill="none" stroke={m.accent} strokeWidth="1.5" viewBox="0 0 24 24"><path d={m.icon} /></svg>}</div>
            {!isMobile && <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div><div style={{ fontSize: 13, color: '#8A93A6' }}>{stock.label}</div></div>}
            <div style={{ textAlign: 'right', lineHeight: 1.1, marginLeft: isMobile ? 'auto' : undefined }}><div style={{ fontSize: 11, color: '#8A93A6' }}>{qty} × total</div><div style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{out ? 'Out of stock' : rupee(p.price * qty)}</div></div>
            <button onClick={(e) => onAdd(e)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, padding: '0 22px', border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 13, fontSize: 14.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}><svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12zM6 6 5 3H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></svg>{out ? 'Enquire' : 'Add to cart'}</button>
          </div>
        </div>
      )}
    </>
  );
}

function catSlug(categoryId: string) { return categories.find((c) => c.id === categoryId)?.slug || ''; }
function Chev() { return <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>; }
const crumb: React.CSSProperties = { border: 0, background: 'transparent', color: '#8A93A6', cursor: 'pointer', padding: 0, fontSize: 13 };
const qbtn: React.CSSProperties = { width: 48, height: 54, border: 0, background: '#fff', cursor: 'pointer', fontSize: 20, color: '#0B1020', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const relArrow: React.CSSProperties = { width: 44, height: 44, border: '1.5px solid rgba(11,16,32,0.12)', background: '#fff', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0B1020' };
const cta: React.CSSProperties = { marginTop: 18, height: 48, padding: '0 24px', border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 13, fontSize: 14.5, fontWeight: 600, cursor: 'pointer' };
