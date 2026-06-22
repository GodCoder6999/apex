import { Link } from 'react-router-dom';
import { color, radius } from '../theme';
import { Icon } from '../icons';
import { Container, Btn } from '../ui';
import { rupee } from '../format';
import { useStore } from '../store';

export function OrderSuccess() {
  const o = useStore().lastOrder();
  if (!o) return (
    <Container style={{ padding: '70px 20px', textAlign: 'center' }}>
      <div className="display" style={{ fontSize: 24, fontWeight: 600 }}>No recent order</div>
      <Link to="/shop"><Btn size="lg" style={{ marginTop: 18 }}>Start shopping</Btn></Link>
    </Container>
  );

  return (
    <Container style={{ paddingTop: 40, maxWidth: 720 }}>
      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <div style={{ width: 84, height: 84, borderRadius: 999, background: color.greenSoft, margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sdPop .5s cubic-bezier(.22,1,.36,1)' }}>
          <Icon name="check" size={42} stroke={color.green} sw={2.4} />
        </div>
        <h1 className="display" style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em' }}>Order placed!</h1>
        <p style={{ color: color.body, fontSize: 15.5, marginTop: 6 }}>Thanks, {o.address.name.split(' ')[0]}. Your order <b>{o.orderNo}</b> is in.</p>
      </div>

      <div style={{ background: color.blueSoft, borderRadius: radius.lg, padding: 18, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
        <Icon name="phone" size={24} stroke={color.blue} />
        <div style={{ fontSize: 14 }}><b>What happens next:</b> our team will call {o.address.phone} to confirm, then deliver to your address. <b>Pay on delivery</b> (cash / UPI / card) — GST invoice included.</div>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${color.line}`, borderRadius: radius.lg, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${color.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="display" style={{ fontSize: 17, fontWeight: 600 }}>Order {o.orderNo}</div>
          <span style={{ background: color.blueSoft, color: color.blue, borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 600 }}>Placed</span>
        </div>
        {o.lines.map((l) => (
          <div key={l.productId} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 20px', borderBottom: `1px solid ${color.lineSoft}` }}>
            <img src={l.image} alt="" style={{ width: 54, height: 54, borderRadius: 10, objectFit: 'cover' }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{l.name}</div><div style={{ fontSize: 12.5, color: color.muted }}>Qty {l.qty}</div></div>
            <span className="display" style={{ fontWeight: 600 }}>{rupee(l.price * l.qty)}</span>
          </div>
        ))}
        <div style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: color.body, padding: '3px 0' }}><span>Subtotal</span><span>{rupee(o.subTotal)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: color.body, padding: '3px 0' }}><span>GST</span><span>{rupee(o.gst)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: color.green, padding: '3px 0' }}><span>Delivery</span><span>Free</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${color.line}`, marginTop: 8, paddingTop: 10 }}><span style={{ fontWeight: 600 }}>Total (pay on delivery)</span><span className="display" style={{ fontSize: 20, fontWeight: 600 }}>{rupee(o.total)}</span></div>
        </div>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${color.line}`, borderRadius: radius.lg, padding: 18, marginTop: 16 }}>
        <div style={{ fontSize: 13, color: color.muted, fontWeight: 600, marginBottom: 4 }}>DELIVERING TO</div>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>{o.address.name}</div>
        <div style={{ fontSize: 14, color: color.body }}>{o.address.line}, {o.address.city}, {o.address.state} - {o.address.pincode}</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
        <Link to="/shop" style={{ flex: 1 }}><Btn full size="lg">Continue shopping</Btn></Link>
        <Link to="/account" style={{ flex: 1 }}><Btn full size="lg" variant="outline">Track order</Btn></Link>
      </div>
    </Container>
  );
}
