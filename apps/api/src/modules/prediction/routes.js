import { Router } from 'express';
import { z } from 'zod';
import { AIPredictionEngine } from './ai-prediction-engine.js';
import { prisma } from '../../lib/prisma.js';
import { optionalAuth } from '../../auth/middleware.js';
import { ValidationError, NotFoundError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';

const router = Router();

// Validation schemas
const predictionQuerySchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  h: z.coerce.number().min(1).max(90).default(14), // horizon in days
});

// Initialize prediction engine
const predictionEngine = new AIPredictionEngine();

// GET /predict
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { itemId, h: horizon } = predictionQuerySchema.parse(req.query);
    
    logger.info(`Price prediction requested for item: ${itemId}, horizon: ${horizon} days`);

    // Verify item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        sku: true,
        name: true,
        description: true,
        category: true,
      },
    });

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    // Get prediction
    const predictions = await predictionEngine.predictPriceTrends(itemId, horizon);

    // Store predictions in database
    await storePredictions(itemId, predictions);

    const result = {
      item,
      predictions,
      metadata: {
        horizon,
        provider: predictionEngine.getCurrentProvider(),
        generatedAt: new Date().toISOString(),
        dataPoints: predictions.length,
      },
    };

    logger.info(`Price prediction completed for item: ${itemId} - generated ${predictions.length} forecast points`);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to store predictions
async function storePredictions(itemId, predictions) {
  try {
    // Clear existing predictions for this item
    await prisma.predictedPrice.deleteMany({
      where: { itemId },
    });

    // Store new predictions (using p50 as the main predicted price)
    const priceData = predictions.map(pred => ({
      itemId,
      predictedPrice: pred.p50,
      forecastDate: new Date(pred.date),
    }));

    await prisma.predictedPrice.createMany({
      data: priceData,
    });

    logger.debug(`Stored ${priceData.length} predictions for item: ${itemId}`);
  } catch (error) {
    logger.error('Failed to store predictions:', error);
    // Don't throw error as this is not critical for the prediction response
  }
}

// GET /predict/providers
router.get('/providers', optionalAuth, async (req, res, next) => {
  try {
    const providers = predictionEngine.getAvailableProviders();
    const currentProvider = predictionEngine.getCurrentProvider();

    res.json({
      success: true,
      data: {
        available: providers,
        current: currentProvider,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /predict/providers/:providerId
router.post('/providers/:providerId', optionalAuth, async (req, res, next) => {
  try {
    const { providerId } = req.params;
    
    predictionEngine.setProvider(providerId);

    logger.info(`Prediction provider switched to: ${providerId}`);

    res.json({
      success: true,
      message: `Prediction provider switched to ${providerId}`,
      data: {
        provider: providerId,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
