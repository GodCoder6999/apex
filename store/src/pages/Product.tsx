import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { color, radius, shadow } from '../theme';
import { Icon, Stars } from '../icons';
import { Container, Btn, Price, StockPill, Pill, SectionHead } from '../ui';
import { ProductCard } from '../components/ProductCard';
import { bySlug, related, categoryName } from '../data/catalog';
import { discountPct, rupee } from '../format';
import { useStore } from '../store';

export function Product() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { add, openDrawer } = useStore();
  const p = slug ? bySlug(slug) : undefined;
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [sticky, setSticky] = useState(false);

  useEffect(() => { setActive(0); setQty(1); }, [slug]);
  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 520);
    window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!p) return (
    <Container style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div className="display" style={{ fontSize: 26, fontWeight: 600 }}>Product not found</div>
      <Link to="/shop"><Btn style={{ marginTop: 18 }}>Browse products</Btn></Link>
    </Container>
  );

  const off = discountPct(p.price, p.mrp);
  const out = p.stock <= 0;
  const buyNow = () => { add(p.id, qty); nav('/checkout'); };

  return (
    <div>
      <Container style={{ paddingTop: 22 }}>
        <div style={{ fontSize: 13, color: color.muted, marginBottom: 18 }}>
          <Link to="/" style={{ color: color.muted }}>Home</Link> / <Link to={`/c/${p.categoryId.replace('c-', '')}`} style={{ color: color.muted }}>{categoryName(p.categoryId)}</Link> / <span style={{ color: color.body }}>{p.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }} className="pd-grid">
          {/* gallery */}
          <div style={{ position: 'sticky', top: 130 }}>
            <div style={{ position: 'relative', background: '#fff', border: `1px solid ${color.line}`, borderRadius: radius.lg, overflow: 'hidden', aspectRatio: '1/1' }}>
              <img src={p.images[active]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {off > 0 && <div style={{ position: 'absolute', top: 16, left: 16 }}><Pill bg={color.red} fg="#fff">{off}% OFF</Pill></div>}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {p.images.map((im, i) => (
                <button key={i} onClick={() => setActive(i)} style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', border: `2px solid ${i === active ? color.blue : color.line}`, padding: 0, cursor: 'pointer', background: '#fff' }}>
                  <img src={im} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* info */}
          <div>
            <div style={{ fontSize: 13.5, color: color.blue, fontWeight: 600 }}>{p.brand}</div>
            <h1 className="display" style={{ margin: '6px 0 10px', fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.15 }}>{p.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Stars value={p.rating} size={16} /><span style={{ fontSize: 13.5, color: color.body, fontWeight: 600 }}>{p.rating}</span>
              <span style={{ fontSize: 13.5, color: color.muted }}>· {p.reviews} reviews</span>
            </div>

            <Price price={p.price} mrp={p.mrp} size={30} />
            <div style={{ fontSize: 13, color: color.muted, marginTop: 4 }}>Inclusive of all taxes (GST {p.gstRate}%)</div>

            <div style={{ margin: '16px 0' }}><StockPill stock={p.stock} /></div>

            {/* highlights */}
            <div style={{ display: 'grid', gap: 9, margin: '18px 0 22px' }}>
              {p.highlights.map((h) => (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: color.greenSoft, color: color.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="check" size={14} stroke={color.green} sw={2.4} /></span>
                  {h}
                </div>
              ))}
            </div>

            {/* qty + actions */}
            {!out && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${color.line}`, borderRadius: 999, height: 50 }}>
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={qbtn}><Icon name="minus" size={16} /></button>
                  <span style={{ width: 36, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))} style={qbtn}><Icon name="plus" size={16} /></button>
                </div>
                <span style={{ fontSize: 13, color: color.muted }}>{p.stock} available</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {out ? (
                <Link to="/enquiry" style={{ flex: 1 }}><Btn full size="lg" variant="dark">Out of stock — enquire</Btn></Link>
              ) : (
                <>
                  <Btn size="lg" variant="outline" onClick={() => { add(p.id, qty); openDrawer(); }} icon={<Icon name="cart" size={18} />} style={{ flex: 1 }}>Add to cart</Btn>
                  <Btn size="lg" onClick={buyNow} style={{ flex: 1 }} icon={<Icon name="bolt" size={18} fill="#fff" />}>Buy now</Btn>
                </>
              )}
            </div>

            {/* trust chips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 22 }}>
              {[['truck', 'Delivered by our team', 'Pay on delivery'], ['shield', 'Genuine & sealed', p.warranty ?? 'Warranty included'], ['tag', 'GST invoice', 'On this order'], ['phone', 'Local support', 'Call / WhatsApp']].map(([ic, t, s]) => (
                <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', background: color.surface, borderRadius: radius.md, padding: 12 }}>
                  <Icon name={ic as any} size={20} stroke={color.blue} />
                  <div><div style={{ fontSize: 13, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 12, color: color.muted }}>{s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* specs + box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 30, marginTop: 50 }} className="pd-grid">
          <div>
            <h3 className="display" style={{ fontSize: 22, fontWeight: 600, marginBottom: 14 }}>Specifications</h3>
            <div style={{ border: `1px solid ${color.line}`, borderRadius: radius.md, overflow: 'hidden' }}>
              {p.specs.map((s, i) => (
                <div key={s.k} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12, padding: '13px 16px', background: i % 2 ? '#fff' : color.surface }}>
                  <span style={{ fontSize: 14, color: color.muted }}>{s.k}</span><span style={{ fontSize: 14, fontWeight: 500 }}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="display" style={{ fontSize: 22, fontWeight: 600, marginBottom: 14 }}>In the box</h3>
            <div style={{ background: '#fff', border: `1px solid ${color.line}`, borderRadius: radius.md, padding: 18 }}>
              {[p.name, 'User manual & warranty card', 'Original accessories', 'GST tax invoice'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', fontSize: 14 }}><Icon name="check" size={16} stroke={color.green} /> {t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* related */}
        {related(p).length > 0 && (
          <div style={{ marginTop: 56 }}>
            <SectionHead kicker="You may also like" title="Related products" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18 }}>
              {related(p).map((r) => <ProductCard key={r.id} p={r} />)}
            </div>
          </div>
        )}
      </Container>

      {/* sticky add-to-cart bar */}
      {sticky && !out && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 140, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${color.line}`, boxShadow: '0 -8px 30px -16px rgba(11,16,32,0.3)' }} className="no-mobtab">
          <Container style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px' }}>
            <img src={p.images[0]} alt="" className="desk-only" style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
              <span className="display" style={{ fontSize: 17, fontWeight: 600 }}>{rupee(p.price)}</span>
            </div>
            <Btn variant="outline" onClick={() => { add(p.id, qty); openDrawer(); }}>Add</Btn>
            <Btn onClick={buyNow}>Buy now</Btn>
          </Container>
        </div>
      )}
    </div>
  );
}
const qbtn: React.CSSProperties = { width: 46, height: 46, borderRadius: 999, background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
