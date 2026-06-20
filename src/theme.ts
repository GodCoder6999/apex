// Design tokens lifted from the Apex Owner Desktop mockup. Single source of
// truth so screens stay consistent and re-theming is one edit.
export const color = {
  // surfaces
  surface: '#F6F7F9',
  card: '#FFFFFF',
  cardAlt: '#FAFBFC',
  inputBg: '#F1F3F6',
  // ink
  ink: '#0F172A',
  body: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  // accent (emerald)
  accent: '#10B981',
  accentDeep: '#059669',
  accentDeeper: '#047857',
  accentSoft: '#ECFDF5',
  // semantic
  green: '#16A34A',
  red: '#E11D48',
  amber: '#F59E0B',
  violet: '#7C3AED',
  // sidebar (deep slate)
  navBg: '#0B1220',
  navLabel: '#3E4C63',
  navText: '#E2E8F0',
  // borders
  border: 'rgba(15,23,42,0.07)',
  borderStrong: 'rgba(15,23,42,0.10)',
  hairline: 'rgba(15,23,42,0.05)',
} as const;

export const radius = { sm: 8, md: 10, lg: 11, xl: 14, xxl: 16 } as const;

export const shadow = {
  card: '0 1px 2px rgba(15,23,42,0.04)',
  pop: '0 18px 50px rgba(15,23,42,0.16)',
  lift: '0 10px 28px rgba(15,23,42,0.08)',
} as const;

export const mono = "'Geist Mono', monospace";

// Status badge palettes (bg / text) keyed by domain status.
export const badge = {
  in_storage: { bg: '#ECFDF5', fg: '#047857', label: 'In storage' },
  with_seller: { bg: '#EFF6FF', fg: '#1D4ED8', label: 'With seller' },
  sold: { bg: '#F1F5F9', fg: '#475569', label: 'Sold' },
  returned: { bg: '#FEF3C7', fg: '#B45309', label: 'Returned' },
  paid: { bg: '#ECFDF5', fg: '#047857', label: 'Paid' },
  partial: { bg: '#FEF3C7', fg: '#B45309', label: 'Partial' },
  due: { bg: '#FFE4E6', fg: '#BE123C', label: 'Due' },
  in_stock: { bg: '#ECFDF5', fg: '#047857', label: 'In stock' },
  low: { bg: '#FEF3C7', fg: '#B45309', label: 'Low' },
  out: { bg: '#FFE4E6', fg: '#BE123C', label: 'Out' },
} as const;
