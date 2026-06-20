// Mock data layer. Mirrors the milk app's db.ts shape: a single store with
// client-side aggregation + live subscriptions via React hooks. Backed by an
// in-memory dataset persisted to localStorage. Swap this file for Firestore
// later without touching screens.
import { useEffect, useState } from 'react';
import type {
  BusinessSettings, Category, Customer, Order, OrderLine, Payment, Product, Seller, Unit,
} from './types';
import * as seed from './seed';

interface DB {
  settings: BusinessSettings;
  categories: Category[];
  products: Product[];
  units: Unit[];
  customers: Customer[];
  sellers: Seller[];
  orders: Order[];
  payments: Payment[];
}

const KEY = 'apex-db-v1';

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch { /* ignore */ }
  return {
    settings: seed.settings,
    categories: seed.categories,
    products: seed.products,
    units: seed.units,
    customers: seed.customers,
    sellers: seed.sellers,
    orders: seed.orders,
    payments: seed.payments,
  };
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
  state = { ...state, categories: [...state.categories, { id: uid('c'), name, active: true }] };
  emit();
}
export function deleteCategory(id: string) {
  state = { ...state, categories: state.categories.filter((c) => c.id !== id) };
  emit();
}
export function saveProduct(p: Omit<Product, 'id'> & { id?: string }) {
  if (p.id) {
    state = { ...state, products: state.products.map((x) => (x.id === p.id ? { ...x, ...p } as Product : x)) };
  } else {
    state = { ...state, products: [...state.products, { ...p, id: uid('p') } as Product] };
  }
  emit();
}
export function deleteProduct(id: string) {
  state = {
    ...state,
    products: state.products.filter((p) => p.id !== id),
    units: state.units.filter((u) => u.productId !== id),
  };
  emit();
}
export function addUnits(productId: string, serials: { serial: string; cost: number }[]) {
  const added: Unit[] = serials.map((s) => ({
    id: uid('u'), productId, serial: s.serial, costPrice: s.cost,
    status: 'in_storage', addedAt: Date.now(),
  }));
  state = { ...state, units: [...added, ...state.units] };
  emit();
  return added.length;
}
export function saveCustomer(c: Omit<Customer, 'id'> & { id?: string }) {
  let saved: Customer;
  if (c.id) {
    saved = { ...c } as Customer;
    state = { ...state, customers: state.customers.map((x) => (x.id === c.id ? saved : x)) };
  } else {
    saved = { ...c, id: uid('cu') } as Customer;
    state = { ...state, customers: [...state.customers, saved] };
  }
  emit();
  return saved;
}
export function saveSeller(s: Omit<Seller, 'id'> & { id?: string }) {
  if (s.id) {
    state = { ...state, sellers: state.sellers.map((x) => (x.id === s.id ? { ...x, ...s } as Seller : x)) };
  } else {
    state = { ...state, sellers: [...state.sellers, { ...s, id: uid('s') } as Seller] };
  }
  emit();
}
export function saveSettings(s: BusinessSettings) {
  state = { ...state, settings: s };
  emit();
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
  return order;
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
}
