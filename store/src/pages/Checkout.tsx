import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MiniTile } from '../components/Tile';
import { useIsMobile } from '../components/useViewport';
import { rupee } from '../format';
import { useStore } from '../store';
import { productById } from '../data/catalog';
import type { Address } from '../data/types';

const STEPS = ['Details', 'Delivery', 'Review'];

export function Checkout() {
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const { items, subTotal, gst, savings, total, count, placeOrder, showToast } = useStore();
  const [step, setStep] = useState(1);
  const [f, setF] = useState<Address>({ name: '', phone: '', email: '', line: '', city: '', state: 'Maharashtra', pincode: '', gstin: '' });
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const lines = items.map((it) => ({ it, p: productById(it.productId)! })).filter((l) => l.p);

  if (lines.length === 0) return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '24px clamp(16px,4vw,40px) 40px', animation: 'sdFade .35s ease' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 19, fontWeight: 600, marginBottom: 8 }}>Your cart is empty</div>
        <div style={{ fontSize: 14, color: '#8A93A6', marginBottom: 22 }}>Add a product before checking out.</div>
        <button onClick={() => nav('/shop')} style={{ height: 48, padding: '0 24px', border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 13, fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>Browse products</button>
      </div>
    </section>
  );

  const step1Valid = f.name.trim() && f.phone.trim().length >= 10 && f.line.trim() && f.city.trim() && f.pincode.trim().length >= 6;
  const next = () => { if (step === 1 && !step1Valid) { showToast({ msg: 'Please fill name, phone, address, city & pincode', type: 'error' }); return; } setStep((s) => Math.min(3, s + 1)); window.scrollTo({ top: 0 }); };
  const back = () => { if (step === 1) nav('/cart'); else setStep((s) => s - 1); };
  const place = () => { placeOrder(f); nav('/order/success'); };
  const delivery = f.city ? `${f.city}, ${f.state} ${f.pincode}` : 'your address';

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '24px clamp(16px,4vw,40px) 40px', animation: 'sdFade .35s ease' }}>
      <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(24px,3.6vw,34px)', letterSpacing: '-0.02em', margin: '0 0 22px' }}>Checkout</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, maxWidth: 520 }}>
        {STEPS.map((label, i) => { const n = i + 1; const done = step > n; const active = step === n; return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: 'none' }}><div style={{ width: 34, height: 34, borderRadius: '50%', background: done ? '#0E9F6E' : active ? '#1A4DF0' : '#E6E8EE', color: step >= n ? '#fff' : '#8A93A6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, transition: 'background .3s' }}>{n}</div><span style={{ fontSize: 11.5, fontWeight: 600, color: '#5B6478' }}>{label}</span></div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > n ? '#0E9F6E' : '#E6E8EE', margin: '0 6px 22px' }} />}
          </div>
        ); })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 20, padding: 'clamp(18px,3vw,28px)' }}>
          {step === 1 && (<>
            <div style={cardTitle}>Contact & delivery details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Full name *" span><input value={f.name} onChange={set('name')} placeholder="e.g. Rahul Sharma" style={inp} /></Field>
              <Field label="Phone *"><input value={f.phone} onChange={(e) => setF((s) => ({ ...s, phone: e.target.value.replace(/[^\d+ ]/g, '') }))} placeholder="10-digit mobile" style={inp} /></Field>
              <Field label="Email"><input value={f.email ?? ''} onChange={set('email')} placeholder="for invoice (optional)" style={inp} /></Field>
              <Field label="Delivery address *" span><textarea value={f.line} onChange={set('line')} placeholder="Flat / building, street, area" rows={2} style={{ ...inp, height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit' }} /></Field>
              <Field label="City *"><input value={f.city} onChange={set('city')} placeholder="City" style={inp} /></Field>
              <Field label="Pincode *"><input value={f.pincode} onChange={(e) => setF((s) => ({ ...s, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} placeholder="6-digit pincode" style={inp} /></Field>
              <Field label="GSTIN (for business invoice — optional)" span><input value={f.gstin ?? ''} onChange={(e) => setF((s) => ({ ...s, gstin: e.target.value.toUpperCase() }))} placeholder="e.g. 27ABCDE1234F1Z5" style={inp} /></Field>
            </div>
          </>)}
          {step === 2 && (<>
            <div style={cardTitle}>Delivery & payment</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'flex', gap: 13, padding: 16, border: '2px solid #1A4DF0', borderRadius: 15, background: '#F4F6FF' }}><div style={radioOn} /><div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 700 }}>Standard delivery — Free</div><div style={{ fontSize: 13, color: '#5B6478', marginTop: 3 }}>Delivered by our own team in 2–3 working days to {delivery}.</div></div><svg width="34" height="34" fill="none" stroke="#1A4DF0" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7M7 18a2 2 0 1 1-4 0M19 18a2 2 0 1 1-4 0" /></svg></div>
              <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 16, margin: '10px 0 4px' }}>Payment method</div>
              <div style={{ display: 'flex', gap: 13, padding: 16, border: '2px solid #1A4DF0', borderRadius: 15, background: '#F4F6FF' }}><div style={radioOn} /><div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 700 }}>Pay on delivery</div><div style={{ fontSize: 13, color: '#5B6478', marginTop: 3 }}>Inspect your order, then pay by cash or online (UPI/card) when it arrives. No advance payment.</div></div><svg width="32" height="32" fill="none" stroke="#0E9F6E" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M3 7h18v10H3zM3 11h18M7 15h4" /></svg></div>
              <div style={{ display: 'flex', gap: 13, padding: 16, border: '1.5px solid rgba(11,16,32,0.1)', borderRadius: 15, opacity: 0.6 }}><div style={{ width: 22, height: 22, flex: 'none', borderRadius: '50%', border: '2px solid rgba(11,16,32,0.2)', marginTop: 2 }} /><div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 700 }}>Pay online now</div><div style={{ fontSize: 13, color: '#8A93A6', marginTop: 3 }}>UPI, cards & netbanking — coming soon to the store.</div></div></div>
            </div>
          </>)}
          {step === 3 && (<>
            <div style={cardTitle}>Review your order</div>
            <div style={{ background: '#F6F7FB', borderRadius: 14, padding: 16, marginBottom: 16 }}><div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8A93A6', marginBottom: 9 }}>Delivering to</div><div style={{ fontSize: 14.5, fontWeight: 600 }}>{f.name || '—'} · {f.phone || '—'}</div><div style={{ fontSize: 13.5, color: '#5B6478', marginTop: 3 }}>{f.line}, {delivery}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{lines.map(({ it, p }) => <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 13 }}><MiniTile p={p} size={52} /><div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</div><div style={{ fontSize: 12.5, color: '#8A93A6' }}>Qty {it.qty}</div></div><span style={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{rupee(p.price * it.qty)}</span></div>)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, padding: 14, background: '#E7F8F0', borderRadius: 13 }}><svg width="22" height="22" fill="none" stroke="#0E9F6E" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" /><path d="m9 12 2 2 4-4" /></svg><span style={{ fontSize: 13.5, color: '#0B5C42', fontWeight: 500 }}>Pay on delivery · GST invoice included · brand warranty</span></div>
          </>)}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={back} style={{ height: 52, padding: '0 22px', border: '1.5px solid rgba(11,16,32,0.14)', background: '#fff', color: '#0B1020', borderRadius: 13, fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>Back</button>
            {step < 3 ? (
              <button onClick={next} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, height: 52, border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 13, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Continue <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
            ) : (
              <button onClick={place} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, height: 52, border: 0, background: '#0E9F6E', color: '#fff', borderRadius: 13, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 12px 28px -10px #0E9F6E' }}>Place order · pay on delivery</button>
            )}
          </div>
        </div>

        <div style={{ position: isMobile ? 'static' : 'sticky', top: 90, background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 20, padding: 22 }}>
          <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 16 }}>{count} item summary</div>
          <SumRow k="Subtotal" v={rupee(subTotal)} />
          {savings > 0 && <SumRow k="You save" v={`−${rupee(savings)}`} green />}
          <SumRow k="Delivery" v="Free" green />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#8A93A6', marginBottom: 14 }}><span>Incl. GST</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{rupee(gst)}</span></div>
          <div style={{ height: 1, background: 'rgba(11,16,32,0.08)', marginBottom: 14 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span style={{ fontSize: 15, fontWeight: 700 }}>Total</span><span style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{rupee(total)}</span></div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return <label style={{ display: 'flex', flexDirection: 'column', gap: 7, gridColumn: span ? '1/-1' : undefined }}><span style={{ fontSize: 13, fontWeight: 600, color: '#27314A' }}>{label}</span>{children}</label>;
}
function SumRow({ k, v, green }: { k: string; v: string; green?: boolean }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: green ? '#0E9F6E' : '#5B6478', fontWeight: green ? 600 : 400, marginBottom: 9 }}><span>{k}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</span></div>;
}
const cardTitle: React.CSSProperties = { fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 19, marginBottom: 20 };
const inp: React.CSSProperties = { height: 48, border: '1.5px solid rgba(11,16,32,0.12)', borderRadius: 12, padding: '0 14px', fontSize: 14.5, outline: 'none' };
const radioOn: React.CSSProperties = { width: 22, height: 22, flex: 'none', borderRadius: '50%', border: '6px solid #1A4DF0', marginTop: 2 };
