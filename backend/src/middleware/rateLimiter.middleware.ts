import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import redis from '../config/redis';
import { RATE_LIMIT_CONFIG } from '../config';

// Global rate limiter
export const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.windowMs,
  max: RATE_LIMIT_CONFIG.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for booking endpoints
export const bookingLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many booking requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limiter (login, register)
export const authLimiter = rateLimit({
  windowMs: 900000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Per-user rate limiter using Redis
export const perUserLimiter = (maxRequests: number = 60, windowMs: number = 60000) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      next();
      return;
    }

    const userId = req.user.id;
    const key = `ratelimit:${userId}:${req.path}`;

    try {
      const requests = await redis.incr(key);

      if (requests === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      if (requests > maxRequests) {
        res.status(429).json({
          error: 'Too many requests, please try again later',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
};
