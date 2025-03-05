const Redis = require('ioredis');
require('dotenv').config();

// Log environment variables being used
console.log('Redis connection details:');
console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retryStrategy: function(times) {
    console.log(`Redis connection retry attempt: ${times}`);
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
};

console.log('Connecting to Redis with config:', redisConfig);

// Create Redis client
const client = new Redis(redisConfig);

// Redis event handlers
client.on('connect', () => {
  console.log('Redis client connected successfully');
});

client.on('ready', () => {
  console.log('Redis client ready to accept commands');
  
  // After successful connection, perform a simple test
  setTimeout(function() {
    client.set('test_key', 'test_value', (err, result) => {
      if (err) {
        console.error('Error setting test key:', err);
      } else {
        console.log('Successfully set test key:', result);
        
        client.get('test_key', (err, value) => {
          if (err) {
            console.error('Error getting test key:', err);
          } else {
            console.log('Retrieved test key:', value);
            
            client.quit(function(err, result) {
              console.log('Redis client closed:', result);
            });
          }
        });
      }
    });
  }, 1000);
});

client.on('error', (err) => {
  console.error('Redis client error:', err);
});

client.on('end', () => {
  console.log('Redis client connection closed');
}); 