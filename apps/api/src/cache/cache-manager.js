import NodeCache from 'node-cache';
import { logger } from '../lib/logger';
import { cacheHits, cacheMisses } from '../lib/metrics';
import { config } from '../config';

export class CacheManager {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: config.cache.ttl * 0.2,
      useClones: false,
    });

    this.cache.on('set', (key, value) => {
      logger.debug(`Cache set: ${key}`);
    });

    this.cache.on('del', (key, value) => {
      logger.debug(`Cache deleted: ${key}`);
    });

    this.cache.on('expired', (key, value) => {
      logger.debug(`Cache expired: ${key}`);
    });
  }

  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      cacheHits.inc({ cache_key: key });
      logger.debug(`Cache hit: ${key}`);
      return value;
    } else {
      cacheMisses.inc({ cache_key: key });
      logger.debug(`Cache miss: ${key}`);
      return undefined;
    }
  }

  set(key, value, ttl) {
    const success = this.cache.set(key, value, ttl);
    if (success) {
      logger.debug(`Cache set: ${key} (TTL: ${ttl || config.cache.ttl}s)`);
    } else {
      logger.warn(`Failed to set cache: ${key}`);
    }
    return success;
  }

  del(key) {
    const deleted = this.cache.del(key);
    if (deleted > 0) {
      logger.debug(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  flush() {
    this.cache.flushAll();
    logger.info('Cache flushed');
  }

  keys() {
    return this.cache.keys();
  }

  getStats() {
    return this.cache.getStats();
  }

  // Helper methods for common cache patterns
  async getOrSet(key, fetchFn, ttl) {
    const cached = this.get(key);
    if (cached !== undefined) {
      return Promise.resolve(cached);
    }

    return fetchFn().then((value) => {
      this.set(key, value, ttl);
      return value;
    });
  }

  // Cache key generators
  static itemKey(id) {
    return `item:${id}`;
  }

  static itemSearchKey(query, limit, offset) {
    return `item:search:${query}:${limit}:${offset}`;
  }

  static priceHistoryKey(itemId, days) {
    return `price:history:${itemId}:${days}`;
  }

  static priceComparisonKey(sku) {
    return `price:compare:${sku}`;
  }

  static predictionKey(itemId, horizon) {
    return `prediction:${itemId}:${horizon}`;
  }

  static watchlistKey(userId) {
    return `watchlist:${userId}`;
  }
}

export const cacheManager = new CacheManager();
