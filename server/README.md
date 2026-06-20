# Apex — Hostinger Backend (PHP + MySQL)

Backend the website (and later the mobile apps) talk to. **Not wired yet** — the
website still runs on its built-in mock data until you set `VITE_API_BASE`.
Everything here is ready for that switch.

```
server/
  schema.sql                  MySQL tables (import first)
  seed.sql                    optional demo catalog/sellers/customers
  api/
    index.php                 REST front controller (all routes)
    config.php                PDO + CORS + helpers
    db_credentials.sample.php → copy to db_credentials.php and fill in
    .htaccess                 routing + protects credentials
```

## API surface
Base: `https://<your-site>/api`

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/bootstrap` | every collection in one payload (used to hydrate the app) |
| GET | `/<resource>` | list (products, units, customers, sellers, categories, orders, payments, enquiries) |
| GET | `/<resource>/<id>` | one row |
| POST | `/<resource>` | create (send the app-shaped object; `id` optional) |
| PUT | `/<resource>/<id>` | update |
| DELETE | `/<resource>/<id>` | delete (deleting a product also drops its units) |
| GET/PUT | `/settings` | business profile (single row) |
| POST | `/orders` | create order — computes totals, marks units `sold`, records the payment, assigns the next invoice no. |
| POST | `/payments/collect` | `{customerId, amount, method}` — applies to oldest dues first |
| POST | `/auth/seller` | `{email, password}` — seller-app login check (bcrypt) |

Field names are camelCase in JSON (e.g. `categoryId`, `gstRate`, `createdAt`);
the API maps them to snake_case columns. Money is numeric ₹, timestamps are
epoch-milliseconds — identical to `src/data/types.ts`.

## Deploy on Hostinger
1. **Create the database** — hPanel → Databases → *MySQL Databases*. Note the DB
   name, user, password, host.
2. **Import the schema** — open *phpMyAdmin* → select the DB → Import → upload
   `schema.sql`. Optionally import `seed.sql` for demo data.
3. **Upload the API** — put the `api/` folder into `public_html/` so it serves at
   `https://<your-site>/api/`. (File Manager or FTP.)
4. **Add credentials** — copy `db_credentials.sample.php` to
   `db_credentials.php` in `api/` and fill in the DB details from step 1. Set
   `cors_origins` to your website origin (or `*` while testing).
5. **Test** — visit `https://<your-site>/api/bootstrap` → you should get JSON.

## Point the website at it
1. In the project root: copy `.env.example` → `.env`, set
   `VITE_API_BASE=https://<your-site>` (no trailing slash, no `/api`).
2. `npm run build` and redeploy `dist/`.
3. On boot the app calls `/api/bootstrap` and runs fully on MySQL; every
   create/update/delete now persists through the API. Unset `VITE_API_BASE` to
   fall back to mock instantly.

## Security notes (before real client data)
- Seller passwords are **bcrypt-hashed** on write via the API. `seed.sql` ships
  plain demo passwords; they re-hash the first time a seller is saved from the UI.
- Add an auth layer (token check in `config.php`) before exposing write
  endpoints publicly — the current build is open for development.
- Keep `db_credentials.php` out of git (already git-ignored) and unreadable over
  HTTP (the `.htaccess` denies it).
