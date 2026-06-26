import { useNavigate } from 'react-router-dom';
import { MiniTile } from '../components/Tile';
import { rupee } from '../format';
import { useStore } from '../store';
import { productById } from '../data/catalog';

export function OrderSuccess() {
  const nav = useNavigate();
  const { lastOrder } = useStore();
  const order = lastOrder();
  if (!order) return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <h1 className="display" style={{ fontSize: 26 }}>No recent order</h1>
      <button onClick={() => nav('/shop')} style={cta}>Continue shopping</button>
    </section>
  );
  const a = order.address;
  const eta = new Date(order.createdAt + 3 * 864e5).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '40px clamp(16px,4vw,40px) 50px', animation: 'sdFade .4s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#E7F8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', animation: 'sdPop .5s cubic-bezier(.22,1,.36,1)' }}><svg width="46" height="46" fill="none" stroke="#0E9F6E" strokeWidth="2.4" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg></div>
        <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(26px,4vw,36px)', letterSpacing: '-0.02em', margin: '0 0 10px' }}>Order placed! 🎉</h1>
        <p style={{ fontSize: 15, color: '#5B6478', margin: '0 0 6px', lineHeight: 1.5 }}>Thank you, {a.name}. We'll call you shortly to confirm delivery.</p>
        <p style={{ fontSize: 14, color: '#8A93A6', margin: 0 }}>Order <strong style={{ color: '#0B1020' }}>{order.orderNo}</strong> · arriving by <strong style={{ color: '#0B1020' }}>{eta}</strong></p>
      </div>
      <div style={{ background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 20, padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          {order.lines.map((l) => { const p = productById(l.productId); return (
            <div key={l.productId} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>{p ? <MiniTile p={p} size={54} radius={13} /> : <div style={{ width: 54, height: 54, borderRadius: 13, background: '#F1F2F6' }} />}<div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.3 }}>{l.name}</div><div style={{ fontSize: 12.5, color: '#8A93A6' }}>Qty {l.qty}</div></div><span style={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{rupee(l.price * l.qty)}</span></div>
          ); })}
        </div>
        <div style={{ height: 1, background: 'rgba(11,16,32,0.08)', marginBottom: 16 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span style={{ fontSize: 15, fontWeight: 700 }}>Total (pay on delivery)</span><span style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 23, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{rupee(order.total)}</span></div>
      </div>
      <div style={{ display: 'flex', gap: 14, background: '#F6F7FB', borderRadius: 16, padding: 18, marginBottom: 24 }}><svg width="22" height="22" fill="none" stroke="#1A4DF0" strokeWidth="1.8" viewBox="0 0 24 24" style={{ flex: 'none', marginTop: 1 }}><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg><div><div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3 }}>Delivering to</div><div style={{ fontSize: 13.5, color: '#5B6478', lineHeight: 1.5 }}>{a.line}, {a.city}, {a.state} {a.pincode} · {a.phone}</div></div></div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => nav(`/track?o=${order.orderNo}`)} style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, height: 52, border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Track this order <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
        <button onClick={() => nav('/shop')} style={{ flex: 1, minWidth: 180, height: 52, border: '1.5px solid rgba(11,16,32,0.14)', background: '#fff', color: '#0B1020', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Continue shopping</button>
      </div>
    </section>
  );
}
const cta: React.CSSProperties = { marginTop: 18, height: 48, padding: '0 24px', border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 13, fontSize: 14.5, fontWeight: 600, cursor: 'pointer' };
