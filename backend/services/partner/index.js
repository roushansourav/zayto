const dotenv = require('dotenv');
dotenv.config({ path: process.env.ENV_FILE || undefined });
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
const port = process.env.PORT || 3005;
app.use(express.json());

// Storage config
const STORAGE_DRIVER = process.env.STORAGE_DRIVER || 'local'; // local|s3
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
if (STORAGE_DRIVER === 'local') {
  if (!fs.existsSync(UPLOAD_DIR)) {
    try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }); } catch {}
  }
  app.use('/uploads', express.static(UPLOAD_DIR));
}

const s3 = STORAGE_DRIVER === 's3' ? new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: Boolean(process.env.S3_FORCE_PATH_STYLE) || false,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
}) : null;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        owner_user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        logo_url TEXT,
        cover_url TEXT,
        address TEXT,
        city TEXT,
        lat DOUBLE PRECISION,
        lon DOUBLE PRECISION,
        is_open BOOLEAN DEFAULT false,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS business_hours (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        open_time TIME,
        close_time TIME,
        is_closed BOOLEAN DEFAULT false
      );
      CREATE TABLE IF NOT EXISTS menu_categories (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        position INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL,
        category_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        price_cents INTEGER NOT NULL,
        image_url TEXT,
        is_available BOOLEAN DEFAULT true
      );
    `);
  } finally {
    client.release();
  }
}

// Auth middleware: expecting Authorization: Bearer <jwt>
function requirePartnerRole(req, res, next) {
  try {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Missing token' });

    const secret = process.env.JWT_SECRET || 'dev_secret';
    const decoded = jwt.verify(token, secret);
    if (!decoded || decoded.role !== 'partner') {
      return res.status(403).json({ success: false, error: 'Forbidden: partner role required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'partner', timestamp: new Date().toISOString() });
});

const createRestaurantSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  description: Joi.string().allow('').max(1000),
  address: Joi.string().allow('').max(240),
  city: Joi.string().allow('').max(80),
  lat: Joi.number().optional(),
  lon: Joi.number().optional()
});

app.post('/restaurants', requirePartnerRole, async (req, res) => {
  const { error, value } = createRestaurantSchema.validate(req.body || {});
  if (error) return res.status(400).json({ success: false, error: error.message });
  const { name, description, address, city, lat, lon } = value;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO restaurants (owner_user_id, name, description, address, city, lat, lon)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, name, is_open, is_verified`,
      [req.user.id, name, description || null, address || null, city || null, lat || null, lon || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error creating restaurant' });
  } finally {
    client.release();
  }
});

app.get('/restaurants', requirePartnerRole, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, name, is_open, is_verified FROM restaurants WHERE owner_user_id = $1 ORDER BY id DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error listing restaurants' });
  } finally {
    client.release();
  }
});

// Business hours endpoints
app.get('/restaurants/:id/hours', requirePartnerRole, async (req, res) => {
  const restaurantId = Number(req.params.id);
  const client = await pool.connect();
  try {
    // Ownership check
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    const result = await client.query('SELECT day_of_week, open_time, close_time, is_closed FROM business_hours WHERE restaurant_id=$1 ORDER BY day_of_week', [restaurantId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching hours' });
  } finally { client.release(); }
});

app.put('/restaurants/:id/hours', requirePartnerRole, async (req, res) => {
  const restaurantId = Number(req.params.id);
  const hours = Array.isArray(req.body) ? req.body : [];
  const client = await pool.connect();
  try {
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    await client.query('BEGIN');
    await client.query('DELETE FROM business_hours WHERE restaurant_id=$1', [restaurantId]);
    for (const h of hours) {
      await client.query(
        'INSERT INTO business_hours (restaurant_id, day_of_week, open_time, close_time, is_closed) VALUES ($1,$2,$3,$4,$5)',
        [restaurantId, h.day_of_week, h.open_time || null, h.close_time || null, Boolean(h.is_closed)]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: 'Error saving hours' });
  } finally { client.release(); }
});

// Menu categories
app.get('/restaurants/:id/categories', requirePartnerRole, async (req, res) => {
  const restaurantId = Number(req.params.id);
  const client = await pool.connect();
  try {
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    const result = await client.query('SELECT id, name, position FROM menu_categories WHERE restaurant_id=$1 ORDER BY position, id', [restaurantId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error listing categories' });
  } finally { client.release(); }
});

app.post('/restaurants/:id/categories', requirePartnerRole, async (req, res) => {
  const restaurantId = Number(req.params.id);
  const { name, position } = req.body || {};
  if (!name) return res.status(400).json({ success: false, error: 'name required' });
  const client = await pool.connect();
  try {
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    const result = await client.query('INSERT INTO menu_categories (restaurant_id, name, position) VALUES ($1,$2,$3) RETURNING id, name, position', [restaurantId, name, position ?? 0]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error creating category' });
  } finally { client.release(); }
});

app.put('/restaurants/:id/categories/:categoryId', requirePartnerRole, async (req, res) => {
  const restaurantId = Number(req.params.id);
  const categoryId = Number(req.params.categoryId);
  const { name, position } = req.body || {};
  const client = await pool.connect();
  try {
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    await client.query('UPDATE menu_categories SET name=$1, position=$2 WHERE id=$3 AND restaurant_id=$4', [name, position ?? 0, categoryId, restaurantId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error updating category' });
  } finally { client.release(); }
});

app.delete('/restaurants/:id/categories/:categoryId', requirePartnerRole, async (req, res) => {
  const restaurantId = Number(req.params.id);
  const categoryId = Number(req.params.categoryId);
  const client = await pool.connect();
  try {
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    await client.query('DELETE FROM menu_categories WHERE id=$1 AND restaurant_id=$2', [categoryId, restaurantId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error deleting category' });
  } finally { client.release(); }
});

// Menu items
app.get('/restaurants/:id/menu-items', requirePartnerRole, async (req, res) => {
  const restaurantId = Number(req.params.id);
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
  const client = await pool.connect();
  try {
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    const result = await client.query(
      categoryId
        ? 'SELECT * FROM menu_items WHERE restaurant_id=$1 AND category_id=$2 ORDER BY id DESC'
        : 'SELECT * FROM menu_items WHERE restaurant_id=$1 ORDER BY id DESC',
      categoryId ? [restaurantId, categoryId] : [restaurantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error listing items' });
  } finally { client.release(); }
});

app.post('/restaurants/:id/menu-items', requirePartnerRole, async (req, res) => {
  const restaurantId = Number(req.params.id);
  const { category_id, name, description, price_cents, is_available } = req.body || {};
  if (!name || typeof price_cents !== 'number') return res.status(400).json({ success: false, error: 'name and price_cents required' });
  const client = await pool.connect();
  try {
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    const result = await client.query(
      'INSERT INTO menu_items (restaurant_id, category_id, name, description, price_cents, is_available) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [restaurantId, category_id ?? null, name, description ?? null, price_cents, is_available !== false]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error creating item' });
  } finally { client.release(); }
});

app.put('/restaurants/:id/menu-items/:itemId', requirePartnerRole, async (req, res) => {
  const restaurantId = Number(req.params.id);
  const itemId = Number(req.params.itemId);
  const { category_id, name, description, price_cents, is_available } = req.body || {};
  const client = await pool.connect();
  try {
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    await client.query(
      'UPDATE menu_items SET category_id=$1, name=$2, description=$3, price_cents=$4, is_available=$5 WHERE id=$6 AND restaurant_id=$7',
      [category_id ?? null, name, description ?? null, price_cents, is_available, itemId, restaurantId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error updating item' });
  } finally { client.release(); }
});

app.patch('/restaurants/:id/menu-items/:itemId/availability', requirePartnerRole, async (req, res) => {
  const restaurantId = Number(req.params.id);
  const itemId = Number(req.params.itemId);
  const { is_available } = req.body || {};
  const client = await pool.connect();
  try {
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    await client.query('UPDATE menu_items SET is_available=$1 WHERE id=$2 AND restaurant_id=$3', [Boolean(is_available), itemId, restaurantId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error updating availability' });
  } finally { client.release(); }
});

app.delete('/restaurants/:id/menu-items/:itemId', requirePartnerRole, async (req, res) => {
  const restaurantId = Number(req.params.id);
  const itemId = Number(req.params.itemId);
  const client = await pool.connect();
  try {
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    await client.query('DELETE FROM menu_items WHERE id=$1 AND restaurant_id=$2', [itemId, restaurantId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error deleting item' });
  } finally { client.release(); }
});

// Image upload for menu items (multipart)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});
const upload = multer({
  storage: diskStorage,
  limits: { fileSize: (Number(process.env.UPLOAD_MAX_BYTES) || 5 * 1024 * 1024) },
  fileFilter: (req, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Invalid file type'));
  }
});

app.post('/restaurants/:id/menu-items/:itemId/image', requirePartnerRole, upload.single('image'), async (req, res) => {
  const restaurantId = Number(req.params.id);
  const itemId = Number(req.params.itemId);
  if (!req.file) return res.status(400).json({ success: false, error: 'image file required' });
  const client = await pool.connect();
  try {
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    let publicUrl = '';
    if (STORAGE_DRIVER === 's3' && s3) {
      const key = `menu-items/${restaurantId}/${itemId}/${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
      await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: fs.createReadStream(req.file.path), ContentType: req.file.mimetype }));
      // Signed URL for GET
      publicUrl = await getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }), { expiresIn: 60 });
      // Prefer public base URL if provided
      if (process.env.S3_BASE_URL) publicUrl = `${process.env.S3_BASE_URL}/${key}`;
      // cleanup local temp file
      try { fs.unlinkSync(req.file.path); } catch {}
    } else {
      publicUrl = `/api/partner/uploads/${req.file.filename}`;
    }
    const result = await client.query('UPDATE menu_items SET image_url=$1 WHERE id=$2 AND restaurant_id=$3 RETURNING *', [publicUrl, itemId, restaurantId]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Menu item not found' });
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error saving image' });
  } finally { client.release(); }
});

// Delete image
app.delete('/restaurants/:id/menu-items/:itemId/image', requirePartnerRole, async (req, res) => {
  const restaurantId = Number(req.params.id);
  const itemId = Number(req.params.itemId);
  const client = await pool.connect();
  try {
    const own = await client.query('SELECT 1 FROM restaurants WHERE id=$1 AND owner_user_id=$2', [restaurantId, req.user.id]);
    if (own.rowCount === 0) return res.status(403).json({ success: false, error: 'Forbidden' });
    const current = await client.query('SELECT image_url FROM menu_items WHERE id=$1 AND restaurant_id=$2', [itemId, restaurantId]);
    const url = current.rows[0]?.image_url || '';
    if (url) {
      if (STORAGE_DRIVER === 'local' && url.includes('/uploads/')) {
        const filename = url.split('/uploads/')[1];
        const p = path.join(UPLOAD_DIR, filename);
        try { fs.unlinkSync(p); } catch {}
      } else if (STORAGE_DRIVER === 's3' && s3) {
        const base = (process.env.S3_BASE_URL || '').replace(/\/$/, '');
        const key = base && url.startsWith(base) ? url.slice(base.length + 1) : url;
        try { await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key })); } catch {}
      }
    }
    await client.query('UPDATE menu_items SET image_url=NULL WHERE id=$1 AND restaurant_id=$2', [itemId, restaurantId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error deleting image' });
  } finally { client.release(); }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, async () => {
    try {
      await ensureSchema();
      console.log(`Partner service listening on ${port}`);
    } catch (err) {
      console.error('Error starting partner service:', err);
    }
  });
}

module.exports = app;


