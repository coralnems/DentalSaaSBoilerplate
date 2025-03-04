const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const logger = require('../config/logger');

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Speed limiting middleware
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 50
});

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://dentalclinic.com', 'https://admin.dentalclinic.com']
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600 // 10 minutes
};

// Content Security Policy configuration
const cspOptions = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https:'],
    fontSrc: ["'self'", 'https:', 'data:'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin'],
    reportUri: '/api/v1/security/csp-report',
    reportOnly: false
  }
};

// Helmet configuration
const helmetConfig = {
  contentSecurityPolicy: cspOptions,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
};

// HPP (HTTP Parameter Pollution) whitelist
const hppWhitelist = [
  'sort',
  'page',
  'limit',
  'fields',
  'filter'
];

// Security middleware
const securityMiddleware = [
  // Apply Helmet security headers
  helmet(helmetConfig),

  // Prevent XSS attacks
  xss(),

  // Sanitize MongoDB queries
  mongoSanitize({
    allowDots: true,
    replaceWith: '_'
  }),

  // Prevent HTTP Parameter Pollution
  hpp({
    whitelist: hppWhitelist
  }),

  // Custom security headers
  (req, res, next) => {
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Feature-Policy', "camera 'none'; microphone 'none'");

    // Log security violations
    if (req.headers['x-forwarded-for']) {
      logger.warn(`Proxy detected: ${req.headers['x-forwarded-for']}`);
    }

    next();
  }
];

// CSP violation report handler
const cspReportHandler = (req, res) => {
  logger.warn('CSP Violation:', req.body);
  res.status(204).end();
};

// Function to check file types for upload
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetable)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.'), false);
  }
};

// Function to validate file size
const fileSizeLimit = {
  fileSize: 5 * 1024 * 1024 // 5MB
};

module.exports = {
  securityMiddleware,
  cspReportHandler,
  fileFilter,
  fileSizeLimit,
  limiter,
  speedLimiter,
}; 