import { getRedisClient } from './redis-config';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  memoryTtl?: number; // Memory cache TTL in seconds (shorter than Redis)
}

export class PerformanceCache {
  private static instance: PerformanceCache;

  static getInstance(): PerformanceCache {
    if (!PerformanceCache.instance) {
      PerformanceCache.instance = new PerformanceCache();
    }
    return PerformanceCache.instance;
  }

  private async getRedisClient() {
    const redis = await getRedisClient();
    if (!redis) {
      throw new Error('Redis not available');
    }
    return redis;
  }

  /**
   * Get data from cache with multi-layer strategy:
   * 1. Memory cache (fastest)
   * 2. Redis cache (fast)
   * 3. Database (slowest)
   */
  async get<T>(key: string): Promise<T | null> {
    const redis = await this.getRedisClient();

    // Check Redis cache
    try {
      const redisData = await redis.get(key);
      if (redisData) {
        if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_CACHE) {
          console.log(`Redis cache hit for key: ${key}`);
        }
        const parsed = JSON.parse(redisData) as T;
        return parsed;
      }
    } catch (error) {
      console.error('Redis cache error:', error);
    }

    return null;
  }

  /**
   * Set data in both memory and Redis cache
   */
  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const { ttl = 300 } = options;

    // Set in Redis cache
    try {
      const redis = await this.getRedisClient();
      await redis.set(key, JSON.stringify(data), 'EX', ttl);
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  /**
   * Invalidate cache for a specific key
   */
  async invalidate(key: string): Promise<void> {
    const redis = await this.getRedisClient();
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    const redis = await this.getRedisClient();
    try {
      await redis.flushall();
    } catch (error) {
      console.error('Redis cache clear error:', error);
    }
  }
}

// Cache keys

export const cache = PerformanceCache.getInstance();
