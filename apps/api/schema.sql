-- PriceScout Database Schema for AWS RDS MySQL
-- Run this script to create the database structure

CREATE DATABASE IF NOT EXISTS pricescout;
USE pricescout;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Marketplaces table
CREATE TABLE IF NOT EXISTS marketplaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    image_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Price data table
CREATE TABLE IF NOT EXISTS price_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    marketplace_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    availability VARCHAR(50),
    url VARCHAR(1000),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (marketplace_id) REFERENCES marketplaces(id) ON DELETE CASCADE,
    UNIQUE KEY unique_item_marketplace_timestamp (item_id, marketplace_id, timestamp)
);

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_item (user_id, item_id)
);

-- Price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    target_price DECIMAL(10,2) NOT NULL,
    is_above BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Insert sample marketplaces
INSERT INTO marketplaces (name, base_url) VALUES
('Amazon', 'https://amazon.com'),
('eBay', 'https://ebay.com'),
('Walmart', 'https://walmart.com'),
('Best Buy', 'https://bestbuy.com'),
('Target', 'https://target.com')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample items
INSERT INTO items (name, description, category, brand, model) VALUES
('iPhone 15 Pro', 'Latest iPhone with A17 Pro chip', 'Electronics', 'Apple', 'iPhone 15 Pro'),
('MacBook Air M2', '13-inch MacBook Air with M2 chip', 'Electronics', 'Apple', 'MacBook Air M2'),
('Samsung Galaxy S24', 'Flagship Android smartphone', 'Electronics', 'Samsung', 'Galaxy S24'),
('Sony WH-1000XM5', 'Noise-canceling headphones', 'Electronics', 'Sony', 'WH-1000XM5'),
('Nintendo Switch', 'Gaming console', 'Electronics', 'Nintendo', 'Switch')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample price data
INSERT INTO price_data (item_id, marketplace_id, price, currency, availability, url) VALUES
(1, 1, 999.00, 'USD', 'In Stock', 'https://amazon.com/iphone-15-pro'),
(1, 2, 995.00, 'USD', 'In Stock', 'https://ebay.com/iphone-15-pro'),
(2, 1, 1199.00, 'USD', 'In Stock', 'https://amazon.com/macbook-air-m2'),
(2, 3, 1199.00, 'USD', 'In Stock', 'https://walmart.com/macbook-air-m2'),
(3, 1, 799.99, 'USD', 'In Stock', 'https://amazon.com/galaxy-s24'),
(3, 4, 799.99, 'USD', 'In Stock', 'https://bestbuy.com/galaxy-s24')
ON DUPLICATE KEY UPDATE price = VALUES(price);

-- Prophet ML Tables for Price Forecasting
-- Products table (simplified for Prophet)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(255) UNIQUE,
    title TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Price history table for Prophet (time series data)
CREATE TABLE IF NOT EXISTS price_history (
    product_id INT NOT NULL,
    ds DATE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, ds),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Forecasts table for Prophet predictions
CREATE TABLE IF NOT EXISTS forecasts (
    product_id INT NOT NULL,
    ds DATE NOT NULL,
    yhat DECIMAL(10,2),
    yhat_lower DECIMAL(10,2),
    yhat_upper DECIMAL(10,2),
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, ds, model_version),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Model metadata table
CREATE TABLE IF NOT EXISTS model_metadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50) DEFAULT 'prophet',
    training_data_start DATE,
    training_data_end DATE,
    model_params JSON,
    performance_metrics JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_model (product_id, model_version)
);

-- Create indexes for better performance
CREATE INDEX idx_price_data_item_id ON price_data(item_id);
CREATE INDEX idx_price_data_marketplace_id ON price_data(marketplace_id);
CREATE INDEX idx_price_data_timestamp ON price_data(timestamp);
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);

-- Prophet-specific indexes
CREATE INDEX idx_price_history_ds ON price_history(product_id, ds);
CREATE INDEX idx_forecasts_ds ON forecasts(product_id, ds);
CREATE INDEX idx_forecasts_model_version ON forecasts(model_version);
CREATE INDEX idx_model_metadata_product_id ON model_metadata(product_id);
CREATE INDEX idx_model_metadata_active ON model_metadata(is_active);
