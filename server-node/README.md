# S&D Solution — Shared API (temporary, free, on Render)

Connects all apps **now**, without Hostinger. Node + Postgres, same endpoints as
the Hostinger PHP API (`server/`) — so swapping later = just change the URL.

## Deploy (one click, uses your existing Render)
1. Render → **New + → Blueprint** → pick this GitHub repo → **Apply**.
   It reads `server-node/render.yaml` and provisions a **free Postgres** + the
   **Node web service** (auto-seeds the demo catalog on first boot).
2. Wait until the service is **Live**. Copy its URL, e.g.
   `https://snd-shared-api.onrender.com`.
3. Test: open `<URL>/api/bootstrap` → should return JSON.
4. **Send me that URL.** I set it in every app and redeploy / OTA:
   - `VITE_API_BASE=<URL>` → owner website + customer store
   - `EXPO_PUBLIC_API_BASE=<URL>` → owner + seller apps

Then everything is **shared & live**: products the owner adds appear in the
shop and seller app; customer orders land in owner/seller **Enquiries**; stock,
dues and invoices are one source of truth.

## Notes
- Render **free** web service sleeps after ~15 min idle → first request after a
  nap takes ~30–50s to wake. Fine for now.
- Free Postgres is durable for development. Move to Hostinger MySQL later by
  deploying `server/` and pointing the apps at that URL instead — no app code
  changes (identical endpoints).
- CORS is open for development; lock it to your domains for production.

## Endpoints (same shape as the PHP API)
`GET /api/bootstrap` · `GET|POST /api/<resource>` · `GET|PUT|DELETE
/api/<resource>/:id` · `POST /api/orders` · `POST /api/payments/collect` ·
`GET|PUT /api/settings` · `POST /api/auth/seller`
(resources: categories, products, units, customers, sellers, orders, payments,
enquiries)
