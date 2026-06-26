import { useNavigate } from 'react-router-dom';
import { Container } from '../ui';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { useIsMobile } from '../components/useViewport';
import { catMetaBySlug } from '../data/catmeta';
import { categories, inStock, featured, bestSellers, newArrivals, deals } from '../data/catalog';

const TRUST = [
  { title: '100% genuine', sub: 'Sealed, brand-new stock', icon: 'M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z', bg: '#E7F8F0', color: '#0E9F6E' },
  { title: 'GST invoice', sub: 'On every order', icon: 'M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1zM9 8h6M9 12h6', bg: '#EAF0FF', color: '#1A4DF0' },
  { title: 'Warranty', sub: 'Full brand warranty', icon: 'M12 2l8 4v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6zM9 12l2 2 4-4', bg: '#F3ECFF', color: '#7C3AED' },
  { title: 'Delivered by us', sub: 'Our own team', icon: 'M3 7h11v8H3zM14 10h4l3 3v2h-7M7 18a2 2 0 1 1-4 0M19 18a2 2 0 1 1-4 0', bg: '#FFF3DF', color: '#D97706' },
  { title: 'Local support', sub: 'Call · WhatsApp', icon: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z', bg: '#FFE8EE', color: '#E8112D' },
];
const B2B_PERKS = [
  { icon: 'M3 3v18h18M7 14l3-3 3 3 5-6', title: 'Volume pricing', sub: 'Better rates as you scale' },
  { icon: 'M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z', title: 'GST quote in 24h', sub: 'Clear, itemised pricing' },
  { icon: 'M3 7h11v8H3zM14 10h4l3 3v2h-7M7 18a2 2 0 1 1-4 0M19 18a2 2 0 1 1-4 0', title: 'Delivery + install', sub: 'Done by our own team' },
];

function Row({ id, items, isMobile }: { id: string; items: { id: string }[]; isMobile: boolean }) {
  const scroll = (dir: number) => { const el = document.getElementById(id); if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.82, 720), behavior: 'smooth' }); };
  return { scroll, node: (
    <div id={id} className="sd-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '4px 2px 8px', margin: '0 -2px' }}>
      {(items as any[]).map((p) => <div key={p.id} style={{ flex: 'none', width: isMobile ? '70vw' : 250, scrollSnapAlign: 'start' }}><ProductCard p={p as any} /></div>)}
    </div>
  ) };
}

function Arrows({ onLeft, onRight, dark }: { onLeft: () => void; onRight: () => void; dark?: boolean }) {
  const st: React.CSSProperties = dark
    ? { width: 44, height: 44, border: '1.5px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }
    : { width: 44, height: 44, border: '1.5px solid rgba(11,16,32,0.12)', background: '#fff', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0B1020' };
  return (
    <div style={{ display: 'flex', gap: 9 }}>
      <button onClick={onLeft} style={st}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg></button>
      <button onClick={onRight} style={st}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg></button>
    </div>
  );
}

function Head({ kicker, kickerColor, title }: { kicker: string; kickerColor: string; title: string }) {
  return (
    <div><span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.08em', color: kickerColor, textTransform: 'uppercase' }}>{kicker}</span><h2 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(24px,3.4vw,34px)', letterSpacing: '-0.02em', margin: '8px 0 0' }}>{title}</h2></div>
  );
}

export function Home() {
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const cats = categories.map((c) => ({ ...c, count: inStock().filter((p) => p.categoryId === c.id).length, meta: catMetaBySlug(c.slug) }));
  const brands = Array.from(new Set(inStock().map((p) => p.brand))).map((b) => ({ name: b, count: inStock().filter((p) => p.brand === b).length })).slice(0, 10);

  const feat = Row({ id: 'row-feat', isMobile, items: featured().length ? featured() : inStock().slice(0, 6) });
  const best = Row({ id: 'row-best', isMobile, items: bestSellers().length ? bestSellers() : inStock().slice(0, 6) });
  const news = Row({ id: 'row-new', isMobile, items: newArrivals().length ? newArrivals() : inStock().slice(3, 9) });
  const dealRow = Row({ id: 'row-deal', isMobile, items: deals().length ? deals() : inStock().slice(0, 4) });

  const sec: React.CSSProperties = { maxWidth: 1280, margin: '0 auto', padding: 'clamp(44px,6vw,68px) clamp(16px,4vw,40px) 0' };

  return (
    <>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg,#F4F6FF 0%,#FBFBFD 100%)' }}>
        <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle,rgba(26,77,240,0.18),transparent 65%)', top: -160, right: -80, animation: 'sdMesh 16s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,17,45,0.12),transparent 65%)', bottom: -180, left: -100, animation: 'sdMesh 20s ease-in-out infinite reverse', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: 'clamp(36px,6vw,76px) clamp(16px,4vw,40px)', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr', gap: 'clamp(28px,5vw,56px)', alignItems: 'center' }}>
          <Reveal>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, background: '#fff', border: '1px solid rgba(11,16,32,0.08)', boxShadow: '0 4px 14px -6px rgba(11,16,32,0.18)', fontSize: 12.5, fontWeight: 600, color: '#1A4DF0', marginBottom: 22 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0E9F6E', animation: 'sdDot 2s infinite' }} />{inStock().length}+ products in stock now</span>
            <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(34px,5.4vw,60px)', lineHeight: 1.02, letterSpacing: '-0.025em', margin: '0 0 20px', color: '#0B1020' }}>Tech you can trust, delivered to your door.</h1>
            <p style={{ fontSize: 'clamp(15px,1.6vw,18px)', lineHeight: 1.55, color: '#5B6478', maxWidth: 480, margin: '0 0 30px' }}>Laptops, PCs, CCTV & components — genuine stock, GST invoice, and <strong style={{ color: '#0B1020', fontWeight: 600 }}>delivered by our own team</strong>. Order online, pay on delivery.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>
              <button onClick={() => nav('/shop')} className="btnBlue" style={{ display: 'flex', alignItems: 'center', gap: 9, height: 54, padding: '0 26px', border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 15, fontSize: 15.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 14px 30px -10px #1A4DF0' }}>Start shopping <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
              <button onClick={() => nav('/deals')} style={{ display: 'flex', alignItems: 'center', gap: 9, height: 54, padding: '0 24px', border: '1.5px solid rgba(11,16,32,0.14)', background: '#fff', color: '#0B1020', borderRadius: 15, fontSize: 15.5, fontWeight: 600, cursor: 'pointer' }}>View this week's deals</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><svg width="20" height="20" fill="#F5A623" stroke="none" viewBox="0 0 24 24"><path d="M12 2l3 6.5 7 .9-5.2 4.8L18.2 22 12 18.3 5.8 22 7.2 14.2 2 9.4l7-.9z" /></svg><div style={{ lineHeight: 1.2 }}><span style={{ fontSize: 14, fontWeight: 700 }}>4.8/5</span><span style={{ fontSize: 12.5, color: '#8A93A6' }}> · 2,400+ reviews</span></div></div>
              <div style={{ width: 1, background: 'rgba(11,16,32,0.1)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><svg width="22" height="22" fill="none" stroke="#0E9F6E" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" /><path d="m9 12 2 2 4-4" /></svg><div style={{ lineHeight: 1.2 }}><span style={{ fontSize: 14, fontWeight: 700 }}>100% genuine</span><div style={{ fontSize: 12.5, color: '#8A93A6' }}>with GST invoice</div></div></div>
            </div>
          </Reveal>

          <Reveal delay={120} style={isMobile ? { order: -1, marginBottom: 8 } : undefined}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '100%', aspectRatio: '4 / 3.4', borderRadius: 26, boxShadow: '0 40px 80px -30px rgba(11,16,32,0.4)', background: 'linear-gradient(150deg,#E7EDFF,#DCE6FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="160" height="160" fill="none" stroke="#1A4DF0" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ opacity: 0.85, filter: 'drop-shadow(0 18px 30px rgba(11,16,32,0.2))' }}><path d="M3 6.5a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5V15H3zM1 18.5 2.5 15h19l1.5 3.5a1 1 0 0 1-.9 1.5H1.9a1 1 0 0 1-.9-1.5z" /></svg>
              </div>
              <div style={{ position: 'absolute', left: -22, bottom: 38, display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 16, padding: '12px 16px 12px 13px', boxShadow: '0 20px 44px -18px rgba(11,16,32,0.3)', animation: 'sdFloat 6s ease-in-out infinite' }}><div style={{ width: 40, height: 40, borderRadius: 11, background: '#E7F8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="21" height="21" fill="none" stroke="#0E9F6E" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 18 3 6h18l-2 9H6" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></svg></div><div style={{ lineHeight: 1.25 }}><div style={{ fontSize: 13, fontWeight: 700 }}>Pay on delivery</div><div style={{ fontSize: 11.5, color: '#8A93A6' }}>cash or online</div></div></div>
              <div style={{ position: 'absolute', right: -18, top: 30, display: 'flex', flexDirection: 'column', gap: 8, background: '#0B1020', color: '#fff', borderRadius: 16, padding: '14px 18px', boxShadow: '0 20px 44px -18px rgba(11,16,32,0.5)', animation: 'sdFloat2 7s ease-in-out infinite' }}><span style={{ fontSize: 11, fontWeight: 600, color: '#5B8CFF', letterSpacing: '0.04em' }}>FAST DELIVERY</span><span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 26, lineHeight: 1 }}>2–3 days</span><span style={{ fontSize: 11.5, color: 'rgba(255,255,255,.6)' }}>by our own team</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TRUST BAND */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
        <Reveal style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5,1fr)', gap: 12, padding: 18, background: '#fff', border: '1px solid rgba(11,16,32,0.07)', borderRadius: 20, boxShadow: '0 18px 40px -28px rgba(11,16,32,0.3)', marginTop: -26, position: 'relative', zIndex: 5 }}>
          {TRUST.map((t) => (
            <div key={t.title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px' }}><div style={{ width: 42, height: 42, flex: 'none', borderRadius: 12, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" fill="none" stroke={t.color} strokeWidth="1.9" viewBox="0 0 24 24"><path d={t.icon} /></svg></div><div style={{ lineHeight: 1.3 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.title}</div><div style={{ fontSize: 12, color: '#8A93A6' }}>{t.sub}</div></div></div>
          ))}
        </Reveal>
      </section>

      {/* SHOP BY CATEGORY */}
      <section style={sec}>
        <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
          <Head kicker="Browse" kickerColor="#1A4DF0" title="Shop by category" />
          {!isMobile && <button onClick={() => nav('/shop')} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 0, background: 'transparent', color: '#1A4DF0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>All categories <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg></button>}
        </Reveal>
        <Reveal style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : `repeat(${Math.min(7, cats.length)},1fr)`, gap: 14 }}>
          {cats.map((c) => (
            <button key={c.id} onClick={() => nav(`/c/${c.slug}`)} className="sd-cattile" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', aspectRatio: '1 / 1.04', border: 0, borderRadius: 20, background: c.meta.grad, padding: 16, cursor: 'pointer', overflow: 'hidden', textAlign: 'left' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.6, background: 'radial-gradient(120% 80% at 80% 0%,rgba(255,255,255,.7),transparent 60%)' }} />
              <svg width="34" height="34" fill="none" stroke={c.meta.accent} strokeWidth="1.6" viewBox="0 0 24 24" style={{ position: 'relative' }}><path d={c.meta.icon} /></svg>
              <div style={{ position: 'relative' }}><div style={{ fontSize: 15, fontWeight: 700, color: '#0B1020', letterSpacing: '-0.01em' }}>{c.name}</div><div style={{ fontSize: 12, color: 'rgba(11,16,32,0.55)', marginTop: 2 }}>{c.count} items</div></div>
            </button>
          ))}
        </Reveal>
      </section>

      {/* FEATURED */}
      <section style={sec}>
        <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
          <Head kicker="Handpicked" kickerColor="#1A4DF0" title="Featured products" />
          <Arrows onLeft={() => feat.scroll(-1)} onRight={() => feat.scroll(1)} />
        </Reveal>
        <Reveal>{feat.node}</Reveal>
      </section>

      {/* DEALS BAND */}
      <section style={{ maxWidth: 1280, margin: 'clamp(44px,6vw,68px) auto 0', padding: '0 clamp(16px,4vw,40px)' }}>
        <Reveal style={{ position: 'relative', borderRadius: 26, background: 'linear-gradient(125deg,#0B1020 0%,#15224A 55%,#3A1530 100%)', overflow: 'hidden', padding: 'clamp(26px,4vw,40px)' }}>
          <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,17,45,0.4),transparent 70%)', top: -120, right: 80, animation: 'sdMesh 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(91,140,255,0.35),transparent 70%)', bottom: -140, right: -40, animation: 'sdMesh 18s ease-in-out infinite reverse' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
            <div><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: '#FF6B7A', textTransform: 'uppercase' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8112D', animation: 'sdDot 1.6s infinite' }} />Limited time</span><h2 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(24px,3.4vw,34px)', letterSpacing: '-0.02em', margin: '9px 0 0', color: '#fff' }}>Deals of the week</h2></div>
            <Arrows dark onLeft={() => dealRow.scroll(-1)} onRight={() => dealRow.scroll(1)} />
          </div>
          <div style={{ position: 'relative' }}>{dealRow.node}</div>
        </Reveal>
      </section>

      {/* BEST SELLERS */}
      <section style={sec}>
        <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
          <Head kicker="Loved by customers" kickerColor="#0E9F6E" title="Best sellers" />
          <Arrows onLeft={() => best.scroll(-1)} onRight={() => best.scroll(1)} />
        </Reveal>
        <Reveal>{best.node}</Reveal>
      </section>

      {/* SHOP BY BRAND */}
      <section style={sec}>
        <Reveal style={{ marginBottom: 22 }}><Head kicker="Trusted names" kickerColor="#1A4DF0" title="Shop by brand" /></Reveal>
        <Reveal style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap: 12 }}>
          {brands.map((b) => (
            <button key={b.name} onClick={() => nav(`/brands?b=${encodeURIComponent(b.name)}`)} className="sd-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, height: 90, border: '1px solid rgba(11,16,32,0.08)', background: '#fff', borderRadius: 16, cursor: 'pointer' }}><span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em', color: '#0B1020' }}>{b.name}</span><span style={{ fontSize: 11, color: '#A8AEBD' }}>{b.count} products</span></button>
          ))}
        </Reveal>
      </section>

      {/* NEW ARRIVALS */}
      <section style={sec}>
        <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
          <Head kicker="Just landed" kickerColor="#7C3AED" title="New arrivals" />
          <Arrows onLeft={() => news.scroll(-1)} onRight={() => news.scroll(1)} />
        </Reveal>
        <Reveal>{news.node}</Reveal>
      </section>

      {/* B2B BANNER */}
      <section style={{ maxWidth: 1280, margin: 'clamp(48px,6vw,72px) auto 0', padding: '0 clamp(16px,4vw,40px)' }}>
        <Reveal style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 0.85fr', gap: 'clamp(20px,3vw,40px)', alignItems: 'center', borderRadius: 26, background: 'linear-gradient(135deg,#EAF0FF,#F4F6FF)', border: '1px solid rgba(26,77,240,0.12)', padding: 'clamp(28px,4vw,44px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle,rgba(26,77,240,0.16),transparent 70%)', bottom: -120, right: 60 }} />
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: '#1A4DF0', textTransform: 'uppercase' }}>Bulk &amp; business</span>
            <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(24px,3.2vw,32px)', letterSpacing: '-0.02em', margin: '10px 0 12px', lineHeight: 1.1 }}>Outfitting an office, café or site?</h2>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: '#5B6478', maxWidth: 460, margin: '0 0 22px' }}>Get volume pricing on laptops, CCTV setups and networking gear. Tell us what you need — our team sends a GST quote, then delivers and installs.</p>
            <button onClick={() => nav('/enquiry')} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, height: 50, padding: '0 24px', border: 0, background: '#0B1020', color: '#fff', borderRadius: 14, fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>Request a quote <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {B2B_PERKS.map((k) => (<div key={k.title} style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#fff', borderRadius: 15, padding: '14px 16px', boxShadow: '0 10px 26px -18px rgba(11,16,32,0.3)' }}><div style={{ width: 40, height: 40, flex: 'none', borderRadius: 12, background: '#EAF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="21" height="21" fill="none" stroke="#1A4DF0" strokeWidth="1.9" viewBox="0 0 24 24"><path d={k.icon} /></svg></div><div><div style={{ fontSize: 14, fontWeight: 600 }}>{k.title}</div><div style={{ fontSize: 12.5, color: '#8A93A6' }}>{k.sub}</div></div></div>))}
          </div>
        </Reveal>
      </section>

      <div style={{ height: 'clamp(40px,6vw,68px)' }} />
    </>
  );
}
