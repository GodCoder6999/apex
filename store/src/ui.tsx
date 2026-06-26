import type { CSSProperties, ReactNode } from 'react';
import { color, font, radius, shadow } from './theme';
import { rupee, discountPct } from './format';

export function Container({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return <div className={className} style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)', ...style }}>{children}</div>;
}

type BtnVariant = 'blue' | 'dark' | 'outline' | 'ghost' | 'white';
export function Btn({ children, onClick, variant = 'blue', size = 'md', full, style, type = 'button', icon }: {
  children: ReactNode; onClick?: () => void; variant?: BtnVariant; size?: 'sm' | 'md' | 'lg';
  full?: boolean; style?: CSSProperties; type?: 'button' | 'submit'; icon?: ReactNode;
}) {
  const sizes = { sm: { h: 38, px: 14, fs: 13.5 }, md: { h: 46, px: 20, fs: 15 }, lg: { h: 54, px: 26, fs: 16 } }[size];
  const variants: Record<BtnVariant, CSSProperties> = {
    blue: { background: color.blue, color: '#fff', boxShadow: shadow.blue },
    dark: { background: color.ink, color: '#fff' },
    outline: { background: '#fff', color: color.ink, border: `1.5px solid ${color.line}` },
    ghost: { background: 'transparent', color: color.ink },
    white: { background: '#fff', color: color.blue, boxShadow: shadow.card },
  };
  return (
    <button type={type} onClick={onClick} className={variant === 'blue' || variant === 'dark' ? 'btnBlue' : undefined}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, height: sizes.h,
        padding: `0 ${sizes.px}px`, borderRadius: radius.pill, border: 0, fontWeight: 600, fontSize: sizes.fs,
        fontFamily: font.body, cursor: 'pointer', width: full ? '100%' : undefined, letterSpacing: '-0.01em', ...variants[variant], ...style }}>
      {icon}{children}
    </button>
  );
}

export function Pill({ children, bg, fg, style }: { children: ReactNode; bg: string; fg: string; style?: CSSProperties }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: bg, color: fg,
    fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: radius.pill, ...style }}>{children}</span>;
}

export function StockPill({ stock }: { stock: number }) {
  if (stock <= 0) return <Pill bg={color.lineSoft} fg={color.muted}>Out of stock</Pill>;
  if (stock <= 3) return <Pill bg={color.amberSoft} fg="#B45309"><Dot c={color.amber} />Only {stock} left</Pill>;
  return <Pill bg={color.greenSoft} fg={color.green}><Dot c={color.green} />In stock</Pill>;
}
function Dot({ c }: { c: string }) { return <span style={{ width: 6, height: 6, borderRadius: 99, background: c }} />; }

export function Price({ price, mrp, size = 20 }: { price: number; mrp?: number; size?: number }) {
  const off = discountPct(price, mrp);
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
      <span className="display" style={{ fontSize: size, fontWeight: 600, color: color.ink, letterSpacing: '-0.02em' }}>{rupee(price)}</span>
      {!!mrp && mrp > price && <span style={{ fontSize: size * 0.62, color: color.muted, textDecoration: 'line-through' }}>{rupee(mrp)}</span>}
      {off > 0 && <span style={{ fontSize: size * 0.6, color: color.green, fontWeight: 600 }}>{off}% off</span>}
    </div>
  );
}

export function SectionHead({ kicker, title, action }: { kicker?: string; title: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
      <div>
        {kicker && <div style={{ color: color.blue, fontWeight: 600, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{kicker}</div>}
        <h2 className="display" style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', color: color.ink }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

// Product image with graceful skeleton + fallback.
export function ProductImg({ src, alt, style }: { src?: string; alt: string; style?: CSSProperties }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: color.lineSoft, ...style }}>
      {src
        ? <img className="imgZoom" src={src} alt={alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div className="skeleton" style={{ width: '100%', height: '100%' }} />}
    </div>
  );
}
