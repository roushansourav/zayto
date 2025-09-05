const dotenv = require('dotenv');
dotenv.config({ path: process.env.ENV_FILE || undefined });
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3006;
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Simple in-memory SSE registry keyed by orderId
const orderStreams = new Map();
function broadcastOrder(orderId, payload) {
  const set = orderStreams.get(String(orderId));
  if (!set) return;
  for (const res of set) {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }
}

async function ensureSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL,
        user_email TEXT,
        status TEXT NOT NULL DEFAULT 'NEW',
        total_cents INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        price_cents INTEGER NOT NULL,
        qty INTEGER NOT NULL
      );
    `);
  } finally { client.release(); }
}

function requirePartnerRole(req, res, next) {
  try {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Missing token' });
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const decoded = jwt.verify(token, secret);
    if (!decoded || decoded.role !== 'partner') return res.status(403).json({ success: false, error: 'Forbidden' });
    req.user = decoded;
    next();
  } catch { return res.status(401).json({ success: false, error: 'Invalid token' }); }
}

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'orders', timestamp: new Date().toISOString() }));

// Partner endpoints (simplified)
app.get('/partner/orders', requirePartnerRole, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, data: result.rows });
  } catch { res.status(500).json({ success: false, error: 'Error listing orders' }); }
  finally { client.release(); }
});

app.post('/partner/orders/:id/status', requirePartnerRole, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  const client = await pool.connect();
  try {
    await client.query('UPDATE orders SET status=$1 WHERE id=$2', [status, id]);
    // Notify SSE listeners
    broadcastOrder(id, { type: 'status', status });
    // Fire-and-forget push (best-effort)
    try {
      const base = process.env.NOTIFICATIONS_BASE || 'http://notifications-service:3007';
      fetch(`${base}/notifications/push/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Order update', body: `Order #${id} is ${status}` }) }).catch(()=>{});
    } catch {}
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, error: 'Error updating status' }); }
  finally { client.release(); }
});

// User endpoints
function requireUser(req, res, next) {
  try {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Missing token' });
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; next();
  } catch { return res.status(401).json({ success: false, error: 'Invalid token' }); }
}

app.post('/orders', requireUser, async (req, res) => {
  const { restaurant_id, items } = req.body || {};
  if (!restaurant_id || !Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, error: 'Invalid payload' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const subtotal = items.reduce((s, it) => s + (it.price_cents || 0) * (it.qty || 1), 0);
    const o = await client.query('INSERT INTO orders (restaurant_id, user_email, status, total_cents) VALUES ($1,$2,$3,$4) RETURNING *', [restaurant_id, req.user.email || null, 'NEW', subtotal]);
    for (const it of items) {
      await client.query('INSERT INTO order_items (order_id, name, price_cents, qty) VALUES ($1,$2,$3,$4)', [o.rows[0].id, it.name, it.price_cents, it.qty || 1]);
    }
    await client.query('COMMIT');
    // Inform any listeners
    broadcastOrder(o.rows[0].id, { type: 'created', order: o.rows[0] });
    res.status(201).json({ success: true, data: o.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: 'Error creating order' });
  } finally { client.release(); }
});

app.get('/orders', requireUser, async (req, res) => {
  const client = await pool.connect();
  try {
    const r = await client.query('SELECT * FROM orders WHERE user_email = $1 ORDER BY created_at DESC LIMIT 50', [req.user.email || null]);
    res.json({ success: true, data: r.rows });
  } catch { res.status(500).json({ success: false, error: 'Error listing orders' }); }
  finally { client.release(); }
});

app.get('/orders/:id', requireUser, async (req, res) => {
  const id = Number(req.params.id);
  const client = await pool.connect();
  try {
    const o = await client.query('SELECT * FROM orders WHERE id=$1', [id]);
    const items = await client.query('SELECT * FROM order_items WHERE order_id=$1', [id]);
    res.json({ success: true, data: { ...o.rows[0], items: items.rows } });
  } catch { res.status(500).json({ success: false, error: 'Error fetching order' }); }
  finally { client.release(); }
});

// Reorder: duplicates items into a new NEW order
app.post('/orders/:id/reorder', requireUser, async (req, res) => {
  const id = Number(req.params.id);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const o = await client.query('SELECT * FROM orders WHERE id=$1', [id]);
    if (!o.rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ success: false, error: 'Order not found' }); }
    const items = await client.query('SELECT * FROM order_items WHERE order_id=$1', [id]);
    const subtotal = items.rows.reduce((s, it) => s + (it.price_cents || 0) * (it.qty || 1), 0);
    const n = await client.query('INSERT INTO orders (restaurant_id, user_email, status, total_cents) VALUES ($1,$2,$3,$4) RETURNING *', [o.rows[0].restaurant_id, req.user.email || null, 'NEW', subtotal]);
    for (const it of items.rows) {
      await client.query('INSERT INTO order_items (order_id, name, price_cents, qty) VALUES ($1,$2,$3,$4)', [n.rows[0].id, it.name, it.price_cents, it.qty]);
    }
    await client.query('COMMIT');
    broadcastOrder(n.rows[0].id, { type: 'created', order: n.rows[0] });
    res.status(201).json({ success: true, data: n.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: 'Error reordering' });
  } finally { client.release(); }
});

// Cancel: allowed only if status NEW or ACCEPTED
app.post('/orders/:id/cancel', requireUser, async (req, res) => {
  const id = Number(req.params.id);
  const client = await pool.connect();
  try {
    const o = await client.query('SELECT status FROM orders WHERE id=$1', [id]);
    if (!o.rowCount) return res.status(404).json({ success: false, error: 'Order not found' });
    if (!['NEW', 'ACCEPTED'].includes(o.rows[0].status)) return res.status(400).json({ success: false, error: 'Cannot cancel at current status' });
    await client.query('UPDATE orders SET status=$1 WHERE id=$2', ['CANCELLED', id]);
    broadcastOrder(id, { type: 'status', status: 'CANCELLED' });
    try {
      const base = process.env.NOTIFICATIONS_BASE || 'http://notifications-service:3007';
      fetch(`${base}/notifications/push/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Order cancelled', body: `Order #${id} was cancelled` }) }).catch(()=>{});
    } catch {}
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, error: 'Error cancelling order' }); }
  finally { client.release(); }
});

// Pay stub: mark as PAID from NEW
app.post('/orders/:id/pay', requireUser, async (req, res) => {
  const id = Number(req.params.id);
  const client = await pool.connect();
  try {
    const o = await client.query('SELECT status FROM orders WHERE id=$1', [id]);
    if (!o.rowCount) return res.status(404).json({ success: false, error: 'Order not found' });
    if (o.rows[0].status !== 'NEW') return res.status(400).json({ success: false, error: 'Only NEW orders can be paid' });
    await client.query('UPDATE orders SET status=$1 WHERE id=$2', ['PAID', id]);
    broadcastOrder(id, { type: 'status', status: 'PAID' });
    try {
      const base = process.env.NOTIFICATIONS_BASE || 'http://notifications-service:3007';
      fetch(`${base}/notifications/push/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Payment received', body: `Order #${id} is paid` }) }).catch(()=>{});
    } catch {}
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, error: 'Error paying order' }); }
  finally { client.release(); }
});

// SSE stream for a specific order id
app.get('/orders/:id/stream', requireUser, async (req, res) => {
  const orderId = String(req.params.id);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  res.write('retry: 5000\n\n');

  let set = orderStreams.get(orderId);
  if (!set) { set = new Set(); orderStreams.set(orderId, set); }
  set.add(res);

  req.on('close', () => {
    set.delete(res);
    if (set.size === 0) orderStreams.delete(orderId);
  });
});

// Payment initiate stub: returns a mock payment URL or intent id
app.post('/payments/initiate', requireUser, async (req, res) => {
  if ((process.env.ENABLE_PAYMENTS || 'true') !== 'true') return res.status(503).json({ success: false, error: 'Payments disabled' });
  const { provider, order_id } = req.body || {};
  if (!provider || !order_id) return res.status(400).json({ success: false, error: 'provider and order_id required' });
  const supported = ['stripe','paypal','telr','paytabs','aps','upi','phonepe','paytm'];
  if (!supported.includes(String(provider))) return res.status(400).json({ success: false, error: 'Unsupported provider' });
  // In real impl: create intent/session with provider SDK
  const redirectUrl = `https://payments.example/${provider}/checkout?order=${order_id}`;
  return res.json({ success: true, data: { provider, order_id, redirectUrl } });
});

// Webhook stubs per provider (signature verification placeholders)
function ok(res) { try { res.json({ received: true }); } catch {} }

app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  // TODO: verify signature header 'stripe-signature' with secret
  ok(res);
});

app.post('/webhooks/paypal', express.json(), (req, res) => {
  const secret = process.env.PAYPAL_WEBHOOK_SECRET || '';
  // TODO: verify transmission using PayPal headers
  ok(res);
});

app.post('/webhooks/telr', express.urlencoded({ extended: false }), (req, res) => {
  const secret = process.env.TELR_WEBHOOK_SECRET || '';
  // TODO: verify
  ok(res);
});

app.post('/webhooks/paytabs', express.json(), (req, res) => {
  const secret = process.env.PAYTABS_WEBHOOK_SECRET || '';
  // TODO: verify
  ok(res);
});

app.post('/webhooks/aps', express.json(), (req, res) => {
  const secret = process.env.APS_WEBHOOK_SECRET || '';
  // TODO: verify
  ok(res);
});

app.post('/webhooks/upi', express.json(), (req, res) => {
  const secret = process.env.UPI_WEBHOOK_SECRET || '';
  // TODO: verify
  ok(res);
});

app.post('/webhooks/phonepe', express.json(), (req, res) => {
  const secret = process.env.PHONEPE_WEBHOOK_SECRET || '';
  // TODO: verify
  ok(res);
});

app.post('/webhooks/paytm', express.json(), (req, res) => {
  const secret = process.env.PAYTM_WEBHOOK_SECRET || '';
  // TODO: verify
  ok(res);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, async () => {
    await ensureSchema();
    console.log(`Orders service listening on ${port}`);
  });
}

module.exports = app;


