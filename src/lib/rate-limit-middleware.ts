import type { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
  addRateLimitHeaders,
  burstRateLimit,
  RATE_LIMIT_TIERS,
  type RateLimitContext,
  type RateLimitTier,
  rateLimit,
  rateLimitResponse,
  rateLimitWithUser,
} from './rate-limit';

export type RateLimitMiddlewareOptions = {
  tier?: RateLimitTier;
  useUserId?: boolean;
  skipAuthenticated?: boolean;
  skipOnSuccess?: boolean;
  customMessage?: string;
  burst?: {
    shortTerm: { limit: number; timeframe: number };
    longTerm: { limit: number; timeframe: number };
  };
};

// Simple type for any Next.js route handler
export type ApiHandler = (
  request: NextRequest,
  context?: unknown
) => Promise<NextResponse> | NextResponse | Promise<NextResponse>;

/**
 * Higher-order function that wraps API route handlers with rate limiting
 */
export function withRateLimit(
  handler: ApiHandler,
  options: RateLimitMiddlewareOptions = {}
): ApiHandler {
  return async (
    request: NextRequest,
    context?: unknown
  ): Promise<NextResponse> => {
    return await executeWithRateLimit(request, options, () =>
      handler(request, context)
    );
  };
}

// Helper function to execute rate limiting logic
async function executeWithRateLimit(
  request: NextRequest,
  options: RateLimitMiddlewareOptions,
  executeHandler: () => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  const {
    tier = RATE_LIMIT_TIERS.MODERATE,
    useUserId = false,
    skipAuthenticated = false,
    skipOnSuccess = false,
    customMessage,
    burst,
  } = options;

  try {
    // Get user session if needed
    let userId: string | null = null;
    if (useUserId || skipAuthenticated) {
      const session = await auth.api.getSession({
        headers: await headers()
      });
      userId = session?.user?.id || null;

      // Skip rate limiting for authenticated users if configured
      if (skipAuthenticated && userId) {
        return await executeHandler();
      }
    }

    // Apply rate limiting
    let rateLimitResult: RateLimitContext;

    if (burst) {
      rateLimitResult = await burstRateLimit(
        request,
        burst.shortTerm,
        burst.longTerm,
        userId || undefined
      );
    } else if (useUserId) {
      rateLimitResult = await rateLimitWithUser(request, userId, tier);
    } else {
      rateLimitResult = await rateLimit(request, tier);
    }

    // Check if rate limit exceeded
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult, customMessage);
    }

    // Execute the original handler
    const response = await executeHandler();

    // Add rate limit headers to successful responses
    if (!skipOnSuccess) {
      addRateLimitHeaders(response, rateLimitResult);
    }

    return response;
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    // If rate limiting fails, allow the request to proceed
    return await executeHandler();
  }
}

/**
 * Middleware specifically for public endpoints (high limits)
 */
export function withPublicRateLimit(
  handler: ApiHandler,
  customOptions: Partial<RateLimitMiddlewareOptions> = {}
): ApiHandler {
  return withRateLimit(handler, {
    tier: RATE_LIMIT_TIERS.PUBLIC,
    skipOnSuccess: true,
    ...customOptions,
  });
}

/**
 * Middleware for authenticated endpoints (moderate limits)
 */
export function withAuthRateLimit(
  handler: ApiHandler,
  customOptions: Partial<RateLimitMiddlewareOptions> = {}
): ApiHandler {
  return withRateLimit(handler, {
    tier: RATE_LIMIT_TIERS.MODERATE,
    useUserId: true,
    ...customOptions,
  });
}

/**
 * Middleware for write operations (strict limits)
 */
export function withStrictRateLimit(
  handler: ApiHandler,
  customOptions: Partial<RateLimitMiddlewareOptions> = {}
): ApiHandler {
  return withRateLimit(handler, {
    tier: RATE_LIMIT_TIERS.STRICT,
    useUserId: true,
    ...customOptions,
  });
}

/**
 * Middleware for critical operations (very strict limits)
 */
export function withCriticalRateLimit(
  handler: ApiHandler,
  customOptions: Partial<RateLimitMiddlewareOptions> = {}
): ApiHandler {
  return withRateLimit(handler, {
    tier: RATE_LIMIT_TIERS.CRITICAL,
    useUserId: true,
    customMessage:
      'This operation is heavily rate limited. Please wait before trying again.',
    ...customOptions,
  });
}

/**
 * Middleware with burst protection for endpoints that might receive sudden traffic
 */
export function withBurstRateLimit(
  handler: ApiHandler,
  shortTerm: { limit: number; timeframe: number } = {
    limit: 10,
    timeframe: 10,
  },
  longTerm: { limit: number; timeframe: number } = {
    limit: 100,
    timeframe: 3600,
  },
  customOptions: Partial<RateLimitMiddlewareOptions> = {}
): ApiHandler {
  return withRateLimit(handler, {
    burst: { shortTerm, longTerm },
    useUserId: true,
    ...customOptions,
  });
}

/**
 * Utility function to create custom rate limit configurations
 */
export function createCustomRateLimit(
  limit: number,
  timeframe: number,
  name: string = 'custom'
): RateLimitTier {
  return {
    name,
    config: {
      limit,
      timeframe,
      skipSuccessfulRequests: false,
      skipFailedRequests: true,
    },
  };
}

/**
 * Middleware for upload endpoints with strict limits
 */
export function withUploadRateLimit(
  handler: ApiHandler,
  customOptions: Partial<RateLimitMiddlewareOptions> = {}
): ApiHandler {
  return withRateLimit(handler, {
    tier: createCustomRateLimit(5, 300), // 5 uploads per 5 minutes
    useUserId: true,
    customMessage:
      'Upload rate limit exceeded. Please wait before uploading again.',
    ...customOptions,
  });
}
