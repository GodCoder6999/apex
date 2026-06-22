import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { color, radius } from '../theme';
import { Icon } from '../icons';
import { Container, Btn } from '../ui';
import { rupee } from '../format';
import { useStore } from '../store';
import { productById } from '../data/catalog';
import type { Address } from '../data/types';

const STATES = ['West Bengal', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 'Telangana', 'Rajasthan', 'Other'];

export function Checkout() {
  const nav = useNavigate();
  const { items, subTotal, gst, total, setQty, placeOrder, notify } = useStore();
  const [step, setStep] = useState(1);
  const [f, setF] = useState<Address>({ name: '', phone: '', email: '', line: '', city: '', state: 'West Bengal', pincode: '', gstin: '' });
  const set = (k: keyof Address, v: string) => setF((s) => ({ ...s, [k]: v }));

  const lines = items.map((it) => ({ it, p: productById(it.productId)! })).filter((l) => l.p);
  if (lines.length === 0) return (
    <Container style={{ padding: '70px 20px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 999, background: color.surface, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="cart" size={28} stroke={color.muted} /></div>
      <div className="display" style={{ fontSize: 24, fontWeight: 600 }}>Your cart is empty</div>
      <Link to="/shop"><Btn size="lg" style={{ marginTop: 18 }}>Start shopping</Btn></Link>
    </Container>
  );

  const next1 = () => { if (!f.name.trim() || !/^\+?\d[\d ]{7,}$/.test(f.phone.trim())) { notify('Enter name & valid phone'); return; } setStep(2); };
  const next2 = () => { if (!f.line.trim() || !f.city.trim() || !/^\d{6}$/.test(f.pincode.trim())) { notify('Complete the delivery address (6-digit pincode)'); return; } setStep(3); };
  const submit = () => { placeOrder(f); nav('/order/success'); };

  return (
    <Container style={{ paddingTop: 28 }}>
      <h1 className="display" style={{ fontSize: 30, fontWeight: 600, marginBottom: 6 }}>Checkout</h1>
      <Steps step={step} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 30, alignItems: 'start', marginTop: 22 }} className="pd-grid">
        <div>
          {step === 1 && (
            <Card title="Contact details">
              <Field label="Full name"><Input value={f.name} onChange={(v) => set('name', v)} placeholder="Your name" /></Field>
              <Row>
                <Field label="Phone"><Input value={f.phone} onChange={(v) => set('phone', v)} placeholder="+91 …" /></Field>
                <Field label="Email (optional)"><Input value={f.email ?? ''} onChange={(v) => set('email', v)} placeholder="you@email.com" /></Field>
              </Row>
              <Btn size="lg" onClick={next1} style={{ marginTop: 6 }}>Continue to address</Btn>
            </Card>
          )}
          {step === 2 && (
            <Card title="Delivery address" onBack={() => setStep(1)}>
              <Field label="Address (house, street, area)"><Input value={f.line} onChange={(v) => set('line', v)} placeholder="Flat / house, street, landmark" /></Field>
              <Row>
                <Field label="City"><Input value={f.city} onChange={(v) => set('city', v)} placeholder="City" /></Field>
                <Field label="Pincode"><Input value={f.pincode} onChange={(v) => set('pincode', v.replace(/\D/g, '').slice(0, 6))} placeholder="700087" /></Field>
              </Row>
              <Row>
                <Field label="State">
                  <select value={f.state} onChange={(e) => set('state', e.target.value)} style={inputStyle}>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
                </Field>
                <Field label="GSTIN (optional · B2B)"><Input value={f.gstin ?? ''} onChange={(v) => set('gstin', v.toUpperCase())} placeholder="For business invoice" /></Field>
              </Row>
              <Btn size="lg" onClick={next2} style={{ marginTop: 6 }}>Review order</Btn>
            </Card>
          )}
          {step === 3 && (
            <Card title="Review & place order" onBack={() => setStep(2)}>
              <div style={{ background: color.surface, borderRadius: radius.md, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{f.name} · {f.phone}</div>
                <div style={{ fontSize: 14, color: color.body }}>{f.line}, {f.city}, {f.state} - {f.pincode}</div>
                {f.gstin && <div style={{ fontSize: 13, color: color.muted, marginTop: 2 }}>GSTIN: {f.gstin}</div>}
              </div>
              {lines.map(({ it, p }) => (
                <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${color.lineSoft}` }}>
                  <img src={p.images[0]} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 12.5, color: color.muted }}>Qty {it.qty}</div></div>
                  <span className="display" style={{ fontWeight: 600 }}>{rupee(p.price * it.qty)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: color.blueSoft, borderRadius: radius.md, padding: 14, margin: '16px 0' }}>
                <Icon name="truck" size={22} stroke={color.blue} />
                <div style={{ fontSize: 13.5 }}><b>Pay on delivery</b> — our team delivers and collects payment (cash / UPI / card). GST invoice included.</div>
              </div>
              <Btn size="lg" full onClick={submit} icon={<Icon name="check" size={18} />}>Place order · {rupee(total)}</Btn>
              <div style={{ fontSize: 12, color: color.muted, textAlign: 'center', marginTop: 10 }}>By placing the order you agree to our terms. No payment is taken online.</div>
            </Card>
          )}
        </div>

        {/* summary */}
        <div style={{ position: 'sticky', top: 130, background: '#fff', border: `1px solid ${color.line}`, borderRadius: radius.lg, padding: 20 }}>
          <div className="display" style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Order summary</div>
          <div className="sd-scroll" style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 12 }}>
            {lines.map(({ it, p }) => (
              <div key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0' }}>
                <img src={p.images[0]} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <button onClick={() => setQty(p.id, it.qty - 1)} style={miniBtn}>−</button><span style={{ fontSize: 12.5 }}>{it.qty}</span><button onClick={() => setQty(p.id, Math.min(p.stock, it.qty + 1))} style={miniBtn}>+</button>
                  </div>
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{rupee(p.price * it.qty)}</span>
              </div>
            ))}
          </div>
          <Line k="Subtotal" v={rupee(subTotal)} />
          <Line k={`GST`} v={rupee(gst)} />
          <Line k="Delivery" v="Free" green />
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${color.line}`, marginTop: 8, paddingTop: 12 }}>
            <span style={{ fontWeight: 600 }}>Total</span><span className="display" style={{ fontSize: 22, fontWeight: 600 }}>{rupee(total)}</span>
          </div>
        </div>
      </div>
    </Container>
  );
}

function Steps({ step }: { step: number }) {
  const labels = ['Contact', 'Address', 'Review'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
      {labels.map((l, i) => {
        const n = i + 1, done = step > n, active = step === n;
        return (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 26, height: 26, borderRadius: 999, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done || active ? color.blue : color.surface, color: done || active ? '#fff' : color.muted }}>{done ? '✓' : n}</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: active ? color.ink : color.muted }}>{l}</span>
            {i < 2 && <span style={{ width: 24, height: 2, background: color.line, borderRadius: 2 }} />}
          </div>
        );
      })}
    </div>
  );
}
function Card({ title, children, onBack }: { title: string; children: React.ReactNode; onBack?: () => void }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${color.line}`, borderRadius: radius.lg, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {onBack && <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: 999, background: color.surface, border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="cleft" size={18} /></button>}
        <div className="display" style={{ fontSize: 20, fontWeight: 600 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: 'block', marginBottom: 14, flex: 1 }}><span style={{ fontSize: 13, fontWeight: 600, color: color.body, display: 'block', marginBottom: 6 }}>{label}</span>{children}</label>;
}
function Row({ children }: { children: React.ReactNode }) { return <div style={{ display: 'flex', gap: 12 }}>{children}</div>; }
function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />;
}
function Line({ k, v, green }: { k: string; v: string; green?: boolean }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14, color: color.body }}><span>{k}</span><span style={{ color: green ? color.green : color.ink, fontWeight: green ? 600 : 500 }}>{v}</span></div>;
}
const inputStyle: React.CSSProperties = { width: '100%', height: 46, border: `1.5px solid ${color.line}`, borderRadius: radius.md, padding: '0 14px', fontSize: 15, outline: 'none', background: '#fff' };
const miniBtn: React.CSSProperties = { width: 20, height: 20, borderRadius: 999, border: `1px solid ${color.line}`, background: '#fff', cursor: 'pointer', fontSize: 13, lineHeight: 1, color: color.ink };
