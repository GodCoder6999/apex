// Cart + order-placement state (no online payment). Cart persists in
// localStorage; placing an order records an order-request locally (swap for the
// shop API later — it lands in the owner/seller apps).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Address, CartItem, Order } from './data/types';
import { products } from './data/seed';
import { pushOrderAsEnquiry } from './data/api';

const CART_KEY = 'snd-store-cart';
const ORDERS_KEY = 'snd-store-orders';
const lookup = (id: string) => products.find((p) => p.id === id);

interface Ctx {
  items: CartItem[];
  count: number;
  subTotal: number;
  gst: number;
  total: number;
  drawerOpen: boolean;
  toast: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  notify: (msg: string) => void;
  placeOrder: (address: Address) => Order;
  lastOrder: () => Order | null;
}
const C = createContext<Ctx>(null as any);
export const useStore = () => useContext(C);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(items)); }, [items]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout((notify as any)._t);
    (notify as any)._t = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const add = useCallback((productId: string, qty = 1) => {
    setItems((it) => {
      const ex = it.find((x) => x.productId === productId);
      const p = lookup(productId);
      const max = p?.stock ?? 99;
      if (ex) return it.map((x) => x.productId === productId ? { ...x, qty: Math.min(max, x.qty + qty) } : x);
      return [...it, { productId, qty: Math.min(max, qty) }];
    });
    setDrawerOpen(true);
    notify('Added to cart');
  }, [notify]);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((it) => it.flatMap((x) => x.productId === productId ? (qty <= 0 ? [] : [{ ...x, qty }]) : [x]));
  }, []);
  const remove = useCallback((productId: string) => setItems((it) => it.filter((x) => x.productId !== productId)), []);
  const clear = useCallback(() => setItems([]), []);

  const { subTotal, gst, total, count } = useMemo(() => {
    let sub = 0, tax = 0, c = 0;
    for (const it of items) {
      const p = lookup(it.productId); if (!p) continue;
      const base = p.price * it.qty;
      const taxable = base / (1 + p.gstRate / 100);
      sub += taxable; tax += base - taxable; c += it.qty;
    }
    return { subTotal: Math.round(sub), gst: Math.round(tax), total: Math.round(sub + tax), count: c };
  }, [items]);

  const placeOrder = useCallback((address: Address): Order => {
    const lines = items.map((it) => {
      const p = lookup(it.productId)!;
      return { productId: p.id, name: p.name, price: p.price, qty: it.qty, image: p.images[0] };
    });
    const seq = (JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[]).length + 1;
    const order: Order = {
      id: 'o-' + Date.now().toString(36),
      orderNo: 'SND-W' + String(1000 + seq),
      lines, subTotal, gst, total, address, status: 'placed', createdAt: Date.now(),
    };
    const prev = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[];
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...prev]));
    setItems([]);
    // Push to the shop as an enquiry (owner + seller Enquiries) when API is live.
    void pushOrderAsEnquiry(order);
    return order;
  }, [items, subTotal, gst, total]);

  const lastOrder = useCallback((): Order | null => {
    try { const a = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[]; return a[0] ?? null; } catch { return null; }
  }, []);

  const value: Ctx = {
    items, count, subTotal, gst, total, drawerOpen, toast,
    openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false),
    add, setQty, remove, clear, notify, placeOrder, lastOrder,
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
