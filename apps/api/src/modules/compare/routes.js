import { Router } from 'express';
import { z } from 'zod';
import { PriceComparisonEngine } from './price-comparison-engine.js';
import { prisma } from '../../lib/prisma.js';
import { optionalAuth } from '../../auth/middleware.js';
import { ValidationError, NotFoundError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';

const router = Router();

// Validation schemas
const compareQuerySchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
});

// Initialize price comparison engine
const comparisonEngine = new PriceComparisonEngine();

// GET /compare
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { sku } = compareQuerySchema.parse(req.query);
    
    logger.info(`Price comparison requested for SKU: ${sku}`);

    // Find the item by SKU
    const item = await prisma.item.findUnique({
      where: { sku },
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
      throw new NotFoundError(`Item with SKU "${sku}" not found`);
    }

    // Get price comparison
    const comparison = await comparisonEngine.comparePrices(sku);
    
    // Update the item in the comparison result
    comparison.item = item;

    // Store the latest prices in the database
    await storeLatestPrices(item.id, comparison.prices);

    logger.info(`Price comparison completed for SKU: ${sku} - found ${comparison.prices.length} prices`);

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to store latest prices
async function storeLatestPrices(itemId, prices) {
  try {
    const now = new Date();
    
    // Create price data entries
    const priceData = prices.map(price => ({
      itemId,
      marketplaceId: price.marketplaceId,
      price: price.price,
      shipping: price.shipping,
      tax: price.tax,
      availability: price.availability,
      timestamp: now,
    }));

    // Use createMany with skipDuplicates to avoid duplicates
    await prisma.priceData.createMany({
      data: priceData,
      skipDuplicates: true,
    });

    logger.debug(`Stored ${priceData.length} price data points for item: ${itemId}`);
  } catch (error) {
    logger.error('Failed to store latest prices:', error);
    // Don't throw error as this is not critical for the comparison response
  }
}

// GET /compare/stats
router.get('/stats', optionalAuth, async (req, res, next) => {
  try {
    const stats = comparisonEngine.getAdapterStats();
    const marketplaces = comparisonEngine.getAvailableMarketplaces();

    res.json({
      success: true,
      data: {
        marketplaces,
        adapterStats: stats,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
