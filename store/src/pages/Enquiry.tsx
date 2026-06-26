import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIsMobile } from '../components/useViewport';
import { useStore } from '../store';
import { pushQuoteEnquiry } from '../data/api';

const PERKS = [
  { icon: 'M3 3v18h18M7 14l3-3 3 3 5-6', title: 'Volume pricing', sub: 'Better rates as you scale' },
  { icon: 'M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z', title: 'GST quote in 24h', sub: 'Clear, itemised pricing' },
  { icon: 'M3 7h11v8H3zM14 10h4l3 3v2h-7M7 18a2 2 0 1 1-4 0M19 18a2 2 0 1 1-4 0', title: 'Delivery + install', sub: 'By our own team' },
];

export function Enquiry() {
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const [sp] = useSearchParams();
  const { showToast } = useStore();
  const [f, setF] = useState({ name: '', phone: '', email: '', product: sp.get('product') || '', qty: '1', note: '' });
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = () => {
    if (!f.name.trim() || f.phone.trim().length < 10) { showToast({ msg: 'Please add your name and a valid phone', type: 'error' }); return; }
    void pushQuoteEnquiry(f);
    setSent(true);
  };

  if (sent) return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '30px clamp(16px,4vw,40px) 44px', animation: 'sdFade .35s ease' }}>
      <div style={{ maxWidth: 520, margin: '30px auto 0', textAlign: 'center' }}>
        <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#E7F8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', animation: 'sdPop .5s cubic-bezier(.22,1,.36,1)' }}><svg width="42" height="42" fill="none" stroke="#0E9F6E" strokeWidth="2.4" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg></div>
        <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 28, letterSpacing: '-0.02em', margin: '0 0 10px' }}>Enquiry received!</h1>
        <p style={{ fontSize: 15, color: '#5B6478', lineHeight: 1.55, margin: '0 0 26px' }}>Thanks — our team will send you an itemised GST quote within 24 hours, by call or WhatsApp.</p>
        <button onClick={() => nav('/')} style={{ height: 50, padding: '0 26px', border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Back to shop</button>
      </div>
    </section>
  );

  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '30px clamp(16px,4vw,40px) 44px', animation: 'sdFade .35s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr', gap: 'clamp(24px,4vw,44px)', alignItems: 'start' }}>
        <div>
          <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', color: '#1A4DF0', textTransform: 'uppercase' }}>Bulk &amp; business</span>
          <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(26px,3.6vw,34px)', letterSpacing: '-0.02em', margin: '9px 0 14px', lineHeight: 1.1 }}>Request a quote</h1>
          <p style={{ fontSize: 15, color: '#5B6478', lineHeight: 1.6, margin: '0 0 24px' }}>Buying in volume, or need something we don't list? Tell us what you need and we'll send an itemised GST quote — then deliver and install with our own team.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{PERKS.map((k) => <div key={k.title} style={{ display: 'flex', alignItems: 'center', gap: 13 }}><div style={{ width: 42, height: 42, flex: 'none', borderRadius: 12, background: '#EAF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="21" height="21" fill="none" stroke="#1A4DF0" strokeWidth="1.9" viewBox="0 0 24 24"><path d={k.icon} /></svg></div><div><div style={{ fontSize: 14.5, fontWeight: 600 }}>{k.title}</div><div style={{ fontSize: 12.5, color: '#8A93A6' }}>{k.sub}</div></div></div>)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 20, padding: 'clamp(20px,3vw,28px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Name *"><input value={f.name} onChange={set('name')} placeholder="Your name" style={inp} /></Field>
            <Field label="Phone *"><input value={f.phone} onChange={(e) => setF((s) => ({ ...s, phone: e.target.value.replace(/[^\d+ ]/g, '') }))} placeholder="10-digit mobile" style={inp} /></Field>
            <Field label="Email" span><input value={f.email} onChange={set('email')} placeholder="Optional" style={inp} /></Field>
            <Field label="Product / category"><input value={f.product} onChange={set('product')} placeholder="e.g. CCTV for office" style={inp} /></Field>
            <Field label="Quantity"><input value={f.qty} onChange={set('qty')} placeholder="e.g. 10" style={inp} /></Field>
            <Field label="Notes" span><textarea value={f.note} onChange={set('note')} placeholder="Tell us about your requirement, location, timeline…" rows={3} style={{ ...inp, height: 'auto', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit' }} /></Field>
          </div>
          <button onClick={submit} style={{ width: '100%', height: 54, marginTop: 18, border: 0, background: '#1A4DF0', color: '#fff', borderRadius: 14, fontSize: 15.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 12px 28px -10px #1A4DF0' }}>Send enquiry</button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 12, fontSize: 12.5, color: '#8A93A6' }}><svg width="14" height="14" fill="none" stroke="#0E9F6E" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>We reply within 24 hours · no spam</div>
        </div>
      </div>
    </section>
  );
}
function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return <label style={{ display: 'flex', flexDirection: 'column', gap: 7, gridColumn: span ? '1/-1' : undefined }}><span style={{ fontSize: 13, fontWeight: 600, color: '#27314A' }}>{label}</span>{children}</label>;
}
const inp: React.CSSProperties = { height: 48, border: '1.5px solid rgba(11,16,32,0.12)', borderRadius: 12, padding: '0 14px', fontSize: 14.5, outline: 'none' };
