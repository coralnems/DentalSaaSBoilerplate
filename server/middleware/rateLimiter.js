const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../config/redis');
const AppError = require('../middleware/errorHandler').AppError;

// Base rate limiter configuration
const createLimiter = (options) => {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rate-limit:',
      ...options.redis
    }),
    windowMs: options.windowMs || 15 * 60 * 1000, // Default: 15 minutes
    max: options.max || 100, // Default: 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: options.windowMs / 1000 // in seconds
    },
    handler: (req, res) => {
      throw new AppError('Rate limit exceeded', 429);
    },
    keyGenerator: (req) => {
      // Use IP + user ID (if authenticated) as key
      return req.user ? `${req.ip}-${req.user._id}` : req.ip;
    },
    skip: (req) => {
      // Skip rate limiting for certain roles if specified
      if (options.skipRoles && req.user && options.skipRoles.includes(req.user.role)) {
        return true;
      }
      return false;
    }
  });
};

// Different rate limiters for various endpoints
const rateLimiters = {
  // Auth endpoints - stricter limits
  auth: createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    redis: {
      prefix: 'rate-limit:auth:'
    }
  }),

  // API endpoints - normal limits
  api: createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    redis: {
      prefix: 'rate-limit:api:'
    },
    skipRoles: ['admin'] // Admins bypass rate limiting
  }),

  // Public endpoints - generous limits
  public: createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per 15 minutes
    redis: {
      prefix: 'rate-limit:public:'
    }
  })
};

module.exports = rateLimiters;