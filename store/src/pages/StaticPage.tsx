import { Link, useParams } from 'react-router-dom';
import { color, radius } from '../theme';
import { Icon } from '../icons';
import { Container, Btn } from '../ui';

const CONTENT: Record<string, { title: string; body: string[] }> = {
  about: { title: 'About S&D Solution', body: [
    'S&D Solution is a retail electronics store in Kolkata — laptops, desktops, CCTV & security, components, networking and accessories.',
    'We sell only genuine, sealed, warranty-backed products with a proper GST invoice on every order. Our own team delivers locally and you pay on delivery.',
  ] },
  contact: { title: 'Contact us', body: [
    '14 Lindsay Street, New Market, Kolkata 700087',
    'Phone: +91 98300 11223 · WhatsApp: +91 98300 11223',
    'Email: shop@sndsolution.in · GSTIN: 19ABCDE1234F1Z5',
    'Hours: Mon–Sat, 10:30 AM – 8:30 PM',
  ] },
  shipping: { title: 'Shipping & delivery', body: [
    'Orders are delivered by our own team within the serviceable area, usually within 1–3 days.',
    'Delivery is free. Our team calls to confirm before delivery.',
  ] },
  returns: { title: 'Returns & replacement', body: [
    'Dead-on-arrival or defective items are replaced as per brand policy. Inspect your product at delivery.',
    'Contact us within the return window for any issue — we will help with replacement or service.',
  ] },
  warranty: { title: 'Warranty', body: [
    'All products carry the manufacturer / brand warranty. The duration is shown on each product page.',
    'Keep your GST invoice — it is your warranty proof.',
  ] },
  privacy: { title: 'Privacy policy', body: [
    'We collect only the details needed to process and deliver your order (name, phone, address).',
    'We never sell your data. Contact us for any data request.',
  ] },
  terms: { title: 'Terms & conditions', body: [
    'Prices include GST and may change without notice. Availability is subject to stock.',
    'Payment is collected on delivery. Placing an order means you accept these terms.',
  ] },
  notfound: { title: 'Page not found', body: ['The page you are looking for does not exist or has moved.'] },
};

export function StaticPage({ k }: { k?: string }) {
  const params = useParams();
  const key = k ?? params.k ?? 'notfound';
  const c = CONTENT[key] ?? CONTENT.notfound;
  const is404 = key === 'notfound';

  return (
    <Container style={{ paddingTop: 40, maxWidth: 760, minHeight: '50vh' }}>
      {is404 && <div style={{ width: 72, height: 72, borderRadius: 999, background: color.surface, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="search" size={32} stroke={color.muted} /></div>}
      <h1 className="display" style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 16 }}>{c.title}</h1>
      <div style={{ background: '#fff', border: `1px solid ${color.line}`, borderRadius: radius.lg, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {c.body.map((p, i) => <p key={i} style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: color.body }}>{p}</p>)}
        {key === 'contact' && (
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <a href="tel:+919830011223"><Btn icon={<Icon name="phone" size={17} />}>Call</Btn></a>
            <a href="https://wa.me/919830011223"><Btn variant="outline" icon={<Icon name="wa" size={17} />}>WhatsApp</Btn></a>
          </div>
        )}
      </div>
      <Link to="/"><Btn variant="ghost" style={{ marginTop: 18, paddingLeft: 0 }} icon={<Icon name="cleft" size={18} />}>Back to home</Btn></Link>
    </Container>
  );
}
