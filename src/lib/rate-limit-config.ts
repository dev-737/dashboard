import { RATE_LIMIT_TIERS, type RateLimitTier } from './rate-limit';
import { createCustomRateLimit } from './rate-limit-middleware';

/**
 * Rate limiting configurations for different API endpoint categories
 */
export const ENDPOINT_RATE_LIMITS = {
  // Authentication and account management
  AUTH: {
    LOGIN: RATE_LIMIT_TIERS.STRICT, // 10/min
    LOGOUT: RATE_LIMIT_TIERS.LENIENT, // 100/min
    DELETE_ACCOUNT: createCustomRateLimit(2, 3600), // 2/hour
    FIX_ACCOUNT: createCustomRateLimit(5, 3600), // 5/hour
  },

  // Hub management operations
  HUBS: {
    // Read operations
    LIST: RATE_LIMIT_TIERS.PUBLIC, // 200/min
    SEARCH: RATE_LIMIT_TIERS.LENIENT, // 100/min
    GET_DETAILS: RATE_LIMIT_TIERS.LENIENT, // 100/min
    RECOMMENDATIONS: RATE_LIMIT_TIERS.MODERATE, // 30/min

    // Write operations
    CREATE: createCustomRateLimit(10, 3600), // 10/hour
    UPDATE: createCustomRateLimit(50, 3600), // 50/hour
    DELETE: createCustomRateLimit(2, 3600), // 2/hour

    // Interaction operations
    UPVOTE: RATE_LIMIT_TIERS.MODERATE, // 30/min
    REVIEW: createCustomRateLimit(5, 3600), // 5 reviews/hour

    // Media uploads
    BANNER_UPLOAD: createCustomRateLimit(5, 3600), // 5/hour
    ICON_UPLOAD: createCustomRateLimit(5, 3600), // 5/hour
  },

  // User operations
  USERS: {
    SEARCH: RATE_LIMIT_TIERS.LENIENT, // 100/min
    GET_PROFILE: RATE_LIMIT_TIERS.MODERATE, // 30/min
    UPDATE_PROFILE: createCustomRateLimit(10, 3600), // 10/hour
  },

  // Discord integration
  DISCORD: {
    GET_USER: RATE_LIMIT_TIERS.MODERATE, // 30/min
    GET_SERVER: RATE_LIMIT_TIERS.MODERATE, // 30/min
    GET_ROLES: RATE_LIMIT_TIERS.MODERATE, // 30/min
  },

  // Server management
  SERVERS: {
    LIST: RATE_LIMIT_TIERS.MODERATE, // 30/min
    GET_DETAILS: RATE_LIMIT_TIERS.MODERATE, // 30/min
    UPDATE: createCustomRateLimit(20, 3600), // 20/hour
  },

  // Dashboard operations
  DASHBOARD: {
    GET_CHANNELS: RATE_LIMIT_TIERS.MODERATE, // 30/min
    GET_CONNECTIONS: RATE_LIMIT_TIERS.MODERATE, // 30/min
    UPDATE_CONNECTION: createCustomRateLimit(30, 3600), // 30/hour
  },

  // Moderation operations
  MODERATION: {
    LIST_INFRACTIONS: RATE_LIMIT_TIERS.MODERATE, // 30/min
    CREATE_INFRACTION: createCustomRateLimit(20, 3600), // 20/hour
    UPDATE_INFRACTION: createCustomRateLimit(30, 3600), // 30/hour
    DELETE_INFRACTION: createCustomRateLimit(10, 3600), // 10/hour

    // Anti-swear rules
    GET_ANTI_SWEAR: RATE_LIMIT_TIERS.MODERATE, // 30/min
    CREATE_ANTI_SWEAR: createCustomRateLimit(10, 3600), // 10/hour
    UPDATE_ANTI_SWEAR: createCustomRateLimit(20, 3600), // 20/hour
    DELETE_ANTI_SWEAR: createCustomRateLimit(10, 3600), // 10/hour
  },

  // Appeals system
  APPEALS: {
    LIST: RATE_LIMIT_TIERS.MODERATE, // 30/min
    CREATE: createCustomRateLimit(3, 86400), // 3/day
    UPDATE: createCustomRateLimit(5, 3600), // 5/hour
    RESPOND: createCustomRateLimit(10, 3600), // 10/hour
  },

  // Announcements
  ANNOUNCEMENTS: {
    LIST: RATE_LIMIT_TIERS.PUBLIC, // 200/min
    CREATE: createCustomRateLimit(5, 3600), // 5/hour (admin only)
    UPDATE: createCustomRateLimit(10, 3600), // 10/hour (admin only)
    DELETE: createCustomRateLimit(5, 3600), // 5/hour (admin only)
  },

  // Tags system
  TAGS: {
    LIST: RATE_LIMIT_TIERS.PUBLIC, // 200/min
    SEARCH: RATE_LIMIT_TIERS.LENIENT, // 100/min
    CATEGORIES: RATE_LIMIT_TIERS.PUBLIC, // 200/min
    CREATE: createCustomRateLimit(20, 3600), // 20/hour
    SUGGEST: RATE_LIMIT_TIERS.MODERATE, // 30/min
  },

  // Search operations
  SEARCH: {
    GENERAL: RATE_LIMIT_TIERS.LENIENT, // 100/min
    HUBS: RATE_LIMIT_TIERS.LENIENT, // 100/min
    USERS: RATE_LIMIT_TIERS.MODERATE, // 30/min
  },

  // File uploads
  UPLOADS: {
    GENERAL: createCustomRateLimit(10, 3600), // 10/hour
    IMAGES: createCustomRateLimit(15, 3600), // 15/hour
    DOCUMENTS: createCustomRateLimit(5, 3600), // 5/hour
  },
} as const;

/**
 * Special rate limiting configurations for burst scenarios
 */
export const BURST_CONFIGURATIONS = {
  // For endpoints that might receive sudden legitimate traffic
  SEARCH_BURST: {
    shortTerm: { limit: 20, timeframe: 10 }, // 20 requests in 10 seconds
    longTerm: { limit: 200, timeframe: 3600 }, // 200 requests per hour
  },

  // For API endpoints that might be called rapidly during UI interactions
  UI_INTERACTION_BURST: {
    shortTerm: { limit: 15, timeframe: 10 }, // 15 requests in 10 seconds
    longTerm: { limit: 100, timeframe: 3600 }, // 100 requests per hour
  },

  // For write operations that might be done in batches
  BATCH_WRITE_BURST: {
    shortTerm: { limit: 5, timeframe: 10 }, // 5 requests in 10 seconds
    longTerm: { limit: 30, timeframe: 3600 }, // 30 requests per hour
  },
} as const;

/**
 * Rate limiting configurations based on user roles/permissions
 */
export const ROLE_BASED_LIMITS = {
  // Anonymous users (IP-based)
  ANONYMOUS: {
    multiplier: 1.0, // Base rate limits
    additionalRestrictions: {
      // No write operations for anonymous users
      CREATE: createCustomRateLimit(0, 60), // Blocked
      UPDATE: createCustomRateLimit(0, 60), // Blocked
      DELETE: createCustomRateLimit(0, 60), // Blocked
    },
  },

  // Regular authenticated users
  USER: {
    multiplier: 1.5, // 50% higher limits
    additionalRestrictions: {},
  },

  // Premium/verified users
  PREMIUM: {
    multiplier: 2.0, // 100% higher limits
    additionalRestrictions: {},
  },

  // Moderators
  MODERATOR: {
    multiplier: 3.0, // 200% higher limits
    additionalRestrictions: {},
  },

  // Administrators
  ADMIN: {
    multiplier: 5.0, // 400% higher limits
    additionalRestrictions: {},
  },
} as const;

/**
 * Helper function to get rate limit configuration for a specific endpoint
 */
export function getRateLimitForEndpoint(
  category: keyof typeof ENDPOINT_RATE_LIMITS,
  operation: string,
  userRole: keyof typeof ROLE_BASED_LIMITS = 'USER'
): RateLimitTier {
  const categoryLimits = ENDPOINT_RATE_LIMITS[category];
  const operationLimit = categoryLimits[
    operation as keyof typeof categoryLimits
  ] as RateLimitTier;

  if (!operationLimit) {
    // Fallback to moderate limits if not found
    return RATE_LIMIT_TIERS.MODERATE;
  }

  // Apply role-based multiplier
  const roleConfig = ROLE_BASED_LIMITS[userRole];
  if (roleConfig.multiplier !== 1.0) {
    return {
      name: `${operationLimit.name}-${userRole.toLowerCase()}`,
      config: {
        ...operationLimit.config,
        limit: Math.floor(operationLimit.config.limit * roleConfig.multiplier),
      },
    };
  }

  return operationLimit;
}

/**
 * Helper function to check if an operation is allowed for anonymous users
 */
export function isOperationAllowedForAnonymous(
  _category: keyof typeof ENDPOINT_RATE_LIMITS,
  operation: string
): boolean {
  const anonymousRestrictions =
    ROLE_BASED_LIMITS.ANONYMOUS.additionalRestrictions;
  const restrictionKey =
    operation.toUpperCase() as keyof typeof anonymousRestrictions;

  if (anonymousRestrictions[restrictionKey]) {
    const restriction = anonymousRestrictions[restrictionKey];
    return restriction.config.limit > 0;
  }

  return true; // Allow by default if not explicitly restricted
}
