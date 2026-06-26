import type { CSSProperties } from 'react';
import { catMetaForProduct } from '../data/catmeta';
import type { Product } from '../data/types';

// Product visual tile. Matches the design's gradient + line-icon look; when the
// product has a real photo (owner upload), the photo is shown on top instead.
export function Tile({ p, radius = 0, iconSize = 92, gloss = true, style }: {
  p: Product; radius?: number; iconSize?: number; gloss?: boolean; style?: CSSProperties;
}) {
  const m = catMetaForProduct(p);
  const img = p.images?.[0];
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: radius, overflow: 'hidden',
      background: m.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      {img ? (
        <img src={img} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <>
          {gloss && <div style={{ position: 'absolute', inset: 0, opacity: 0.5, background: 'radial-gradient(120% 90% at 78% 12%,rgba(255,255,255,0.85),rgba(255,255,255,0) 55%)' }} />}
          <svg width={iconSize} height={iconSize} fill="none" stroke={m.accent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 8px 16px rgba(11,16,32,0.12))', position: 'relative' }}>
            <path d={m.icon} />
          </svg>
        </>
      )}
    </div>
  );
}

// Small fixed-size tile (cart rows, summaries) — icon-only.
export function MiniTile({ p, size, radius = 12, iconSize }: { p: Product; size: number; radius?: number; iconSize?: number }) {
  return <div style={{ width: size, height: size, flex: 'none' }}><Tile p={p} radius={radius} iconSize={iconSize ?? Math.round(size * 0.52)} gloss={false} /></div>;
}
