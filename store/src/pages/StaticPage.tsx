import { useNavigate, useParams } from 'react-router-dom';

interface PageDef { eyebrow: string; title: string; intro: string; sections?: [string, string][]; stats?: [string, string][]; faq?: [string, string][]; }

const PAGES: Record<string, PageDef> = {
  about: { eyebrow: 'Our story', title: 'A neighbourhood electronics shop, now online', intro: 'S&D Solution has served the city since 2014 — first as a counter on Lamington Road, now as a storefront you can shop from anywhere. Same genuine stock, same honest pricing, same people delivering to your door.',
    sections: [['What we sell', 'Laptops, desktops, CCTV systems, networking gear, storage and components — all sealed, brand-new, and backed by full manufacturer warranty with a GST invoice on every order.'], ['Delivered by our own team', 'We don’t hand your order to a faceless courier. Our staff packs, delivers and — for CCTV and networking — installs, so you can pay on delivery once you’ve seen it working.'], ['Built on trust', 'Over 2,400 reviews and a 4.8 average. Most of our business comes from repeat customers and referrals — that’s the standard we hold ourselves to.']],
    stats: [['10+', 'Years serving the city'], ['1,200+', 'Products in stock'], ['2,400+', 'Customer reviews'], ['4.8/5', 'Average rating']] },
  contact: { eyebrow: 'Get in touch', title: 'We’re here to help', intro: 'Questions about a product, an order, or a bulk requirement? Reach us any way you like — we usually reply the same day.',
    sections: [['Visit the shop', 'Shop 14, Lamington Road, Mumbai 400004. Open Mon–Sat, 10:30am–8:30pm.'], ['Call or WhatsApp', '+91 98201 14455 — fastest for stock checks and order updates.'], ['Email', 'care@sndsolution.shop for invoices, warranty and B2B quotes.']] },
  shipping: { eyebrow: 'Delivery', title: 'Shipping & delivery', intro: 'We deliver across the city with our own team — no third-party couriers for local orders.',
    sections: [['Timelines', 'In-stock items are delivered within 2–3 working days. You’ll get a call before our team arrives.'], ['Charges', 'Free delivery on all orders within the city. Outstation orders are quoted at checkout or on enquiry.'], ['Pay on delivery', 'Inspect your item first, then pay by cash or online (UPI/card) when it arrives. No advance payment needed.'], ['Installation', 'CCTV and networking setups include on-site installation by our technicians at no extra charge within the city.']] },
  returns: { eyebrow: 'Peace of mind', title: 'Returns & replacements', intro: 'Sealed, genuine stock means fewer surprises — but if something isn’t right, we make it right.',
    sections: [['7-day replacement', 'Dead-on-arrival or defective units are replaced within 7 days of delivery, subject to inspection.'], ['How to request', 'Call or WhatsApp us with your order number. We arrange pickup and replacement together.'], ['Warranty claims', 'Beyond 7 days, manufacturer warranty applies. We help you with the brand’s service centre and paperwork.']] },
  warranty: { eyebrow: 'Coverage', title: 'Warranty', intro: 'Every product carries full manufacturer warranty. Your GST invoice is your warranty proof.',
    sections: [['Brand warranty', 'Warranty period varies by product (shown on each product page) and is honoured directly by the manufacturer’s service network.'], ['Invoice = proof', 'Keep the GST invoice we issue on delivery — it’s required for any warranty or service claim.'], ['We assist', 'Trouble with a claim? We help you coordinate with the brand’s service centre.']] },
  faq: { eyebrow: 'Questions', title: 'Frequently asked questions', intro: '',
    faq: [['Is the product genuine?', 'Yes — every item is sealed, brand-new and sourced through authorised channels, with a GST invoice on delivery.'], ['Do I pay before delivery?', 'No. Inspect your order first, then pay by cash or online when our team delivers it.'], ['How long does delivery take?', 'In-stock items arrive within 2–3 working days across the city, delivered by our own team.'], ['Do you give a GST invoice?', 'Yes, on every order — useful for business purchases and warranty claims.'], ['Can I get a bulk / business quote?', 'Absolutely. Use the Bulk / B2B enquiry form and we’ll send an itemised GST quote within 24 hours.'], ['What if my item is defective?', 'We offer 7-day replacement for dead-on-arrival units, and help with manufacturer warranty after that.']] },
  privacy: { eyebrow: 'Legal', title: 'Privacy policy', intro: 'We collect only what we need to process and deliver your order.',
    sections: [['What we collect', 'Your name, contact details and delivery address — used solely to fulfil your order and provide support.'], ['What we don’t do', 'We never sell your data. We don’t store card details; online payments are handled by the payment provider.'], ['Contact', 'Email care@sndsolution.shop for any data request.']] },
  terms: { eyebrow: 'Legal', title: 'Terms of service', intro: 'By placing an order you agree to the terms below.',
    sections: [['Pricing', 'Prices include GST and are subject to change. The price shown at order confirmation applies to your order.'], ['Orders', 'Orders are confirmed subject to stock. If an item is unavailable we’ll contact you with options.'], ['Payment', 'Pay on delivery by cash or online. Ownership passes once payment is received.']] },
};

export function StaticPage({ k }: { k?: string }) {
  const nav = useNavigate();
  const { k: param } = useParams();
  const key = k || param || 'about';
  const d = PAGES[key] || PAGES.about;
  const isContact = key === 'contact';

  return (
    <section style={{ maxWidth: 780, margin: '0 auto', padding: '32px clamp(16px,4vw,40px) 48px', animation: 'sdFade .35s ease' }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', color: '#1A4DF0', textTransform: 'uppercase' }}>{d.eyebrow}</span>
      <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 'clamp(28px,4.4vw,40px)', letterSpacing: '-0.025em', margin: '10px 0 16px', lineHeight: 1.08 }}>{d.title}</h1>
      {d.intro && <p style={{ fontSize: 'clamp(15px,1.8vw,17px)', color: '#5B6478', lineHeight: 1.65, margin: '0 0 28px', maxWidth: 640 }}>{d.intro}</p>}
      {d.stats && d.stats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 34 }}>{d.stats.map(([v, l]) => <div key={l} style={{ background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 16, padding: '18px 14px', textAlign: 'center' }}><div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: 'clamp(20px,2.6vw,26px)', color: '#1A4DF0', letterSpacing: '-0.02em' }}>{v}</div><div style={{ fontSize: 11.5, color: '#8A93A6', marginTop: 4, lineHeight: 1.3 }}>{l}</div></div>)}</div>
      )}
      {d.sections && d.sections.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>{d.sections.map(([h, p]) => <div key={h}><h2 style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 19, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{h}</h2><p style={{ fontSize: 15, color: '#5B6478', lineHeight: 1.65, margin: 0 }}>{p}</p></div>)}</div>
      )}
      {d.faq && d.faq.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>{d.faq.map(([q, a]) => <div key={q} style={{ background: '#fff', border: '1px solid rgba(11,16,32,0.08)', borderRadius: 16, padding: '20px 22px' }}><div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}><svg width="20" height="20" fill="none" stroke="#1A4DF0" strokeWidth="2" viewBox="0 0 24 24" style={{ flex: 'none', marginTop: 1 }}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 .3c0 1.7-2.5 2-2.5 3.7M12 17h.01" /></svg><div><div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{q}</div><div style={{ fontSize: 14, color: '#5B6478', lineHeight: 1.6 }}>{a}</div></div></div></div>)}</div>
      )}
      {isContact && <button onClick={() => nav('/enquiry')} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, height: 50, padding: '0 24px', marginTop: 28, background: '#1A4DF0', color: '#fff', borderRadius: 14, fontSize: 14.5, fontWeight: 600, border: 0, cursor: 'pointer' }}>Send a business enquiry <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>}
    </section>
  );
}
