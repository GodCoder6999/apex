// Thin API client for the shared backend. Inert until VITE_API_BASE is set.
// When live: hydrates the shop catalog from the owner's real products/stock, and
// pushes placed orders as ENQUIRIES (owner + seller see them).
import type { Order, Product, Category } from './types';
import { hydrate } from './catalog';

// Accept a bare host (Render fromService) or a full URL; always end up with https://host (no trailing slash).
const _raw = (import.meta.env.VITE_API_BASE ?? '').trim().replace(/\/$/, '');
export const API_BASE = _raw && !/^https?:\/\//.test(_raw) ? `https://${_raw}` : _raw;
export const USE_API = API_BASE.length > 0;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Load the live catalog before the app renders (no-op on mock). */
export async function hydrateFromApi(): Promise<void> {
  if (!USE_API) return;
  try {
    // Free-tier API can cold-start (~50s). Allow time but never hang forever.
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 60000);
    const r = await fetch(`${API_BASE}/api/bootstrap`, { signal: ctl.signal });
    clearTimeout(t);
    if (!r.ok) return;
    const b = await r.json();
    const stock = new Map<string, number>();
    for (const u of (b.units || [])) if (u.status === 'in_storage') stock.set(u.productId, (stock.get(u.productId) || 0) + 1);

    const cats: Category[] = (b.categories || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug || slugify(c.name), icon: c.icon || 'chip' }));
    const active = (b.products || []).filter((p: any) => p.active !== false);
    const products: Product[] = active.map((p: any, i: number): Product => {
      const images = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []);
      const specs = Array.isArray(p.specs) ? p.specs
        : (typeof p.specs === 'string' && p.specs ? p.specs.split('·').map((x: string) => ({ k: 'Spec', v: x.trim() })) : []);
      const highlights = Array.isArray(p.highlights) && p.highlights.length ? p.highlights
        : (typeof p.specs === 'string' ? p.specs.split('·').map((x: string) => x.trim()).filter(Boolean) : []);
      const rating = Number(p.rating) || 4.6;
      // The owner catalog has no merchandising flags, so the storefront home
      // sections would be empty. Derive sensible defaults when absent so Home
      // populates: spread featured/best-seller/new-arrival across the catalog.
      const featured = p.featured ?? (i % 3 === 0);
      const bestSeller = p.bestSeller ?? (rating >= 4.6);
      const newArrival = p.newArrival ?? (i >= active.length - 4);
      return {
        id: p.id, slug: p.slug || slugify(p.name), name: p.name, brand: p.brand || '', categoryId: p.categoryId,
        price: Number(p.price) || 0, mrp: p.mrp ? Number(p.mrp) : undefined, gstRate: Number(p.gstRate) || 18,
        rating, reviews: Number(p.reviews) || 0, stock: stock.get(p.id) || 0,
        images, highlights, specs, warranty: p.warranty, featured, bestSeller,
        newArrival, deal: p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : undefined,
      };
    });
    hydrate(products, cats);
  } catch (e) { console.warn('[api] catalog hydrate failed', e); }
}

/** Push a B2B / bulk quote request to the shop as an enquiry. */
export async function pushQuoteEnquiry(q: { name: string; phone: string; email?: string; product?: string; qty?: string; note?: string }): Promise<void> {
  if (!USE_API) return;
  const note = `BULK / B2B QUOTE\nProduct: ${q.product || '—'} · Qty: ${q.qty || '—'}` + (q.email ? `\nEmail: ${q.email}` : '') + (q.note ? `\n${q.note}` : '');
  const items = q.product ? [{ name: q.product, qty: Number(q.qty) || 1 }] : [];
  try {
    await fetch(`${API_BASE}/api/enquiries`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: q.name, phone: q.phone, items, note, status: 'open' }),
    });
  } catch (e) { console.warn('[api] quote enquiry failed', e); }
}

/** Push a customer order to the shop as an enquiry (owner/seller see it). */
export async function pushOrderAsEnquiry(order: Order): Promise<void> {
  if (!USE_API) return;
  const items = order.lines.map((l) => ({ productId: l.productId, name: l.name, price: l.price, qty: l.qty }));
  const a = order.address;
  const note = `ONLINE ORDER ${order.orderNo} · Total ₹${order.total} (pay on delivery)\n` +
    `${a.name} · ${a.phone}\n${a.line}, ${a.city}, ${a.state} - ${a.pincode}` + (a.gstin ? `\nGSTIN ${a.gstin}` : '');
  try {
    await fetch(`${API_BASE}/api/enquiries`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: a.name, phone: a.phone, items, note, status: 'open' }),
    });
  } catch (e) { console.warn('[api] order→enquiry failed', e); }
}
