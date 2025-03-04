const redis = require('../config/redis');
const logger = require('../config/logger');

// Cache key generator
const generateCacheKey = (req) => {
  const tenant = req.tenant?._id || 'public';
  const path = req.originalUrl || req.url;
  const query = JSON.stringify(req.query || {});
  return `cache:${tenant}:${path}:${query}`;
};

// Cache duration (in seconds)
const CACHE_DURATIONS = {
  short: 300, // 5 minutes
  medium: 1800, // 30 minutes
  long: 3600, // 1 hour
  day: 86400 // 24 hours
};

// Cache middleware
const cache = (duration = 'medium') => {
  return async (req, res, next) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req);
    const cacheDuration = CACHE_DURATIONS[duration] || CACHE_DURATIONS.medium;

    try {
      // Check cache
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        const data = JSON.parse(cachedData);
        logger.debug(`Cache hit for key: ${cacheKey}`);
        return res.json(data);
      }

      // Store original send
      const originalSend = res.send;

      // Override send
      res.send = function (body) {
        // Only cache successful responses
        if (res.statusCode === 200) {
          redis.setex(cacheKey, cacheDuration, JSON.stringify(body))
            .catch(err => logger.error('Cache set error:', err));
        }
        
        // Call original send
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    const tenant = req.tenant?._id || 'public';
    
    try {
      // Process each pattern
      for (const pattern of patterns) {
        const cachePattern = `cache:${tenant}:${pattern}*`;
        const keys = await redis.keys(cachePattern);
        
        if (keys.length > 0) {
          await redis.del(keys);
          logger.debug(`Invalidated cache keys matching pattern: ${cachePattern}`);
        }
      }
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }

    next();
  };
};

// Cache clear by tenant
const clearTenantCache = async (tenantId) => {
  try {
    const pattern = `cache:${tenantId}:*`;
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(keys);
      logger.info(`Cleared all cache for tenant: ${tenantId}`);
    }
  } catch (error) {
    logger.error('Clear tenant cache error:', error);
    throw error;
  }
};

// Cache warmup for frequently accessed data
const warmupCache = async (req, warmupFn, key, duration = 'long') => {
  const cacheKey = `cache:warmup:${key}`;
  const cacheDuration = CACHE_DURATIONS[duration] || CACHE_DURATIONS.long;

  try {
    const data = await warmupFn();
    await redis.setex(cacheKey, cacheDuration, JSON.stringify(data));
    logger.info(`Cache warmup completed for key: ${cacheKey}`);
    return data;
  } catch (error) {
    logger.error('Cache warmup error:', error);
    throw error;
  }
};

module.exports = {
  cache,
  invalidateCache,
  clearTenantCache,
  warmupCache,
  CACHE_DURATIONS
}; 