const redisService = require('../services/redis.service');

/**
 * Redis Controller for handling Redis-related API requests
 */
class RedisController {
  /**
   * Get a value from Redis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getValue(req, res) {
    try {
      const { key } = req.params;
      
      if (!key) {
        return res.status(400).json({ message: 'Key is required' });
      }
      
      const value = await redisService.get(key);
      
      if (value === null) {
        return res.status(404).json({ message: 'Key not found' });
      }
      
      return res.status(200).json(value);
    } catch (error) {
      console.error('Error in Redis getValue:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Set a value in Redis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async setValue(req, res) {
    try {
      const { key, value, expiry } = req.body;
      
      if (!key || value === undefined) {
        return res.status(400).json({ message: 'Key and value are required' });
      }
      
      const success = await redisService.set(key, value, expiry);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to set value in Redis' });
      }
      
      return res.status(200).json({ message: 'Value set successfully' });
    } catch (error) {
      console.error('Error in Redis setValue:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Delete a key from Redis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteKey(req, res) {
    try {
      const { key } = req.params;
      
      if (!key) {
        return res.status(400).json({ message: 'Key is required' });
      }
      
      const success = await redisService.delete(key);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to delete key from Redis' });
      }
      
      return res.status(200).json({ message: 'Key deleted successfully' });
    } catch (error) {
      console.error('Error in Redis deleteKey:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new RedisController(); 