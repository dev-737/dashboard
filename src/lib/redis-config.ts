import { Redis } from 'ioredis';

/**
 * Redis configuration for rate limiting
 */
export interface RedisConfig {
  url: string;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
  keepAlive: number;
  connectTimeout: number;
  commandTimeout: number;
}

/**
 * Default Redis configuration optimized for rate limiting
 */
export const DEFAULT_REDIS_CONFIG: Omit<RedisConfig, 'url'> = {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

/**
 * Redis client singleton for rate limiting
 */
class RedisManager {
  private static instance: RedisManager;
  private client: Redis | null = null;
  private isConnecting = false;

  private constructor() {}

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  public async getClient(): Promise<Redis | null> {
    if (this.client && this.client.status === 'ready') {
      return this.client;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (!this.isConnecting) {
            resolve(this.client);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.warn(
        'REDIS_URL environment variable not set, rate limiting will use in-memory fallback'
      );
      return null;
    }

    this.isConnecting = true;

    try {
      this.client = new Redis(redisUrl, {
        ...DEFAULT_REDIS_CONFIG,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.client.on('error', (error) => {
        console.error('Redis connection error:', error.message);
      });

      this.client.on('close', () => {
        console.warn(
          '⚠️ Redis connection closed, rate limiting will use memory fallback'
        );
      });

      this.client.on('reconnecting', () => {
        console.log('Redis reconnecting...');
      });

      // Test the connection
      await this.client.ping();

      this.isConnecting = false;
      return this.client;
    } catch (error) {
      console.error('❌ Failed to initialize Redis for rate limiting:', error);
      this.client = null;
      this.isConnecting = false;
      return null;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        console.log('Redis disconnected gracefully');
      } catch (error) {
        console.error('Error disconnecting Redis:', error);
      } finally {
        this.client = null;
      }
    }
  }

  public getConnectionStatus(): string {
    if (!this.client) return 'disconnected';
    return this.client.status;
  }

  public async healthCheck(): Promise<{
    connected: boolean;
    status: string;
    latency?: number;
    error?: string;
  }> {
    if (!this.client) {
      return {
        connected: false,
        status: 'no-client',
      };
    }

    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;

      return {
        connected: true,
        status: this.client.status,
        latency,
      };
    } catch (error) {
      return {
        connected: false,
        status: this.client.status,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Get the Redis client instance for rate limiting
 */
export async function getRedisClient(): Promise<Redis | null> {
  const manager = RedisManager.getInstance();
  return await manager.getClient();
}

/**
 * Disconnect Redis client (useful for cleanup in tests or shutdown)
 */
export async function disconnectRedis(): Promise<void> {
  const manager = RedisManager.getInstance();
  await manager.disconnect();
}

/**
 * Get Redis connection status
 */
export function getRedisStatus(): string {
  const manager = RedisManager.getInstance();
  return manager.getConnectionStatus();
}

/**
 * Perform Redis health check
 */
export async function checkRedisHealth(): Promise<{
  connected: boolean;
  status: string;
  latency?: number;
  error?: string;
}> {
  const manager = RedisManager.getInstance();
  return await manager.healthCheck();
}

/**
 * Redis key utilities for rate limiting
 */
export const RedisKeys = {
  rateLimit: (identifier: string, endpoint: string) =>
    `rate_limit:${identifier}:${endpoint}`,

  rateLimitGlobal: (endpoint: string) => `rate_limit:global:${endpoint}`,

  rateLimitUser: (userId: string, endpoint: string) =>
    `rate_limit:user:${userId}:${endpoint}`,

  rateLimitIP: (ip: string, endpoint: string) =>
    `rate_limit:ip:${ip}:${endpoint}`,
};

/**
 * Redis rate limiting operations
 */
export const RedisRateLimitOps = {
  /**
   * Get rate limit data from Redis
   */
  async get(
    client: Redis,
    key: string
  ): Promise<{
    limit: number;
    remaining: number;
    reset: number;
  } | null> {
    try {
      const result = await client.hmget(key, 'limit', 'remaining', 'reset');
      if (result && result[0] !== null) {
        return {
          limit: parseInt(result[0] as string, 10),
          remaining: parseInt(result[1] as string, 10),
          reset: parseInt(result[2] as string, 10),
        };
      }
      return null;
    } catch (error) {
      console.error('Redis rate limit get error:', error);
      return null;
    }
  },

  /**
   * Set rate limit data in Redis
   */
  async set(
    client: Redis,
    key: string,
    data: {
      limit: number;
      remaining: number;
      reset: number;
    },
    ttl: number
  ): Promise<boolean> {
    try {
      const pipeline = client.pipeline();
      pipeline.hmset(key, {
        limit: data.limit,
        remaining: data.remaining,
        reset: data.reset,
      });
      pipeline.expire(key, ttl);

      const results = await pipeline.exec();
      return results?.every(([error]) => error === null) || false;
    } catch (error) {
      console.error('Redis rate limit set error:', error);
      return false;
    }
  },

  /**
   * Delete rate limit data from Redis
   */
  async delete(client: Redis, key: string): Promise<boolean> {
    try {
      const result = await client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis rate limit delete error:', error);
      return false;
    }
  },
};
