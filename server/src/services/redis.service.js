const Redis = require('ioredis');
const { promisify } = require('util');

/**
 * Redis Service for server-side operations
 * This service is designed to gracefully handle Redis connection failures
 * and allow the application to continue functioning without Redis
 */
class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionAttempted = false;
    
    // Create a local memory cache as fallback when Redis is not available
    this.memoryCache = new Map();
    
    // Initialize Redis connection
    this.init();
  }

  /**
   * Initialize the Redis client
   */
  async init() {
    try {
      if (this.connectionAttempted) return;
      this.connectionAttempted = true;

      // Redis configuration
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
        retryStrategy: (times) => {
          if (times > 5) {
            console.log('Redis connection failed after 5 retries, will not attempt further reconnections');
            console.log('Application will continue using in-memory cache as fallback');
            return false; // Stop reconnecting after 5 attempts
          }
          return Math.min(times * 100, 3000); // Reconnect with increasing delay
        },
        maxRetriesPerRequest: 3
      };
      
      console.log('Attempting to connect to Redis at:', `${redisConfig.host}:${redisConfig.port}`);
      
      // Create Redis client
      this.client = new Redis(redisConfig);

      // Handle events
      this.client.on('connect', () => {
        console.log('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('Redis client disconnected');
        this.isConnected = false;
      });

      // Wait for ready event
      this.client.on('ready', () => {
        console.log('Redis client ready to accept commands');
        this.isConnected = true;
      });

      // Promisify Redis commands if needed
      if (this.isConnected) {
        // ioredis already returns promises, so no need to promisify
        this.getAsync = this.client.get.bind(this.client);
        this.setAsync = this.client.set.bind(this.client);
        this.delAsync = this.client.del.bind(this.client);
        this.expireAsync = this.client.expire.bind(this.client);
      }
    } catch (error) {
      console.error('Redis initialization error:', error);
      console.log('Application will continue using in-memory cache as fallback');
      this.isConnected = false;
    }
  }

  /**
   * Get a value from Redis or memory cache
   * @param {string} key - The key to get
   * @returns {Promise<any>} - The value or null if not found
   */
  async get(key) {
    if (this.isConnected) {
      try {
        const value = await this.getAsync(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error(`Error getting Redis key ${key}:`, error);
        // Fall back to memory cache
        return this.memoryCache.get(key) || null;
      }
    } else {
      // Use memory cache when Redis is not available
      return this.memoryCache.get(key) || null;
    }
  }

  /**
   * Set a value in Redis or memory cache
   * @param {string} key - The key to set
   * @param {any} value - The value to set
   * @param {number} [expiry] - Optional expiry time in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, expiry) {
    if (this.isConnected) {
      try {
        const stringValue = JSON.stringify(value);
        await this.setAsync(key, stringValue);
        
        if (expiry) {
          await this.expireAsync(key, expiry);
        }
        
        return true;
      } catch (error) {
        console.error(`Error setting Redis key ${key}:`, error);
        // Fall back to memory cache
        this.memoryCache.set(key, value);
        return true;
      }
    } else {
      // Use memory cache when Redis is not available
      this.memoryCache.set(key, value);
      return true;
    }
  }

  /**
   * Delete a key from Redis or memory cache
   * @param {string} key - The key to delete
   * @returns {Promise<boolean>} - Success status
   */
  async delete(key) {
    if (this.isConnected) {
      try {
        await this.delAsync(key);
        return true;
      } catch (error) {
        console.error(`Error deleting Redis key ${key}:`, error);
        // Fall back to memory cache
        this.memoryCache.delete(key);
        return true;
      }
    } else {
      // Use memory cache when Redis is not available
      this.memoryCache.delete(key);
      return true;
    }
  }

  /**
   * Close the Redis connection
   */
  async close() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
    // Clear memory cache
    this.memoryCache.clear();
  }
}

module.exports = new RedisService(); 