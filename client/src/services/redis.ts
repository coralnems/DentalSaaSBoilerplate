import { api } from './api';

/**
 * Redis service for client-side operations
 * Note: Direct Redis connections are not possible from the browser.
 * This service uses the API as a proxy to interact with Redis.
 */
class RedisService {
  /**
   * Get a value from Redis
   * @param key The key to get
   * @returns The value or null if not found
   */
  async get(key: string): Promise<any> {
    try {
      const response = await api.get(`/redis/${key}`);
      return response.data;
    } catch (error) {
      console.error('Error getting Redis value:', error);
      return null;
    }
  }

  /**
   * Set a value in Redis
   * @param key The key to set
   * @param value The value to set
   * @param expiry Optional expiry time in seconds
   * @returns Success status
   */
  async set(key: string, value: any, expiry?: number): Promise<boolean> {
    try {
      await api.post('/redis', { key, value, expiry });
      return true;
    } catch (error) {
      console.error('Error setting Redis value:', error);
      return false;
    }
  }

  /**
   * Delete a key from Redis
   * @param key The key to delete
   * @returns Success status
   */
  async delete(key: string): Promise<boolean> {
    try {
      await api.delete(`/redis/${key}`);
      return true;
    } catch (error) {
      console.error('Error deleting Redis key:', error);
      return false;
    }
  }
}

export const redisService = new RedisService(); 