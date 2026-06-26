// Cart + wishlist + order state (no online payment). Cart/wishlist persist in
// localStorage; placing an order records it locally and pushes it to the shop as
// an enquiry (owner/seller Enquiries) when the API is live.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Address, CartItem, Order } from './data/types';
import { productById } from './data/catalog';
import { pushOrderAsEnquiry } from './data/api';

const CART_KEY = 'snd-store-cart';
const WISH_KEY = 'snd-store-wish';
const RECENT_KEY = 'snd-store-recent';
const ORDERS_KEY = 'snd-store-orders';
const lookup = (id: string) => productById(id);

export interface Toast { msg: string; type?: 'cart' | 'ok' | 'error'; action?: string; onAction?: () => void; }

interface Ctx {
  items: CartItem[];
  count: number;
  subTotal: number;   // sum price*qty (incl GST)
  mrpTotal: number;   // sum mrp*qty
  savings: number;    // mrpTotal - subTotal
  gst: number;        // GST component within subTotal
  total: number;      // == subTotal (pay on delivery)
  drawerOpen: boolean;
  toast: Toast | null;
  wish: Record<string, 1>;
  recent: string[];
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (productId: string, qty?: number, e?: any) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  toggleWish: (productId: string) => void;
  pushRecent: (slug: string) => void;
  notify: (msg: string, type?: Toast['type']) => void;
  showToast: (t: Toast) => void;
  placeOrder: (address: Address) => Order;
  orders: () => Order[];
  lastOrder: () => Order | null;
}
const C = createContext<Ctx>(null as any);
export const useStore = () => useContext(C);

function read<T>(k: string, fb: T): T { try { return JSON.parse(localStorage.getItem(k) || '') as T; } catch { return fb; } }

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => read<CartItem[]>(CART_KEY, []));
  const [wish, setWish] = useState<Record<string, 1>>(() => read<Record<string, 1>>(WISH_KEY, {}));
  const [recent, setRecent] = useState<string[]>(() => read<string[]>(RECENT_KEY, []));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem(WISH_KEY, JSON.stringify(wish)); }, [wish]);
  useEffect(() => { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); }, [recent]);

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 3600);
  }, []);
  const notify = useCallback((msg: string, type: Toast['type'] = 'ok') => showToast({ msg, type }), [showToast]);

  const flyToCart = useCallback((e: any) => {
    try {
      const target = document.getElementById(window.innerWidth < 760 ? 'sdCartBtnM' : 'sdCartBtn');
      const node = e?.currentTarget || e?.target;
      if (!target || !node) return;
      const src = node.getBoundingClientRect(); const dst = target.getBoundingClientRect();
      const dot = document.createElement('div');
      Object.assign(dot.style, { position: 'fixed', left: `${src.left + src.width / 2 - 10}px`, top: `${src.top + src.height / 2 - 10}px`,
        width: '20px', height: '20px', borderRadius: '50%', background: '#1A4DF0', zIndex: '9999', boxShadow: '0 10px 24px #1A4DF0', pointerEvents: 'none' });
      document.body.appendChild(dot);
      const dx = dst.left + dst.width / 2 - (src.left + src.width / 2);
      const dy = dst.top + dst.height / 2 - (src.top + src.height / 2);
      const anim = dot.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.55}px,${dy * 0.55 - 70}px) scale(1.35)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px,${dy}px) scale(0.15)`, opacity: 0.5 },
      ], { duration: 720, easing: 'cubic-bezier(.55,0,.4,1)' });
      anim.onfinish = () => { dot.remove(); target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.22)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'ease-out' }); };
    } catch { /* ignore */ }
  }, []);

  const add = useCallback((productId: string, qty = 1, e?: any) => {
    const p = lookup(productId);
    const max = p?.stock ?? 99;
    setItems((it) => {
      const ex = it.find((x) => x.productId === productId);
      if (ex) return it.map((x) => x.productId === productId ? { ...x, qty: Math.min(max, x.qty + qty) } : x);
      return [...it, { productId, qty: Math.min(max, qty) }];
    });
    const label = p ? p.name.split(' ').slice(0, 3).join(' ') : 'Item';
    showToast({ msg: `${label} added`, type: 'cart', action: 'View cart', onAction: () => { setToast(null); setDrawerOpen(true); } });
    if (e) flyToCart(e);
  }, [showToast, flyToCart]);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((it) => it.flatMap((x) => x.productId === productId ? (qty <= 0 ? [] : [{ ...x, qty }]) : [x]));
  }, []);
  const remove = useCallback((productId: string) => setItems((it) => it.filter((x) => x.productId !== productId)), []);
  const clear = useCallback(() => setItems([]), []);

  const toggleWish = useCallback((productId: string) => {
    setWish((w) => { const n = { ...w }; if (n[productId]) { delete n[productId]; } else { n[productId] = 1; } return n; });
  }, []);
  const pushRecent = useCallback((slug: string) => {
    setRecent((r) => [slug, ...r.filter((x) => x !== slug)].slice(0, 9));
  }, []);

  const { subTotal, mrpTotal, savings, gst, total, count } = useMemo(() => {
    let sub = 0, mrp = 0, tax = 0, c = 0;
    for (const it of items) {
      const p = lookup(it.productId); if (!p) continue;
      const base = p.price * it.qty;
      const taxable = base / (1 + (p.gstRate || 18) / 100);
      sub += base; mrp += (p.mrp || p.price) * it.qty; tax += base - taxable; c += it.qty;
    }
    return { subTotal: Math.round(sub), mrpTotal: Math.round(mrp), savings: Math.round(mrp - sub), gst: Math.round(tax), total: Math.round(sub), count: c };
  }, [items]);

  const placeOrder = useCallback((address: Address): Order => {
    const lines = items.map((it) => {
      const p = lookup(it.productId)!;
      return { productId: p.id, name: p.name, price: p.price, qty: it.qty, image: p.images[0] };
    });
    const order: Order = {
      id: 'o-' + Date.now().toString(36),
      orderNo: 'SD' + String(Date.now()).slice(-7),
      lines, subTotal, gst, total, address, status: 'placed', createdAt: Date.now(),
    };
    const prev = read<Order[]>(ORDERS_KEY, []);
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...prev].slice(0, 12)));
    setItems([]);
    void pushOrderAsEnquiry(order);
    return order;
  }, [items, subTotal, gst, total]);

  const orders = useCallback((): Order[] => read<Order[]>(ORDERS_KEY, []), []);
  const lastOrder = useCallback((): Order | null => { const a = read<Order[]>(ORDERS_KEY, []); return a[0] ?? null; }, []);

  const value: Ctx = {
    items, count, subTotal, mrpTotal, savings, gst, total, drawerOpen, toast, wish, recent,
    openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false),
    add, setQty, remove, clear, toggleWish, pushRecent, notify, showToast, placeOrder, orders, lastOrder,
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
