// SVG icons for RN (react-native-svg). Path data ported from the Apex design.
import Svg, { Path, Circle, Rect } from 'react-native-svg';

type El = { t: 'p'; d: string } | { t: 'c'; cx: number; cy: number; r: number } | { t: 'r'; x: number; y: number; w: number; h: number; rx?: number };
const P = (d: string): El => ({ t: 'p', d });
const C = (cx: number, cy: number, r: number): El => ({ t: 'c', cx, cy, r });
const R = (x: number, y: number, w: number, h: number, rx = 1.6): El => ({ t: 'r', x, y, w, h, rx });

export const ICONS: Record<string, El[]> = {
  grid: [R(3, 3, 7, 7), R(14, 3, 7, 7), R(14, 14, 7, 7), R(3, 14, 7, 7)],
  tag: [P('M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z'), C(7, 7, 1.2)],
  box: [P('M12 2l9 5v10l-9 5-9-5V7z'), P('M3 7l9 5 9-5'), P('M12 12v10')],
  layers: [P('M12 2l9 5-9 5-9-5 9-5z'), P('M3 12l9 5 9-5'), P('M3 17l9 5 9-5')],
  plus: [P('M12 5v14M5 12h14')],
  cart: [C(9, 20, 1.3), C(19, 20, 1.3), P('M2 3h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.5a1.5 1.5 0 0 0 1.5-1.2L22 7H6')],
  doc: [P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'), P('M14 2v6h6'), P('M9 13h6M9 17h4')],
  users: [P('M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'), C(9.5, 7, 3.5), P('M22 21v-2a4 4 0 0 0-3-3.87'), P('M16 3.5a4 4 0 0 1 0 7')],
  clock: [C(12, 12, 9), P('M12 7v5l3 2')],
  trend: [P('M23 6l-9.5 9.5-5-5L1 18'), P('M17 6h6v6')],
  chart: [P('M3 21h18'), P('M7 21V11M12 21V4M17 21v-7')],
  badge: [C(12, 8, 6), P('M8.2 13.9L7 23l5-3 5 3-1.2-9.1')],
  gear: [P('M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6')],
  search: [C(11, 11, 7), P('M21 21l-4.3-4.3')],
  scan: [P('M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2'), P('M7 8v8M11 8v8M15 8v8')],
  bell: [P('M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9'), P('M13.7 21a2 2 0 0 1-3.4 0')],
  check: [P('M20 6L9 17l-5-5')],
  x: [P('M18 6L6 18M6 6l12 12')],
  cdown: [P('M6 9l6 6 6-6')],
  cright: [P('M9 6l6 6-6 6')],
  cleft: [P('M15 18l-6-6 6-6')],
  mail: [R(2, 4, 20, 16, 2), P('M22 6l-10 7L2 6')],
  download: [P('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'), P('M7 10l5 5 5-5M12 15V3')],
  print: [P('M6 9V2h12v7'), P('M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'), R(6, 14, 12, 8, 1)],
  trash: [P('M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6')],
  edit: [P('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'), P('M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z')],
  wa: [P('M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z')],
  wallet: [P('M21 12V7H5a2 2 0 0 1 0-4h14v4'), P('M3 5v14a2 2 0 0 0 2 2h16v-5'), P('M18 12a2 2 0 0 0 0 4h4v-4z')],
  bolt: [P('M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12z')],
  arrowup: [P('M12 19V5M6 11l6-6 6 6')],
  arrowdn: [P('M12 5v14M18 13l-6 6-6-6')],
  save: [P('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'), P('M17 21v-8H7v8M7 3v5h8')],
  cloud: [P('M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z')],
  help: [C(12, 12, 9), P('M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4'), P('M12 17h.01')],
  image: [R(3, 3, 18, 18, 2), C(8.5, 8.5, 1.5), P('M21 15l-5-5L5 21')],
  more: [C(5, 12, 1), C(12, 12, 1), C(19, 12, 1)],
  dots: [C(12, 5, 1), C(12, 12, 1), C(12, 19, 1)],
  logout: [P('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'), P('M16 17l5-5-5-5M21 12H9')],
};

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, color = '#0F172A', stroke = 1.8, fill }: {
  name: IconName; size?: number; color?: string; stroke?: number; fill?: string;
}) {
  const els = ICONS[name] ?? [];
  const useFill = fill ?? 'none';
  const strokeColor = fill && fill !== 'none' ? 'none' : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={useFill} stroke={strokeColor}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {els.map((e, i) => {
        if (e.t === 'p') return <Path key={i} d={e.d} />;
        if (e.t === 'c') return <Circle key={i} cx={e.cx} cy={e.cy} r={e.r} />;
        return <Rect key={i} x={e.x} y={e.y} width={e.w} height={e.h} rx={e.rx} />;
      })}
    </Svg>
  );
}
