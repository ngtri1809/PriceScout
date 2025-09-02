import { logger } from './logger';
import { httpRequestTotal } from './metrics';

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
  }
}

export const errorHandler = (error, req, res, next) => {
  const { method, route } = req;
  const routeName = route?.path || req.path;

  // Log error
  logger.error({
    error: error.message,
    stack: error.stack,
    method,
    route: routeName,
    url: req.url,
  });

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    const statusCode = 400;
    httpRequestTotal.inc({ method, route: routeName, status_code: statusCode });
    
    return res.status(statusCode).json({
      type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
      title: 'Validation Error',
      status: statusCode,
      detail: 'Request validation failed',
      instance: req.url,
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
    });
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    const statusCode = error.statusCode;
    httpRequestTotal.inc({ method, route: routeName, status_code: statusCode });
    
    return res.status(statusCode).json({
      type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
      title: error.constructor.name.replace('Error', ''),
      status: statusCode,
      detail: error.message,
      instance: req.url,
    });
  }

  // Handle unexpected errors
  const statusCode = 500;
  httpRequestTotal.inc({ method, route: routeName, status_code: statusCode });
  
  res.status(statusCode).json({
    type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
    title: 'Internal Server Error',
    status: statusCode,
    detail: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
    instance: req.url,
  });
};

export const notFoundHandler = (req, res) => {
  const { method, route } = req;
  const routeName = route?.path || req.path;
  const statusCode = 404;
  
  httpRequestTotal.inc({ method, route: routeName, status_code: statusCode });
  
  res.status(statusCode).json({
    type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
    title: 'Not Found',
    status: statusCode,
    detail: `The requested resource ${req.url} was not found`,
    instance: req.url,
  });
};
