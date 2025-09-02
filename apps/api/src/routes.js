import { Router } from 'express';
import authRoutes from './auth/routes.js';
import itemRoutes from './modules/items/routes.js';
import compareRoutes from './modules/compare/routes.js';
import watchlistRoutes from './modules/watchlist/routes.js';
import predictionRoutes from './modules/prediction/routes.js';
import notificationRoutes from './modules/notifications/routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PriceScout API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/compare', compareRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/predict', predictionRoutes);
router.use('/notifications', notificationRoutes);

export default router;
