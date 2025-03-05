# Redis Integration Guide

This guide explains how to use Redis in the MERN Boilerplate application.

## Docker Container Configuration

The application uses a Redis Docker container with the following configuration:

```json
{
  "Id": "f0d6d31c4e8dd35e01dfbec12b4639f6cb2c4b3362404ae161d2cb184b77993c",
  "Image": "redis/redis-stack-server:latest",
  "Ports": {
    "6379/tcp": null
  },
  "IPAddress": "localhost",
  "IPPrefixLen": 16
}
```

## Environment Variables

### Client (.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_ENCRYPTION_KEY=secure-encryption-key-for-development
VITE_REDIS_HOST=172.17.0.2
VITE_REDIS_PORT=6379
VITE_REDIS_PASSWORD=
```

### Server (.env)

```
# Redis Configuration
REDIS_HOST=172.17.0.2
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://172.17.0.2:6379
```

## Server-Side Redis Usage

The server uses Redis for caching and session management. Here's how to use it:

```javascript
const redisService = require('./services/redis.service');

// Store data in Redis
await redisService.set('key', { data: 'value' }, 3600); // Expires in 1 hour

// Retrieve data from Redis
const data = await redisService.get('key');

// Delete data from Redis
await redisService.delete('key');
```

## Client-Side Redis Usage

Since browsers cannot connect directly to Redis, the client uses the API as a proxy:

```javascript
import { redisService } from './services/redis';

// Store data in Redis
await redisService.set('user:preferences', { theme: 'dark' }, 86400); // Expires in 24 hours

// Retrieve data from Redis
const preferences = await redisService.get('user:preferences');

// Delete data from Redis
await redisService.delete('user:preferences');
```

## API Endpoints

The application provides the following Redis-related API endpoints:

- `GET /api/redis/:key` - Get a value from Redis
- `POST /api/redis` - Set a value in Redis (requires key, value, and optional expiry)
- `DELETE /api/redis/:key` - Delete a key from Redis

All endpoints require authentication.

## Common Use Cases

1. **Session Storage**: Store user sessions for faster access
2. **Caching**: Cache frequently accessed data to reduce database load
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Temporary Data Storage**: Store temporary data that doesn't need to be persisted long-term

## Monitoring Redis

You can monitor Redis using the Redis CLI:

```bash
docker exec -it recursing_lichterman redis-cli
```

Common commands:
- `MONITOR` - Watch all Redis commands in real-time
- `INFO` - Get information about the Redis server
- `KEYS *` - List all keys (use with caution in production)
- `TTL key` - Check the time-to-live for a key 