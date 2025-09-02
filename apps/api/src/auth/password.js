import bcrypt from 'bcryptjs';
import { logger } from '../lib/logger';

export class PasswordService {
  static SALT_ROUNDS = 12;

  static async hash(password) {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hash = await bcrypt.hash(password, salt);
      logger.debug('Password hashed successfully');
      return hash;
    } catch (error) {
      logger.error('Password hashing failed:', error);
      throw new Error('Password hashing failed');
    }
  }

  static async verify(password, hash) {
    try {
      const isValid = await bcrypt.compare(password, hash);
      logger.debug(`Password verification ${isValid ? 'successful' : 'failed'}`);
      return isValid;
    } catch (error) {
      logger.error('Password verification failed:', error);
      throw new Error('Password verification failed');
    }
  }

  static validate(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
