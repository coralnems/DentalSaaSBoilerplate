const dotenv = require('dotenv');
const path = require('path');
const logger = require('./logger');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

// Environment variable validation
const validateEnv = () => {
  const missingVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingVars.length > 0) {
    const error = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }
};

// Environment configuration
const env = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  API_VERSION: process.env.API_VERSION || 'v1',
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI,
  MONGODB_DEV_URI: process.env.MONGODB_DEV_URI,
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  
  // Redis configuration
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  
  // Email configuration
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  
  // Storage configuration
  STORAGE_TYPE: process.env.STORAGE_TYPE || 'local',
  S3_BUCKET: process.env.S3_BUCKET,
  S3_REGION: process.env.S3_REGION,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  
  // Security configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  
  // Monitoring configuration
  SENTRY_DSN: process.env.SENTRY_DSN,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Feature flags
  ENABLE_MFA: process.env.ENABLE_MFA === 'true',
  ENABLE_RATE_LIMIT: process.env.ENABLE_RATE_LIMIT !== 'false',
  ENABLE_SWAGGER: process.env.ENABLE_SWAGGER !== 'false',
  
  // Payment configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_CURRENCY: process.env.STRIPE_CURRENCY || 'usd',
  
  // Cache configuration
  CACHE_TTL: parseInt(process.env.CACHE_TTL, 10) || 3600,
  CACHE_MAX: parseInt(process.env.CACHE_MAX, 10) || 500
};

// Environment-specific settings
const envSettings = {
  development: {
    isDev: true,
    isProd: false,
    isTest: false
  },
  production: {
    isDev: false,
    isProd: true,
    isTest: false
  },
  test: {
    isDev: false,
    isProd: false,
    isTest: true
  }
};

// Merge environment-specific settings
Object.assign(env, envSettings[env.NODE_ENV] || envSettings.development);

// Validate environment variables in production
if (env.isProd) {
  validateEnv();
}

module.exports = env; 