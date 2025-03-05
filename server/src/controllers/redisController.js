const Redis = require('ioredis');
const { BadRequestError } = require('../utils/errors');

// Create Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
});

// Handle Redis connection events
redisClient.on('connect', function() {
  console.log('Redis client connected');
});

redisClient.on('error', function(err) {
  console.error('Redis client error:', err);
});

/**
 * Get a value from Redis
 * @route GET /api/redis/:key
 * @access Private/Admin
 */
function getValue(req, res) {
  try {
    const { key } = req.params;
    
    if (!key) {
      throw new BadRequestError('Key is required');
    }
    
    redisClient.get(key)
      .then(value => {
        res.status(200).json({
          success: true,
          data: value
        });
      })
      .catch(error => {
        console.error('Error in Redis getValue:', error);
        res.status(500).json({ message: error.message || 'Server error' });
      });
  } catch (error) {
    console.error('Error in Redis getValue:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
}

/**
 * Set a value in Redis
 * @route POST /api/redis
 * @access Private/Admin
 */
function setValue(req, res) {
  try {
    const { key, value, expiry } = req.body;
    
    if (!key || value === undefined) {
      throw new BadRequestError('Key and value are required');
    }
    
    let setPromise;
    
    if (expiry) {
      setPromise = redisClient.set(key, value, 'EX', expiry);
    } else {
      setPromise = redisClient.set(key, value);
    }
    
    setPromise
      .then(result => {
        res.status(200).json({
          success: true,
          data: result
        });
      })
      .catch(error => {
        console.error('Error in Redis setValue:', error);
        res.status(500).json({ message: error.message || 'Server error' });
      });
  } catch (error) {
    console.error('Error in Redis setValue:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
}

/**
 * Delete a value from Redis
 * @route DELETE /api/redis/:key
 * @access Private/Admin
 */
function deleteValue(req, res) {
  try {
    const { key } = req.params;
    
    if (!key) {
      throw new BadRequestError('Key is required');
    }
    
    redisClient.del(key)
      .then(result => {
        res.status(200).json({
          success: true,
          data: result
        });
      })
      .catch(error => {
        console.error('Error in Redis deleteValue:', error);
        res.status(500).json({ message: error.message || 'Server error' });
      });
  } catch (error) {
    console.error('Error in Redis deleteValue:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
}

/**
 * Get all keys matching a pattern
 * @route GET /api/redis/keys/:pattern
 * @access Private/Admin
 */
function getKeys(req, res) {
  try {
    const { pattern } = req.params;
    
    redisClient.keys(pattern || '*')
      .then(keys => {
        res.status(200).json({
          success: true,
          count: keys.length,
          data: keys
        });
      })
      .catch(error => {
        console.error('Error in Redis getKeys:', error);
        res.status(500).json({ message: error.message || 'Server error' });
      });
  } catch (error) {
    console.error('Error in Redis getKeys:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
}

module.exports = {
  getValue,
  setValue,
  deleteValue,
  getKeys,
  redisClient
}; 