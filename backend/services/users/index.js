const dotenv = require('dotenv');
dotenv.config({ path: process.env.ENV_FILE || undefined });
const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());

// In-memory stores for demo; replace with DB/Redis in production
const users = new Map(); // key: id/email, value: { id, email, name, password?, provider }
const phoneOtps = new Map(); // key: phone, value: { code, expiresAt }

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_do_not_use_in_prod';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const ALLOW_DEV_OAUTH = (process.env.ALLOW_DEV_OAUTH || 'true').toLowerCase() === 'true';
const APPLE_AUDIENCE = process.env.APPLE_AUDIENCE || undefined;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'users', timestamp: new Date().toISOString() });
});

// Register
app.post('/register', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: 'email, password, and name are required' });
  }
  if (users.has(email)) {
    return res.status(409).json({ success: false, error: 'User already exists' });
  }
  const id = uuidv4();
  users.set(email, { id, email, password, name, provider: 'password' });
  const token = jwt.sign({ sub: id, email }, JWT_SECRET, { expiresIn: '1h' });
  return res.status(201).json({ success: true, data: { id, email, name, token } });
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'email and password are required' });
  }
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: user.id, email }, JWT_SECRET, { expiresIn: '1h' });
  return res.json({ success: true, data: { token } });
});

// Profile (demo: use x-user-email header)
app.get('/profile', (req, res) => {
  const email = req.header('x-user-email');
  if (!email) {
    return res.status(401).json({ success: false, error: 'Missing x-user-email header' });
  }
  const user = users.get(email);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  return res.json({ success: true, data: { email: user.email, name: user.name } });
});

// Google OAuth
app.post('/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ success: false, error: 'idToken is required' });
    }
    let email = '';
    let name = '';
    if (googleClient && GOOGLE_CLIENT_ID) {
      const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      email = payload?.email || '';
      name = payload?.name || payload?.given_name || '';
    } else if (ALLOW_DEV_OAUTH) {
      // Dev fallback (no verification); DO NOT use in production
      email = `dev_${uuidv4()}@example.com`;
      name = 'Google User';
    } else {
      return res.status(401).json({ success: false, error: 'OAuth verification disabled without GOOGLE_CLIENT_ID' });
    }
    if (!email) {
      return res.status(400).json({ success: false, error: 'Unable to resolve email from token' });
    }
    let user = users.get(email);
    if (!user) {
      user = { id: uuidv4(), email, name, provider: 'google' };
      users.set(email, user);
    }
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ success: true, data: { token, user: { id: user.id, email: user.email, name: user.name } } });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid Google token' });
  }
});

// Apple Sign-in (expects identityToken)
app.post('/auth/apple', async (req, res) => {
  try {
    const { identityToken } = req.body || {};
    if (!identityToken) {
      return res.status(400).json({ success: false, error: 'identityToken is required' });
    }
    let email = '';
    let name = '';
    try {
      const payload = await appleSignin.verifyIdToken(identityToken, {
        audience: APPLE_AUDIENCE,
      });
      email = payload?.email || '';
      name = 'Apple User';
    } catch (e) {
      if (!ALLOW_DEV_OAUTH) {
        return res.status(401).json({ success: false, error: 'Invalid Apple token' });
      }
      // Dev fallback if verification fails/missing config
      email = `dev_${uuidv4()}@apple.example.com`;
      name = 'Apple User';
    }
    if (!email) {
      return res.status(400).json({ success: false, error: 'Unable to resolve email from token' });
    }
    let user = users.get(email);
    if (!user) {
      user = { id: uuidv4(), email, name, provider: 'apple' };
      users.set(email, user);
    }
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ success: true, data: { token, user: { id: user.id, email: user.email, name: user.name } } });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid Apple token' });
  }
});

// Phone OTP - request
app.post('/auth/otp/request', (req, res) => {
  const { phone } = req.body || {};
  if (!phone) {
    return res.status(400).json({ success: false, error: 'phone is required' });
  }
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  phoneOtps.set(phone, { code, expiresAt });
  const body = { success: true, data: { phone } };
  if (process.env.NODE_ENV !== 'production') body.data.code = code;
  return res.json(body);
});

// Phone OTP - verify
app.post('/auth/otp/verify', (req, res) => {
  const { phone, code } = req.body || {};
  if (!phone || !code) {
    return res.status(400).json({ success: false, error: 'phone and code are required' });
  }
  const entry = phoneOtps.get(phone);
  if (!entry || entry.code !== code || Date.now() > entry.expiresAt) {
    return res.status(401).json({ success: false, error: 'Invalid or expired code' });
  }
  phoneOtps.delete(phone);
  let email = `${phone}@phone.local`;
  let user = users.get(email);
  if (!user) {
    user = { id: uuidv4(), email, name: `User ${phone}`, provider: 'phone' };
    users.set(email, user);
  }
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  return res.json({ success: true, data: { token, user: { id: user.id, email: user.email, name: user.name } } });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Users service listening on port ${port}`);
  });
}

module.exports = app;


