import { cacheLife } from 'next/cache';
import { z } from 'zod';
import type { Prisma } from '@/lib/generated/prisma/client/client';
import { HubVisibility } from '@/lib/generated/prisma/client/client';
import { PerformanceCache } from '@/lib/performance-cache';
import { db } from '@/lib/prisma';

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 60;

// Cache TTLs
const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  LONG: 600, // 10 minutes
  COUNT: 900, // 15 minutes
};

export const DiscoverSortSchema = z.enum([
  'trending',
  'active',
  'new',
  'oldest',
  'upvoted',
  'rated',
  'members',
  'growing',
]);

export type DiscoverSort = z.infer<typeof DiscoverSortSchema>;

export type DiscoverParams = {
  q?: string;
  tags?: string[];
  features?: { verified?: boolean; partnered?: boolean; nsfw?: boolean };
  language?: string;
  region?: string;
  activity?: ('LOW' | 'MEDIUM' | 'HIGH')[];
  memberCount?: { min?: number; max?: number };
  minRating?: number;
  showFeaturedOnly?: boolean;
  sort?: DiscoverSort;
  page?: number;
  pageSize?: number;
};

export type HubCardDTO = {
  id: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  iconUrl: string | null;
  bannerUrl: string | null;
  weeklyMessageCount: number;
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  language: string | null;
  region: string | null;
  verified: boolean;
  partnered: boolean;
  nsfw: boolean;
  tags: { name: string; color: string | null }[];
  _count: { upvotes: number; connections: number; messages: number };
  averageRating: number | null;
  isUpvoted?: boolean;
  serializedCreatedAt: string;
};

const performanceCache = PerformanceCache.getInstance();

/**
 * Builds the strictly typed Prisma WhereInput from abstract params
 */
function buildWhereClause(p: DiscoverParams): Prisma.HubWhereInput {
  const conditions: Prisma.HubWhereInput[] = [
    { visibility: HubVisibility.PUBLIC },
  ];

  // Search (Name or Description)
  // Optimized: Using mode: 'insensitive' which maps to ILIKE in Postgres
  if (p.q?.trim()) {
    const term = p.q.trim();
    conditions.push({
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ],
    });
  }

  // Filters
  if (p.language) conditions.push({ language: p.language });
  if (p.region) conditions.push({ region: p.region });

  // Activity Level - mapped directly to enum
  if (p.activity?.length) {
    conditions.push({ activityLevel: { in: p.activity } });
  }

  // Verification / Trust
  if (p.features?.verified) conditions.push({ verified: true });
  if (p.features?.partnered) conditions.push({ partnered: true });

  // Safety
  // Explicit check for NSFW true/false to avoid bleeding content
  conditions.push({ nsfw: p.features?.nsfw === true });

  // Tags
  if (p.tags?.length) {
    conditions.push({
      tags: { some: { name: { in: p.tags } } },
    });
  }

  // Rating
  if (p.minRating !== undefined && p.minRating > 0) {
    conditions.push({ averageRating: { gte: p.minRating } });
  }

  // Member Count Filtering
  // NOW OPTIMIZED: Uses the denormalized connectionCount field
  if (p.memberCount?.min !== undefined || p.memberCount?.max !== undefined) {
    conditions.push({
      connectionCount: {
        gte: p.memberCount?.min,
        lte: p.memberCount?.max,
      },
    });
  }

  // Filter dead hubs: require at least 3 weekly messages AND at least one connected server.
  // weeklyMessageCount is denormalized and indexed, so this is fast.
  conditions.push({ weeklyMessageCount: { gte: 3 } });
  if (!p.memberCount) {
    conditions.push({ connections: { some: { connected: true } } });
  }

  // Featured
  if (p.showFeaturedOnly) {
    conditions.push({ featured: true });
  }

  return { AND: conditions };
}

/**
 * Determine sort order using indexed fields
 */
function buildOrderBy(
  sort: DiscoverSort = 'trending'
): Prisma.HubOrderByWithRelationInput[] {
  switch (sort) {
    case 'active':
      // Activity priority: High metrics -> Recent messages
      return [
        { activityMetrics: { messagesLast24h: 'desc' } },
        { activityMetrics: { activeUsersLast24h: 'desc' } },
        { id: 'desc' },
      ];
    case 'new':
      return [{ createdAt: 'desc' }, { id: 'desc' }];
    case 'oldest':
      return [{ createdAt: 'asc' }, { id: 'asc' }];
    case 'upvoted':
      // Prefer denormalized first (fast), but fall back to relation counts if it hasn't been synced.
      return [
        { upvoteCount: 'desc' },
        { upvotes: { _count: 'desc' } },
        { id: 'desc' },
      ];
    case 'rated':
      return [
        { averageRating: 'desc' },
        { reviewCount: 'desc' }, // Break ties with more reviews
        { reviews: { _count: 'desc' } },
        { id: 'desc' },
      ];
    case 'members':
      // Prefer denormalized first (fast), but fall back to relation counts if it hasn't been synced.
      return [
        { connectionCount: 'desc' },
        { connections: { _count: 'desc' } },
        { id: 'desc' },
      ];
    case 'growing':
      return [
        // Growth rate from metrics table
        { activityMetrics: { memberGrowthRate: 'desc' } },
        { activityMetrics: { newConnectionsLast7d: 'desc' } },
        { id: 'desc' },
      ];
    case 'trending':
    default:
      // High-stats ranking: messages > rating > members > upvotes
      // trendingScore is kept as the primary if populated, then we fall
      // through a tight engagement ladder instead of piling up tiebreakers.
      return [
        { activityMetrics: { trendingScore: 'desc' } },
        { weeklyMessageCount: 'desc' },
        { averageRating: 'desc' },
        { connectionCount: 'desc' },
        { upvoteCount: 'desc' },
        { lastActive: 'desc' },
        { id: 'desc' },
      ];
  }
}

/**
 * Main query execution method with caching strategies
 */
async function getCachedHubs(params: DiscoverParams) {
  'use cache';
  cacheLife('discover-data');

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * pageSize;

  const where = buildWhereClause(params);
  const orderBy = buildOrderBy(params.sort);

  // Cache keys
  const paramHash = JSON.stringify({ ...params, page, pageSize });
  const listKey = `discover:list:${paramHash}`;
  const countKey = `discover:count:${JSON.stringify(params)}`;

  // Try cache first
  const cached = await performanceCache.get<PaginatedResult>(listKey);
  if (cached) return cached;

  // Parallel fetch: Items + Total Count
  // We cache count separately for longer because totals change less frequently than order/items
  let total = await performanceCache.get<number>(countKey);
  if (total === null) {
    total = await db.hub.count({ where });
    await performanceCache.set(countKey, total, { ttl: CACHE_TTL.COUNT });
  }

  const hubs = await db.hub.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
    select: {
      id: true,
      name: true,
      description: true,
      shortDescription: true,
      iconUrl: true,
      bannerUrl: true,
      activityLevel: true,
      language: true,
      region: true,
      verified: true,
      partnered: true,
      nsfw: true,
      createdAt: true,
      lastActive: true,
      averageRating: true,
      weeklyMessageCount: true,

      tags: {
        select: { name: true, color: true },
        take: 8, // Limit tags fetching
      },

      // We still need activity metrics for some display/sorting context if needed
      activityMetrics: {
        select: {
          messagesLast24h: true,
          activeUsersLast24h: true,
        },
      },

      // Live counts for display (connected servers only)
      _count: {
        select: {
          connections: { where: { connected: true } },
          upvotes: true,
          reviews: true,
        },
      },
    },
  });

  const items: HubCardDTO[] = hubs.map((hub) => ({
    ...hub,
    serializedCreatedAt: hub.createdAt.toISOString(),
    tags: hub.tags,
    _count: {
      connections: hub._count.connections,
      upvotes: hub._count.upvotes,
      messages: hub.weeklyMessageCount,
    },
    isUpvoted: false, // Populated by caller if user exists
  }));

  const result: PaginatedResult = {
    items,
    page,
    pageSize,
    total,
    nextPage: skip + items.length < total ? page + 1 : null,
  };

  // Cache the page result
  // Shorter TTL for first page to keep it fresh
  const ttl = page === 1 ? CACHE_TTL.SHORT : CACHE_TTL.LONG;
  await performanceCache.set(listKey, result, { ttl });

  return result;
}

type PaginatedResult = {
  items: HubCardDTO[];
  page: number;
  pageSize: number;
  total: number;
  nextPage: number | null;
};

/**
 * Public API - keeping signature compatible-ish but switching to efficient implementation
 */
export async function getDiscoverHubs(params: DiscoverParams, userId?: string) {
  const result = await getCachedHubs(params);

  if (!userId || result.items.length === 0) {
    return result;
  }

  // Enrich with user state (Is Upvoted?)
  // Fetch upvotes only for the specific hubs returned
  const hubIds = result.items.map((h: HubCardDTO) => h.id);
  const userUpvotes = await db.hubUpvote.findMany({
    where: {
      userId,
      hubId: { in: hubIds },
    },
    select: { hubId: true },
  });

  const upvoteSet = new Set(userUpvotes.map((uv) => uv.hubId));

  return {
    ...result,
    items: result.items.map((item: HubCardDTO) => ({
      ...item,
      isUpvoted: upvoteSet.has(item.id),
    })),
  };
}
