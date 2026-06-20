# Apex Electronics — Owner Web App

Responsive, desktop-first **owner dashboard** for a retail electronics shop
(serial-tracked inventory, GST billing, sellers, customers, dues, profit).

Built as a **static React SPA** — no backend required. Data currently runs on a
**mock layer** (in-memory + `localStorage`), shaped exactly like the future
Firestore model so swapping in Firebase later means changing one file.

## Stack
- **React 19 + Vite + TypeScript** (plain DOM — matches the Apex design 1:1)
- **react-router-dom** (HashRouter → works on any static host, no rewrites)
- No CSS framework: design tokens in `src/theme.ts`, Geist font via Google Fonts

> Why not PHP? This is a single-page React app. PHP would mean rewriting the
> whole UI and running a server runtime. The static build below needs **no
> server** — it drops onto Render or Hostinger as plain files.

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs static site to dist/
npm run preview  # serve the production build
```

## Project layout
```
src/
  theme.ts            design tokens (colors, radius, shadow, status badges)
  icons.tsx           SVG icon sprite + <Icon/>
  ui.tsx              Card, Badge, Btn, fields, Modal, SidePanel, Toast
  format.ts           ₹ / date formatting
  nav.ts              sidebar nav config
  data/
    types.ts          Firestore-shaped domain model
    seed.ts           mock dataset (electronics retail sample)
    db.ts             mock store + live hooks + mutations  ← swap for Firestore
  components/         Shell, Sidebar, Topbar, InvoicePreview, modals
  screens/            Dashboard, Products, Categories, Stock, Intake,
                      NewOrder, Invoices, Customers, Dues, Sellers,
                      Profit, Analytics, Settings
```

## Deploy

### Render (test) — Static Site
1. Push this folder to a GitHub repo.
2. Render → **New + → Static Site** → select the repo.
3. Build command `npm run build`, publish dir `dist` (or just rely on
   `render.yaml`, already included). Deploy.

### Hostinger (production)
1. `npm run build`.
2. Upload the **contents of `dist/`** into `public_html` (File Manager or FTP).
   Works on the cheapest shared plan — it's static files. HashRouter means
   deep links work with no `.htaccess` rewrite.

## Swapping mock → Firebase (later)
Replace `src/data/db.ts` with Firestore reads/writes (keep the same exported
hook + function names). `types.ts` already matches the planned collections
(`products`, `units`, `customers`, `orders`, `payments`, …). Nothing in
`screens/` needs to change.
