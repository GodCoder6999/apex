# Storefront build — Handoff for a new session

You are finishing the **customer shopping website** for S&D Solution at
`store/` (a Vite + React + TS SPA). Most of it is built; **a few pages remain**.
The app **will not compile yet** because `src/App.tsx` imports page modules that
don't exist. Create them (below), then build, commit, push, and deploy on Render.

Read first: `customer-shopping-website-plan.md` (features/flows) and
`customer-shop-design.md` (the design brief). The design source HTML is
`S&D Solution Store.dc.html` in the Claude Design project
`4765094b-1055-4c14-b0f5-61c3976743f7` (fetch via the `claude_design` MCP /
DesignSync `get_file` if you need exact markup).

---

## 0. Locked product decisions (do NOT add payment)
- **No online payment / no gateway.** Checkout = contact → address → review →
  **Place order**. Payment is "Pay on delivery — collected by our team".
- **Sellers deliver**; order is an order-request that (later) flows to the
  owner/seller apps via the shared backend.
- **Only in-stock products** shown (`catalog.inStock()`); **never expose product
  IDs** — URLs use **slugs**.
- **Account optional**, guest checkout allowed, but **full delivery details
  required** to place an order.
- **SPA on Render** (HashRouter, no domain yet). SEO not a priority.
- **Distinct consumer theme** (electric blue `#1A4DF0`, Clash Display + General
  Sans) — NOT the emerald dashboard. Already wired in `theme.ts` + `styles.css`.

---

## 1. What's already built (in `store/`)
```
store/
  package.json  vite.config.ts  tsconfig.json  index.html   (✅ fonts via fontshare)
  public/logo.png                                            (✅ S&D logo)
  src/
    main.tsx        ✅ HashRouter + StoreProvider + App
    App.tsx         ✅ routes (imports pages — SOME MISSING, see §2)
    styles.css      ✅ reset, fonts, animations (sdFloat/sdMesh/sdMarquee/…), .desk-only/.mob-only, .cardHover/.btnBlue/.skeleton
    theme.ts        ✅ color{}, font{display,body}, radius{}, shadow{}
    format.ts       ✅ rupee(), rupee2(), discountPct()
    icons.tsx       ✅ <Icon name size stroke sw fill/>, <Stars value/>, IconName, catIcon
    ui.tsx          ✅ Container, Btn(variant: blue|dark|outline|ghost|white; size sm|md|lg; full; icon),
                       Pill, StockPill, Price, SectionHead, ProductImg
    store.tsx       ✅ StoreProvider + useStore() — see API §3
    data/
      types.ts      ✅ Category, Brand, Product, CartItem, Address, Order, OrderLine, OrderStatus
      seed.ts       ✅ categories, brands, products[15] (images via picsum seeds, mrp/rating/stock/specs/highlights/flags)
      catalog.ts    ✅ inStock, categories, brands, bySlug, byCategory, categoryBySlug, categoryName,
                       featured, bestSellers, newArrivals, deals, search(q), related(p)
    components/
      Layout.tsx    ✅ Header + <Outlet/> + Footer + CartDrawer + Toast + MobileTab + scroll-to-top
      Header.tsx    ✅ announcement, logo, search+autocomplete, category nav, mega-menu, mobile drawer, cart badge
      Footer.tsx    ✅ trust strip, columns, contact, policies, GSTIN
      CartDrawer.tsx✅ slide-in cart, qty steppers, total, "Checkout" → /checkout
      Chrome.tsx    ✅ Toast (reads store.toast), MobileTab (bottom nav, mobile only)
      ProductCard.tsx ✅ card with image, badges, rating, price, quick-add
    pages/
      Home.tsx      ✅ hero, trust marquee, shop-by-category, featured, deals band, best sellers, brands, new arrivals, B2B banner
```

---

## 2. REMAINING — create these page files (App.tsx already imports them)
All live in `store/src/pages/`. Use `Container`, `Btn`, `Price`, `StockPill`,
`SectionHead`, `ProductCard`, `Icon`, `Stars`, `useStore`, catalog helpers, and
`color/font/radius/shadow` from `theme`. Match the blue/Clash consumer look.

### `Shop.tsx` → `export function Shop()`
Category listing + the all-products page. Route is both `/shop` and `/c/:slug`
(read `useParams().slug`; if present, filter to that category via
`categoryBySlug` + `byCategory`, else `inStock()`).
- Header: category title + count.
- **Filters** (left rail desktop / drawer mobile): brand (checkboxes from
  `brands` present in the list), price range, availability (in-stock/few-left),
  min rating. **Sort**: relevance, price ↑/↓, newest, discount (`discountPct`).
- Active-filter chips, clear-all. **Grid** of `<ProductCard/>`
  (`repeat(auto-fill,minmax(230px,1fr))`). Empty state. Optional pagination.

### `Product.tsx` → `export function Product()`
`/p/:slug` → `bySlug(slug)`; if missing → not-found.
- **Gallery** (main image + thumbnails, hover/zoom), badges (deal %, bestseller).
- Brand · title · `<Stars/>` + rating(reviews) · `<Price price mrp/>` ·
  "incl. GST" note · `<StockPill stock/>`.
- **Qty stepper** + **Add to cart** (`add(p.id, qty)`) + **Buy now**
  (add then `nav('/checkout')`) + wishlist (optional/no-op).
- Highlights list, specs table (`p.specs`), warranty, "what's in the box",
  delivery note ("Delivered by our team · pay on delivery"), trust chips.
- **Sticky add-to-cart bar** on scroll (esp. mobile): mini product + price + Add.
- **Related** row (`related(p)`), recently-viewed optional.

### `Search.tsx` → `export function Search()`
`/search?q=` → `useSearchParams()`; run `search(q)`; reuse the Shop grid + a
search box. Empty/no-results state with suggestions (categories/brands).

### `Checkout.tsx` → `export function Checkout()` — NO payment
3 short steps (or one page): **Contact** (name, phone, email optional) →
**Delivery address** (line, city, state, pincode; GSTIN optional) →
**Review & Place order**. Right/side **order summary** (items, subtotal, GST,
total). Validate required fields. On submit:
`const order = placeOrder(address); nav('/order/success')`. Payment line:
"Pay on delivery — collected by our team." Empty cart → redirect to `/shop`.

### `OrderSuccess.tsx` → `export function OrderSuccess()`
Read latest order: `const o = useStore().lastOrder()`. Show big check, **order
no.** (`o.orderNo`), summary (lines, total), delivery address, "what happens
next" (our team will call to confirm & deliver; pay on delivery), CTAs
(Continue shopping, Track order). If no order → friendly fallback to `/shop`.

### `Account.tsx` → `export function Account()`
Lightweight (no real auth yet). Tabs/sections: **Track order** (the route
`/track` reuses this) — list orders from `localStorage['snd-store-orders']` with
status; **Profile/addresses** placeholder. Keep simple; note "full accounts come
with the backend".

### `Enquiry.tsx` → `export function Enquiry()`
Bulk/B2B quote form: name, phone, email, product/category interest, qty, message.
On submit → toast "Enquiry sent — our team will contact you" (store to
`localStorage['snd-store-enquiries']`). Hero explaining bulk pricing + GST.

### `StaticPage.tsx` → `export function StaticPage({ k }: { k?: string })`
Reads `k` prop or `useParams().k` (about, contact, notfound, shipping, returns,
warranty, privacy, terms). Render a titled content block with placeholder copy +
store contact (address, phone, WhatsApp, GSTIN). Contact page = details + map
placeholder. notfound = 404 with link home.

---

## 3. `useStore()` API (from `store.tsx`)
```ts
items: CartItem[]; count; subTotal; gst; total;       // money pre-computed (GST-inclusive prices)
drawerOpen; toast;
openDrawer(); closeDrawer();
add(productId, qty=1);   // clamps to stock, opens drawer, toasts
setQty(productId, qty);  // qty<=0 removes
remove(productId); clear();
notify(msg);
placeOrder(address): Order;   // clears cart, stores in localStorage 'snd-store-orders'
lastOrder(): Order | null;
```
Product lookup by id: `import { products } from '../data/seed'` then `.find`.
Catalog (in-stock, slugs) from `../data/catalog`.

---

## 4. Finish steps
```bash
cd store
npm install
npx tsc --noEmit         # fix any type errors in the new pages
npm run build            # must pass (tsc -b && vite build)
npm run dev              # eyeball it; check Home, Shop, Product, Cart drawer, Checkout → Success
```
Add **`store/render.yaml`** (static site) + **`store/.gitignore`**
(`node_modules dist .env`) like the owner site. Render: New → Static Site →
build `npm run build`, publish `dist`. HashRouter ⇒ no rewrite rules needed.

Commit + push (repo `https://github.com/GodCoder6999/apex.git`, branch `main`),
commit footer:
```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

---

## 5. Conventions / gotchas
- **Caveman mode** is on in chat (terse). Code stays normal.
- Theme: headings use `className="display"` (Clash) or `fontFamily: font.display`.
  Accent `color.blue` `#1A4DF0`. Money via `rupee()`. Prices are **GST-inclusive**;
  `store` splits out `gst`/`subTotal` for display.
- Responsive: `.desk-only` / `.mob-only` classes (breakpoint 900px). Mobile has a
  bottom tab (`Chrome.tsx`) + 64px spacer in Layout.
- Images: picsum seeds in `seed.ts` (owner replaces with real images later).
- Keep it **distinct, premium, conversion-focused** (sticky add-to-cart, urgency
  pills "Only N left", trust badges, motion) — that's the whole point of this site.
- Backend: still mock/localStorage. The plan's API seam (Hostinger PHP+MySQL)
  comes later; don't block on it.

---

## 6. After the storefront compiles & deploys
- (Optional next) wire the storefront order → backend `online_orders` and add an
  "Online orders" view to the owner app (see plan §6, §13).
- Replace picsum with real product images.
- Add basic `<title>`/meta per route if desired (SPA-level only).
```
