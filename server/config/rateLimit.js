const rateLimit = require('express-rate-limit');

// Base rate limiter configuration
const baseConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
};

// Rate limiters for different routes
const rateLimiters = {
  // API general rate limiter
  api: rateLimit({
    ...baseConfig,
    max: 100 // 100 requests per 15 minutes
  }),

  // Authentication routes rate limiter
  auth: rateLimit({
    ...baseConfig,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    message: 'Too many login attempts, please try again after an hour'
  }),

  // File upload rate limiter
  upload: rateLimit({
    ...baseConfig,
    max: 10, // 10 uploads per 15 minutes
    message: 'Too many file uploads, please try again after 15 minutes'
  }),

  // Report generation rate limiter
  reports: rateLimit({
    ...baseConfig,
    max: 20, // 20 reports per 15 minutes
    message: 'Too many report requests, please try again after 15 minutes'
  }),

  // SMS/Email notifications rate limiter
  notifications: rateLimit({
    ...baseConfig,
    max: 50, // 50 notifications per 15 minutes
    message: 'Too many notification requests, please try again after 15 minutes'
  }),

  // Analytics endpoints rate limiter
  analytics: rateLimit({
    ...baseConfig,
    max: 30, // 30 analytics requests per 15 minutes
    message: 'Too many analytics requests, please try again after 15 minutes'
  }),

  // Insurance verification rate limiter
  insurance: rateLimit({
    ...baseConfig,
    max: 40, // 40 verifications per 15 minutes
    message: 'Too many insurance verification requests, please try again after 15 minutes'
  }),

  // Payment processing rate limiter
  payment: rateLimit({
    ...baseConfig,
    max: 15, // 15 payment requests per 15 minutes
    message: 'Too many payment requests, please try again after 15 minutes'
  })
};

module.exports = rateLimiters; 