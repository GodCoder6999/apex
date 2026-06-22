// Thin API client for the shared Hostinger backend. Inert until VITE_API_BASE
// is set. When live, a placed order is pushed as an ENQUIRY so it shows up in
// the owner + seller apps' Enquiries section (per client requirement).
import type { Order } from './types';

export const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');
export const USE_API = API_BASE.length > 0;

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

/** (Later) read the live catalog so the shop shows the owner's real stock. */
export async function fetchCatalog(): Promise<any[] | null> {
  if (!USE_API) return null;
  try { const r = await fetch(`${API_BASE}/api/products`); return r.ok ? r.json() : null; } catch { return null; }
}
