import { Link } from 'react-router-dom';
import { color, radius } from '../theme';
import { Icon } from '../icons';
import { Container, Btn } from '../ui';
import { rupee } from '../format';
import type { Order } from '../data/types';

const statusLabel: Record<string, { l: string; c: string; bg: string }> = {
  placed: { l: 'Placed', c: color.blue, bg: color.blueSoft },
  confirmed: { l: 'Confirmed', c: color.violet, bg: color.violetSoft },
  out_for_delivery: { l: 'Out for delivery', c: '#B45309', bg: color.amberSoft },
  delivered: { l: 'Delivered', c: color.green, bg: color.greenSoft },
  cancelled: { l: 'Cancelled', c: color.muted, bg: color.lineSoft },
};

export function Account() {
  let orders: Order[] = [];
  try { orders = JSON.parse(localStorage.getItem('snd-store-orders') || '[]'); } catch { /* */ }

  return (
    <Container style={{ paddingTop: 30, maxWidth: 820 }}>
      <h1 className="display" style={{ fontSize: 30, fontWeight: 600, marginBottom: 4 }}>My orders</h1>
      <p style={{ color: color.muted, fontSize: 14.5, marginBottom: 22 }}>Track your orders. Full accounts (saved addresses, login) arrive with the live store.</p>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: radius.lg, border: `1px solid ${color.line}` }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: color.surface, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="cart" size={28} stroke={color.muted} /></div>
          <div className="display" style={{ fontSize: 20, fontWeight: 600 }}>No orders yet</div>
          <div style={{ color: color.muted, margin: '6px 0 18px' }}>When you place an order it shows up here.</div>
          <Link to="/shop"><Btn size="lg">Start shopping</Btn></Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map((o) => {
            const s = statusLabel[o.status] ?? statusLabel.placed;
            return (
              <div key={o.id} style={{ background: '#fff', border: `1px solid ${color.line}`, borderRadius: radius.lg, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${color.lineSoft}` }}>
                  <div><div className="display" style={{ fontSize: 16, fontWeight: 600 }}>{o.orderNo}</div><div style={{ fontSize: 12.5, color: color.muted }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div></div>
                  <span style={{ background: s.bg, color: s.c, borderRadius: 999, padding: '6px 13px', fontSize: 12.5, fontWeight: 600 }}>{s.l}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, padding: '12px 18px', overflowX: 'auto' }} className="sd-scroll">
                  {o.lines.map((l) => <img key={l.productId} src={l.image} alt={l.name} title={l.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flex: 'none' }} />)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderTop: `1px solid ${color.lineSoft}` }}>
                  <span style={{ fontSize: 13.5, color: color.body }}>{o.lines.length} item{o.lines.length > 1 ? 's' : ''} · Pay on delivery</span>
                  <span className="display" style={{ fontSize: 18, fontWeight: 600 }}>{rupee(o.total)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
}
