import { Link } from 'react-router-dom';
import { color, radius } from '../theme';
import { rupee, discountPct } from '../format';
import { Icon, Stars } from '../icons';
import { Pill, ProductImg } from '../ui';
import { useStore } from '../store';
import type { Product } from '../data/types';

export function ProductCard({ p }: { p: Product }) {
  const { add } = useStore();
  const off = discountPct(p.price, p.mrp);
  return (
    <Link to={`/p/${p.slug}`} className="cardHover" style={{ display: 'block', background: color.card,
      borderRadius: radius.lg, border: `1px solid ${color.line}`, overflow: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <ProductImg src={p.images[0]} alt={p.name} style={{ aspectRatio: '1 / 1' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
          {off > 0 && <Pill bg={color.red} fg="#fff">{off}% OFF</Pill>}
          {p.bestSeller && <Pill bg={color.ink} fg="#fff">Bestseller</Pill>}
          {p.newArrival && !p.bestSeller && <Pill bg={color.violetSoft} fg={color.violet}>New</Pill>}
        </div>
        {p.stock <= 3 && p.stock > 0 && (
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <Pill bg={color.amberSoft} fg="#B45309">Only {p.stock} left</Pill>
          </div>
        )}
        {/* quick add */}
        <button onClick={(e) => { e.preventDefault(); add(p.id); }} aria-label="Add to cart"
          className="btnBlue" style={{ position: 'absolute', bottom: 12, right: 12, width: 44, height: 44, borderRadius: 999,
            background: color.blue, color: '#fff', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="cart" size={19} />
        </button>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12, color: color.muted, fontWeight: 600, marginBottom: 4 }}>{p.brand}</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: color.ink, lineHeight: 1.35, minHeight: 40,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '8px 0 10px' }}>
          <Stars value={p.rating} /><span style={{ fontSize: 12, color: color.muted }}>{p.rating} ({p.reviews})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span className="display" style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>{rupee(p.price)}</span>
          {!!p.mrp && p.mrp > p.price && <span style={{ fontSize: 12.5, color: color.muted, textDecoration: 'line-through' }}>{rupee(p.mrp)}</span>}
        </div>
      </div>
    </Link>
  );
}
