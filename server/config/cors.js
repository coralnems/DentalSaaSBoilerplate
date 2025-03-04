const logger = require('./logger');

const corsOptions = {
  development: {
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400 // 24 hours
  },
  production: {
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const msg = 'CORS policy violation: origin not allowed';
        logger.warn(`${msg}: ${origin}`);
        callback(new Error(msg));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
  }
};

// Get CORS options based on environment
const getCorsOptions = () => {
  const env = process.env.NODE_ENV || 'development';
  return corsOptions[env] || corsOptions.development;
};

module.exports = getCorsOptions;