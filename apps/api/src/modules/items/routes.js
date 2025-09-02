import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { cacheManager } from '../../cache/cache-manager.js';
import { optionalAuth } from '../../auth/middleware.js';
import { ValidationError, NotFoundError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';

const router = Router();

// Validation schemas
const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

const priceHistoryQuerySchema = z.object({
  days: z.coerce.number().min(1).max(365).default(30),
});

// GET /items/search
router.get('/search', optionalAuth, async (req, res, next) => {
  try {
    const { q, limit, offset } = searchQuerySchema.parse(req.query);
    
    const cacheKey = cacheManager.constructor.itemSearchKey(q, limit, offset);
    
    // Try to get from cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.debug(`Item search cache hit for query: ${q}`);
      return res.json({
        success: true,
        data: cached,
      });
    }

    // Search items
    const items = await prisma.item.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        sku: true,
        name: true,
        description: true,
        category: true,
        createdAt: true,
      },
    });

    const total = await prisma.item.count({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      },
    });

    const result = {
      items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };

    // Cache the result for 5 minutes
    cacheManager.set(cacheKey, result, 300);

    logger.info(`Item search completed: "${q}" - found ${items.length} items`);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// GET /items/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const cacheKey = cacheManager.constructor.itemKey(id);
    
    // Try to get from cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.debug(`Item cache hit for ID: ${id}`);
      return res.json({
        success: true,
        data: cached,
      });
    }

    const item = await prisma.item.findUnique({
      where: { id },
      select: {
        id: true,
        sku: true,
        name: true,
        description: true,
        category: true,
        createdAt: true,
      },
    });

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    // Cache the result for 10 minutes
    cacheManager.set(cacheKey, item, 600);

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// GET /items/:id/prices
router.get('/:id/prices', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days } = priceHistoryQuerySchema.parse(req.query);
    
    const cacheKey = cacheManager.constructor.priceHistoryKey(id, days);
    
    // Try to get from cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.debug(`Price history cache hit for item: ${id}, days: ${days}`);
      return res.json({
        success: true,
        data: cached,
      });
    }

    // Verify item exists
    const item = await prisma.item.findUnique({
      where: { id },
      select: { id: true, name: true, sku: true },
    });

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    // Get price history
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const priceData = await prisma.priceData.findMany({
      where: {
        itemId: id,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        marketplaceId: true,
        price: true,
        shipping: true,
        tax: true,
        availability: true,
        timestamp: true,
      },
    });

    // Group by marketplace and date
    const groupedData = new Map();
    
    priceData.forEach(data => {
      const date = data.timestamp.toISOString().split('T')[0];
      
      if (!groupedData.has(data.marketplaceId)) {
        groupedData.set(data.marketplaceId, new Map());
      }
      
      const marketplaceData = groupedData.get(data.marketplaceId);
      marketplaceData.set(date, {
        price: data.price,
        shipping: data.shipping,
        tax: data.tax,
        totalCost: Math.round((data.price + data.shipping + data.tax) * 100) / 100,
        availability: data.availability,
        timestamp: data.timestamp,
      });
    });

    const result = {
      item,
      priceHistory: Object.fromEntries(
        Array.from(groupedData.entries()).map(([marketplace, data]) => [
          marketplace,
          Object.fromEntries(data)
        ])
      ),
      summary: {
        totalDataPoints: priceData.length,
        marketplaces: Array.from(groupedData.keys()),
        dateRange: {
          start: startDate.toISOString(),
          end: new Date().toISOString(),
        },
      },
    };

    // Cache the result for 2 minutes
    cacheManager.set(cacheKey, result, 120);

    logger.info(`Price history retrieved for item: ${id} - ${priceData.length} data points over ${days} days`);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
