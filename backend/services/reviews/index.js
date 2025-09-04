const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3004;

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function ensureSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL,
        user_id INTEGER,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
    `);
  } finally {
    client.release();
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'reviews', timestamp: new Date().toISOString() });
});

// List reviews by restaurant
app.get('/reviews', async (req, res) => {
  const { restaurant_id } = req.query;
  if (!restaurant_id) {
    return res.status(400).json({ success: false, error: 'restaurant_id is required' });
  }
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC',
      [restaurant_id]
    );
    client.release();
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching reviews' });
  }
});

// Create a review
app.post('/reviews', async (req, res) => {
  const { restaurant_id, user_id, rating, comment } = req.body || {};
  if (!restaurant_id || !rating) {
    return res.status(400).json({ success: false, error: 'restaurant_id and rating are required' });
  }
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO reviews (restaurant_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [restaurant_id, user_id ?? null, rating, comment ?? null]
    );
    client.release();
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error creating review' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, async () => {
    try {
      await ensureSchema();
      console.log(`Reviews service listening on port ${port}`);
    } catch (err) {
      console.error('Error starting reviews service:', err);
    }
  });
}

module.exports = app;


