import { useNavigate } from 'react-router-dom';
import { categories } from '../data/catalog';

const SOCIALS = [
  'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z',
  'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  'M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM17.5 6.5h.01',
];

export function Footer({ isMobile }: { isMobile: boolean }) {
  const nav = useNavigate();
  const cols: { title: string; links: [string, string][] }[] = [
    { title: 'Shop', links: categories.slice(0, 5).map((c) => [c.name, `/c/${c.slug}`]) },
    { title: 'Help', links: [['Track your order', '/track'], ['Shipping & delivery', '/policies/shipping'], ['Returns', '/policies/returns'], ['Warranty', '/policies/warranty'], ['FAQ', '/policies/faq']] },
    { title: 'Company', links: [['About us', '/about'], ['Contact', '/contact'], ['Bulk / B2B enquiry', '/enquiry'], ['Privacy policy', '/policies/privacy'], ['Terms', '/policies/terms']] },
  ];

  return (
    <footer style={{ marginTop: 'clamp(56px,7vw,88px)', background: '#0B1020', color: '#fff', paddingBottom: isMobile ? 74 : 0 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,40px) 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1.4fr 1fr 1fr 1.2fr', gap: 'clamp(28px,4vw,48px)', paddingBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: '-0.03em' }}><span style={{ color: '#FF3B4E' }}>S</span><span style={{ color: '#1A4DF0' }}>D</span></span></div>
              <div style={{ lineHeight: 1 }}><span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: 17 }}>S&amp;D Solution</span><div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>ELECTRONICS · SINCE 2014</div></div>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)', margin: '0 0 18px' }}>Your neighbourhood electronics store, online. Genuine products, GST invoice, and delivery by our own team — pay only when it arrives.</p>
            <div style={{ display: 'flex', gap: 10 }}>{SOCIALS.map((d, i) => <button key={i} className="sd-social" style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: 0, cursor: 'pointer', transition: 'background .2s' }}><svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d={d} /></svg></button>)}</div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 15 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>{col.links.map(([l, h]) => <button key={l} onClick={() => nav(h)} className="sd-foot-link" style={{ border: 0, background: 'transparent', color: 'rgba(255,255,255,0.72)', fontSize: 13.5, textAlign: 'left', cursor: 'pointer', padding: 0, transition: 'color .2s' }}>{l}</button>)}</div>
            </div>
          ))}
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 15 }}>Get in touch</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13, fontSize: 13.5, color: 'rgba(255,255,255,0.72)' }}>
              <div style={{ display: 'flex', gap: 10 }}><svg width="17" height="17" fill="none" stroke="#5B8CFF" strokeWidth="1.8" viewBox="0 0 24 24" style={{ flex: 'none', marginTop: 1 }}><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg><span>Shop 14, Lamington Road,<br />Mumbai 400004</span></div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><svg width="17" height="17" fill="none" stroke="#5B8CFF" strokeWidth="1.8" viewBox="0 0 24 24" style={{ flex: 'none' }}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg><span>+91 98201 14455</span></div>
              <a href="https://wa.me/919820114455" target="_blank" rel="noreferrer" style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#25D366', textDecoration: 'none' }}><svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24" style={{ flex: 'none' }}><path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3 1 2.6 1.1 2.7s1.9 2.9 4.6 4c1.7.7 2.3.8 3.1.7s1.4-.6 1.6-1.1.2-1 .1-1.1z" /></svg><span>Chat on WhatsApp</span></a>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><svg width="17" height="17" fill="none" stroke="#5B8CFF" strokeWidth="1.8" viewBox="0 0 24 24" style={{ flex: 'none' }}><path d="M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z" /></svg><span>GSTIN: 27ABCDE1234F1Z5</span></div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, paddingTop: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>{['Pay on delivery', 'GST invoice on every order', 'Brand warranty'].map((t) => <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}><svg width="15" height="15" fill="none" stroke="#0E9F6E" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>{t}</span>)}</div>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>© 2026 S&amp;D Solution. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
