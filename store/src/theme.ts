// Storefront design tokens — distinct consumer theme (electric blue + Clash
// Display), separate from the emerald/Geist dashboard. Lifted from the
// "S&D Solution Store" design.
export const color = {
  bg: '#FBFBFD',
  surface: '#F6F7FB',
  card: '#FFFFFF',
  ink: '#0B1020',
  body: '#5B6478',
  muted: '#8A93A6',
  faint: '#A8AEBD',
  line: '#E6E8EE',
  lineSoft: '#F1F2F6',
  dark: '#27314A',

  blue: '#1A4DF0',
  blue2: '#5B7CFF',
  blueSoft: '#EAF0FF',
  blueSoft2: '#F4F6FF',

  green: '#0E9F6E',
  greenSoft: '#E7F8F0',
  red: '#E8112D',
  red2: '#FF3B4E',
  redSoft: '#FFE8EE',
  violet: '#7C3AED',
  violetSoft: '#F3ECFF',
  amber: '#F5A623',
  amberSoft: '#FFF6E6',
} as const;

export const font = {
  display: "'Clash Display', sans-serif",
  body: "'General Sans', system-ui, sans-serif",
};

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;
export const shadow = {
  sm: '0 1px 2px rgba(11,16,32,0.05)',
  card: '0 6px 24px -10px rgba(11,16,32,0.12)',
  pop: '0 24px 60px -20px rgba(11,16,32,0.28)',
  blue: '0 14px 30px -10px rgba(26,77,240,0.5)',
} as const;
