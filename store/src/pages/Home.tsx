import { Link } from 'react-router-dom';
import { color, radius, shadow } from '../theme';
import { Icon } from '../icons';
import { Container, Btn, SectionHead } from '../ui';
import { ProductCard } from '../components/ProductCard';
import { categories, brands, featured, bestSellers, newArrivals, deals, byCategory } from '../data/catalog';

function Row({ items }: { items: any[] }) {
  return (
    <div className="sd-scroll" style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(230px, 1fr)', gap: 18, overflowX: 'auto', paddingBottom: 6 }}>
      {items.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}

export function Home() {
  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(180deg, ${color.blueSoft2}, ${color.bg})` }}>
        <div aria-hidden style={{ position: 'absolute', top: -120, right: -80, width: 460, height: 460, borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${color.blue2}, transparent 70%)`, opacity: 0.5, animation: 'sdMesh 14s ease-in-out infinite' }} />
        <Container style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 30, alignItems: 'center', padding: '64px 20px 70px' }}>
          <div className="rise">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', boxShadow: shadow.sm, borderRadius: 999, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: color.blue }}>
              <Icon name="spark" size={15} stroke={color.blue} /> Genuine tech · delivered to your door
            </span>
            <h1 className="display" style={{ fontSize: 'clamp(38px, 6vw, 64px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.02, margin: '20px 0 16px' }}>
              Premium electronics,<br /><span style={{ color: color.blue }}>priced right.</span>
            </h1>
            <p style={{ fontSize: 17, color: color.body, lineHeight: 1.6, maxWidth: 480, margin: '0 0 28px' }}>
              Laptops, gaming PCs, CCTV, components & accessories — sealed, warranty-backed, with GST invoice. Pay on delivery.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/shop"><Btn size="lg" icon={<Icon name="arrowR" size={18} />} style={{ flexDirection: 'row-reverse' }}>Shop all products</Btn></Link>
              <Link to="/c/cctv"><Btn size="lg" variant="outline">CCTV solutions</Btn></Link>
            </div>
            <div style={{ display: 'flex', gap: 22, marginTop: 30, flexWrap: 'wrap' }}>
              {[['500+', 'Products'], ['4.8★', 'Avg rating'], ['Same-day', 'Local delivery']].map(([a, b]) => (
                <div key={b}><div className="display" style={{ fontSize: 24, fontWeight: 600 }}>{a}</div><div style={{ fontSize: 13, color: color.muted }}>{b}</div></div>
              ))}
            </div>
          </div>
          <div className="desk-only" style={{ position: 'relative', height: 420 }}>
            {featured().slice(0, 3).map((p, i) => (
              <Link key={p.id} to={`/p/${p.slug}`} className="cardHover" style={{ position: 'absolute', background: '#fff', borderRadius: radius.xl, boxShadow: shadow.card, overflow: 'hidden',
                width: i === 0 ? 240 : 180, top: [40, 0, 210][i], left: [20, 270, 250][i], animation: `sdFloat${i === 1 ? '2' : ''} ${6 + i}s ease-in-out infinite` }}>
                <img src={p.images[0]} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                <div style={{ padding: 12 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{p.name}</div></div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* TRUST BAND (marquee) */}
      <div style={{ background: color.ink, color: '#fff', overflow: 'hidden', padding: '14px 0' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'sdMarquee 26s linear infinite' }}>
          {[0, 1].map((dup) => (
            <div key={dup} style={{ display: 'flex', gap: 48, paddingRight: 48 }}>
              {['Free home delivery', 'GST invoice on every order', 'Genuine & sealed products', 'Warranty included', 'Pay on delivery', 'Local support'].map((t) => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  <Icon name="check" size={16} stroke={color.blue2} />{t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Container style={{ padding: '56px 20px 0' }}>
        {/* SHOP BY CATEGORY */}
        <SectionHead kicker="Browse" title="Shop by category" action={<Link to="/shop" style={{ color: color.blue, fontWeight: 600, fontSize: 14 }}>View all →</Link>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16 }}>
          {categories.map((c) => (
            <Link key={c.id} to={`/c/${c.slug}`} className="cardHover" style={{ background: '#fff', borderRadius: radius.lg, border: `1px solid ${color.line}`, padding: 20, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: color.blueSoft, color: color.blue, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={c.icon as any} size={26} stroke={color.blue} /></div>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>{c.name}</div>
              <div style={{ fontSize: 12.5, color: color.muted, marginTop: 2 }}>{byCategory(c.id).length} items</div>
            </Link>
          ))}
        </div>
      </Container>

      <Section title="Featured" kicker="Hand-picked" items={featured()} />

      {/* DEALS BAND */}
      <div style={{ background: `linear-gradient(120deg, ${color.ink}, #1b2540)`, color: '#fff', margin: '56px 0 0', padding: '40px 0' }}>
        <Container>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ color: color.red2, fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="bolt" size={16} stroke={color.red2} fill={color.red2} /> Hot deals</div>
              <h2 className="display" style={{ margin: '6px 0 0', fontSize: 30, fontWeight: 600, color: '#fff' }}>Best price, today.</h2>
            </div>
            <Link to="/shop"><Btn variant="white">See all deals</Btn></Link>
          </div>
          <div className="sd-scroll" style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(230px,1fr)', gap: 18, overflowX: 'auto' }}>
            {deals().map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </Container>
      </div>

      <Section title="Best sellers" kicker="Most loved" items={bestSellers()} />

      {/* BRANDS */}
      <Container style={{ padding: '56px 20px 0' }}>
        <SectionHead kicker="Trusted by you" title="Shop by brand" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 14 }}>
          {brands.map((b) => (
            <div key={b.id} className="cardHover" style={{ background: '#fff', border: `1px solid ${color.line}`, borderRadius: radius.md, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, color: color.dark }}>{b.name}</div>
          ))}
        </div>
      </Container>

      <Section title="New arrivals" kicker="Just in" items={newArrivals()} />

      {/* B2B BANNER */}
      <Container style={{ padding: '56px 20px 0' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(120deg, ${color.blue}, ${color.violet})`, borderRadius: radius.xl, padding: '44px 40px', color: '#fff' }}>
          <div aria-hidden style={{ position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ position: 'relative', maxWidth: 560 }}>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.85 }}>For business & bulk</div>
            <h2 className="display" style={{ fontSize: 34, fontWeight: 600, margin: '8px 0 10px' }}>Buying in bulk? Get a custom quote.</h2>
            <p style={{ fontSize: 16, opacity: 0.92, marginBottom: 22 }}>Offices, cafes, CCTV setups & resellers — tell us what you need and our team will send the best price with GST invoice.</p>
            <Link to="/enquiry"><Btn variant="white" size="lg">Request a quote</Btn></Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

function Section({ title, kicker, items }: { title: string; kicker: string; items: any[] }) {
  if (!items.length) return null;
  return (
    <Container style={{ padding: '56px 20px 0' }}>
      <SectionHead kicker={kicker} title={title} action={<Link to="/shop" style={{ color: color.blue, fontWeight: 600, fontSize: 14 }}>View all →</Link>} />
      <Row items={items} />
    </Container>
  );
}
