const Redis = require('ioredis');
const logger = require('./logger');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
};

// Create Redis client
const redisClient = new Redis(redisConfig);

// Redis event handlers
redisClient.on('connect', () => {
  logger.info('Redis client connected successfully');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('ready', () => {
  logger.info('Redis client ready to accept commands');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis client reconnecting...');
});

redisClient.on('end', () => {
  logger.warn('Redis client connection closed');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Closing Redis connection...');
  await redisClient.quit();
  process.exit(0);
});

module.exports = redisClient; 