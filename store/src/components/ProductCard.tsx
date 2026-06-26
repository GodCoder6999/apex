import { useNavigate } from 'react-router-dom';
import { rupee, discountPct } from '../format';
import { Tile } from './Tile';
import { badgeFor } from '../data/catmeta';
import { useStore } from '../store';
import type { Product } from '../data/types';

export function ProductCard({ p }: { p: Product }) {
  const nav = useNavigate();
  const { add, toggleWish, wish } = useStore();
  const off = discountPct(p.price, p.mrp);
  const out = p.stock <= 0; const low = p.stock > 0 && p.stock <= 3;
  const badge = badgeFor(p);
  const wished = !!wish[p.id];

  const open = () => nav(`/p/${p.slug}`);
  const onWish = (e: React.MouseEvent) => { e.stopPropagation(); toggleWish(p.id); };
  const onAdd = (e: React.MouseEvent) => { e.stopPropagation(); if (out) nav(`/enquiry?product=${encodeURIComponent(p.name)}`); else add(p.id, 1, e); };

  const stockStyle: React.CSSProperties = out
    ? { background: '#F1F2F5', color: '#8A93A6' }
    : low ? { background: '#FFF6E6', color: '#B45309' } : { background: '#E7F8F0', color: '#0E9F6E' };

  return (
    <div onClick={open} className="sd-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', background: '#fff',
      border: '1px solid rgba(11,16,32,0.08)', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', height: '100%',
      boxShadow: '0 1px 2px rgba(11,16,32,0.04)' }}>
      <div style={{ position: 'relative', aspectRatio: '1.15 / 1' }}>
        <Tile p={p} />
        <span style={{ position: 'absolute', top: 12, left: 13, fontFamily: "'Clash Display',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.02em', color: 'rgba(11,16,32,0.55)' }}>{p.brand}</span>
        {badge && (
          <span style={{ position: 'absolute', top: 12, right: 54, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '5px 9px', borderRadius: 999, background: badge.bg, color: badge.fg }}>{badge.text}</span>
        )}
        <button onClick={onWish} aria-label="Wishlist" style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 11, border: 0,
          background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: wished ? '#E8112D' : '#0B1020', cursor: 'pointer' }}>
          <svg width="17" height="17" fill={wished ? '#E8112D' : 'none'} stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
        </button>
        <span style={{ position: 'absolute', bottom: 12, left: 13, display: 'inline-flex', alignItems: 'center', fontSize: 10.5, fontWeight: 700, padding: '5px 10px', borderRadius: 999, ...stockStyle }}>
          {out ? 'Out of stock' : low ? `Only ${p.stock} left` : 'In stock'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '15px 15px 16px', flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: '#0B1020', lineHeight: 1.32, letterSpacing: '-0.01em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 38 }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="#F5A623" stroke="none" viewBox="0 0 24 24"><path d="M12 2l3 6.5 7 .9-5.2 4.8L18.2 22 12 18.3 5.8 22 7.2 14.2 2 9.4l7-.9z" /></svg>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0B1020' }}>{p.rating.toFixed(1)}</span>
          <span style={{ fontSize: 12, color: '#8A93A6' }}>({p.reviews})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0B1020', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{rupee(p.price)}</span>
          {!!p.mrp && p.mrp > p.price && <>
            <span style={{ fontSize: 12.5, color: '#8A93A6', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>{rupee(p.mrp)}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#E8112D' }}>{off}% off</span>
          </>}
        </div>
        <button onClick={onAdd} style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 42, borderRadius: 12, border: 0,
          background: out ? '#FFE8EE' : '#1A4DF0', color: out ? '#E8112D' : '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={out ? 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' : 'M6 6h15l-1.5 9h-12zM6 6 5 3H2'} /></svg>
          {out ? 'Enquire' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}
