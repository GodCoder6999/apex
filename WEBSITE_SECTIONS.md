# Apex Electronics — Owner Website · Sections & What They Do

Reference for every tab/screen in the owner web app, what it does, and the data
it touches. Routes are hash-based (`/#/...`). Source: `src/screens/`.

---

## Global shell (every screen)
- **Sidebar** (`components/Sidebar.tsx`) — dark-slate nav grouped into Overview /
  Catalog / Inventory / Sales / Insights / Manage. Active item highlighted in
  emerald. Live **badges**: low-stock count (Stock), open-enquiry count
  (Enquiries), customers-owing count (Dues).
- **Top bar** (`components/Topbar.tsx`):
  - **Global search** — instant lookup across products, serials, customers,
    invoices; click a result jumps to its screen.
  - **Scanner-ready pill** — indicates a USB scanner types into the focused field.
  - **New Order** button — jumps to billing.
  - **Notification bell** — live dropdown: low stock, customer dues, open
    enquiries; red dot until opened; rows deep-link to the screen.
- **Toasts** for every save/delete/collect action.

---

## 1. Dashboard — `/`
Owner cockpit (today at a glance).
- **6 stat tiles:** Today's sales, Today's collections, Outstanding dues, Units
  in stock, Low-stock items, Today's profit.
- **Sales-trend chart** (last 30 days, animated area+line).
- **Top categories** bars (by in-stock value).
- **Recent invoices** list (status pills) → Invoices.
- **Low stock** list → Stock.
- Quick actions: Add Stock, Add Product.

## 2. Categories — `/categories` (Catalog)
- Grid of categories with product count + active state.
- **New Category** (modal). **Delete** (guarded — blocked if products still use it).

## 3. Products — `/products` (Catalog)
- Table: product (photo/initials thumb), brand, price, GST%, in-stock badge.
- **Search** + **category filter** chips.
- **New / Edit Product** (modal): barcode (scan field), name, category, brand,
  specs, price, cost price, GST%, HSN, **optional photo upload**, save/delete.
- Row → **detail side-panel**: full info + unit list + Edit / Delete.

## 4. Stock / Units — `/stock` (Inventory)
- Serial-tracked inventory grouped by product (expand to serial rows).
- Each unit row: serial (mono), cost, **status** (In storage / With seller /
  Sold / Returned), held-by seller, added date.
- **Search** by serial **or product/brand**; **status filter** pills with counts.

## 5. Add Stock — `/intake` (Inventory)
- Pick a product, then **scan each serial** (or type) to add units to storage.
- Scanned serials appear as chips with cost; running count.
- **Intake summary** (units, cost/unit, total) + **Commit** → units become
  In storage.

## 6. New Order — `/order` (Sales) — key billing screen
- **Left:** scan/search to add a **specific unit (serial)** as a bill line;
  per-line discount; swipe/remove.
- **Right:** customer select / **+ new**; subtotal; **whole-bill discount**
  (₹ or %); **CGST/SGST or IGST** auto-calc; **grand total**.
- **Payment block:** paying now; **Cash / Online / Split**; **partial →
  remainder auto to dues**.
- **Generate Invoice** → preview → **WhatsApp / Email / PDF / Print**. Sold units
  flip to Sold; payment recorded.

## 7. Enquiries — `/enquiries` (Sales)
- Log customer enquiries: customer (pick/new) + **products asked** (with qty) +
  note. **Status** workflow: Open / Quoted / Converted / Lost.
- Search + status filter; est. total per enquiry.
- Row → detail panel: items, status buttons, **Demo bill** (proforma quotation,
  marked *not a tax invoice*, sendable via WhatsApp/print), delete.
- Open count shows as sidebar + notification badge.

## 8. Invoices — `/invoices` (Sales)
- Table of all invoices: no., date, customer, total, paid, due, seller, status
  pill. Search + status filter (all/paid/partial/due).
- Row → **GST invoice preview** (business header + GSTIN, customer, line items
  with serials, tax split, totals, paid/due) → send WhatsApp/Email/PDF/Print.

## 9. Customers — `/customers` (Sales)
- Table: name, phone, GSTIN, outstanding due. Search.
- **New / Edit Customer** (modal): name, phone, address, GSTIN.
- Row → detail panel: outstanding + invoice count, invoice history,
  **Collect payment**, edit.

## 10. Dues — `/dues` (Sales)
- Customers who owe, sorted by amount; total outstanding.
- Expand → unpaid invoices (date, items, paid/total, due).
- **Collect payment** (cash / online / split) — applied to oldest dues first.

## 11. Profit — `/profit` (Insights)
- **Today** (default) / 7d / 30d / 90d / 1y range.
- Revenue − unit cost − discounts = **net profit** (tax shown separately, not
  counted as profit).
- Breakdown bars by **category** + table of **top products by profit**.

## 12. Analytics — `/analytics` (Insights)
- Totals: sales, collected, outstanding dues, **stock value**.
- Weekly sales bar chart (12 weeks).
- **Seller performance** bars.
- **Top products** ranking — top 10 + **View all** toggle; switch metric
  **units / revenue**.

## 13. Sellers — `/sellers` (Manage)
- Table: seller, phone, sold, collected, due, status. Search.
- **Add Seller** (modal): name, phone, **email + password** (seller-app login).
- Row → detail panel: sold/collected/due + **stock currently held** (serials).

## 14. Settings — `/settings` (Manage)
- **Business profile** for invoices: name, address, GSTIN, state, phone, invoice
  prefix, default tax. Logo placeholder.
- **Backup card:** export data as JSON; reset demo data to seed.

---

## Data model (behind the screens)
`src/data/types.ts` collections: **settings, categories, products, units,
customers, sellers, orders, payments, enquiries** (+ invoice counter).
- Today on a **mock store** (`db.ts`, in browser localStorage).
- Ready to flip to the **Hostinger PHP + MySQL API** (`server/`) by setting
  `VITE_API_BASE` — screens unchanged. See `server/README.md`.

## Excluded from seller mobile app (owner-only)
Profit, Analytics, Categories/Products management, Add-Stock intake, Sellers
management, Settings/Backup. Sellers get: collect/return stock, sell + invoice,
customers, dues, enquiries, my-sales. See `seller-mobile-design.md`.
