import { Link } from 'react-router-dom';
import { color, radius, shadow } from '../theme';
import { rupee } from '../format';
import { Icon } from '../icons';
import { Btn } from '../ui';
import { useStore } from '../store';
import { productById } from '../data/catalog';

export function CartDrawer() {
  const { drawerOpen, closeDrawer, items, setQty, remove, total, count } = useStore();
  if (!drawerOpen) return null;
  const lines = items.map((it) => ({ it, p: productById(it.productId)! })).filter((l) => l.p);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
      <div onClick={closeDrawer} style={{ position: 'absolute', inset: 0, background: 'rgba(11,16,32,0.5)', animation: 'sdFadeIn .2s ease' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '94vw', background: '#fff',
        display: 'flex', flexDirection: 'column', boxShadow: shadow.pop, animation: 'sdSlideR .3s cubic-bezier(.22,1,.36,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${color.line}` }}>
          <div className="display" style={{ fontSize: 19, fontWeight: 600 }}>Your cart {count > 0 && <span style={{ color: color.muted }}>({count})</span>}</div>
          <button onClick={closeDrawer} style={{ width: 38, height: 38, borderRadius: 999, background: color.surface, border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={18} /></button>
        </div>

        <div className="sd-scroll" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {lines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: color.surface, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="cart" size={28} stroke={color.muted} /></div>
              <div className="display" style={{ fontSize: 18, fontWeight: 600 }}>Your cart is empty</div>
              <div style={{ color: color.muted, fontSize: 14, margin: '6px 0 18px' }}>Add some gear to get started.</div>
              <Btn onClick={closeDrawer}>Continue shopping</Btn>
            </div>
          ) : lines.map(({ it, p }) => (
            <div key={p.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${color.lineSoft}` }}>
              <img src={p.images[0]} alt="" style={{ width: 72, height: 72, borderRadius: radius.sm, objectFit: 'cover', flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: color.muted, marginTop: 2 }}>{p.brand}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${color.line}`, borderRadius: 999 }}>
                    <button onClick={() => setQty(p.id, it.qty - 1)} style={qtyBtn}><Icon name="minus" size={14} /></button>
                    <span style={{ width: 28, textAlign: 'center', fontSize: 13.5, fontWeight: 600 }}>{it.qty}</span>
                    <button onClick={() => setQty(p.id, Math.min(p.stock, it.qty + 1))} style={qtyBtn}><Icon name="plus" size={14} /></button>
                  </div>
                  <span className="display" style={{ fontSize: 15, fontWeight: 600 }}>{rupee(p.price * it.qty)}</span>
                </div>
              </div>
              <button onClick={() => remove(p.id)} style={{ background: 'transparent', border: 0, color: color.muted, cursor: 'pointer', alignSelf: 'flex-start' }}><Icon name="trash" size={16} /></button>
            </div>
          ))}
        </div>

        {lines.length > 0 && (
          <div style={{ padding: 20, borderTop: `1px solid ${color.line}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14, color: color.body }}>
              <span>Total (incl. GST)</span><span className="display" style={{ fontSize: 20, fontWeight: 600, color: color.ink }}>{rupee(total)}</span>
            </div>
            <div style={{ fontSize: 12.5, color: color.muted, marginBottom: 14 }}>Pay on delivery · delivered by our team</div>
            <Link to="/checkout" onClick={closeDrawer}><Btn full size="lg" icon={<Icon name="arrowR" size={18} />} style={{ flexDirection: 'row-reverse' }}>Checkout</Btn></Link>
          </div>
        )}
      </div>
    </div>
  );
}

const qtyBtn: React.CSSProperties = { width: 30, height: 30, borderRadius: 999, background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.ink };
