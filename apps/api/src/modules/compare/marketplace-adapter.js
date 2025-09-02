import { logger } from '../../lib/logger.js';
import { marketplaceRequests } from '../../lib/metrics.js';

export class BaseMarketplaceAdapter {
  async makeRequest(url, options = {}) {
    const startTime = Date.now();
    
    try {
      marketplaceRequests.inc({ marketplace: this.id, status: 'request' });
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'PriceScout/1.0',
          ...options.headers,
        },
      });

      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        marketplaceRequests.inc({ marketplace: this.id, status: 'error' });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      marketplaceRequests.inc({ marketplace: this.id, status: 'success' });
      
      logger.debug(`Marketplace ${this.id} request completed in ${duration}ms`);
      return data;
    } catch (error) {
      marketplaceRequests.inc({ marketplace: this.id, status: 'error' });
      logger.error(`Marketplace ${this.id} request failed:`, error);
      throw error;
    }
  }

  async fetchPrices(item) {
    throw new Error('fetchPrices method must be implemented');
  }
}
