import { TfjsProvider } from './providers/tfjs-provider.js';
import { ProphetProvider } from './providers/prophet-provider.js';
import { cacheManager } from '../../cache/cache-manager.js';
import { config } from '../../config/index.js';
import { logger } from '../../lib/logger.js';
import { predictionRequests } from '../../lib/metrics.js';

export class AIPredictionEngine {
  constructor() {
    this.providers = new Map();
    // Initialize prediction providers
    this.registerProvider(new TfjsProvider());
    this.registerProvider(new ProphetProvider());
    
    this.defaultProvider = config.prediction.provider;
    logger.info(`AIPredictionEngine initialized with default provider: ${this.defaultProvider}`);
  }

  registerProvider(provider) {
    this.providers.set(provider.id, provider);
    logger.info(`Registered prediction provider: ${provider.id}`);
  }

  async predictPriceTrends(itemId, horizon = 14) {
    const cacheKey = cacheManager.constructor.predictionKey(itemId, horizon);
    
    // Try to get from cache first
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      logger.debug(`Prediction cache hit for item: ${itemId}, horizon: ${horizon}`);
      return cached;
    }

    logger.info(`Starting price prediction for item: ${itemId}, horizon: ${horizon}`);

    try {
      // Get historical price data
      const historicalData = await this.getHistoricalPriceData(itemId);
      
      if (historicalData.length < 10) {
        throw new Error('Insufficient historical data for prediction (minimum 10 points required)');
      }

      // Get the prediction provider
      const provider = this.providers.get(this.defaultProvider);
      if (!provider) {
        throw new Error(`Prediction provider not found: ${this.defaultProvider}`);
      }

      // Make prediction
      predictionRequests.inc({ provider: provider.id, status: 'request' });
      
      const predictions = await provider.predictPriceTrends(historicalData, horizon);
      
      predictionRequests.inc({ provider: provider.id, status: 'success' });
      
      // Cache the result for 5 minutes
      cacheManager.set(cacheKey, predictions, 300);
      
      logger.info(`Price prediction completed for item: ${itemId} - generated ${predictions.length} forecast points`);
      return predictions;
    } catch (error) {
      const provider = this.providers.get(this.defaultProvider);
      if (provider) {
        predictionRequests.inc({ provider: provider.id, status: 'error' });
      }
      
      logger.error(`Price prediction failed for item: ${itemId}:`, error);
      throw error;
    }
  }

  async getHistoricalPriceData(itemId) {
    const { prisma } = await import('../../lib/prisma.js');
    
    const priceData = await prisma.priceData.findMany({
      where: { itemId },
      orderBy: { timestamp: 'asc' },
      take: 90, // Last 90 days of data
    });

    // Group by date and take average price per day
    const dailyPrices = new Map();
    
    priceData.forEach(data => {
      const date = data.timestamp.toISOString().split('T')[0];
      if (!dailyPrices.has(date)) {
        dailyPrices.set(date, []);
      }
      dailyPrices.get(date).push(data.price);
    });

    // Calculate daily averages
    const historicalData = [];

    for (const [date, prices] of dailyPrices) {
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      historicalData.push({
        price: averagePrice,
        timestamp: `${date}T00:00:00.000Z`,
      });
    }

    return historicalData;
  }

  getAvailableProviders() {
    return Array.from(this.providers.keys());
  }

  getCurrentProvider() {
    return this.defaultProvider;
  }

  setProvider(providerId) {
    if (!this.providers.has(providerId)) {
      throw new Error(`Prediction provider not found: ${providerId}`);
    }
    this.defaultProvider = providerId;
    logger.info(`Switched to prediction provider: ${providerId}`);
  }
}
