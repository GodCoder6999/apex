// Mock data layer for the mobile app. Same public API as the website's db.ts,
// but persistence uses AsyncStorage (async) with a synchronous in-memory store
// seeded immediately so screens render without waiting. Mirrors the API seam:
// hydrate from / sync to the Hostinger backend when USE_API is on.
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  BusinessSettings, Category, Customer, Enquiry, Order, OrderLine, Payment, Product, Seller, Unit,
} from './types';
import * as seed from './seed';
import { USE_API } from './config';
import { api } from './api';

interface DB {
  settings: BusinessSettings; categories: Category[]; products: Product[]; units: Unit[];
  customers: Customer[]; sellers: Seller[]; orders: Order[]; payments: Payment[]; enquiries: Enquiry[];
}

const KEY = 'snd-db-v4';
function fresh(): DB {
  return {
    settings: seed.settings, categories: seed.categories, products: seed.products, units: seed.units,
    customers: seed.customers, sellers: seed.sellers, orders: seed.orders, payments: seed.payments,
    enquiries: seed.enquiries,
  };
}

let state: DB = fresh();
const subs = new Set<() => void>();

function persist() { AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {}); }
function emit() { persist(); subs.forEach((fn) => fn()); }
function sync(fn: () => Promise<unknown>) { if (USE_API) fn().catch((e) => console.warn('[api sync]', e)); }

/** Load persisted/remote data once at boot. Call from App. */
export async function initStore() {
  if (USE_API) {
    try {
      const b = await api.bootstrap();
      state = {
        settings: b.settings ?? state.settings, categories: b.categories ?? [], products: b.products ?? [],
        units: b.units ?? [], customers: b.customers ?? [], sellers: b.sellers ?? [], orders: b.orders ?? [],
        payments: b.payments ?? [], enquiries: b.enquiries ?? [],
      };
      emit();
      return;
    } catch (e) { console.warn('[api bootstrap] using local data:', e); }
  }
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) { state = { ...fresh(), ...JSON.parse(raw) }; emit(); }
  } catch { /* keep seed */ }
}
export async function resetDB() { await AsyncStorage.removeItem(KEY); state = fresh(); emit(); }

function useSelector<T>(selector: (db: DB) => T): T {
  const [value, setValue] = useState(() => selector(state));
  useEffect(() => {
    const fn = () => setValue(() => selector(state));
    subs.add(fn); fn();
    return () => { subs.delete(fn); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// reads
export const useSettings = () => useSelector((d) => d.settings);
export const useCategories = () => useSelector((d) => d.categories);
export const useProducts = () => useSelector((d) => d.products);
export const useUnits = () => useSelector((d) => d.units);
export const useCustomers = () => useSelector((d) => d.customers);
export const useSellers = () => useSelector((d) => d.sellers);
export const useOrders = () => useSelector((d) => d.orders);
export const usePayments = () => useSelector((d) => d.payments);
export const useEnquiries = () => useSelector((d) => d.enquiries);

export const getProducts = () => state.products;
export const getUnits = () => state.units;
export const getCustomers = () => state.customers;
export const getOrders = () => state.orders;
export const getCategories = () => state.categories;

// derived
export const unitsByProduct = (id: string) => state.units.filter((u) => u.productId === id);
export const inStockCount = (id: string) => state.units.filter((u) => u.productId === id && u.status === 'in_storage').length;
export const categoryName = (id: string) => state.categories.find((c) => c.id === id)?.name ?? '—';
export const customerName = (id: string) => state.customers.find((c) => c.id === id)?.name ?? 'Walk-in';
export const sellerName = (id: string) => id === 'owner' ? 'Owner' : (state.sellers.find((s) => s.id === id)?.name ?? '—');
export const customerDue = (id: string) => state.orders.filter((o) => o.customerId === id).reduce((s, o) => s + o.due, 0);

// mutations
export function addCategory(name: string) {
  const cat = { id: uid('c'), name, active: true };
  state = { ...state, categories: [...state.categories, cat] }; emit(); sync(() => api.saveCategory(cat));
}
export function deleteCategory(id: string) {
  state = { ...state, categories: state.categories.filter((c) => c.id !== id) }; emit(); sync(() => api.deleteCategory(id));
}
export function saveProduct(p: Omit<Product, 'id'> & { id?: string }) {
  const saved = { ...p, id: p.id ?? uid('p') } as Product;
  state = { ...state, products: p.id ? state.products.map((x) => x.id === p.id ? saved : x) : [...state.products, saved] };
  emit(); sync(() => api.saveProduct(saved));
}
export function deleteProduct(id: string) {
  state = { ...state, products: state.products.filter((p) => p.id !== id), units: state.units.filter((u) => u.productId !== id) };
  emit(); sync(() => api.deleteProduct(id));
}
export function addUnits(productId: string, serials: { serial: string; cost: number }[]) {
  const added: Unit[] = serials.map((s) => ({ id: uid('u'), productId, serial: s.serial, costPrice: s.cost, status: 'in_storage', addedAt: Date.now() }));
  state = { ...state, units: [...added, ...state.units] }; emit(); added.forEach((u) => sync(() => api.addUnit(u)));
  return added.length;
}
export function returnUnit(serial: string) {
  state = { ...state, units: state.units.map((u) => u.serial === serial ? { ...u, status: 'returned', heldBy: undefined } : u) };
  emit();
}
export function saveCustomer(c: Omit<Customer, 'id'> & { id?: string }) {
  const saved = { ...c, id: c.id ?? uid('cu') } as Customer;
  state = { ...state, customers: c.id ? state.customers.map((x) => x.id === c.id ? saved : x) : [...state.customers, saved] };
  emit(); sync(() => api.saveCustomer(saved)); return saved;
}
export function saveSeller(s: Omit<Seller, 'id'> & { id?: string }) {
  const saved = { ...s, id: s.id ?? uid('s') } as Seller;
  state = { ...state, sellers: s.id ? state.sellers.map((x) => x.id === s.id ? saved : x) : [...state.sellers, saved] };
  emit(); sync(() => api.saveSeller(saved));
}
export function saveSettings(s: BusinessSettings) { state = { ...state, settings: s }; emit(); sync(() => api.saveSettings(s)); }

export function saveEnquiry(e: Omit<Enquiry, 'id' | 'createdAt' | 'status'> & { id?: string; status?: Enquiry['status'] }) {
  const enq: Enquiry = e.id ? { ...state.enquiries.find((x) => x.id === e.id)!, ...e } as Enquiry
    : { ...e, id: uid('e'), status: e.status ?? 'open', createdAt: Date.now() } as Enquiry;
  state = e.id ? { ...state, enquiries: state.enquiries.map((x) => x.id === e.id ? enq : x) } : { ...state, enquiries: [enq, ...state.enquiries] };
  emit(); sync(() => api.saveEnquiry(enq));
}
export function setEnquiryStatus(id: string, status: Enquiry['status']) {
  state = { ...state, enquiries: state.enquiries.map((x) => x.id === id ? { ...x, status } : x) }; emit(); sync(() => api.setEnquiryStatus(id, status));
}
export function deleteEnquiry(id: string) {
  state = { ...state, enquiries: state.enquiries.filter((x) => x.id !== id) }; emit(); sync(() => api.deleteEnquiry(id));
}

export function nextInvoiceNo() {
  const seq = state.orders.length + 38 + 1;
  return `${state.settings.invoicePrefix}/26-27/${String(seq).padStart(4, '0')}`;
}
export function createOrder(input: {
  customerId: string; lines: OrderLine[]; discountTotal: number; paidNow: number; method: Order['method']; soldBy?: string;
}) {
  const subTotal = input.lines.reduce((s, l) => s + l.price, 0);
  const lineDisc = input.lines.reduce((s, l) => s + l.discount, 0);
  const discountTotal = lineDisc + input.discountTotal;
  const taxTotal = input.lines.reduce((s, l) => s + l.taxAmt, 0);
  const grandTotal = subTotal - discountTotal + taxTotal;
  const order: Order = {
    id: uid('o'), invoiceNo: nextInvoiceNo(), customerId: input.customerId, lines: input.lines,
    subTotal, discountTotal, taxTotal, grandTotal, paidNow: input.paidNow, due: grandTotal - input.paidNow,
    soldBy: input.soldBy ?? 'owner', method: input.method, createdAt: Date.now(),
  };
  const soldSerials = new Set(input.lines.map((l) => l.serial));
  state = {
    ...state, orders: [order, ...state.orders],
    units: state.units.map((u) => soldSerials.has(u.serial) ? { ...u, status: 'sold', soldOrderId: order.id } : u),
    payments: input.paidNow > 0 ? [...state.payments, { id: uid('pay'), customerId: input.customerId, orderId: order.id, amount: input.paidNow, method: input.method, collectedBy: order.soldBy, forDue: false, at: order.createdAt }] : state.payments,
  };
  emit();
  sync(() => api.createOrder({ customerId: input.customerId, lines: input.lines, discountTotal: input.discountTotal, paidNow: input.paidNow, method: input.method, soldBy: order.soldBy }));
  return order;
}
export function collectPayment(customerId: string, amount: number, method: Order['method']) {
  let remaining = amount;
  const orders = state.orders.map((o) => {
    if (o.customerId !== customerId || o.due <= 0 || remaining <= 0) return o;
    const pay = Math.min(o.due, remaining); remaining -= pay;
    return { ...o, paidNow: o.paidNow + pay, due: o.due - pay };
  });
  state = { ...state, orders, payments: [...state.payments, { id: uid('pay'), customerId, amount, method, collectedBy: 'owner', forDue: true, at: Date.now() }] };
  emit(); sync(() => api.collect(customerId, amount, method));
}

export interface Notification { id: string; icon: 'bolt' | 'clock' | 'help' | 'doc'; title: string; sub: string; tint: string; route: string; }
export function buildNotifications(): Notification[] {
  const out: Notification[] = [];
  state.products.map((p) => ({ p, c: inStockCount(p.id) })).filter((x) => x.c > 0 && x.c <= 2).slice(0, 4)
    .forEach(({ p, c }) => out.push({ id: 'low-' + p.id, icon: 'bolt', title: `${p.name} low on stock`, sub: `${c} unit${c > 1 ? 's' : ''} left`, tint: '#F59E0B', route: 'Stock' }));
  state.customers.map((c) => ({ c, due: customerDue(c.id) })).filter((x) => x.due > 0).sort((a, b) => b.due - a.due).slice(0, 3)
    .forEach(({ c, due }) => out.push({ id: 'due-' + c.id, icon: 'clock', title: `${c.name} owes ₹${due.toLocaleString('en-IN')}`, sub: 'Outstanding payment', tint: '#E11D48', route: 'Dues' }));
  state.enquiries.filter((e) => e.status === 'open').slice(0, 3)
    .forEach((e) => out.push({ id: 'enq-' + e.id, icon: 'help', title: `New enquiry · ${e.name}`, sub: e.items.map((i) => i.name).join(', ').slice(0, 40), tint: '#3B82F6', route: 'Enquiries' }));
  return out;
}
