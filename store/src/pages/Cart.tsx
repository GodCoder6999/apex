import { useNavigate } from 'react-router-dom';
import { MiniTile } from '../components/Tile';
import { useIsMobile } from '../components/useViewport';
import { rupee } from '../format';
import { useStore } from '../store';
import { productById } from '../data/catalog';

export function Cart() {
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const { items, setQty, remove, subTotal, mrpTotal, savings, gst, count } = useStore();
  const lines = items.map((it) => ({ it, p: productById(it.productId)! })).filter((l) => l.p);

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '24px clamp(16px,4vw,40px) 40px', animation: 'sdFade .35s ease' }}>
      <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(26px,4vw,38px)', letterSpacing: '-0.02em', margin: '0 0 22px' }}>Shopping cart</h1>
      {lines.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '70px 24px', textAlign: 'center', background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 22 }}>
          <div style={{ width: 96, height: 96, borderRadius: 26, background: '#F1F2F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><svg width="44" height="44" fill="none" stroke="#C2C8D4" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12zM6 6 5 3H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></svg></div>
          <div style={{ fontSize: 19, fontWeight: 600, marginBottom: 7 }}>Your cart is empty</div>
          <div style={{ fontSize: 14, color: '#8A93A6', marginBottom: 24, maxWidth: 320 }}>Looks like you haven’t added anything yet. Explore our catalog and pay only when it’s delivered.</div>
          <button onClick={() => nav('/shop')} style={{ height: 50, padding: '0 26px', border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Browse products</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {lines.map(({ it, p }) => (
              <div key={p.id} style={{ display: 'flex', gap: 16, background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 18, padding: 16 }}>
                <button onClick={() => nav(`/p/${p.slug}`)} style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer' }}><MiniTile p={p} size={96} radius={14} /></button>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div><div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: '#1A4DF0' }}>{p.brand}</div><button onClick={() => nav(`/p/${p.slug}`)} style={{ border: 0, background: 'transparent', padding: 0, fontSize: 15, fontWeight: 600, color: '#0B1020', cursor: 'pointer', textAlign: 'left', marginTop: 3, lineHeight: 1.3 }}>{p.name}</button></div>
                    <button onClick={() => remove(p.id)} style={{ border: 0, background: 'transparent', color: '#C2C8D4', cursor: 'pointer', flex: 'none', height: 'fit-content' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg></button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#0E9F6E', fontWeight: 600, marginTop: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0E9F6E' }} />{p.stock > 0 ? 'In stock' : 'Backorder'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid rgba(11,16,32,0.14)', borderRadius: 11, overflow: 'hidden' }}><button onClick={() => setQty(p.id, it.qty - 1)} style={cqty}>−</button><span style={{ minWidth: 36, textAlign: 'center', fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{it.qty}</span><button onClick={() => setQty(p.id, Math.min(p.stock, it.qty + 1))} style={cqty}>+</button></div>
                    <div style={{ textAlign: 'right' }}><div style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{rupee(p.price * it.qty)}</div><div style={{ fontSize: 12, color: '#8A93A6' }}>{rupee(p.price)} each</div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 90, background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 20, padding: 22 }}>
            <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 19, marginBottom: 18 }}>Order summary</div>
            <Row k="MRP total" v={rupee(mrpTotal)} strike />
            {savings > 0 && <Row k="Discount" v={`−${rupee(savings)}`} green />}
            <Row k="Delivery" v="Free" green />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#8A93A6', marginBottom: 14 }}><span>(incl. GST {rupee(gst)})</span><span /></div>
            <div style={{ height: 1, background: 'rgba(11,16,32,0.08)', marginBottom: 14 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}><span style={{ fontSize: 16, fontWeight: 700 }}>Total</span><span style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{rupee(subTotal)}</span></div>
            <button onClick={() => nav('/checkout')} className="btnBlue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', height: 54, border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 14, fontSize: 15.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 12px 28px -10px #1A4DF0' }}>Proceed to checkout <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 12, fontSize: 12.5, color: '#8A93A6' }}><svg width="14" height="14" fill="none" stroke="#0E9F6E" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" /></svg>Pay on delivery — no payment now</div>
            <div style={{ fontSize: 12, color: '#A8AEBD', textAlign: 'center', marginTop: 8 }}>{count} item{count === 1 ? '' : 's'}</div>
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ k, v, green, strike }: { k: string; v: string; green?: boolean; strike?: boolean }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: green ? '#0E9F6E' : '#5B6478', fontWeight: green ? 600 : 400, marginBottom: 10 }}><span>{k}</span><span style={{ textDecoration: strike ? 'line-through' : 'none', fontVariantNumeric: 'tabular-nums' }}>{v}</span></div>;
}
const cqty: React.CSSProperties = { width: 36, height: 38, border: 0, background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' };
