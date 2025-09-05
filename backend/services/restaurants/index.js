const dotenv = require('dotenv');
dotenv.config({ path: process.env.ENV_FILE || undefined });
const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3001;

// Enable JSON parsing
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address VARCHAR(500),
        phone VARCHAR(20),
        email VARCHAR(255),
        cuisine_type VARCHAR(100),
        rating DECIMAL(3,2) DEFAULT 0,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        category VARCHAR(100),
        available BOOLEAN DEFAULT true,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        user_id INTEGER,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tables created successfully (if they did not exist).');
  } finally {
    client.release();
  }
}

async function insertSampleData() {
  const client = await pool.connect();
  try {
    // Check if sample data already exists
    const existingRestaurants = await client.query('SELECT COUNT(*) FROM restaurants');
    if (existingRestaurants.rows[0].count > 0) {
      console.log('Sample data already exists, skipping insertion.');
      return;
    }

    // Insert sample restaurants
    const restaurantsResult = await client.query(`
      INSERT INTO restaurants (name, description, address, phone, email, cuisine_type, rating, image_url) VALUES
      ('Pizza Palace', 'Authentic Italian pizza with fresh ingredients', '123 Main St, Downtown', '+1-555-0123', 'info@pizzapalace.com', 'Italian', 4.5, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'),
      ('Sushi Master', 'Fresh sushi and Japanese cuisine', '456 Oak Ave, Midtown', '+1-555-0456', 'hello@sushimaster.com', 'Japanese', 4.8, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'),
      ('Burger House', 'Classic American burgers and fries', '789 Pine St, Uptown', '+1-555-0789', 'contact@burgerhouse.com', 'American', 4.2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
      ('Taco Fiesta', 'Mexican street food and authentic tacos', '321 Elm St, Westside', '+1-555-0321', 'info@tacofiesta.com', 'Mexican', 4.6, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'),
      ('Thai Delight', 'Traditional Thai cuisine with modern twist', '654 Maple Dr, Eastside', '+1-555-0654', 'hello@thaidelight.com', 'Thai', 4.4, 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400')
      RETURNING id
    `);

    // Insert sample menu items
    for (const restaurant of restaurantsResult.rows) {
      await client.query(`
        INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES
        (${restaurant.id}, 'Margherita Pizza', 'Classic tomato and mozzarella', 14.99, 'Pizza'),
        (${restaurant.id}, 'Pepperoni Pizza', 'Spicy pepperoni with cheese', 16.99, 'Pizza'),
        (${restaurant.id}, 'Caesar Salad', 'Fresh romaine with caesar dressing', 8.99, 'Salad')
      `);
    }

    console.log('Sample data inserted successfully.');
  } catch (err) {
    console.error('Error inserting sample data:', err);
  } finally {
    client.release();
  }
}

async function migrateSchema() {
  const client = await pool.connect();
  try {
    // Restaurants table columns
    await client.query(`
      ALTER TABLE IF EXISTS restaurants
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS address VARCHAR(500),
        ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
        ADD COLUMN IF NOT EXISTS email VARCHAR(255),
        ADD COLUMN IF NOT EXISTS cuisine_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Menu items table columns
    await client.query(`
      ALTER TABLE IF EXISTS menu_items
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2),
        ADD COLUMN IF NOT EXISTS category VARCHAR(100),
        ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Reviews table columns
    await client.query(`
      ALTER TABLE IF EXISTS reviews
        ADD COLUMN IF NOT EXISTS user_id INTEGER,
        ADD COLUMN IF NOT EXISTS rating INTEGER,
        ADD COLUMN IF NOT EXISTS comment TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    console.log('Schema migration complete (added missing columns if needed).');
  } catch (err) {
    console.error('Schema migration error:', err);
  } finally {
    client.release();
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'restaurants', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Hello from the Restaurants Service!');
});

// Get all restaurants with optional filtering, pagination, and sorting
app.get('/restaurants', async (req, res) => {
  try {
    const { cuisine_type, search } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    // Sorting: sort=rating|name|created_at and optional sort_dir=asc|desc or sort=field:dir
    let sortField = 'rating';
    let sortDir = 'DESC';
    if (typeof req.query.sort === 'string') {
      const parts = req.query.sort.split(':');
      const field = parts[0];
      const dir = (parts[1] || '').toUpperCase();
      if (['rating', 'name', 'created_at'].includes(field)) sortField = field;
      if (['ASC', 'DESC'].includes(dir)) sortDir = dir;
    } else if (typeof req.query.sort_dir === 'string') {
      const dir = req.query.sort_dir.toUpperCase();
      if (['ASC', 'DESC'].includes(dir)) sortDir = dir;
    }

    let baseQuery = 'FROM restaurants';
    let params = [];
    let conditions = [];

    if (cuisine_type) {
      conditions.push(`cuisine_type ILIKE $${params.length + 1}`);
      params.push(`%${cuisine_type}%`);
    }

    if (search) {
      conditions.push(`(name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const client = await pool.connect();
    try {
      // Total count
      const totalResult = await client.query(`SELECT COUNT(*) ${baseQuery}`, params);
      const total = parseInt(totalResult.rows[0].count, 10) || 0;

      // Data with pagination
      const offset = (page - 1) * limit;
      const dataResult = await client.query(
        `SELECT * ${baseQuery} ORDER BY ${sortField} ${sortDir}, id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      res.json({
        success: true,
        data: dataResult.rows,
        count: dataResult.rows.length,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching restaurants' });
  }
});

// Get restaurant by ID
app.get('/restaurants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM restaurants WHERE id = $1', [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching restaurant' });
  }
});

// Get restaurant menu
app.get('/restaurants/:id/menu', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM menu_items WHERE restaurant_id = $1 AND available = true ORDER BY category, name', [id]);
    client.release();
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching menu' });
  }
});

// Get restaurant reviews
app.get('/restaurants/:id/reviews', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC', [id]);
    client.release();
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching reviews' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, async () => {
    try {
      await createTables();
      await migrateSchema();
      await insertSampleData();
      console.log(`Restaurants service listening on port ${port}`);
    } catch (err) {
      console.error('Error starting service:', err);
    }
  });
}

module.exports = app;


