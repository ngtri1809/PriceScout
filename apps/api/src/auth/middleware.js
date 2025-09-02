import { JWTService } from './jwt';
import { prisma } from '../lib/prisma';
import { UnauthorizedError, ForbiddenError } from '../lib/errors';
import { logger } from '../lib/logger';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const payload = JWTService.verifyToken(token);
    
    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = payload;
    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const payload = JWTService.verifyToken(token);
        
        // Verify user still exists
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, name: true },
        });

        if (user) {
          req.user = payload;
        }
      } catch (error) {
        // Token is invalid, but we don't throw an error for optional auth
        logger.debug('Optional auth token invalid:', error);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  // For now, we don't have admin roles, but this is a placeholder
  // In a real app, you'd check req.user.role === 'admin'
  next();
};
