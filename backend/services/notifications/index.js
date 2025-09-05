const dotenv = require('dotenv');
dotenv.config({ path: process.env.ENV_FILE || undefined });
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3007;
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS push_tokens (
        id SERIAL PRIMARY KEY,
        user_email TEXT,
        platform TEXT,
        token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } finally { client.release(); }
}

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

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'notifications', timestamp: new Date().toISOString() }));

app.post('/notifications/push/register', requireUser, async (req, res) => {
  const { token, platform } = req.body || {};
  if (!token) return res.status(400).json({ success: false, error: 'token required' });
  const client = await pool.connect();
  try {
    await client.query('INSERT INTO push_tokens (user_email, platform, token) VALUES ($1,$2,$3)', [req.user.email || null, platform || null, token]);
    res.status(201).json({ success: true });
  } catch { res.status(500).json({ success: false, error: 'Error registering token' }); }
  finally { client.release(); }
});

// Admin/test endpoint to send push to all tokens (mock; integrate with Expo push API)
app.post('/notifications/push/send', async (req, res) => {
  const { title, body } = req.body || {};
  const client = await pool.connect();
  try {
    const r = await client.query('SELECT token FROM push_tokens ORDER BY id DESC LIMIT 1000');
    const tokens = r.rows.map(x => x.token);
    console.log('Sending push to', tokens.length, 'devices:', { title, body });
    // TODO: integrate with Expo push service
    res.json({ success: true, sent: tokens.length });
  } catch { res.status(500).json({ success: false, error: 'Error sending push' }); }
  finally { client.release(); }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, async () => {
    await ensureSchema();
    console.log(`Notifications service listening on ${port}`);
  });
}

module.exports = app;


