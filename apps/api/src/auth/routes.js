import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { PasswordService } from './password';
import { JWTService } from './jwt';
import { authenticateToken } from './middleware';
import { ValidationError, ConflictError, UnauthorizedError } from '../lib/errors';
import { logger } from '../lib/logger';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Validate password strength
    const passwordValidation = PasswordService.validate(password);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password and create user
    const passwordHash = await PasswordService.hash(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = JWTService.generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        accessToken: token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await PasswordService.verify(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT token
    const token = JWTService.generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      data: {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /auth/me
router.delete('/me', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Delete user and all related data
    await prisma.user.delete({
      where: { id: req.user.userId },
    });

    logger.info(`User deleted: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
