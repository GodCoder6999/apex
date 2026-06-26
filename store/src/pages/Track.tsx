import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MiniTile } from '../components/Tile';
import { rupee } from '../format';
import { useStore } from '../store';
import { productById } from '../data/catalog';
import type { Order } from '../data/types';

const STEPS = ['Order confirmed', 'Packed', 'Out for delivery', 'Delivered'];
const DESCS = ['We received your order', 'Your items are packed & invoiced', 'Our delivery partner is on the way', 'Handed over to you'];

export function Track() {
  const { orders } = useStore();
  const [sp] = useSearchParams();
  const all = orders();
  const [input, setInput] = useState(sp.get('o') || '');
  const [result, setResult] = useState<Order | 'notfound' | null>(null);

  const lookup = (val: string) => { const v = val.trim().toUpperCase(); const o = all.find((x) => x.orderNo.toUpperCase() === v); setResult(o || (v ? 'notfound' : null)); };
  useEffect(() => { const o = sp.get('o'); if (o) lookup(o); /* eslint-disable-next-line */ }, []);

  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '30px clamp(16px,4vw,40px) 44px', animation: 'sdFade .35s ease' }}>
      <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(26px,4vw,36px)', letterSpacing: '-0.02em', margin: '0 0 8px' }}>Track your order</h1>
      <p style={{ fontSize: 14.5, color: '#5B6478', margin: '0 0 24px' }}>Enter your order number (e.g. SD1234567) to see live status.</p>
      <div style={{ display: 'flex', gap: 11, marginBottom: 14 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && lookup(input)} placeholder="Order number" style={{ flex: 1, height: 54, border: '1.5px solid rgba(11,16,32,0.14)', borderRadius: 14, padding: '0 16px', fontSize: 15, outline: 'none' }} />
        <button onClick={() => lookup(input)} style={{ height: 54, padding: '0 26px', border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Track</button>
      </div>

      {all.length > 0 && (
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 24 }}><span style={{ fontSize: 12.5, color: '#8A93A6', alignSelf: 'center' }}>Recent:</span>{all.slice(0, 3).map((o) => <button key={o.id} onClick={() => { setInput(o.orderNo); setResult(o); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', background: '#fff', border: '1px solid rgba(11,16,32,0.12)', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>{o.orderNo} · {rupee(o.total)}</button>)}</div>
      )}

      {result === 'notfound' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 18, background: '#FFF1F2', border: '1px solid rgba(232,17,45,0.16)', borderRadius: 16 }}><svg width="24" height="24" fill="none" stroke="#E8112D" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg><div><div style={{ fontSize: 14.5, fontWeight: 600, color: '#B91C28' }}>No order found with that number</div><div style={{ fontSize: 13, color: '#8A6' }}>Double-check the number, or place an order to track it here.</div></div></div>
      )}

      {result && result !== 'notfound' && (() => { const o = result; const cur = 0; const eta = new Date(o.createdAt + 3 * 864e5).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }); return (
        <div style={{ background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 20, padding: 24, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, paddingBottom: 18, borderBottom: '1px solid rgba(11,16,32,0.08)', marginBottom: 22 }}><div><div style={{ fontSize: 12, color: '#8A93A6' }}>Order</div><div style={{ fontSize: 17, fontWeight: 700 }}>{o.orderNo}</div></div><div style={{ textAlign: 'right' }}><div style={{ fontSize: 12, color: '#8A93A6' }}>Placed {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div><div style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{rupee(o.total)}</div></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 15px', background: '#EAF0FF', borderRadius: 13, marginBottom: 24 }}><svg width="20" height="20" fill="none" stroke="#1A4DF0" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7M7 18a2 2 0 1 1-4 0M19 18a2 2 0 1 1-4 0" /></svg><span style={{ fontSize: 13.5, fontWeight: 600, color: '#1A4DF0' }}>Estimated delivery — {eta}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {STEPS.map((label, i) => { const done = i <= cur; return (
              <div key={label} style={{ display: 'flex', gap: 15 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div style={{ width: 30, height: 30, flex: 'none', borderRadius: '50%', background: done ? '#0E9F6E' : '#E6E8EE', color: done ? '#fff' : '#A8AEBD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg></div>{i < 3 && <div style={{ width: 2, flex: 1, minHeight: 26, background: i < cur ? '#0E9F6E' : '#E6E8EE' }} />}</div>
                <div style={{ paddingBottom: 22 }}><div style={{ fontSize: 14.5, fontWeight: 600, color: done ? '#0B1020' : '#A8AEBD' }}>{label}</div><div style={{ fontSize: 12.5, color: '#8A93A6', marginTop: 2 }}>{DESCS[i]}</div></div>
              </div>
            ); })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 6, borderTop: '1px solid rgba(11,16,32,0.08)', marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8A93A6', paddingTop: 14 }}>Items</div>
            {o.lines.map((l) => { const p = productById(l.productId); return <div key={l.productId} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>{p ? <MiniTile p={p} size={46} radius={11} /> : <div style={{ width: 46, height: 46, borderRadius: 11, background: '#F1F2F6' }} />}<div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{l.name}</div><span style={{ fontSize: 13, color: '#8A93A6' }}>Qty {l.qty}</span></div>; })}
          </div>
        </div>
      ); })()}
    </section>
  );
}
