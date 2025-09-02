import Bottleneck from 'bottleneck';
import { config } from '../../config/index.js';
import { logger } from '../../lib/logger.js';

export class RateLimiter {
  constructor() {
    this.limiters = new Map();
    // Initialize rate limiters for each marketplace
    this.createLimiter('amazon', config.marketplace.amazon.rateLimit);
    this.createLimiter('ebay', config.marketplace.ebay.rateLimit);
  }

  createLimiter(name, requestsPerMinute) {
    const limiter = new Bottleneck({
      maxConcurrent: 5,
      minTime: Math.floor(60000 / requestsPerMinute), // Convert to milliseconds between requests
      reservoir: requestsPerMinute,
      reservoirRefreshAmount: requestsPerMinute,
      reservoirRefreshInterval: 60 * 1000, // 1 minute
    });

    limiter.on('error', (error) => {
      logger.error(`Rate limiter error for ${name}:`, error);
    });

    limiter.on('depleted', () => {
      logger.warn(`Rate limiter depleted for ${name}`);
    });

    this.limiters.set(name, limiter);
  }

  async schedule(marketplace, fn) {
    const limiter = this.limiters.get(marketplace);
    if (!limiter) {
      logger.warn(`No rate limiter found for marketplace: ${marketplace}`);
      return fn();
    }

    return limiter.schedule(fn);
  }

  getStats(marketplace) {
    const limiter = this.limiters.get(marketplace);
    if (!limiter) {
      return null;
    }

    return {
      queued: limiter.queued(),
      running: limiter.running(),
      done: limiter.done(),
      reservoir: limiter.reservoir,
    };
  }

  getAllStats() {
    const stats = {};
    for (const [marketplace, limiter] of this.limiters) {
      stats[marketplace] = {
        queued: limiter.queued(),
        running: limiter.running(),
        done: limiter.done(),
        reservoir: limiter.reservoir,
      };
    }
    return stats;
  }
}

export const rateLimiter = new RateLimiter();
