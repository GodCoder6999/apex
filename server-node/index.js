// Shared API for S&D Solution — owner web, owner/seller apps, and the storefront
// all talk to this. Postgres, JSONB doc-per-row. Same endpoints as the Hostinger
// PHP API so swapping later = just change the URL. CORS open (dev).
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import * as seed from './seed.js';

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

const RESOURCES = ['categories', 'products', 'units', 'customers', 'sellers', 'orders', 'payments', 'enquiries'];
const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

async function init() {
  for (const r of RESOURCES) {
    await pool.query(`CREATE TABLE IF NOT EXISTS ${r} (id text PRIMARY KEY, doc jsonb NOT NULL, updated_at timestamptz DEFAULT now())`);
  }
  await pool.query(`CREATE TABLE IF NOT EXISTS settings (id int PRIMARY KEY, doc jsonb NOT NULL)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS counters (name text PRIMARY KEY, value int NOT NULL)`);

  const { rows } = await pool.query('SELECT count(*)::int AS n FROM products');
  if (rows[0].n === 0) {
    console.log('Seeding shared DB…');
    for (const c of seed.categories) await upsert('categories', c);
    for (const p of seed.products) await upsert('products', p);
    for (const u of seed.units) await upsert('units', u);
    for (const c of seed.customers) await upsert('customers', c);
    for (const s of seed.sellers) await upsert('sellers', s);
    await pool.query(`INSERT INTO settings (id, doc) VALUES (1, $1) ON CONFLICT (id) DO NOTHING`, [seed.settings]);
    await pool.query(`INSERT INTO counters (name, value) VALUES ('invoice', 38) ON CONFLICT (name) DO NOTHING`);
  }
}
async function upsert(table, doc) {
  await pool.query(`INSERT INTO ${table} (id, doc, updated_at) VALUES ($1,$2,now())
    ON CONFLICT (id) DO UPDATE SET doc = EXCLUDED.doc, updated_at = now()`, [doc.id, doc]);
  return doc;
}
async function list(table) { const { rows } = await pool.query(`SELECT doc FROM ${table} ORDER BY updated_at DESC`); return rows.map((r) => r.doc); }
async function getOne(table, id) { const { rows } = await pool.query(`SELECT doc FROM ${table} WHERE id=$1`, [id]); return rows[0]?.doc ?? null; }

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => { console.error(e); res.status(500).json({ error: String(e.message || e) }); });

app.get('/', (_req, res) => res.json({ ok: true, service: 'snd-shared-api' }));

app.get('/api/bootstrap', wrap(async (_req, res) => {
  const out = {};
  for (const r of RESOURCES) out[r] = await list(r);
  const s = await pool.query('SELECT doc FROM settings WHERE id=1');
  out.settings = s.rows[0]?.doc ?? seed.settings;
  res.json(out);
}));

// settings
app.get('/api/settings', wrap(async (_req, res) => { const s = await pool.query('SELECT doc FROM settings WHERE id=1'); res.json(s.rows[0]?.doc ?? seed.settings); }));
app.put('/api/settings', wrap(async (req, res) => { await pool.query(`INSERT INTO settings (id,doc) VALUES (1,$1) ON CONFLICT (id) DO UPDATE SET doc=$1`, [req.body]); res.json({ ok: true }); }));
app.post('/api/settings', wrap(async (req, res) => { await pool.query(`INSERT INTO settings (id,doc) VALUES (1,$1) ON CONFLICT (id) DO UPDATE SET doc=$1`, [req.body]); res.json({ ok: true }); }));

// seller login
app.post('/api/auth/seller', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  const sellers = await list('sellers');
  const s = sellers.find((x) => x.active && (x.email || '').toLowerCase() === String(email || '').toLowerCase() && x.password === password);
  if (!s) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ id: s.id, name: s.name, email: s.email, role: 'seller' });
}));

// next invoice number (atomic)
async function nextInvoiceNo() {
  const { rows } = await pool.query(`UPDATE counters SET value = value + 1 WHERE name='invoice' RETURNING value`);
  const seq = rows[0]?.value ?? 39;
  const s = await pool.query('SELECT doc FROM settings WHERE id=1');
  const prefix = s.rows[0]?.doc?.invoicePrefix || 'SND';
  return `${prefix}/26-27/${String(seq).padStart(4, '0')}`;
}

// create order: totals + mark units sold + payment
app.post('/api/orders', wrap(async (req, res) => {
  const b = req.body || {};
  const lines = b.lines || [];
  if (!lines.length) return res.status(400).json({ error: 'No items' });
  const subTotal = lines.reduce((s, l) => s + Number(l.price), 0);
  const lineDisc = lines.reduce((s, l) => s + Number(l.discount || 0), 0);
  const taxTotal = lines.reduce((s, l) => s + Number(l.taxAmt || 0), 0);
  const discountTotal = lineDisc + Number(b.discountTotal || 0);
  const grandTotal = subTotal - discountTotal + taxTotal;
  const paidNow = Math.min(Number(b.paidNow || 0), grandTotal);
  const order = {
    id: uid('o'), invoiceNo: await nextInvoiceNo(), customerId: b.customerId || null, lines,
    subTotal, discountTotal, taxTotal, grandTotal, paidNow, due: grandTotal - paidNow,
    soldBy: b.soldBy || 'owner', method: b.method || 'cash', createdAt: Date.now(),
  };
  await upsert('orders', order);
  for (const l of lines) if (l.serial) {
    const un = (await list('units')).find((x) => x.serial === l.serial);
    if (un) await upsert('units', { ...un, status: 'sold', soldOrderId: order.id });
  }
  if (paidNow > 0) await upsert('payments', { id: uid('pay'), customerId: order.customerId, orderId: order.id, amount: paidNow, method: order.method, collectedBy: order.soldBy, forDue: false, at: order.createdAt });
  res.status(201).json(order);
}));

// collect against oldest dues
app.post('/api/payments/collect', wrap(async (req, res) => {
  const { customerId, amount, method } = req.body || {};
  if (!customerId || !(amount > 0)) return res.status(400).json({ error: 'customerId & amount required' });
  let remaining = Number(amount);
  const orders = (await list('orders')).filter((o) => o.customerId === customerId && o.due > 0).sort((a, b) => a.createdAt - b.createdAt);
  for (const o of orders) { if (remaining <= 0) break; const pay = Math.min(o.due, remaining); remaining -= pay; await upsert('orders', { ...o, paidNow: o.paidNow + pay, due: o.due - pay }); }
  await upsert('payments', { id: uid('pay'), customerId, orderId: null, amount: Number(amount), method: method || 'cash', collectedBy: 'owner', forDue: true, at: Date.now() });
  res.json({ ok: true });
}));

// generic CRUD for the resources
for (const r of RESOURCES) {
  app.get(`/api/${r}`, wrap(async (_req, res) => res.json(await list(r))));
  app.get(`/api/${r}/:id`, wrap(async (req, res) => { const d = await getOne(r, req.params.id); d ? res.json(d) : res.status(404).json({ error: 'Not found' }); }));
  app.post(`/api/${r}`, wrap(async (req, res) => {
    const doc = { ...req.body };
    if (!doc.id) doc.id = uid(r.slice(0, 2));
    if (r === 'enquiries') { doc.status = doc.status || 'open'; if (!doc.createdAt) doc.createdAt = Date.now(); }
    res.status(201).json(await upsert(r, doc));
  }));
  app.put(`/api/${r}/:id`, wrap(async (req, res) => {
    const existing = await getOne(r, req.params.id);
    const doc = { ...(existing || {}), ...req.body, id: req.params.id };
    res.json(await upsert(r, doc));
  }));
  app.delete(`/api/${r}/:id`, wrap(async (req, res) => {
    await pool.query(`DELETE FROM ${r} WHERE id=$1`, [req.params.id]);
    if (r === 'products') await pool.query(`DELETE FROM units WHERE doc->>'productId' = $1`, [req.params.id]);
    res.json({ ok: true });
  }));
}

// Listen IMMEDIATELY so Render's health check on `/` passes; seed the DB in the
// background. (Blocking listen on init() can stall the deploy for many minutes
// while tables/seed rows are created, and a slow/failed DB connect would mean
// the port never opens at all.)
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('snd-shared-api on :' + port));

init().then(() => console.log('DB ready'))
  .catch((e) => console.error('init failed:', e));
