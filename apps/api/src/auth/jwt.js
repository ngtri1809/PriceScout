import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../lib/logger';

export class JWTService {
  static generateToken(payload) {
    try {
      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        issuer: 'pricescout-api',
        audience: 'pricescout-client',
      });
      
      logger.debug(`JWT token generated for user: ${payload.email}`);
      return token;
    } catch (error) {
      logger.error('JWT token generation failed:', error);
      throw new Error('Token generation failed');
    }
  }

  static verifyToken(token) {
    try {
      const payload = jwt.verify(token, config.jwt.secret, {
        issuer: 'pricescout-api',
        audience: 'pricescout-client',
      });
      
      logger.debug(`JWT token verified for user: ${payload.email}`);
      return payload;
    } catch (error) {
      logger.error('JWT token verification failed:', error);
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  static decodeToken(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded;
    } catch (error) {
      logger.error('JWT token decode failed:', error);
      return null;
    }
  }

  static isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch (error) {
      return true;
    }
  }
}
