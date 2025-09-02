import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { cacheManager } from '../../cache/cache-manager.js';
import { authenticateToken } from '../../auth/middleware.js';
import { ValidationError, NotFoundError, ConflictError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';

const router = Router();

// Validation schemas
const addToWatchlistSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
});

// GET /watchlist
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const cacheKey = cacheManager.constructor.watchlistKey(req.user.userId);
    
    // Try to get from cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.debug(`Watchlist cache hit for user: ${req.user.userId}`);
      return res.json({
        success: true,
        data: cached,
      });
    }

    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.user.userId },
      include: {
        item: {
          select: {
            id: true,
            sku: true,
            name: true,
            description: true,
            category: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = {
      items: watchlist.map(w => ({
        ...w.item,
        addedAt: w.createdAt,
      })),
      total: watchlist.length,
    };

    // Cache the result for 5 minutes
    cacheManager.set(cacheKey, result, 300);

    logger.info(`Watchlist retrieved for user: ${req.user.userId} - ${watchlist.length} items`);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /watchlist
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const { itemId } = addToWatchlistSchema.parse(req.body);

    // Verify item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, name: true },
    });

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    // Check if already in watchlist
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_itemId: {
          userId: req.user.userId,
          itemId,
        },
      },
    });

    if (existing) {
      throw new ConflictError('Item is already in your watchlist');
    }

    // Add to watchlist
    await prisma.watchlist.create({
      data: {
        userId: req.user.userId,
        itemId,
      },
    });

    // Clear cache
    const cacheKey = cacheManager.constructor.watchlistKey(req.user.userId);
    cacheManager.del(cacheKey);

    logger.info(`Item added to watchlist: user=${req.user.userId}, item=${itemId}`);

    res.status(201).json({
      success: true,
      message: 'Item added to watchlist',
      data: {
        itemId,
        itemName: item.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /watchlist/:itemId
router.delete('/:itemId', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const { itemId } = req.params;

    // Check if item is in watchlist
    const watchlistItem = await prisma.watchlist.findUnique({
      where: {
        userId_itemId: {
          userId: req.user.userId,
          itemId,
        },
      },
      include: {
        item: {
          select: { name: true },
        },
      },
    });

    if (!watchlistItem) {
      throw new NotFoundError('Item not found in your watchlist');
    }

    // Remove from watchlist
    await prisma.watchlist.delete({
      where: {
        userId_itemId: {
          userId: req.user.userId,
          itemId,
        },
      },
    });

    // Clear cache
    const cacheKey = cacheManager.constructor.watchlistKey(req.user.userId);
    cacheManager.del(cacheKey);

    logger.info(`Item removed from watchlist: user=${req.user.userId}, item=${itemId}`);

    res.json({
      success: true,
      message: 'Item removed from watchlist',
      data: {
        itemId,
        itemName: watchlistItem.item.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /watchlist/:itemId/status
router.get('/:itemId/status', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const { itemId } = req.params;

    const watchlistItem = await prisma.watchlist.findUnique({
      where: {
        userId_itemId: {
          userId: req.user.userId,
          itemId,
        },
      },
    });

    res.json({
      success: true,
      data: {
        itemId,
        inWatchlist: !!watchlistItem,
        addedAt: watchlistItem?.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
