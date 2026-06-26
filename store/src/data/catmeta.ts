// Category visual metadata lifted verbatim from the "S&D Solution Store" design:
// each category renders as a soft gradient tile with a single line-icon. Used by
// product cards, the gallery, cart rows and category tiles so the storefront
// looks identical to the design even before real photos exist.
import { categories } from './catalog';
import type { Product } from './types';

export interface CatMeta { grad: string; accent: string; icon: string; }

// keyed by category slug (falls back by name keyword, then a sane default)
const BY_SLUG: Record<string, CatMeta> = {
  laptops: { icon: 'M3 6.5a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5V15H3zM1 18.5 2.5 15h19l1.5 3.5a1 1 0 0 1-.9 1.5H1.9a1 1 0 0 1-.9-1.5z', grad: 'linear-gradient(155deg,#EAF0FF,#DCE6FF 55%,#CBDCFF)', accent: '#1A4DF0' },
  desktops: { icon: 'M6 3h7v18H6zM9 6.5h1M9 9.5h1M16 8l4 1.2v6l-4 1.2', grad: 'linear-gradient(155deg,#F3ECFF,#E7DBFF 60%,#DAC8FF)', accent: '#7C3AED' },
  pcs: { icon: 'M6 3h7v18H6zM9 6.5h1M9 9.5h1M16 8l4 1.2v6l-4 1.2', grad: 'linear-gradient(155deg,#F3ECFF,#E7DBFF 60%,#DAC8FF)', accent: '#7C3AED' },
  cctv: { icon: 'M3 8.2 17.5 5l1 4.4L4 12.6zM4.8 12.4 6.4 18M14 8.6l5 1.3v3.6l-5 1.2M11.5 18.6a3 3 0 0 1-6.2-.6', grad: 'linear-gradient(155deg,#E4F4FF,#D2ECFF 60%,#BFE2FF)', accent: '#0EA5E9' },
  components: { icon: 'M7 7h10v10H7zM10.5 4v3M13.5 4v3M10.5 17v3M13.5 17v3M4 10.5h3M4 13.5h3M17 10.5h3M17 13.5h3', grad: 'linear-gradient(155deg,#FFF3DF,#FFE7C2 60%,#FFD79E)', accent: '#D97706' },
  storage: { icon: 'M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4H4zM4 11v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6M7.5 9h.01M8 14.5h8', grad: 'linear-gradient(155deg,#DCF7EE,#C6F0E2 60%,#AEE7D2)', accent: '#0E9F6E' },
  networking: { icon: 'M4 14h16v4H4zM7 16h.01M11 16h.01M12 14V9M8.5 9a5 5 0 0 1 7 0M6 7a8 8 0 0 1 12 0', grad: 'linear-gradient(155deg,#E5F1FF,#D4E8FF 60%,#C0DBFF)', accent: '#2563EB' },
  accessories: { icon: 'M12 3a5 5 0 0 1 5 5v8a5 5 0 0 1-10 0V8a5 5 0 0 1 5-5zM12 7v4', grad: 'linear-gradient(155deg,#FFE8EE,#FFD6E0 60%,#FFC2D2)', accent: '#E8112D' },
};

const DEFAULT: CatMeta = BY_SLUG.components;

export function catMetaBySlug(slug?: string): CatMeta {
  if (!slug) return DEFAULT;
  if (BY_SLUG[slug]) return BY_SLUG[slug];
  const s = slug.toLowerCase();
  if (s.includes('lap')) return BY_SLUG.laptops;
  if (s.includes('desk') || s.includes('pc')) return BY_SLUG.desktops;
  if (s.includes('cctv') || s.includes('secur') || s.includes('camera')) return BY_SLUG.cctv;
  if (s.includes('stor')) return BY_SLUG.storage;
  if (s.includes('net') || s.includes('wifi') || s.includes('router')) return BY_SLUG.networking;
  if (s.includes('acc')) return BY_SLUG.accessories;
  return DEFAULT;
}

export function catMetaForProduct(p: Product): CatMeta {
  const cat = categories.find((c) => c.id === p.categoryId);
  return catMetaBySlug(cat?.slug);
}

// Badge resolved from owner-curated flags (best seller > new > deal).
export function badgeFor(p: Product): { text: string; bg: string; fg: string } | null {
  if (p.bestSeller) return { text: 'Best seller', bg: '#0B1020', fg: '#fff' };
  if (p.newArrival) return { text: 'New', bg: '#1A4DF0', fg: '#fff' };
  if (p.deal) return { text: 'Deal', bg: '#E8112D', fg: '#fff' };
  return null;
}
