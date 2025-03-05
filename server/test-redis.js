require('dotenv').config();
const Redis = require('ioredis');
const { logger } = require('./src/middleware/errorHandler');

async function testRedisConnection() {
  try {
    // Get Redis connection details from environment variables
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:32769';
    
    logger.info(`Attempting to connect to Redis at ${redisUrl}`);
    
    // Create Redis client
    const redis = new Redis(redisUrl);
    
    // Test connection with a ping-pong
    redis.on('connect', async () => {
      logger.info('Connected to Redis successfully!');
      
      // Set a test value
      await redis.set('test_key', 'Connection successful at ' + new Date().toISOString());
      
      // Get the test value
      const value = await redis.get('test_key');
      logger.info(`Retrieved test value: ${value}`);
      
      // Close connection
      redis.quit();
      logger.info('Redis connection closed');
    });
    
    // Handle connection errors
    redis.on('error', (error) => {
      logger.error('Redis connection error:', error.message);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Error in Redis test script:', error.message);
    process.exit(1);
  }
}

// Run the test
testRedisConnection(); 