import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { hash, compare } from './utils/pass.js';

// Load environment variables
dotenv.config();

// Create MySQL connection pool for AWS RDS
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pricescout',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

const pool = mysql.createPool(dbConfig);

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Simple routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PriceScout API is running!',
    database: 'AWS RDS MySQL'
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Simple validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }


	const hashed = hash(password);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [name, email, hashed] 
    );

    res.json({ 
      message: 'User created successfully',
      user: { id: result.insertId, name, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.execute(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0 || !compare(users[0].password, password)) { 
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    res.json({ 
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Items routes
app.get('/api/items', async (req, res) => {
  try {
    const [items] = await pool.execute(`
      SELECT 
        i.*,
        pd.price,
        pd.marketplace_id,
        pd.timestamp as last_price_timestamp
      FROM items i
      LEFT JOIN (
        SELECT 
          item_id,
          price,
          marketplace_id,
          timestamp,
          ROW_NUMBER() OVER (PARTITION BY item_id ORDER BY timestamp DESC) as rn
        FROM price_data
      ) pd ON i.id = pd.item_id AND pd.rn = 1
      ORDER BY i.created_at DESC
    `);
    
    res.json(items);
  } catch (error) {
    console.error('Items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    
    // Get item details
    const [items] = await pool.execute(
      'SELECT * FROM items WHERE id = ?',
      [itemId]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get price history
    const [priceData] = await pool.execute(`
      SELECT price, marketplace_id, timestamp
      FROM price_data 
      WHERE item_id = ? 
      ORDER BY timestamp DESC
    `, [itemId]);

    const item = {
      ...items[0],
      priceData
    };

    res.json(item);
  } catch (error) {
    console.error('Item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search route
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const [items] = await pool.execute(`
      SELECT 
        i.*,
        pd.price,
        pd.marketplace_id,
        pd.timestamp as last_price_timestamp
      FROM items i
      LEFT JOIN (
        SELECT 
          item_id,
          price,
          marketplace_id,
          timestamp,
          ROW_NUMBER() OVER (PARTITION BY item_id ORDER BY timestamp DESC) as rn
        FROM price_data
      ) pd ON i.id = pd.item_id AND pd.rn = 1
      WHERE i.name LIKE ? OR i.description LIKE ?
      ORDER BY i.created_at DESC
    `, [`%${q}%`, `%${q}%`]);

    res.json(items);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Watchlist routes
app.get('/api/watchlist/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const [items] = await pool.execute(`
      SELECT 
        i.*,
        pd.price,
        pd.marketplace_id,
        pd.timestamp as last_price_timestamp
      FROM watchlist w
      JOIN items i ON w.item_id = i.id
      LEFT JOIN (
        SELECT 
          item_id,
          price,
          marketplace_id,
          timestamp,
          ROW_NUMBER() OVER (PARTITION BY item_id ORDER BY timestamp DESC) as rn
        FROM price_data
      ) pd ON i.id = pd.item_id AND pd.rn = 1
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId]);

    res.json(items);
  } catch (error) {
    console.error('Watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/watchlist', async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    
    if (!userId || !itemId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already in watchlist
    const [existing] = await pool.execute(
      'SELECT id FROM watchlist WHERE user_id = ? AND item_id = ?',
      [userId, itemId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Item already in watchlist' });
    }

    await pool.execute(
      'INSERT INTO watchlist (user_id, item_id, created_at) VALUES (?, ?, NOW())',
      [userId, itemId]
    );

    res.json({ message: 'Item added to watchlist' });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Simple API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Database: AWS RDS MySQL`);
});

export default app;