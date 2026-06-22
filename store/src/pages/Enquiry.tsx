import { useState } from 'react';
import { color, radius } from '../theme';
import { Icon } from '../icons';
import { Container, Btn } from '../ui';
import { categories } from '../data/catalog';
import { useStore } from '../store';

export function Enquiry() {
  const { notify } = useStore();
  const [f, setF] = useState({ name: '', phone: '', email: '', interest: categories[0].name, qty: '', message: '' });
  const [sent, setSent] = useState(false);
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!f.name.trim() || !f.phone.trim()) { notify('Name & phone required'); return; }
    try {
      const prev = JSON.parse(localStorage.getItem('snd-store-enquiries') || '[]');
      localStorage.setItem('snd-store-enquiries', JSON.stringify([{ ...f, at: Date.now() }, ...prev]));
    } catch { /* */ }
    setSent(true); notify('Enquiry sent — we will contact you');
  };

  return (
    <Container style={{ paddingTop: 30, maxWidth: 980 }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(120deg, ${color.blue}, ${color.violet})`, borderRadius: radius.xl, padding: '38px 34px', color: '#fff', marginBottom: 26 }}>
        <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.85 }}>Bulk / B2B</div>
        <h1 className="display" style={{ fontSize: 32, fontWeight: 600, margin: '8px 0 8px' }}>Request a quote</h1>
        <p style={{ fontSize: 16, opacity: 0.92, maxWidth: 560 }}>Offices, cafes, CCTV setups, resellers — tell us what you need and our team sends the best price with GST invoice.</p>
      </div>

      {sent ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', border: `1px solid ${color.line}`, borderRadius: radius.lg }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: color.greenSoft, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={36} stroke={color.green} sw={2.4} /></div>
          <div className="display" style={{ fontSize: 24, fontWeight: 600 }}>Enquiry received!</div>
          <p style={{ color: color.body, marginTop: 6 }}>Our team will reach out to {f.phone} shortly with a quote.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: `1px solid ${color.line}`, borderRadius: radius.lg, padding: 24, maxWidth: 640 }}>
          <Row><F label="Full name"><I v={f.name} on={(v) => set('name', v)} ph="Your / business name" /></F><F label="Phone"><I v={f.phone} on={(v) => set('phone', v)} ph="+91 …" /></F></Row>
          <Row><F label="Email (optional)"><I v={f.email} on={(v) => set('email', v)} ph="you@email.com" /></F><F label="Interested in"><select value={f.interest} onChange={(e) => set('interest', e.target.value)} style={inp}>{categories.map((c) => <option key={c.id}>{c.name}</option>)}<option>Mixed / Other</option></select></F></Row>
          <F label="Approx quantity"><I v={f.qty} on={(v) => set('qty', v)} ph="e.g. 10 laptops, 8-cam CCTV" /></F>
          <F label="Message"><textarea value={f.message} onChange={(e) => set('message', e.target.value)} placeholder="Tell us what you need…" rows={4} style={{ ...inp, height: 'auto', padding: 14, resize: 'vertical' }} /></F>
          <Btn size="lg" full onClick={submit} icon={<Icon name="arrowR" size={18} />} style={{ flexDirection: 'row-reverse' }}>Send enquiry</Btn>
        </div>
      )}
    </Container>
  );
}
function Row({ children }: { children: React.ReactNode }) { return <div style={{ display: 'flex', gap: 12 }} className="pd-grid">{children}</div>; }
function F({ label, children }: { label: string; children: React.ReactNode }) { return <label style={{ display: 'block', marginBottom: 14, flex: 1 }}><span style={{ fontSize: 13, fontWeight: 600, color: color.body, display: 'block', marginBottom: 6 }}>{label}</span>{children}</label>; }
function I({ v, on, ph }: { v: string; on: (x: string) => void; ph?: string }) { return <input value={v} onChange={(e) => on(e.target.value)} placeholder={ph} style={inp} />; }
const inp: React.CSSProperties = { width: '100%', height: 46, border: `1.5px solid ${color.line}`, borderRadius: radius.md, padding: '0 14px', fontSize: 15, outline: 'none', background: '#fff' };
