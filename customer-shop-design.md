# Design Brief — S&D Solution · Customer Shopping Website (storefront)

**Hand-off for Claude Design.** Design the **public customer storefront** for an
electronics shop — a **responsive, mobile-first website** where customers browse
in-stock products and **place an order** (delivery by the shop's team). It must
feel like a **premium consumer store**, NOT an admin tool.

---

## 0. Most important: make it a distinct, compelling shopping experience
- This site has **three sibling apps** (owner dashboard, owner mobile, seller
  mobile) that use an emerald/Geist "admin" look. **Do NOT reuse that.** The
  storefront should have its **own bold consumer identity.**
- **You choose the theme** — palette, typography, mood, accent. Go for
  **attractive, attention-grabbing, premium, and compelling to buy.** Electronics
  retail: think hi-tech, confident, a little exciting.
- Only the **logo** carries over (red "S" + blue "D" + "SOLUTION"). Everything
  else is your creative call.
- Optimise for **conversion**: easy to browse, easy to add to cart, easy to
  place an order. Reduce friction; build desire and trust.

---

## 1. The business & how the shop works
S&D Solution sells electronics (laptops, PCs, CCTV, components, networking,
accessories). The storefront is **catalog + order placement** — there is **no
online payment**:
- Customer browses **in-stock** products → adds to cart → **places an order**
  with full delivery details.
- The order is sent to the shop's **owner/seller** team. A **seller delivers**
  the order and **collects payment on delivery** (cash/online). A GST invoice is
  issued then.
- So the website's job is to **make people want to buy and place the order** —
  the rest happens offline via the team.

Key traits to design around:
- **Only available products are shown** (things the shop actually has in stock).
- **No prices hidden, no payment step** — "Pay on delivery, delivered by our team".
- **Trust matters** (genuine products, GST invoice, warranty, local delivery).

---

## 2. Experience principles (theme-agnostic, all required)
- **Bold first impression** — large cinematic **hero**, strong product imagery,
  confident type, a clear signature accent.
- **Conversion-focused** — prominent **Add to cart / Buy now**, **sticky
  add-to-cart** on product + mobile, clear price & savings, **guest checkout**.
- **Urgency & trust** — "Only N left", "In stock" badges, genuine / GST-invoice /
  warranty / delivered-by-our-team chips; ratings later.
- **Motion & delight** — tasteful hover/scroll animation, image zoom, smooth
  page transitions, skeleton loaders. Premium, never janky.
- **Merchandising** — hero banners, **Featured / Best sellers / New arrivals**
  carousels, **shop by category**, **shop by brand**, deal highlights.
- **Mobile-first & fast** — phone is primary: bottom nav, big tap targets,
  thumb reach, quick loads.
- **Polished empty/loading/error** states with friendly microcopy.

---

## 3. Global shell
- **Header:** logo, **search bar** (with autocomplete: products, categories,
  brands), **category nav / mega-menu**, **account** entry, **cart** icon with
  count, optional wishlist. Sticky, condenses on scroll.
- Optional **announcement strip** (offers / delivery info).
- **Footer:** categories, policies (Shipping/Returns/Warranty/Privacy/Terms),
  contact (address, phone, WhatsApp, GSTIN), social, trust/payment-on-delivery
  badges, newsletter (optional).
- **Mobile:** hamburger or drawer nav + **bottom tab bar** (Home · Categories ·
  Search · Cart · Account).

---

## 4. Screens (design desktop + mobile)

### 4.1 Home
Hero/banner carousel (links to category/product) · shop-by-category tiles ·
Featured / Best sellers / New arrivals carousels · deals row · shop-by-brand
logos · trust band (genuine, GST invoice, warranty, local delivery, support) ·
bulk/B2B enquiry banner.

### 4.2 Category listing
Product **grid** (card: image, name, brand, **price** + MRP strike + % off,
rating, **In stock / Only N left / Out of stock** badge, **Add to cart**) ·
**filters** (brand, price, spec facets like RAM/storage/screen/CCTV-channels,
availability, rating) as left rail (desktop) / drawer (mobile) · **sort**
(relevance, price ↑/↓, newest, discount) · active-filter chips · pagination or
infinite scroll · empty state.

### 4.3 Search
Instant **autocomplete** dropdown (product thumb + price, categories, brands) →
full results reuse the category grid. "No results" with suggestions.

### 4.4 Product detail — the money page
**Image gallery** (zoom, thumbs) · title, brand, rating, highlights · **price
block** (price, MRP strike, % off, "incl. GST" note) · **availability** (in
stock / only N left / out-of-stock → "Notify me" or "Enquire") · **Add to cart**
+ **Buy now** + wishlist · **specs table** · description · what's in the box ·
warranty · delivery note ("Delivered by our team · pay on delivery") · **related
/ similar** + recently viewed · reviews (later). **Sticky add-to-cart bar** on
scroll (esp. mobile).

### 4.5 Cart
Line items (image, name, price, **qty stepper**, line total, remove,
save-for-later) · **order summary** (subtotal, discount, GST, total) ·
**Checkout** CTA · empty-cart state. Persists across visits.

### 4.6 Checkout — NO payment
Short flow / single page: **Contact** (name, phone, optional email) →
**Delivery address** (full address, city, state, pincode; GSTIN optional) →
**Review & place order** (items, totals, GST, terms). Big **"Place order"**
button. Payment line reads **"Pay on delivery — collected by our team."** Guest
allowed; "create account to save details" optional.

### 4.7 Order success + tracking
Success page (order no., summary, what-happens-next, ETA). **Track order**
(status timeline: Placed → Confirmed → Out for delivery → Delivered). Cancel
(if allowed) · reorder. Track by order no. + phone without login.

### 4.8 Account (optional login)
Profile · **addresses** (CRUD) · **orders** list + detail (items, status,
invoice once delivered, reorder) · wishlist (optional) · logout.

### 4.9 Auth
Login / Register (or modal). Clean, minimal, on-brand. Guest checkout always
available.

### 4.10 Enquiry / Request a quote
For bulk/B2B or out-of-stock/high-value: customer + products + qty + note →
sent to the shop team. "Enquire" buttons on out-of-stock / B2B items route here.

### 4.11 Static / content
About · Contact (address, map, hours, phone, WhatsApp, GSTIN) · Policies
(Shipping, Returns, Warranty, Privacy, Terms) · FAQ.

---

## 5. Key components to design
Header (logo + search + cart + account) · product card (with badges/ribbons) ·
filter rail/drawer · sort control · image gallery + zoom · price/stock block ·
qty stepper · cart line + sticky summary · checkout stepper · address form ·
order status timeline · trust/urgency badges · banners/carousels · brand strip ·
footer · empty / loading (skeleton) / error states · toast/confirmation.

---

## 6. Scope notes
- **No online payment / no gateway** — order placement only; pay on delivery.
- **Only in-stock products shown.** Never expose internal IDs (use clean slugs).
- **Delivery by the shop's sellers.** Single price (₹, GST). English.
- Built with **React + Vite** (SPA), reuses the shop's backend (products, stock,
  orders, GST invoice). Deployed on **Render** (no custom domain yet).
- Reviews, coupons, wishlist = **later** (design can hint but not required).

---

## 7. Deliver
A cohesive, **distinct, premium consumer storefront** (all screens above, desktop
+ mobile), its **own visual system** (your choice of theme/palette/type — bold,
attractive, conversion-driven), and the key flows: **browse → product → cart →
place order → success/track**, plus enquiry. Make people **want to buy.**
