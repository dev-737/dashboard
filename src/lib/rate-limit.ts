import type Redis from 'ioredis';
import { type NextRequest, NextResponse } from 'next/server';
import { getRedisClient, RedisRateLimitOps } from './redis-config';

interface RateLimitContextBase {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface RateLimitContext extends RateLimitContextBase {
  success: boolean;
  identifier: string;
  endpoint: string;
}

export interface RateLimitConfig {
  limit: number;
  timeframe: number; // in seconds
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: NextRequest, identifier: string) => string;
}

export interface RateLimitTier {
  name: string;
  config: RateLimitConfig;
}

// Enhanced rate limit tiers for different endpoint types
export const RATE_LIMIT_TIERS = {
  // Very restrictive for sensitive operations
  CRITICAL: {
    name: 'critical',
    config: {
      limit: 50,
      timeframe: 300, // 5 minutes
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
  },
  // Restrictive for write operations
  STRICT: {
    name: 'strict',
    config: {
      limit: 100,
      timeframe: 60, // 1 minute
      skipSuccessfulRequests: false,
      skipFailedRequests: true,
    },
  },
  // Moderate for authenticated endpoints
  MODERATE: {
    name: 'moderate',
    config: {
      limit: 150,
      timeframe: 60, // 1 minute
      skipSuccessfulRequests: false,
      skipFailedRequests: true,
    },
  },
  // Lenient for read operations
  LENIENT: {
    name: 'lenient',
    config: {
      limit: 400,
      timeframe: 60, // 1 minute
      skipSuccessfulRequests: true,
      skipFailedRequests: true,
    },
  },
  // Very lenient for public read-only endpoints
  PUBLIC: {
    name: 'public',
    config: {
      limit: 200,
      timeframe: 60, // 1 minute
      skipSuccessfulRequests: true,
      skipFailedRequests: true,
    },
  },
} as const;

// Redis client is now managed by redis-config.ts

// Fallback in-memory store when Redis is unavailable
const fallbackCache: Record<string, RateLimitContextBase> = {};

// Cleanup old entries periodically to prevent memory leaks in fallback mode
const CLEANUP_INTERVAL = 300000; // 5 minutes
let lastCleanup = Date.now();

function cleanupFallbackCache(): void {
  const now = Math.floor(Date.now() / 1000);

  if (now - lastCleanup < CLEANUP_INTERVAL / 1000) {
    return;
  }

  for (const [key, data] of Object.entries(fallbackCache)) {
    if (now > data.reset) {
      delete fallbackCache[key];
    }
  }

  lastCleanup = now;
}

function getIdentifier(
  request: NextRequest,
  preferUserId: boolean = false
): string {
  // Try to get user ID from session if available and preferred
  if (preferUserId) {
    // This would need to be implemented based on your auth system
    // For now, fall back to IP-based identification
  }

  // Get IP address with fallbacks
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const ip = request.ip || forwarded?.split(',')[0] || realIp || 'anonymous';

  return ip;
}

function generateKey(
  request: NextRequest,
  identifier: string,
  config: RateLimitConfig
): string {
  if (config.keyGenerator) {
    return config.keyGenerator(request, identifier);
  }

  // Default key generation: identifier + endpoint path
  return `${identifier}:${request.nextUrl.pathname}`;
}

export async function rateLimit(
  request: NextRequest,
  tier: RateLimitTier = RATE_LIMIT_TIERS.MODERATE,
  customIdentifier?: string
): Promise<RateLimitContext> {
  const now = Math.floor(Date.now() / 1000);
  const identifier = customIdentifier || getIdentifier(request);
  const key = generateKey(request, identifier, tier.config);
  const endpoint = request.nextUrl.pathname;

  const redis = await getRedisClient();

  if (redis) {
    // Use Redis for distributed rate limiting
    return await rateLimitWithRedis(
      redis,
      key,
      tier,
      now,
      identifier,
      endpoint
    );
  } else {
    // Fallback to in-memory rate limiting
    return await rateLimitWithMemory(key, tier, now, identifier, endpoint);
  }
}

// Redis-based rate limiting implementation
async function rateLimitWithRedis(
  redis: Redis,
  key: string,
  tier: RateLimitTier,
  now: number,
  identifier: string,
  endpoint: string
): Promise<RateLimitContext> {
  try {
    // Get current rate limit data using utility function
    const existingData = await RedisRateLimitOps.get(redis, key);

    let rateLimitData: RateLimitContextBase;

    // Check if key exists and hasn't expired
    if (existingData && now <= existingData.reset) {
      rateLimitData = existingData;
    } else {
      // Create new rate limit data
      rateLimitData = {
        limit: tier.config.limit,
        remaining: tier.config.limit,
        reset: now + tier.config.timeframe,
      };
    }

    // Check if we've hit the rate limit
    const success = rateLimitData.remaining > 0;
    const retryAfter = success ? undefined : rateLimitData.reset - now;

    // If we haven't hit the limit, decrement the remaining count
    if (success) {
      rateLimitData.remaining--;
    }

    // Store the updated rate limit data in Redis using utility function
    const ttl = tier.config.timeframe + 60; // Add 60s buffer
    await RedisRateLimitOps.set(redis, key, rateLimitData, ttl);

    return {
      ...rateLimitData,
      success,
      identifier,
      endpoint,
      retryAfter,
    };
  } catch (error) {
    console.error('Redis rate limiting failed, falling back to memory:', error);
    // Fallback to memory-based rate limiting
    return await rateLimitWithMemory(key, tier, now, identifier, endpoint);
  }
}

// Memory-based rate limiting fallback
async function rateLimitWithMemory(
  key: string,
  tier: RateLimitTier,
  now: number,
  identifier: string,
  endpoint: string
): Promise<RateLimitContext> {
  cleanupFallbackCache();

  // Get the existing rate limit data or create a new one
  const rateLimitData = fallbackCache[key] || {
    limit: tier.config.limit,
    remaining: tier.config.limit,
    reset: now + tier.config.timeframe,
  };

  // If the reset time has passed, reset the counter
  if (now > rateLimitData.reset) {
    rateLimitData.remaining = tier.config.limit;
    rateLimitData.reset = now + tier.config.timeframe;
    rateLimitData.limit = tier.config.limit; // Update limit in case tier changed
  }

  // Check if we've hit the rate limit
  const success = rateLimitData.remaining > 0;

  // Calculate retry after time
  const retryAfter = success ? undefined : rateLimitData.reset - now;

  // If we haven't hit the limit, decrement the remaining count
  if (success) {
    rateLimitData.remaining--;
  }

  // Store the updated rate limit data
  fallbackCache[key] = rateLimitData;

  return {
    ...rateLimitData,
    success,
    identifier,
    endpoint,
    retryAfter,
  };
}

export function rateLimitResponse(
  context: RateLimitContext,
  customMessage?: string
): NextResponse<{ error: string; retryAfter?: number }> {
  const message =
    customMessage || 'Rate limit exceeded. Please try again later.';

  // Log rate limit violation for monitoring
  logRateLimitViolation(context);

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': context.limit.toString(),
    'X-RateLimit-Remaining': context.remaining.toString(),
    'X-RateLimit-Reset': context.reset.toString(),
  };

  if (context.retryAfter) {
    headers['Retry-After'] = context.retryAfter.toString();
  }

  return NextResponse.json(
    {
      error: message,
      retryAfter: context.retryAfter,
    },
    {
      status: 429,
      headers,
    }
  );
}

// Logging and monitoring functions
function logRateLimitViolation(context: RateLimitContext): void {
  console.warn(`Rate limit exceeded`, {
    identifier: context.identifier,
    endpoint: context.endpoint,
    limit: context.limit,
    remaining: context.remaining,
    reset: new Date(context.reset * 1000).toISOString(),
    retryAfter: context.retryAfter,
    timestamp: new Date().toISOString(),
  });
}

// Utility functions for rate limit management
export function addRateLimitHeaders(
  response: NextResponse,
  context: RateLimitContext
): NextResponse {
  response.headers.set('X-RateLimit-Limit', context.limit.toString());
  response.headers.set('X-RateLimit-Remaining', context.remaining.toString());
  response.headers.set('X-RateLimit-Reset', context.reset.toString());

  if (context.retryAfter) {
    response.headers.set('Retry-After', context.retryAfter.toString());
  }

  return response;
}

export async function getRateLimitStatus(
  request: NextRequest,
  tier: RateLimitTier = RATE_LIMIT_TIERS.MODERATE,
  customIdentifier?: string
): Promise<RateLimitContextBase | null> {
  const identifier = customIdentifier || getIdentifier(request);
  const key = generateKey(request, identifier, tier.config);

  const redis = await getRedisClient();

  if (redis) {
    try {
      return await RedisRateLimitOps.get(redis, key);
    } catch (error) {
      console.error('Failed to get rate limit status from Redis:', error);
    }
  }

  // Fallback to memory cache
  return fallbackCache[key] || null;
}

export async function clearRateLimit(
  request: NextRequest,
  tier: RateLimitTier = RATE_LIMIT_TIERS.MODERATE,
  customIdentifier?: string
): Promise<boolean> {
  const identifier = customIdentifier || getIdentifier(request);
  const key = generateKey(request, identifier, tier.config);

  const redis = await getRedisClient();

  if (redis) {
    try {
      return await RedisRateLimitOps.delete(redis, key);
    } catch (error) {
      console.error('Failed to clear rate limit in Redis:', error);
    }
  }

  // Fallback to memory cache
  if (fallbackCache[key]) {
    delete fallbackCache[key];
    return true;
  }

  return false;
}

// Advanced rate limiting with user-based identification
export async function rateLimitWithUser(
  request: NextRequest,
  userId: string | null,
  tier: RateLimitTier = RATE_LIMIT_TIERS.MODERATE
): Promise<RateLimitContext> {
  // Use user ID if available, otherwise fall back to IP
  const identifier = userId || getIdentifier(request);
  return rateLimit(request, tier, identifier);
}

// Burst rate limiting - allows short bursts but enforces longer-term limits
export async function burstRateLimit(
  request: NextRequest,
  shortTerm: { limit: number; timeframe: number },
  longTerm: { limit: number; timeframe: number },
  customIdentifier?: string
): Promise<RateLimitContext> {
  const identifier = customIdentifier || getIdentifier(request);

  // Check short-term limit first
  const shortTermTier: RateLimitTier = {
    name: 'burst-short',
    config: {
      limit: shortTerm.limit,
      timeframe: shortTerm.timeframe,
      keyGenerator: (req, id) => `burst-short:${id}:${req.nextUrl.pathname}`,
    },
  };

  const shortTermResult = await rateLimit(request, shortTermTier, identifier);

  if (!shortTermResult.success) {
    return shortTermResult;
  }

  // Check long-term limit
  const longTermTier: RateLimitTier = {
    name: 'burst-long',
    config: {
      limit: longTerm.limit,
      timeframe: longTerm.timeframe,
      keyGenerator: (req, id) => `burst-long:${id}:${req.nextUrl.pathname}`,
    },
  };

  return rateLimit(request, longTermTier, identifier);
}
