// Typed client for the Hostinger PHP REST API (server/api). Returns the exact
// app shapes from types.ts, so db.ts can hydrate/persist through it without any
// screen changes. Inert until VITE_API_BASE is set (see config.ts).
import { API_BASE } from './config';
import type {
  BusinessSettings, Category, Customer, Enquiry, Order, OrderLine, Payment, Product, Seller, Unit,
} from './types';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let msg = `API ${res.status}`;
    try { msg = (await res.json()).error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>);
}

const get = <T>(p: string) => req<T>(p);
const post = <T>(p: string, body: unknown) => req<T>(p, { method: 'POST', body: JSON.stringify(body) });
const put = <T>(p: string, body: unknown) => req<T>(p, { method: 'PUT', body: JSON.stringify(body) });
const del = (p: string) => req<{ ok: true }>(p, { method: 'DELETE' });

/** Everything in one round-trip — used to hydrate the store on boot. */
export interface Bootstrap {
  settings: BusinessSettings | null;
  categories: Category[];
  products: Product[];
  units: Unit[];
  customers: Customer[];
  sellers: Seller[];
  orders: Order[];
  payments: Payment[];
  enquiries: Enquiry[];
}

export const api = {
  bootstrap: () => get<Bootstrap>('bootstrap'),

  // categories
  saveCategory: (c: Category) => post<Category>('categories', c),
  deleteCategory: (id: string) => del(`categories/${id}`),

  // products
  saveProduct: (p: Partial<Product>) => post<Product>('products', p),
  deleteProduct: (id: string) => del(`products/${id}`),

  // units
  addUnit: (u: Omit<Unit, 'id'>) => post<Unit>('units', u),
  saveUnit: (u: Partial<Unit> & { id: string }) => put<Unit>(`units/${u.id}`, u),

  // customers
  saveCustomer: (c: Partial<Customer>) => post<Customer>('customers', c),

  // sellers
  saveSeller: (s: Partial<Seller>) => post<Seller>('sellers', s),
  sellerLogin: (email: string, password: string) =>
    post<{ id: string; name: string; email: string; role: 'seller' }>('auth/seller', { email, password }),

  // enquiries
  saveEnquiry: (e: Partial<Enquiry>) => post<Enquiry>('enquiries', e),
  setEnquiryStatus: (id: string, status: Enquiry['status']) => put<Enquiry>(`enquiries/${id}`, { status }),
  deleteEnquiry: (id: string) => del(`enquiries/${id}`),

  // orders & payments (server computes totals, marks units sold, records payment)
  createOrder: (input: {
    customerId: string; lines: OrderLine[]; discountTotal: number;
    paidNow: number; method: Order['method']; soldBy?: string;
  }) => post<Order>('orders', input),
  collect: (customerId: string, amount: number, method: Payment['method']) =>
    post<{ ok: true; applied: number }>('payments/collect', { customerId, amount, method }),

  // settings
  saveSettings: (s: BusinessSettings) => put<{ ok: true }>('settings', s),
};
