import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all available products from the Prophet CSV files
 * @returns {Promise<string[]>} Array of product names
 */
export async function getAvailableProducts() {
  try {
    // Use absolute path to avoid __dirname issues
    const dataDir = '/Users/tringuyen/Documents/PriceScout/PriceScout/infra/ml-service/data/Predictions_17_SKU';
    const files = await fs.readdir(dataDir);
    
    return files
      .filter(file => file.startsWith('prophet_forecast_') && file.endsWith('.csv'))
      .map(file => file.replace('prophet_forecast_', '').replace('.csv', '').replace(/_/g, ' '));
  } catch (error) {
    console.error('Error getting available products:', error);
    return [];
  }
}

/**
 * Get available dates for a specific product CSV file
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<string[]>} Array of available dates
 */
export async function getAvailableDates(filePath) {
  try {
    const csvContent = await fs.readFile(filePath, 'utf8');
    const lines = csvContent.trim().split('\n');
    const dates = [];
    
    for (let i = 1; i < Math.min(lines.length, 11); i++) { // Show first 10 dates
      const values = lines[i].split(',');
      if (values[0]) {
        dates.push(values[0]);
      }
    }
    
    return dates;
  } catch (error) {
    console.error('Error getting available dates:', error);
    return [];
  }
}

/**
 * Get date range for a specific product CSV file
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<{start: string|null, end: string|null}>} Object with start and end dates
 */
export async function getDateRange(filePath) {
  try {
    const csvContent = await fs.readFile(filePath, 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      return { start: null, end: null };
    }
    
    // Get first date (after header)
    const firstLine = lines[1].split(',');
    const startDate = firstLine[0];
    
    // Get last date
    const lastLine = lines[lines.length - 1].split(',');
    const endDate = lastLine[0];
    
    return {
      start: startDate,
      end: endDate
    };
  } catch (error) {
    console.error('Error getting date range:', error);
    return { start: null, end: null };
  }
}

/**
 * Get the file path for a specific product
 * @param {string} productName - Name of the product
 * @returns {string} Full file path to the CSV file
 */
export function getProductFilePath(productName) {
  // Convert product name to match the actual file naming convention
  const filename = `prophet_forecast_${productName.replace(/\s+/g, '_')}.csv`;
  return path.join('/Users/tringuyen/Documents/PriceScout/PriceScout/infra/ml-service/data/Predictions_17_SKU', filename);
}

/**
 * Find the correct file path for a product by checking actual files
 * @param {string} productName - Name of the product
 * @returns {Promise<string|null>} Full file path or null if not found
 */
export async function findProductFilePath(productName) {
  try {
    // Use absolute path to avoid __dirname issues
    const dataDir = '/Users/tringuyen/Documents/PriceScout/PriceScout/infra/ml-service/data/Predictions_17_SKU';
    const files = await fs.readdir(dataDir);
    
    // Try exact match with underscores first
    const exactMatchUnderscore = `prophet_forecast_${productName.replace(/\s+/g, '_')}.csv`;
    if (files.includes(exactMatchUnderscore)) {
      return path.join(dataDir, exactMatchUnderscore);
    }
    
    // Try exact match with spaces
    const exactMatchSpaces = `prophet_forecast_${productName}.csv`;
    if (files.includes(exactMatchSpaces)) {
      return path.join(dataDir, exactMatchSpaces);
    }
    
    // Try case-insensitive match with underscores
    const lowerProductName = productName.toLowerCase();
    for (const file of files) {
      if (file.startsWith('prophet_forecast_') && file.endsWith('.csv')) {
        const fileProductName = file
          .replace('prophet_forecast_', '')
          .replace('.csv', '')
          .toLowerCase();
        
        if (fileProductName === lowerProductName.replace(/\s+/g, '_')) {
          return path.join(dataDir, file);
        }
      }
    }
    
    // Try case-insensitive match with spaces
    for (const file of files) {
      if (file.startsWith('prophet_forecast_') && file.endsWith('.csv')) {
        const fileProductName = file
          .replace('prophet_forecast_', '')
          .replace('.csv', '')
          .toLowerCase();
        
        if (fileProductName === lowerProductName) {
          return path.join(dataDir, file);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding product file path:', error);
    return null;
  }
}

/**
 * Read and parse Prophet forecast data from CSV file
 * @param {string} filePath - Path to the CSV file
 * @param {string} targetDate - Target date in YYYY-MM-DD format
 * @returns {Promise<Object|null>} Forecast data or null if not found
 */
export async function getForecastData(filePath, targetDate) {
  try {
    const csvContent = await fs.readFile(filePath, 'utf8');
    const lines = csvContent.trim().split('\n');
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const rowDate = values[0]; // ds column
      
      if (rowDate === targetDate) {
        return {
          ds: values[0],
          yhat: parseFloat(values[1]),
          yhat_lower: parseFloat(values[2]),
          yhat_upper: parseFloat(values[3])
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error reading forecast data:', error);
    return null;
  }
}

/**
 * Validate if a product exists
 * @param {string} productName - Name of the product
 * @returns {Promise<boolean>} True if product exists, false otherwise
 */
export async function validateProductExists(productName) {
  try {
    const filePath = await findProductFilePath(productName);
    return filePath !== null;
  } catch (error) {
    return false;
  }
}
