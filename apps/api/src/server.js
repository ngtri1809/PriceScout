import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import {hash, compare} from './utils/pass.js';
import {cleanResults, searchFilter} from './utils/searchHelper.js';
import {getJson} from 'serpapi';
import { 
  getAvailableProducts, 
  getDateRange, 
  findProductFilePath, 
  getForecastData, 
  validateProductExists,
  getHistoricalData
} from './utils/prophet-helpers.js';

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


	const hashed = await hash(password, 10);
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
	
    if (users.length === 0 || !await compare(password, users[0].password)) { 
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
		const { q, limit = 10 } = req.query;
    if (!q) {
		return res.status(400).json({ error: 'Search query required' });
    }
	
	const engines = ["google_shopping", "amazon", "ebay"]

	const promises = engines.map(engine => {
		const params = {
		engine,
		api_key: process.env.SERPAPI_KEY,
		hl: "en",
		gl: "us"
	};
	
	if (engine === "amazon") {
		params["k"] = q;
	} else if (engine === "ebay") {
		params["_nkw"] = q;
	} else {
		params["q"] = q;
	}

	return getJson(params);
	});

	const results = await Promise.all(promises);
	
	const items = {};
	results.forEach((result, i) => {
		items[engines[i]] = cleanResults(engines[i], result, limit);
	});
	
	const merged = Object.values(items).flat()
	const filtered = searchFilter(q, merged, true)
	filtered.sort((a,b) => {
		if (a.price == null) return 1;
		if (b.price ==null) return -1;
		return a.price - b.price;
	});
    res.json(filtered);
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

// Prophet ML Prediction routes
app.get('/api/predictions/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { days = 30 } = req.query;
    
    // Get price predictions from forecasts table
    const [predictions] = await pool.execute(`
      SELECT 
        f.ds as date,
        f.yhat as predicted_price,
        f.yhat_lower as lower_bound,
        f.yhat_upper as upper_bound,
        f.model_version,
        f.created_at as prediction_date
      FROM forecasts f
      WHERE f.product_id = ? 
        AND f.ds >= CURDATE()
        AND f.model_version = (
          SELECT model_version 
          FROM model_metadata 
          WHERE product_id = ? AND is_active = 1
          ORDER BY created_at DESC 
          LIMIT 1
        )
      ORDER BY f.ds
      LIMIT ?
    `, [productId, productId, parseInt(days)]);
    
	const data = {product_id: productId, predictions: predictions, count: predictions.length}
    res.json(data);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    // Get all products with their latest price and prediction info
    const [products] = await pool.execute(`
      SELECT 
        p.id,
        p.sku,
        p.title,
        ph.price as current_price,
        ph.ds as last_price_date,
        f.yhat as next_predicted_price,
        f.ds as next_prediction_date,
        mm.model_version,
        mm.performance_metrics
      FROM products p
      LEFT JOIN (
        SELECT 
          product_id,
          price,
          ds,
          ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY ds DESC) as rn
        FROM price_history
      ) ph ON p.id = ph.product_id AND ph.rn = 1
      LEFT JOIN (
        SELECT 
          product_id,
          yhat,
          ds,
          ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY ds ASC) as rn
        FROM forecasts
        WHERE ds >= CURDATE()
      ) f ON p.id = f.product_id AND f.rn = 1
      LEFT JOIN model_metadata mm ON p.id = mm.product_id AND mm.is_active = 1
      ORDER BY p.created_at DESC
    `);
    
    res.json(products);
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/:productId/history', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { days = 90 } = req.query;
    
    // Get price history for a product
    const [history] = await pool.execute(`
      SELECT 
        ds as date,
        price,
        created_at
      FROM price_history
      WHERE product_id = ?
        AND ds >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY ds DESC
    `, [productId, parseInt(days)]);
    
    res.json({
      product_id: productId,
      history: history,
      count: history.length
    });
  } catch (error) {
    console.error('Price history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/ml/status', async (req, res) => {
  try {
    // Get ML service status and statistics
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT ph.product_id) as products_with_data,
        COUNT(DISTINCT f.product_id) as products_with_predictions,
        COUNT(DISTINCT mm.product_id) as products_with_models,
        AVG(JSON_EXTRACT(mm.performance_metrics, '$.mae')) as avg_mae,
        AVG(JSON_EXTRACT(mm.performance_metrics, '$.mape')) as avg_mape
      FROM products p
      LEFT JOIN price_history ph ON p.id = ph.product_id
      LEFT JOIN forecasts f ON p.id = f.product_id
      LEFT JOIN model_metadata mm ON p.id = mm.product_id AND mm.is_active = 1
    `);
    
    const [recentPredictions] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM forecasts
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    
    res.json({
      status: 'operational',
      statistics: stats[0],
      recent_predictions: recentPredictions[0].count,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('ML status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Prophet Forecast API
app.get('/api/prophet/forecast', async (req, res) => {
  try {
    const { productName, date, month, year } = req.query;
    
    // Validate required parameters
    if (!productName || !date || !month) {
      return res.status(400).json({ 
        error: 'Missing required parameters: productName, date, and month are required' 
      });
    }
    
    // Set default year to 2024 if not provided
    const yearValue = year || '2024';
    
    // Validate date format and check if it's in the past
    const requestedDate = new Date(`${month}/${date}/${yearValue}`);
    const currentDate = new Date();
    const maxDate = new Date('2026-11-04');
    
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format. Please use valid date, month, and year values' 
      });
    }
    
    if (requestedDate < currentDate) {
      return res.status(400).json({ 
        error: 'Requested date has already passed. Please select a future date' 
      });
    }
    
    if (requestedDate > maxDate) {
      return res.status(400).json({ 
        error: 'Requested date exceeds maximum allowed date (2026-11-04). Please select an earlier date' 
      });
    }
    
    // // Check if product exists
    // const productExists = await validateProductExists(productName);
    // if (!productExists) {
    //   const availableProducts = await getAvailableProducts();
    //   return res.status(404).json({ 
    //     error: `Product forecast not found: ${productName}`,
    //     availableProducts: availableProducts
    //   });
    // }
    
    // Get file path and forecast data
    const filePath = await findProductFilePath(productName);
    if (!filePath) {
      const availableProducts = await getAvailableProducts();
      return res.status(404).json({ 
        error: `Product forecast not found: ${productName}`,
        availableProducts: availableProducts
      });
    }
    
    const targetDate = `${yearValue}-${month.padStart(2, '0')}-${date.padStart(2, '0')}`;
    const forecastData = await getForecastData(filePath, targetDate);
    
    if (!forecastData) {
      const dateRange = await getDateRange(filePath);
      return res.status(404).json({ 
        error: `No forecast data found for ${productName} on ${month}/${date}/${yearValue}`,
        availableDateRange: dateRange,
        requestedDate: `${month}/${date}/${yearValue}`
      });
    }
    
    res.json({
      success: true,
      productName,
      requestedDate: `${month}/${date}/${yearValue}`,
      forecast: forecastData
    });
    
  } catch (error) {
    console.error('Prophet forecast error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching forecast data' 
    });
  }
});

// Historical price data endpoint for charts
app.get('/api/prophet/history', async (req, res) => {
  try {
    const { productName } = req.query;
    if (!productName) {
      return res.status(400).json({ 
        error: 'Missing required parameter: productName' 
      });
    }
    
    const filePath = await findProductFilePath(productName);
    if (!filePath) {
      const availableProducts = await getAvailableProducts();
      return res.status(404).json({ 
        error: `Product not found: ${productName}`,
        availableProducts: availableProducts
      });
    }
    
    const historicalData = await getHistoricalData(filePath);
    
    res.json({
      success: true,
      productName,
      data: historicalData
    });
  } catch (error) {
    console.error('Historical data error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching historical data' 
    });
  }
});


// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Simple API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Database: AWS RDS MySQL`);
  console.log(`🔮 Prophet forecast: http://localhost:${PORT}/api/prophet/forecast`);
});

export default app;