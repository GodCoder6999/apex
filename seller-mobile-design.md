# Design Brief — Electronics Business · Seller Mobile App (phone, portrait)

**Hand-off for Claude Design.** Design the **Seller mobile app** — a **native-feel
phone app** (portrait, touch-first), built with **Expo / React Native**. It
**reuses the exact visual language** of the already-built Apex Owner web app
(emerald accent, Geist type, dark-slate surfaces, status pills, mono serials).
This is a **separate app from the owner** — sellers never see owner screens
(no profit, no catalog/category/seller management, no analytics).

Treat this as the **mobile sibling** of `electronics-owner-desktop-design.md` and
the implemented `Apex Owner Desktop`. Keep components portable so the **owner
mobile app** can reuse them later.

---

## 1. Who uses it & what for
A **field/shop seller** at a retail electronics store (laptops, PCs, CCTV,
components, accessories). The seller:
- **Collects stock** from the shop onto themselves (by scanning serials), and
  **returns** unsold units.
- **Sells** to customers — scans a unit, builds a bill, takes **instant payment**
  (cash / online / split, partial allowed), generates a **GST invoice**, and
  **sends it** (WhatsApp / Email / PDF).
- **Creates & finds customers**, tracks **dues**, and **collects due payments**.
- Logs **enquiries** and shares a **demo/quote bill** for products a customer
  asked about.
- Reviews **their own** stock-in-hand and sales/collections (no shop-wide
  profit or analytics).

Core traits to design around:
- **Camera-first scanning** — the phone camera is the scanner. A big **Scan**
  action is always one tap away. Manual search is the fallback everywhere.
- **Serial-number inventory** — every device is an individual unit with its own
  serial/IMEI and a status (with me / sold / returned).
- **One-handed, on-the-move** — large tap targets, bottom-reachable primary
  actions, minimal typing, fast confirms.
- **GST invoicing** — bills show tax lines; share instantly.

---

## 2. Layout principles (mobile, portrait)
- **App shell:** compact **top bar** (screen title + seller avatar/sync dot) +
  **bottom tab bar** (4–5 tabs) + a prominent **center Scan button** (FAB-style
  notch in the tab bar).
- **Bottom tabs:** **Home · Stock · Scan (center) · Sell · More**. "More"
  holds Customers, Dues, Enquiries, My sales, Settings/Logout.
- **Single-column**, thumb-friendly. Sticky bottom action bars for primary CTAs
  (e.g. "Charge ₹…", "Collect", "Generate invoice").
- **Sheets over modals:** use **bottom sheets** for create/edit, payment, and
  confirmations (slide up, drag-to-dismiss). Full-screen flows for billing and
  scanning.
- **Lists are cards/rows** with status pills; generous spacing; pull-to-refresh.
- Designed for **375–430px** widths; safe-area aware (notch + home indicator).

---

## 3. Visual language (reuse the Apex system — keep identical)
- **Mood:** modern, professional "tech retail." Clean, trustworthy, a little
  premium. Same brand as the owner app.
- **Palette:**
  - Surface: `#F6F7F9`; cards `#FFFFFF`; subtle card alt `#FAFBFC`.
  - Ink: `#0F172A` (headings), `#334155` (body), `#64748B` (muted), `#94A3B8` (faint).
  - **Primary accent: emerald** `#10B981` (deep `#059669`, deeper `#047857`,
    soft bg `#ECFDF5`). Buttons, active tab, scan state, links.
  - Dark surface (top bar / scan screen / brand): deep slate `#0B1220`.
  - Semantic: green `#16A34A` (paid/in-stock), red `#E11D48` (due/out),
    amber `#F59E0B` (low/partial), blue `#3B82F6` (with-seller), violet `#7C3AED`.
- **Typography:** **Geist** (UI) + **Geist Mono** (serials, barcodes, invoice
  numbers, money). Strong tabular numerals for prices/totals.
- **Components:** 12–16px radius cards, soft shadows, hairline borders
  `rgba(15,23,42,0.07)`. Pill badges for status. Brand mark = emerald gradient
  "bolt" tile.
- **Status badges (reuse exact labels/colors):**
  - Unit: **With me** (blue) · **In storage** (emerald) · **Sold** (slate) · **Returned** (amber).
  - Payment: **Paid** (emerald) · **Partial** (amber) · **Due** (red).
  - Enquiry: **Open** (amber) · **Quoted** (blue) · **Converted** (emerald) · **Lost** (slate).

---

## 4. Global shell
- **Top bar:** screen title (left), a small **sync/online dot** + seller avatar
  (right). On Home: greeting + date instead of title. Optional notification dot
  (low personal stock / new dues).
- **Bottom tab bar:** Home · Stock · **Scan** (center, raised emerald circle with
  scan icon) · Sell · More. Active tab = emerald icon + label.
- **Center Scan button** opens the **Scan hub** (full-screen camera) which routes
  the scanned serial to the right flow (collect / sell / lookup) based on a small
  mode toggle at the top of the scanner.
- **Empty / loading / error / success** states designed for every screen
  (friendly illustration + one primary action). Toasts for confirmations.

---

## 5. Screens

### 5.1 Login
Branded dark-slate background, emerald bolt logo, "Seller sign in", email +
password, sign-in button, "forgot password". Minimal. (Seller credentials are
created by the owner.)

### 5.2 Home — "My day"
Personal cockpit (today by default):
- **Greeting** + date + sync status.
- **Stat tiles (2×2):** Today's sales (₹), Today's collections (₹), Units with me,
  Outstanding dues (customers I sold to).
- **Quick actions:** big **Scan to sell**, **Collect stock**, **New customer**.
- **Lists:** recent invoices (mine), customers who owe me, low personal stock.

### 5.3 Scan hub (full-screen camera)
- Live camera viewfinder with a **scan frame** + emerald "ready" pulse.
- **Mode toggle** at top: **Sell · Collect · Look up** (decides where a scanned
  serial goes).
- On scan: bottom sheet confirms the matched **product + serial** with a clear
  **success / not-found** state; primary CTA per mode (Add to bill / Collect this
  unit / View unit). Manual **"enter serial"** + **search** fallback.
- Torch toggle, and a hint line ("Point at the barcode / IMEI").

### 5.4 Collect stock (intake to seller)
- Goal: move shop units **into the seller's hands**.
- **Scan loop:** each scanned serial appears as a **chip/row** with product +
  cost; running **count** of collected units. Manual search to add.
- Sticky bottom: **"Collect N units"** confirm. Shows which product(s).
- Success sheet → those units become **With me**.

### 5.5 Return stock
- Reverse of collect: scan/search units currently **With me**, mark **Return**
  to storage. Chips list + count + sticky **"Return N units"**. Confirm sheet.

### 5.6 My stock
- The seller's units **With me**, grouped by product (expandable to serial list).
- Each serial row: serial (mono), status pill, collected date.
- **Filters:** product/search by serial or name; status (With me / Sold / Returned).
- Tap a unit → small sheet: **Sell now** / **Return** / details.

### 5.7 New Order / Sell — key flow (full-screen, multi-step or single scroll)
Mobile billing, scanner-driven:
- **Add items:** big **Scan** strip at top ("Scan serial / barcode") + search.
  Each added line = product name, **serial** (mono), price, **per-line discount**,
  GST%, line total; swipe-to-remove.
- **Customer:** select/search, or **+ new customer** (bottom sheet). Walk-in
  allowed.
- **Bill summary (sticky/collapsible):** subtotal, **whole-bill discount**
  (₹ or %), **CGST/SGST or IGST** auto, **grand total** (big, mono).
- **Payment sheet (instant):** amount paying now, method **Cash / Online /
  Split** (two inputs); **partial → remainder auto to dues**. "Paying now" vs
  "Goes to dues" shown clearly.
- **Generate invoice** → invoice preview → **Send WhatsApp / Email / PDF / Print**.
- Optimised for scan-keeps-focus and few taps.

### 5.8 Invoice (preview & send)
- Mobile GST invoice layout (A4 feel, scrollable): business header + GSTIN +
  logo, customer + GSTIN, line items with serials, discount, CGST/SGST/IGST,
  totals, **paid / due**. Big **Send** buttons (WhatsApp / Email / PDF / Print).
- Reachable later from a sold order.

### 5.9 Customers
- Searchable list: name, phone, **outstanding due** pill. Tap → customer detail:
  contact, **dues**, invoice history (mine), **Collect payment** action.
- **+ New customer** bottom sheet (name, phone, address, GSTIN optional).

### 5.10 Dues book
- Customers who owe (from my sales), sorted by amount. Expand → unpaid invoices
  with items/serials. **Collect payment** sheet (cash / online / split, partial
  allowed; applies to oldest first).

### 5.11 Enquiries + demo bill
- Log a customer **enquiry**: pick/new customer + **products asked** (with qty) +
  note. Status: Open / Quoted / Converted / Lost.
- **Demo bill (quotation):** proforma layout — products, qty, prices, GST,
  estimated total, clearly marked **"DEMO · NOT A TAX INVOICE."** Share via
  **WhatsApp / PDF**. Converting later flows into New Order.

### 5.12 My sales (read-only)
- The seller's own performance: today / 7d / 30d toggle. Totals: **sold**,
  **collected**, **due**. List of my invoices with status pills. **No profit, no
  shop-wide analytics.**

### 5.13 Settings / account
- Profile (name, phone, email — read-only-ish), **sync status / last sync**,
  **sign out**. Minimal.

---

## 6. Key components to design
- **Bottom tab bar with center Scan FAB** (raised emerald circle, notch).
- **Scan viewfinder** (frame, ready-pulse, success/not-found sheet, torch, mode toggle).
- **Serial chip / unit row** (mono serial + status pill + action).
- **Stat tile** (label, big mono value, small sub) — compact 2-up grid.
- **Bottom sheet** (create/edit customer, payment, confirm) with drag handle.
- **Payment widget** (amount + Cash/Online/Split toggle; paying-now vs due).
- **Bill line row** (product, serial, price, discount input, total; swipe-remove).
- **Mobile invoice / quotation preview** (scrollable, share bar).
- **Status badges & money/serial mono text** (reuse owner tokens exactly).
- **Empty/loading/error/success** states + toasts.

---

## 7. Interaction & states
- **Scan = camera**, one tap from anywhere (center tab). Every scan resolves to a
  product+serial with clear **success / not-found** feedback; manual entry +
  search fallback.
- **Partial payment** pushes remainder to dues automatically.
- **Sticky bottom CTAs** for the main action on each flow (thumb reach).
- **Confirmations** for collect/return/sell and destructive actions (bottom sheet).
- Design **empty, loading, error, success** for every screen. Offline-friendly
  cues (sync dot) since sellers move around.

---

## 8. Scope notes (seller vs owner)
- **Included:** login, my-day home, scan hub, collect/return stock, my stock,
  new order → GST invoice → send, customers (create/search), dues + collect,
  enquiries + demo bill, my sales, settings/logout.
- **Excluded (owner-only):** profit, analytics, catalog (categories/products
  create-edit), serial intake to shop storage, seller management, business
  settings/backup. Sellers act on what the owner has set up.
- **Pricing:** single product price (set by owner) + sale-time **discount**
  (per-line and/or whole-bill, ₹ or %). No per-customer pricing.
- **Platform:** phone portrait, Expo / React Native; **camera scanner**
  (`expo-camera` / vision-camera). Reuses the owner app's visual system and the
  same backend API.
- Deliver: a cohesive **mobile UI** (all screens above), reusing the Apex visual
  system, and the key flows (Collect stock, Scan-to-Sell → GST invoice → send,
  Collect dues, Enquiry → demo bill).
