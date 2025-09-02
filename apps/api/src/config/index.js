import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/pricescout',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: '7d',
  },
  
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '60', 10),
  },
  
  email: {
    ses: {
      region: process.env.SES_REGION || 'us-east-1',
      accessKey: process.env.SES_ACCESS_KEY || '',
      secretKey: process.env.SES_SECRET_KEY || '',
    },
    mailhog: {
      host: process.env.MAILHOG_HOST || 'localhost',
      port: parseInt(process.env.MAILHOG_PORT || '1025', 10),
    },
  },
  
  prediction: {
    provider: process.env.PREDICTOR_PROVIDER || 'tfjs',
    mlServiceUrl: process.env.ML_SERVICE_URL || 'http://ml:8080',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  marketplace: {
    amazon: {
      rateLimit: parseInt(process.env.AMAZON_RATE_LIMIT || '10', 10),
    },
    ebay: {
      rateLimit: parseInt(process.env.EBAY_RATE_LIMIT || '10', 10),
    },
  },
};
