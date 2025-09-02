import { AmazonAdapter } from './adapters/amazon-adapter.js';
import { EbayAdapter } from './adapters/ebay-adapter.js';
import { rateLimiter } from './rate-limiter.js';
import { cacheManager } from '../../cache/cache-manager.js';
import { logger } from '../../lib/logger.js';

export class PriceComparisonEngine {
  constructor() {
    this.adapters = new Map();
    // Initialize marketplace adapters
    this.registerAdapter(new AmazonAdapter());
    this.registerAdapter(new EbayAdapter());
  }

  registerAdapter(adapter) {
    this.adapters.set(adapter.id, adapter);
    logger.info(`Registered marketplace adapter: ${adapter.id}`);
  }

  async comparePrices(sku) {
    const cacheKey = cacheManager.constructor.priceComparisonKey(sku);
    
    // Try to get from cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.debug(`Price comparison cache hit for SKU: ${sku}`);
      return cached;
    }

    logger.info(`Starting price comparison for SKU: ${sku}`);

    try {
      // Fetch prices from all marketplaces in parallel with rate limiting
      const pricePromises = Array.from(this.adapters.values()).map(adapter =>
        rateLimiter.schedule(adapter.id, () => adapter.fetchPrices({ sku }))
      );

      const priceResults = await Promise.allSettled(pricePromises);
      const allPrices = [];

      // Process results
      priceResults.forEach((result, index) => {
        const adapter = Array.from(this.adapters.values())[index];
        
        if (result.status === 'fulfilled') {
          allPrices.push(...result.value);
          logger.debug(`Successfully fetched ${result.value.length} prices from ${adapter.id}`);
        } else {
          logger.error(`Failed to fetch prices from ${adapter.id}:`, result.reason);
        }
      });

      // Calculate total costs
      const totalCosts = allPrices.map(price => ({
        marketplaceId: price.marketplaceId,
        totalCost: Math.round((price.price + price.shipping + price.tax) * 100) / 100,
        price: price.price,
        shipping: price.shipping,
        tax: price.tax,
        availability: price.availability,
      }));

      // Sort by total cost
      totalCosts.sort((a, b) => a.totalCost - b.totalCost);

      const comparison = {
        item: {
          id: '', // Will be filled by the calling service
          sku,
          name: '', // Will be filled by the calling service
          createdAt: new Date().toISOString(),
        },
        prices: allPrices,
        totalCosts,
      };

      // Cache the result
      cacheManager.set(cacheKey, comparison, 60); // Cache for 1 minute

      logger.info(`Price comparison completed for SKU: ${sku} - found ${allPrices.length} prices`);
      return comparison;
    } catch (error) {
      logger.error(`Price comparison failed for SKU: ${sku}:`, error);
      throw error;
    }
  }

  getAdapterStats() {
    return rateLimiter.getAllStats();
  }

  getAvailableMarketplaces() {
    return Array.from(this.adapters.keys());
  }
}
