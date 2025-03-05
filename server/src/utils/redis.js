const Redis = require('ioredis');
require('dotenv').config();

// Get Redis configuration from environment variables
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || null;

/**
 * Redis client configuration
 */
const redisConfig = {
  retryStrategy: (times) => {
    // Exponential backoff for retry
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// Add password if specified
if (REDIS_PASSWORD) {
  redisConfig.password = REDIS_PASSWORD;
}

// Create Redis client
const redisClient = new Redis(REDIS_URL, redisConfig);

// Log connection status
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

/**
 * Redis wrapper with utility methods
 */
const redis = {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<string|null>} - Cached data or null
   */
  async get(key) {
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {string} value - Value to cache
   * @param {string} [flag='EX'] - Redis flag (EX, PX, etc.)
   * @param {number} [expiry=3600] - Expiry time in seconds or milliseconds
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, flag = 'EX', expiry = 3600) {
    try {
      await redisClient.set(key, value, flag, expiry);
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  },

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  },

  /**
   * Set hash field value
   * @param {string} key - Hash key
   * @param {string} field - Hash field
   * @param {string} value - Value to set
   * @returns {Promise<boolean>} - Success status
   */
  async hset(key, field, value) {
    try {
      await redisClient.hset(key, field, value);
      return true;
    } catch (error) {
      console.error('Redis hset error:', error);
      return false;
    }
  },

  /**
   * Get hash field value
   * @param {string} key - Hash key
   * @param {string} field - Hash field
   * @returns {Promise<string|null>} - Field value or null
   */
  async hget(key, field) {
    try {
      return await redisClient.hget(key, field);
    } catch (error) {
      console.error('Redis hget error:', error);
      return null;
    }
  },

  /**
   * Get all hash fields and values
   * @param {string} key - Hash key
   * @returns {Promise<Object|null>} - Hash fields and values or null
   */
  async hgetall(key) {
    try {
      return await redisClient.hgetall(key);
    } catch (error) {
      console.error('Redis hgetall error:', error);
      return null;
    }
  },

  /**
   * Flush all keys in the current database
   * @returns {Promise<boolean>} - Success status
   */
  async flushdb() {
    try {
      await redisClient.flushdb();
      return true;
    } catch (error) {
      console.error('Redis flushdb error:', error);
      return false;
    }
  },

  /**
   * Check if Redis is connected
   * @returns {boolean} - Connection status
   */
  isConnected() {
    return redisClient.status === 'ready';
  },

  /**
   * Close Redis connection
   * @returns {Promise<void>}
   */
  async close() {
    try {
      await redisClient.quit();
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
};

module.exports = redis; 