import { Link } from 'react-router-dom';
import { color } from '../theme';
import { Icon } from '../icons';
import { Container } from '../ui';
import { categories } from '../data/catalog';

export function Footer() {
  return (
    <footer style={{ background: color.ink, color: '#C2C8D4', marginTop: 60 }}>
      {/* trust strip */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Container style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, padding: '26px 20px' }}>
          {[['shield', 'Genuine products', 'Sealed & warranty-backed'], ['truck', 'Delivered by our team', 'Pay on delivery'],
            ['tag', 'GST invoice', 'On every order'], ['phone', 'Local support', 'Call / WhatsApp us']].map(([ic, t, s]) => (
            <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(91,140,255,0.16)', color: '#5B8CFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic as any} size={20} stroke="#5B8CFF" /></span>
              <div><div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{t}</div><div style={{ fontSize: 12.5, color: '#8A93A6' }}>{s}</div></div>
            </div>
          ))}
        </Container>
      </div>

      <Container style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 30, padding: '40px 20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" style={{ height: 36, background: '#fff', borderRadius: 8, padding: 2 }} />
            <span className="display" style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>S&amp;D Solution</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7 }}>14 Lindsay Street, New Market,<br />Kolkata 700087</div>
          <div style={{ fontSize: 13, marginTop: 8 }}>GSTIN: 19ABCDE1234F1Z5</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <a href="tel:+919830011223" style={fIcon}><Icon name="phone" size={17} /></a>
            <a href="https://wa.me/919830011223" style={fIcon}><Icon name="wa" size={17} /></a>
            <a href="mailto:shop@sndsolution.in" style={fIcon}><Icon name="mail" size={17} /></a>
          </div>
        </div>
        <div>
          <FH>Shop</FH>
          {categories.map((c) => <FL key={c.id} to={`/c/${c.slug}`}>{c.name}</FL>)}
        </div>
        <div>
          <FH>Help</FH>
          <FL to="/track">Track order</FL><FL to="/enquiry">Bulk / B2B enquiry</FL><FL to="/account">My account</FL><FL to="/contact">Contact us</FL>
        </div>
        <div>
          <FH>Policies</FH>
          <FL to="/policies/shipping">Shipping & delivery</FL><FL to="/policies/returns">Returns</FL><FL to="/policies/warranty">Warranty</FL><FL to="/policies/privacy">Privacy</FL><FL to="/policies/terms">Terms</FL>
        </div>
      </Container>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Container style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', padding: '18px 20px', fontSize: 12.5 }}>
          <span>© {new Date().getFullYear()} S&amp;D Solution. All rights reserved.</span>
          <span>Pay on delivery · Cash / UPI / Card</span>
        </Container>
      </div>
    </footer>
  );
}
function FH({ children }: { children: React.ReactNode }) { return <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{children}</div>; }
function FL({ to, children }: { to: string; children: React.ReactNode }) { return <Link to={to} style={{ display: 'block', fontSize: 13.5, padding: '6px 0', color: '#A8AEBD' }}>{children}</Link>; }
const fIcon: React.CSSProperties = { width: 38, height: 38, borderRadius: 999, background: 'rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' };
