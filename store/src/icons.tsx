import type { CSSProperties } from 'react';

const P: Record<string, string[]> = {
  search: ['M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M21 21l-4.3-4.3'],
  cart: ['M2 3h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.5a1.5 1.5 0 0 0 1.5-1.2L22 7H6'],
  user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0'],
  heart: ['M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z'],
  menu: ['M3 6h18M3 12h18M3 18h18'],
  x: ['M18 6L6 18M6 6l12 12'],
  cright: ['M9 6l6 6-6 6'], cleft: ['M15 6l-6 6 6 6'], cdown: ['M6 9l6 6 6-6'], cup: ['M6 15l6-6 6 6'],
  arrowR: ['M5 12h14M13 6l6 6-6 6'],
  check: ['M20 6L9 17l-5-5'],
  plus: ['M12 5v14M5 12h14'], minus: ['M5 12h14'],
  trash: ['M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'],
  truck: ['M1 3h15v13H1zM16 8h4l3 3v5h-7', 'M5.5 18.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0', 'M18.5 18.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0'],
  shield: ['M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z', 'M9 12l2 2 4-4'],
  bolt: ['M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12z'],
  tag: ['M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z', 'M7 7h.01'],
  filter: ['M4 6h16M7 12h10M10 18h4'],
  phone: ['M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z'],
  mail: ['M2 4h20v16H2zM22 6l-10 7L2 6'],
  mapPin: ['M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z', 'M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'],
  wa: ['M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z'],
  laptop: ['M4 5h16v11H4zM2 20h20', 'M9 20h6'],
  desktop: ['M3 4h18v12H3zM8 20h8M12 16v4'],
  cctv: ['M3 7l15-4 1 4-15 4z', 'M3 7v6h6', 'M9 13l2 5', 'M14 6l2 1'],
  chip: ['M6 6h12v12H6zM9 9h6v6H9', 'M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2'],
  wifi: ['M5 12.5a10 10 0 0 1 14 0', 'M8.5 16a5 5 0 0 1 7 0', 'M12 19.5h.01'],
  keyboard: ['M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10'],
  grid: ['M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z'],
  spark: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'],
  clock: ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 7v5l3 2'],
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 20, stroke = 'currentColor', sw = 1.8, fill = 'none', style }: {
  name: IconName; size?: number; stroke?: string; sw?: number; fill?: string; style?: CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {P[name].map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

// Solid star rating row
export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fillPct = Math.max(0, Math.min(1, value - i)) * 100;
        return (
          <span key={i} style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
            <Star size={size} color="#E6E8EE" />
            <span style={{ position: 'absolute', inset: 0, width: `${fillPct}%`, overflow: 'hidden' }}>
              <Star size={size} color="#F5A623" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
function Star({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z" />
    </svg>
  );
}

export const catIcon: Record<string, IconName> = {
  laptop: 'laptop', desktop: 'desktop', cctv: 'cctv', chip: 'chip', wifi: 'wifi', keyboard: 'keyboard',
};
