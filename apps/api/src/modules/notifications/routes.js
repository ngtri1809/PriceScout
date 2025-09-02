import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { emailService } from './email-service.js';
import { authenticateToken } from '../../auth/middleware.js';
import { ValidationError, NotFoundError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';
import { config } from '../../config/index.js';

const router = Router();

// Validation schemas
const updatePreferencesSchema = z.object({
  emailOptIn: z.boolean(),
});

const priceDropNotificationSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  currentPrice: z.number().min(0, 'Current price must be positive'),
  previousPrice: z.number().min(0, 'Previous price must be positive'),
});

// GET /notifications/preferences
router.get('/preferences', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: req.user.userId },
    });

    const result = preferences || {
      userId: req.user.userId,
      emailOptIn: true,
      createdAt: new Date(),
    };

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /notifications/preferences
router.put('/preferences', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const { emailOptIn } = updatePreferencesSchema.parse(req.body);

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: req.user.userId },
      update: { emailOptIn },
      create: {
        userId: req.user.userId,
        emailOptIn,
      },
    });

    logger.info(`Notification preferences updated for user: ${req.user.userId}, emailOptIn: ${emailOptIn}`);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
});

// POST /notifications/price-drop (internal endpoint)
router.post('/price-drop', async (req, res, next) => {
  try {
    const { itemId, currentPrice, previousPrice } = priceDropNotificationSchema.parse(req.body);

    // Get item details
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, name: true, sku: true },
    });

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    // Get users watching this item who have email notifications enabled
    const watchlistUsers = await prisma.watchlist.findMany({
      where: { itemId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    const usersToNotify = await Promise.all(
      watchlistUsers.map(async (watchlistItem) => {
        const preferences = await prisma.notificationPreference.findUnique({
          where: { userId: watchlistItem.user.id },
        });
        
        return preferences?.emailOptIn ? watchlistItem.user : null;
      })
    );

    const validUsers = usersToNotify.filter(user => user !== null);

    // Send email notifications
    const emailPromises = validUsers.map(async (user) => {
      try {
        const itemUrl = `${process.env.WEB_URL || 'http://localhost:5173'}/item/${item.id}`;
        
        await emailService.sendPriceDropNotification(
          user.email,
          user.name || 'User',
          item.name,
          currentPrice,
          previousPrice,
          itemUrl
        );
        
        logger.info(`Price drop notification sent to user: ${user.email} for item: ${item.name}`);
      } catch (error) {
        logger.error(`Failed to send price drop notification to user: ${user.email}:`, error);
      }
    });

    await Promise.allSettled(emailPromises);

    logger.info(`Price drop notifications processed for item: ${item.name} - ${validUsers.length} users notified`);

    res.json({
      success: true,
      message: 'Price drop notifications sent',
      data: {
        itemId,
        itemName: item.name,
        usersNotified: validUsers.length,
        priceDrop: previousPrice - currentPrice,
        percentageDrop: Math.round(((previousPrice - currentPrice) / previousPrice) * 100),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /notifications/test (development only)
router.get('/test', authenticateToken, async (req, res, next) => {
  try {
    if (config.nodeEnv === 'production') {
      throw new Error('Test endpoint not available in production');
    }

    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Send test email
    await emailService.sendEmail({
      to: user.email,
      subject: 'PriceScout Test Email',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from PriceScout.</p>
        <p>If you received this, the email service is working correctly!</p>
      `,
    });

    res.json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
