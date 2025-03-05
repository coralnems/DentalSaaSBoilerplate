const redis = require('redis');
require('dotenv').config();

// Log environment variables being used
console.log('Redis connection details:');
console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);

// Use the same connection logic as in the service
const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;
console.log('Connecting to Redis at:', redisUrl);

// Create Redis client
const client = redis.createClient({
  url: redisUrl,
  password: process.env.REDIS_PASSWORD || '',
  socket: {
    reconnectStrategy: function(retries) {
      console.log(`Redis connection retry attempt: ${retries}`);
      if (retries > 3) {
        console.log('Redis connection failed after 3 retries');
        return false; // Stop reconnecting
      }
      return Math.min(retries * 100, 3000); // Reconnect with increasing delay
    }
  }
});

// Handle events
client.on('connect', () => {
  console.log('Redis client connected successfully');
});

client.on('ready', () => {
  console.log('Redis client ready to accept commands');
  
  // After successful connection, perform a simple test
  setTimeout(async function() {
    try {
      await client.set('test_key', 'test_value');
      console.log('Successfully set test key');
      
      const value = await client.get('test_key');
      console.log('Retrieved test key:', value);
      
      await client.quit();
      console.log('Redis client closed');
    } catch (err) {
      console.error('Error during Redis operations:', err);
    }
  }, 1000);
});

client.on('error', (err) => {
  console.error('Redis client error:', err);
});

client.on('end', () => {
  console.log('Redis client connection closed');
});

// Connect to Redis
console.log('Attempting to connect to Redis...');
client.connect().catch(function(err) {
  console.error('Redis connection failed:', err.message);
}); 