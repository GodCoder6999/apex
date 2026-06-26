import { useNavigate } from 'react-router-dom';
import { MiniTile } from './Tile';
import { rupee } from '../format';
import { useStore } from '../store';
import { productById } from '../data/catalog';

export function CartDrawer({ isMobile }: { isMobile: boolean }) {
  const nav = useNavigate();
  const { drawerOpen, closeDrawer, items, setQty, remove, count, subTotal, savings } = useStore();
  if (!drawerOpen) return null;
  const lines = items.map((it) => ({ it, p: productById(it.productId)! })).filter((l) => l.p);
  const go = (path: string) => { closeDrawer(); nav(path); };

  return (
    <div onClick={closeDrawer} style={{ position: 'fixed', inset: 0, zIndex: 140, background: 'rgba(11,16,32,0.5)', backdropFilter: 'blur(3px)', animation: 'sdPop .2s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: isMobile ? '100%' : 420, background: '#fff', display: 'flex', flexDirection: 'column', animation: 'sdSlideR .32s cubic-bezier(.22,1,.36,1)', boxShadow: '-20px 0 60px rgba(11,16,32,.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px', borderBottom: '1px solid rgba(11,16,32,0.07)' }}>
          <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 19 }}>Your cart <span style={{ color: '#8A93A6', fontSize: 15, fontWeight: 500 }}>({count})</span></div>
          <button onClick={closeDrawer} style={{ width: 36, height: 36, border: 0, background: '#F1F2F6', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><svg width="18" height="18" fill="none" stroke="#0B1020" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
        </div>

        {lines.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center' }}>
            <div style={{ width: 88, height: 88, borderRadius: 24, background: '#F1F2F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><svg width="40" height="40" fill="none" stroke="#C2C8D4" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12zM6 6 5 3H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></svg></div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Your cart is empty</div>
            <div style={{ fontSize: 13.5, color: '#8A93A6', marginBottom: 22, maxWidth: 240 }}>Browse our catalog and add the gear you need — pay only on delivery.</div>
            <button onClick={() => go('/shop')} style={{ height: 46, padding: '0 24px', border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 13, fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>Start shopping</button>
          </div>
        ) : (<>
          <div className="sd-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
            {lines.map(({ it, p }) => (
              <div key={p.id} style={{ display: 'flex', gap: 13, padding: '14px 0', borderBottom: '1px solid rgba(11,16,32,0.06)' }}>
                <MiniTile p={p} size={74} radius={14} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</div><button onClick={() => remove(p.id)} style={{ border: 0, background: 'transparent', color: '#C2C8D4', cursor: 'pointer', padding: 0, flex: 'none' }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg></button></div>
                  <div style={{ fontSize: 12, color: '#8A93A6', margin: '2px 0 10px' }}>{p.brand}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(11,16,32,0.12)', borderRadius: 10, overflow: 'hidden' }}><button onClick={() => setQty(p.id, it.qty - 1)} style={qb}>−</button><span style={{ minWidth: 30, textAlign: 'center', fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{it.qty}</span><button onClick={() => setQty(p.id, Math.min(p.stock, it.qty + 1))} style={qb}>+</button></div>
                    <span style={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{rupee(p.price * it.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(11,16,32,0.08)', padding: '18px 22px 22px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#5B6478', marginBottom: 7 }}><span>Subtotal (incl. GST)</span><span style={{ fontWeight: 600, color: '#0B1020', fontVariantNumeric: 'tabular-nums' }}>{rupee(subTotal)}</span></div>
            {savings > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#0E9F6E', marginBottom: 7 }}><span>You save</span><span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>−{rupee(savings)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#5B6478', marginBottom: 14 }}><span>Delivery</span><span style={{ fontWeight: 600, color: '#0E9F6E' }}>Free</span></div>
            <button onClick={() => go('/checkout')} className="btnBlue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', height: 52, border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 12px 26px -10px #1A4DF0' }}>Checkout · {rupee(subTotal)} <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
            <button onClick={() => go('/cart')} style={{ width: '100%', height: 42, marginTop: 8, border: 0, background: 'transparent', color: '#5B6478', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>View full cart</button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 10, fontSize: 12, color: '#8A93A6' }}><svg width="14" height="14" fill="none" stroke="#0E9F6E" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" /></svg>No payment now — pay when it's delivered</div>
          </div>
        </>)}
      </div>
    </div>
  );
}
const qb: React.CSSProperties = { width: 30, height: 30, border: 0, background: '#fff', cursor: 'pointer', fontSize: 16, color: '#0B1020', display: 'flex', alignItems: 'center', justifyContent: 'center' };
