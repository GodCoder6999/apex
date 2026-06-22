# S&D Solution — Customer Shopping Website · Plan & Spec

Detailed plan for the **customer-facing e-commerce website** (the public shop).
Sits on top of the **same backend** as the owner website + owner/seller mobile
apps. This doc covers every section, feature, data flow, and the open decisions
to confirm with the client before/at design hand-off.

---

## 0. What this is
A **public shopping website** where customers browse the electronics catalog
(laptops, PCs, CCTV, components, accessories), add to cart, and **order online
or enquire**. It reuses S&D Solution's existing catalog, stock, pricing, GST,
and customer/order data — so what the owner manages in the dashboard shows up
in the shop, and online orders flow back into the owner/seller apps.

Three apps already exist and share one backend:
- **Owner website** (dashboard) — React + Vite, Firebase-free, mock now → Hostinger PHP+MySQL API.
- **Owner mobile** + **Seller mobile** — Expo / React Native.
- **NEW → Customer storefront** (this doc).

---

## 1. Goals
- Let customers **discover products** (search, categories, filters) and see
  live **price, specs, availability**.
- Let customers **buy online** (cart → checkout → pay) **and/or** send an
  **enquiry / request quote** (B2B + big-ticket items).
- Push every online order into the existing **orders** pipeline so the owner
  fulfils it and a **GST invoice** is generated (same format as the apps).
- Keep stock honest — availability driven by the **serial-tracked units**
  already in the system (count of `in_storage`).
- Reuse the **S&D Solution visual system** (emerald `#10B981`, Geist, the logo)
  for one consistent brand. (Final design supplied separately.)

---

## 2. Tech stack (fits what's already built)
- **React + Vite + TypeScript** (same as owner website) — fast, static-friendly.
- **react-router-dom** for routing. SEO note below (consider SSR/prerender).
- **Same design tokens** (`theme.ts`) + Geist fonts + logo.
- **Backend:** the **Hostinger PHP + MySQL API** (`server/`) — extended with
  storefront endpoints (catalog read, cart/order create, customer auth).
- **Payments:** online gateway (Razorpay recommended for India: UPI, cards,
  netbanking, wallets) — *decision pending*.
- **Hosting:** Hostinger (static `dist/` + the PHP API already there). Render
  for staging, like the owner site.
- **Images:** product images stored as URLs/files on Hostinger (the catalog
  already has an `image` field).

> SEO consideration: a pure SPA hurts Google indexing of product pages. Options:
> (a) **prerender** product/category routes at build, (b) move to **Next.js**
> for SSR, or (c) accept SPA + good meta tags if SEO isn't critical. **Decision
> pending** — call out in §19.

---

## 3. How it plugs into the existing data model
Reuses these tables (from `server/schema.sql`): `products`, `units`,
`categories`, `customers`, `orders`, `payments`, `settings`, `counters`.

New/extended for the storefront:
- **products** (extend): `onlineVisible` (show in shop), `onlinePrice?`
  (optional web price; else use `price`), `images[]` (gallery), `slug`
  (SEO URL), `longDescription`, `highlights[]`, `warranty`, `featured`.
- **customers** (extend) → web accounts: `email`, `passwordHash`, `addresses[]`,
  `emailVerified`. (Guest checkout also allowed.)
- **online_orders** (or reuse `orders` with `channel: 'online' | 'store'`):
  cart items, shipping address, fulfilment status (`placed → confirmed →
  packed → shipped/ready → delivered/collected → cancelled`), payment status,
  delivery method.
- **carts** (optional server cart) or keep cart in **localStorage** (guest) +
  sync on login.
- **reviews** (optional): `productId, customerId, rating, text, approved`.
- **wishlists** (optional): `customerId, productId[]`.
- **coupons** (optional): `code, type (% / ₹), value, minOrder, expiry, active`.
- **banners / homepage blocks** (owner-managed): hero slides, featured rows.

Stock availability = `COUNT(units WHERE productId=? AND status='in_storage')`.
On order **confirmation**, the owner/system **reserves/assigns serial units**
(status → `sold` with `soldOrderId`), exactly like the in-store sell flow.

---

## 4. Site map (all pages/routes)
```
/                     Home (hero, featured, categories, deals, brands)
/c/:categorySlug      Category listing (filters + sort + grid)
/search?q=            Search results
/p/:productSlug       Product detail (gallery, specs, price, stock, add to cart)
/cart                 Cart
/checkout             Checkout (address → delivery → payment → review)
/order/success/:id    Order confirmation
/account              Account dashboard (profile, addresses)
/account/orders       Order history + order detail/tracking
/account/wishlist     Wishlist (optional)
/login /register      Auth (or modal); guest checkout supported
/enquiry              Request a quote / bulk enquiry (B2B)
/about /contact       Static: store info, map, hours, GSTIN
/policies/*           Shipping, Returns, Warranty, Privacy, Terms
/track                Track order (by order no. + phone, no login)
```

---

## 5. Sections & features — detailed

### 5.1 Global shell
- **Top bar / header:** logo, **search bar** (autocomplete: products,
  categories, brands), category mega-menu/nav, **account** icon, **cart** icon
  with item count, optional wishlist. Sticky on scroll.
- **Announcement strip** (optional): offers / free-delivery threshold / GST info.
- **Footer:** categories, policies, contact, GSTIN, address, social, payment
  badges, newsletter signup.
- **Mobile:** hamburger nav + bottom bar (Home · Categories · Search · Cart ·
  Account). Fully responsive.
- States: loading skeletons, empty, error, offline.

### 5.2 Home
- **Hero / banner carousel** (owner-managed slides → category/product links).
- **Shop by category** tiles (Laptops, PCs, CCTV, Components, Networking, Accessories).
- **Featured / Best sellers / New arrivals** product carousels.
- **Deals / offers** row (if coupons/sale price).
- **Shop by brand** logos (Lenovo, Apple, HP, Hikvision, …).
- **Trust band:** GST invoice, genuine products, warranty, store pickup, support.
- **CTA:** bulk/B2B enquiry banner.

### 5.3 Category listing (`/c/:slug`)
- **Product grid** (card: image, name, brand, price, ₹ MRP strike if any,
  rating, **in-stock / few-left / out-of-stock** badge, add-to-cart / view).
- **Filters (left rail / drawer on mobile):** brand, price range, GST%,
  specs facets (RAM, storage, screen, resolution, channels…), availability,
  rating. Facets derived from product attributes.
- **Sort:** relevance, price ↑/↓, newest, popularity, discount.
- **Pagination / infinite scroll.** Result count. Active-filter chips.
- Empty state when no matches.

### 5.4 Search
- Instant **autocomplete** dropdown (products with thumb + price, categories,
  brands). Full results page reuses the category grid + filters.
- Handles serial/model/brand/keyword. "No results" with suggestions.

### 5.5 Product detail (`/p/:slug`) — key page
- **Image gallery** (zoom, thumbnails).
- **Title, brand, category, rating**, short highlights.
- **Price block:** selling price, MRP strike, % off, **GST note** ("incl. GST"
  or "+18% GST" per business setting), EMI hint (optional).
- **Availability:** in stock / few left (e.g. "Only 2 left") / out of stock →
  **Notify me** or **Enquire**. Driven by `in_storage` unit count.
- **Add to cart** + **Buy now** + **wishlist**.
- **Specs table** (key/value), **description**, **what's in the box**,
  **warranty**, **HSN** (optional).
- **Delivery / pickup:** pincode check (optional), store-pickup availability.
- **Trust:** genuine, GST invoice, warranty, easy returns.
- **Related / similar products**, **recently viewed**.
- **Reviews** (optional, owner-moderated).
- Serial note: customers don't pick serials; a unit is assigned at fulfilment.

### 5.6 Cart (`/cart`)
- Line items (image, name, price, qty stepper bounded by stock, line total,
  remove, save-for-later/wishlist).
- **Coupon** input (optional). **Order summary:** subtotal, discount, **GST**,
  delivery fee, **grand total**.
- Stock re-validation. **Checkout** CTA. Empty-cart state with CTAs.
- Cart persists (localStorage for guests; synced to account on login).

### 5.7 Checkout (`/checkout`)
Stepper or single page:
1. **Contact** — email/phone (login or guest; option to create account).
2. **Delivery method** — *Home delivery* and/or *Store pickup* (decision §19).
3. **Address** — saved addresses or new (name, phone, address, city, state,
   pincode); **GSTIN** field for B2B invoice.
4. **Payment** — online (Razorpay: UPI/card/netbanking/wallet) and/or **COD**
   and/or **Pay at store** (decision §19).
5. **Review & place order** — items, totals, GST (CGST/SGST vs IGST by state),
   address, terms checkbox.
- On success → create order (`channel=online`, `status=placed`), reduce
  availability, fire confirmation (email/WhatsApp), show success page.
- Robust error handling for payment failure / stock-changed.

### 5.8 Order success + tracking
- **Success page:** order no., summary, ETA, what's next, download/印 invoice
  once confirmed.
- **Track order** (`/track` or `/account/orders/:id`): status timeline
  (Placed → Confirmed → Packed → Shipped/Ready → Delivered/Collected). Cancel
  (if allowed before packed). Reorder.

### 5.9 Account
- **Profile** (name, email, phone), **addresses** (CRUD), change password.
- **Orders** list + detail (items with serials once shipped, invoice download,
  status, support/reorder).
- **Wishlist** (optional). **Saved cards** handled by gateway, not stored by us.
- Logout. Guests can still track via order no. + phone.

### 5.10 Enquiry / Request a quote (`/enquiry`)
- For bulk/B2B or out-of-stock/high-value items: customer + products + qty +
  note → creates an **enquiry** in the existing enquiries pipeline (owner/seller
  apps already have Enquiries + demo bill). Owner replies / sends quotation.
- "Enquire" buttons on out-of-stock or B2B-flagged products route here.

### 5.11 Static / content
- **About, Contact** (store address, map, hours, phone, WhatsApp, GSTIN),
  **Policies** (Shipping, Returns/Replacement, Warranty, Privacy, Terms).
- **FAQ**. **Newsletter** signup (optional).

---

## 6. Order fulfilment flow (ties to owner/seller)
1. Customer places online order → `orders` row, `channel=online`,
   `status=placed`, payment captured (online) or pending (COD/pay-at-store).
2. Owner sees it in the **dashboard** (new "Online orders" view or merged
   Invoices with a channel filter) — *needs a small addition to the owner app*.
3. Owner **confirms** → assigns **serial units** (status → `sold`,
   `soldOrderId`), prints/sends the **GST invoice** (same classic format).
4. Fulfil: **ship** (courier + tracking) or **ready for pickup**.
5. Status updates flow back to the customer (email/WhatsApp + account page).
6. Payments/dues reconcile in the existing money screens.

> This means a few **owner-app additions**: online-orders view, confirm/assign,
> set fulfilment status, manage storefront content (banners, online price,
> visibility, featured). Scope these in Phase planning.

---

## 7. Pricing, GST, invoices
- Price = `onlinePrice ?? price`. Optional MRP for strike-through/discount.
- **GST**: show inclusive/exclusive per `settings.taxDefault`; compute
  **CGST/SGST** (intra-state) vs **IGST** (inter-state) from business state vs
  shipping/GSTIN state — same logic as the apps.
- **Invoice**: reuse the **classic GST tax-invoice** generator (already built);
  customer can download PDF from order detail once confirmed.
- **Coupons/discounts** (optional): code-based, validated server-side.

## 8. Delivery / shipping (decision-dependent)
- Options: **Home delivery** (flat fee / free over ₹X / weight-zone), **Store
  pickup** (free), **courier integration** (optional: Shiprocket/Delhivery) or
  manual dispatch + tracking link.
- Serviceable-pincode check (optional).

## 9. Payments (decision-dependent)
- **Razorpay** (recommended): UPI, cards, netbanking, wallets, EMI.
- **COD** (optional, risk for high-value electronics — maybe cap by amount).
- **Pay at store / pay on pickup** (optional).
- Refunds via gateway for cancellations/returns.

## 10. Notifications
- **Email** (order confirmation, status, invoice) — SMTP/Resend/Brevo.
- **WhatsApp** (order updates) — wa.me link now; WhatsApp Business API later.
- Owner alert on new online order (dashboard badge + optional push/email).

## 11. Search, filters, performance
- Client search over catalog for small catalogs; server search (SQL LIKE /
  FULLTEXT) as it grows. Facets from product attributes.
- Image optimization (responsive sizes, lazy-load), skeleton loaders,
  code-splitting, caching of catalog reads.

## 12. SEO & marketing
- Per-product/category **meta tags, Open Graph, canonical, JSON-LD Product
  schema** (price, availability, rating) — needs SSR/prerender for best results.
- Clean **slug** URLs. Sitemap.xml, robots.txt. Fast LCP.
- Analytics: GA4 / Plausible; conversion events (add-to-cart, checkout, purchase).

## 13. Admin / owner controls (storefront management)
Owner needs to manage (additions to the owner app or a small admin section):
- Toggle **online visibility** + set **online price / MRP / featured** per product.
- Upload **product images/gallery**, **specs/highlights**, **slug/SEO**.
- Manage **home banners**, **featured rows**, **brands**.
- Manage **coupons**, **delivery fees**, **policies/content**.
- View + process **online orders**; moderate **reviews**.

## 14. Security & rules
- Customer auth (JWT/session) separate from owner/seller roles. Passwords
  bcrypt-hashed (API already hashes sellers). HTTPS only.
- Server-side validation of price/stock/coupons (never trust client totals).
- Payment via gateway (PCI handled by Razorpay; we never store card data).
- Rate limiting + auth on write endpoints; CORS locked to the shop domain.
- GDPR-ish: privacy policy, data deletion request path.

## 15. Non-functional
- **Mobile-first responsive**, accessible (WCAG AA: contrast, focus, alt text,
  keyboard nav), fast, resilient (offline cart, retry on network errors).

## 16. Reuse from existing codebase
- **Design tokens** (`theme.ts`), Geist fonts, logo, status-badge styles.
- **GST invoice** generator + `rupeesInWords`, money/format helpers.
- **Backend API + schema** (extend, don't fork).
- Shared **types** (Product, Order, Customer) — keep shapes aligned.

---

## 17. Phased roadmap
1. **Foundation** — Vite app, design system, shell (header/footer/nav), routing,
   catalog read API, product card.
2. **Catalog** — Home, category listing + filters/sort, search, product detail,
   availability from stock.
3. **Cart & accounts** — cart (guest + synced), register/login, addresses,
   wishlist (optional).
4. **Checkout & payments** — address → delivery → **Razorpay** → place order →
   success; order creation into backend.
5. **Orders & fulfilment** — account orders + tracking, owner-app online-orders
   view + confirm/assign serials + GST invoice + status updates + notifications.
6. **Content & admin** — banners/featured/online-price management, coupons,
   policies, reviews.
7. **SEO & launch** — meta/schema/sitemap, analytics, performance, Hostinger
   deploy, domain, polish.

---

## 18. Deliverables
- Responsive **customer storefront** (all pages above) on the S&D visual system.
- **Backend extensions** (storefront endpoints + schema additions).
- **Owner-app additions** (online-orders + storefront content management).
- Payment + notifications integration. Docs + deploy.

---

## 19. Decisions to confirm with the client (please answer before build)
1. **Buy online vs enquiry-only?** Full e-commerce checkout + payment, OR
   browse + "enquire/quote" (no online payment) to start? (Big-ticket
   electronics often start enquiry-first.)
2. **Payment gateway:** Razorpay? And which methods — UPI/cards/netbanking/EMI?
   **COD** allowed? amount cap? **Pay at store** option?
3. **Delivery:** home delivery (fees? free-over-₹X?) and/or **store pickup
   only**? Courier integration (Shiprocket/Delhivery) or manual dispatch?
4. **Accounts:** required to buy, or **guest checkout** allowed? Social login?
5. **Catalog scope online:** all products or a curated subset? Separate
   **online price** vs in-store price?
6. **Reviews & ratings:** include now or later? Owner-moderated?
7. **Coupons/offers:** needed at launch?
8. **SEO priority:** if high → invest in SSR/prerender (maybe Next.js) vs SPA.
9. **Domain & email:** shop domain (e.g. shop.sndsolution.in) + transactional
   email provider.
10. **Returns/warranty policy** content (needed for policy pages + flows).
11. **Languages/currency:** English + ₹ only (assumed)?
12. **Owner workflow:** OK to add an "Online orders" + storefront-management
    section to the owner app?

---

## 20. Design hand-off notes (for the design you'll provide)
- Reuse **S&D Solution** brand: emerald accent, Geist type, the logo, clean
  "tech-retail" feel — consistent with the dashboard + apps.
- Provide: **Home, Category listing, Product detail, Cart, Checkout, Account/
  Orders, Search, Auth, Enquiry, static/policy** screens — desktop + mobile.
- Components to design: header/search/cart, product card, filter rail, gallery,
  price/stock block, qty stepper, cart summary, checkout stepper, address form,
  payment block, order timeline, empty/loading/error states, footer.
```
