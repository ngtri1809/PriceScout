-- Initialize MySQL database for PriceScout
CREATE DATABASE IF NOT EXISTS pricescout;
USE pricescout;

-- Create user for the application
CREATE USER IF NOT EXISTS 'pricescout'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON pricescout.* TO 'pricescout'@'%';
FLUSH PRIVILEGES;
