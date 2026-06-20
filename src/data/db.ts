// Mock data layer. Mirrors the milk app's db.ts shape: a single store with
// client-side aggregation + live subscriptions via React hooks. Backed by an
// in-memory dataset persisted to localStorage. Swap this file for Firestore
// later without touching screens.
import { useEffect, useState } from 'react';
import type {
  BusinessSettings, Category, Customer, Enquiry, Order, OrderLine, Payment, Product, Seller, Unit,
} from './types';
import * as seed from './seed';
import { USE_API } from './config';
import { api } from './api';

/** Run an API write only when the live backend is enabled; never throw. */
function sync(fn: () => Promise<unknown>) {
  if (!USE_API) return;
  fn().catch((e) => console.warn('[api sync]', e));
}

interface DB {
  settings: BusinessSettings;
  categories: Category[];
  products: Product[];
  units: Unit[];
  customers: Customer[];
  sellers: Seller[];
  orders: Order[];
  payments: Payment[];
  enquiries: Enquiry[];
}

export const DB_KEY = 'apex-db-v2';
const KEY = DB_KEY;

function fresh(): DB {
  return {
    settings: seed.settings,
    categories: seed.categories,
    products: seed.products,
    units: seed.units,
    customers: seed.customers,
    sellers: seed.sellers,
    orders: seed.orders,
    payments: seed.payments,
    enquiries: seed.enquiries,
  };
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw) } as DB; // merge so new keys get defaults
  } catch { /* ignore */ }
  return fresh();
}

let state: DB = load();
const subs = new Set<() => void>();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}
function emit() {
  persist();
  subs.forEach((fn) => fn());
}
export function resetDB() {
  localStorage.removeItem(KEY);
  state = load();
  emit();
}

/** Hydrate the store from the live API when VITE_API_BASE is set. Called once
 *  at boot from main.tsx. No-op (keeps mock data) when USE_API is false. */
export async function initStore() {
  if (!USE_API) return;
  try {
    const b = await api.bootstrap();
    state = {
      settings: b.settings ?? state.settings,
      categories: b.categories ?? [],
      products: b.products ?? [],
      units: b.units ?? [],
      customers: b.customers ?? [],
      sellers: b.sellers ?? [],
      orders: b.orders ?? [],
      payments: b.payments ?? [],
      enquiries: b.enquiries ?? [],
    };
    emit();
  } catch (e) {
    console.warn('[api bootstrap] falling back to local data:', e);
  }
}

/** Subscribe a selector to store changes; re-runs on every mutation. */
function useSelector<T>(selector: (db: DB) => T): T {
  const [value, setValue] = useState(() => selector(state));
  useEffect(() => {
    const fn = () => setValue(() => selector(state));
    subs.add(fn);
    fn();
    return () => { subs.delete(fn); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// ---------- live reads ----------
export const useSettings = () => useSelector((d) => d.settings);
export const useCategories = () => useSelector((d) => d.categories);
export const useProducts = () => useSelector((d) => d.products);
export const useUnits = () => useSelector((d) => d.units);
export const useCustomers = () => useSelector((d) => d.customers);
export const useSellers = () => useSelector((d) => d.sellers);
export const useOrders = () => useSelector((d) => d.orders);
export const usePayments = () => useSelector((d) => d.payments);
export const useEnquiries = () => useSelector((d) => d.enquiries);

// non-hook snapshot reads (for search, billing pickers)
export const getProducts = () => state.products;
export const getUnits = () => state.units;
export const getCustomers = () => state.customers;
export const getOrders = () => state.orders;
export const getCategories = () => state.categories;

// ---------- derived helpers ----------
export function unitsByProduct(productId: string) {
  return state.units.filter((u) => u.productId === productId);
}
export function inStockCount(productId: string) {
  return state.units.filter((u) => u.productId === productId && u.status === 'in_storage').length;
}
export function categoryName(id: string) {
  return state.categories.find((c) => c.id === id)?.name ?? '—';
}
export function customerName(id: string) {
  return state.customers.find((c) => c.id === id)?.name ?? 'Walk-in';
}
export function sellerName(id: string) {
  if (id === 'owner') return 'Owner';
  return state.sellers.find((s) => s.id === id)?.name ?? '—';
}
export function customerDue(customerId: string) {
  return state.orders.filter((o) => o.customerId === customerId).reduce((s, o) => s + o.due, 0);
}

// ---------- mutations ----------
export function addCategory(name: string) {
  const cat = { id: uid('c'), name, active: true };
  state = { ...state, categories: [...state.categories, cat] };
  emit();
  sync(() => api.saveCategory(cat));
}
export function deleteCategory(id: string) {
  state = { ...state, categories: state.categories.filter((c) => c.id !== id) };
  emit();
  sync(() => api.deleteCategory(id));
}
export function saveProduct(p: Omit<Product, 'id'> & { id?: string }) {
  const saved = { ...p, id: p.id ?? uid('p') } as Product;
  if (p.id) {
    state = { ...state, products: state.products.map((x) => (x.id === p.id ? saved : x)) };
  } else {
    state = { ...state, products: [...state.products, saved] };
  }
  emit();
  sync(() => api.saveProduct(saved));
}
export function deleteProduct(id: string) {
  state = {
    ...state,
    products: state.products.filter((p) => p.id !== id),
    units: state.units.filter((u) => u.productId !== id),
  };
  emit();
  sync(() => api.deleteProduct(id));
}
export function addUnits(productId: string, serials: { serial: string; cost: number }[]) {
  const added: Unit[] = serials.map((s) => ({
    id: uid('u'), productId, serial: s.serial, costPrice: s.cost,
    status: 'in_storage', addedAt: Date.now(),
  }));
  state = { ...state, units: [...added, ...state.units] };
  emit();
  added.forEach((u) => sync(() => api.addUnit(u)));
  return added.length;
}
export function saveCustomer(c: Omit<Customer, 'id'> & { id?: string }) {
  const saved = { ...c, id: c.id ?? uid('cu') } as Customer;
  if (c.id) {
    state = { ...state, customers: state.customers.map((x) => (x.id === c.id ? saved : x)) };
  } else {
    state = { ...state, customers: [...state.customers, saved] };
  }
  emit();
  sync(() => api.saveCustomer(saved));
  return saved;
}
export function saveSeller(s: Omit<Seller, 'id'> & { id?: string }) {
  const saved = { ...s, id: s.id ?? uid('s') } as Seller;
  if (s.id) {
    state = { ...state, sellers: state.sellers.map((x) => (x.id === s.id ? saved : x)) };
  } else {
    state = { ...state, sellers: [...state.sellers, saved] };
  }
  emit();
  sync(() => api.saveSeller(saved));
}
export function saveSettings(s: BusinessSettings) {
  state = { ...state, settings: s };
  emit();
  sync(() => api.saveSettings(s));
}

/** Next sequential invoice number: PREFIX/FY/NNNN. */
export function nextInvoiceNo() {
  const fy = '26-27';
  const seq = state.orders.length + 38 + 1;
  return `${state.settings.invoicePrefix}/${fy}/${String(seq).padStart(4, '0')}`;
}

export function createOrder(input: {
  customerId: string;
  lines: OrderLine[];
  discountTotal: number;
  paidNow: number;
  method: Order['method'];
  soldBy?: string;
}) {
  const subTotal = input.lines.reduce((s, l) => s + l.price, 0);
  const lineDisc = input.lines.reduce((s, l) => s + l.discount, 0);
  const discountTotal = lineDisc + input.discountTotal;
  const taxTotal = input.lines.reduce((s, l) => s + l.taxAmt, 0);
  const grandTotal = subTotal - discountTotal + taxTotal;
  const order: Order = {
    id: uid('o'),
    invoiceNo: nextInvoiceNo(),
    customerId: input.customerId,
    lines: input.lines,
    subTotal, discountTotal, taxTotal, grandTotal,
    paidNow: input.paidNow,
    due: grandTotal - input.paidNow,
    soldBy: input.soldBy ?? 'owner',
    method: input.method,
    createdAt: Date.now(),
  };
  // mark units sold
  const soldSerials = new Set(input.lines.map((l) => l.serial));
  state = {
    ...state,
    orders: [order, ...state.orders],
    units: state.units.map((u) =>
      soldSerials.has(u.serial) ? { ...u, status: 'sold', soldOrderId: order.id } : u),
    payments: input.paidNow > 0
      ? [...state.payments, {
          id: uid('pay'), customerId: input.customerId, orderId: order.id,
          amount: input.paidNow, method: input.method, collectedBy: order.soldBy, forDue: false, at: order.createdAt,
        }]
      : state.payments,
  };
  emit();
  sync(() => api.createOrder({
    customerId: input.customerId, lines: input.lines, discountTotal: input.discountTotal,
    paidNow: input.paidNow, method: input.method, soldBy: order.soldBy,
  }));
  return order;
}

export function saveEnquiry(e: Omit<Enquiry, 'id' | 'createdAt' | 'status'> & { id?: string; status?: Enquiry['status'] }) {
  const enq: Enquiry = e.id
    ? { ...state.enquiries.find((x) => x.id === e.id)!, ...e } as Enquiry
    : { ...e, id: uid('e'), status: e.status ?? 'open', createdAt: Date.now() } as Enquiry;
  state = e.id
    ? { ...state, enquiries: state.enquiries.map((x) => x.id === e.id ? enq : x) }
    : { ...state, enquiries: [enq, ...state.enquiries] };
  emit();
  sync(() => api.saveEnquiry(enq));
}
export function setEnquiryStatus(id: string, status: Enquiry['status']) {
  state = { ...state, enquiries: state.enquiries.map((x) => x.id === id ? { ...x, status } : x) };
  emit();
  sync(() => api.setEnquiryStatus(id, status));
}
export function deleteEnquiry(id: string) {
  state = { ...state, enquiries: state.enquiries.filter((x) => x.id !== id) };
  emit();
  sync(() => api.deleteEnquiry(id));
}

export interface Notification { id: string; icon: 'bolt' | 'clock' | 'help' | 'doc'; title: string; sub: string; tint: string; path: string; }
/** Derived notifications: low stock, dues, open enquiries, recent invoices. */
export function buildNotifications(): Notification[] {
  const out: Notification[] = [];
  const low = state.products.map((p) => ({ p, c: inStockCount(p.id) })).filter((x) => x.c > 0 && x.c <= 2);
  low.slice(0, 4).forEach(({ p, c }) => out.push({
    id: 'low-' + p.id, icon: 'bolt', title: `${p.name} low on stock`, sub: `${c} unit${c > 1 ? 's' : ''} left · reorder soon`,
    tint: '#F59E0B', path: '/stock',
  }));
  const debtors = state.customers.map((c) => ({ c, due: customerDue(c.id) })).filter((x) => x.due > 0).sort((a, b) => b.due - a.due);
  debtors.slice(0, 3).forEach(({ c, due }) => out.push({
    id: 'due-' + c.id, icon: 'clock', title: `${c.name} owes ${'₹' + due.toLocaleString('en-IN')}`, sub: 'Outstanding payment',
    tint: '#E11D48', path: '/dues',
  }));
  state.enquiries.filter((e) => e.status === 'open').slice(0, 3).forEach((e) => out.push({
    id: 'enq-' + e.id, icon: 'help', title: `New enquiry · ${e.name}`, sub: e.items.map((i) => i.name).join(', ').slice(0, 48),
    tint: '#3B82F6', path: '/enquiries',
  }));
  return out;
}

export function collectPayment(customerId: string, amount: number, method: Order['method']) {
  // Apply against oldest-due orders first.
  let remaining = amount;
  const orders = state.orders.map((o) => {
    if (o.customerId !== customerId || o.due <= 0 || remaining <= 0) return o;
    const pay = Math.min(o.due, remaining);
    remaining -= pay;
    return { ...o, paidNow: o.paidNow + pay, due: o.due - pay };
  });
  state = {
    ...state,
    orders,
    payments: [...state.payments, {
      id: uid('pay'), customerId, amount, method, collectedBy: 'owner', forDue: true, at: Date.now(),
    }],
  };
  emit();
  sync(() => api.collect(customerId, amount, method));
}
