import { cacheLife, cacheTag } from 'next/cache';
import type { Prisma } from '@/lib/generated/prisma/client/client';
import { HubVisibility } from '@/lib/generated/prisma/client/client';
import { PerformanceCache } from '@/lib/performance-cache';
import { db } from '@/lib/prisma';

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 60;
const CACHE_TTL_SHORT = 300; // 5 minutes
const CACHE_TTL_LONG = 600; // 10 minutes
const CACHE_TTL_COUNT = 900; // 15 minutes

export type DiscoverSort =
  | 'trending'
  | 'active'
  | 'new'
  | 'oldest'
  | 'upvoted'
  | 'rated'
  | 'members'
  | 'growing';

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
  activityMetrics: {
    messagesLast24h: number;
    activeUsersLast24h: number;
  } | null;
  _count: { upvotes: number; connections: number; messages: number };
  averageRating?: number | null;
  isUpvoted?: boolean;
};

class CacheService {
  private cache = PerformanceCache.getInstance();

  public get<T>(key: string): Promise<T | null> {
    return this.cache.get<T>(key);
  }

  public set<T>(key: string, data: T, ttl: number): Promise<void> {
    return this.cache.set(key, data, { ttl });
  }

  public generateCacheKey(prefix: string, params: object): string {
    return `${prefix}:${JSON.stringify(params)}`;
  }
}

const cacheService = new CacheService();

function getBaseSelect() {
  const baseSelect = {
    id: true,
    name: true,
    description: true,
    shortDescription: true,
    iconUrl: true,
    bannerUrl: true,
    weeklyMessageCount: true,
    activityLevel: true,
    language: true,
    region: true,
    verified: true,
    partnered: true,
    nsfw: true,
    createdAt: true,
    averageRating: true,
    tags: { select: { name: true, color: true }, take: 10 },
    activityMetrics: {
      select: {
        messagesLast24h: true,
        activeUsersLast24h: true,
        newConnectionsLast24h: true,
      },
    },
    _count: {
      select: {
        upvotes: true,
        reviews: true,
        messages: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        connections: { where: { connected: true } },
      },
    },
  } as const;

  return baseSelect;
}

function buildWhere(p: DiscoverParams): Prisma.HubWhereInput {
  const and: Prisma.HubWhereInput[] = [
    {
      visibility: HubVisibility.PUBLIC,
      connections: { some: { connected: true } },
    },
  ];

  if (p.q) {
    and.push({
      OR: [
        { name: { contains: p.q, mode: 'insensitive' } },
        { description: { contains: p.q, mode: 'insensitive' } },
      ],
    });
  }

  if (p.language) and.push({ language: p.language });
  if (p.region) and.push({ region: p.region });
  if (p.activity?.length) and.push({ activityLevel: { in: p.activity } });

  if (p.features?.verified) and.push({ verified: true });
  if (p.features?.partnered) and.push({ partnered: true });

  and.push({ nsfw: p.features?.nsfw === true });

  if (p.tags?.length) {
    and.push({ tags: { some: { name: { in: p.tags } } } });
  }

  if (p.minRating !== undefined) {
    and.push({ averageRating: { gte: p.minRating } });
  }

  // Member count filter (based on connected connections)
  // Note: This uses post-processing since Prisma doesn't support _count in WHERE clauses
  // The filtering happens after the query in the processedItems section

  // Featured filter
  if (p.showFeaturedOnly) {
    and.push({ featured: true });
  }

  return { AND: and };
}

function buildOrderBy(
  sort: DiscoverSort = 'trending'
): Prisma.HubOrderByWithRelationInput[] {
  switch (sort) {
    case 'active':
      return [
        { activityMetrics: { messagesLast24h: 'desc' } },
        { weeklyMessageCount: 'desc' },
        { activityMetrics: { activeUsersLast24h: 'desc' } },
        { id: 'desc' },
      ];
    case 'new':
      return [{ createdAt: 'desc' }, { id: 'desc' }];
    case 'oldest':
      return [{ createdAt: 'asc' }, { id: 'asc' }];
    case 'upvoted':
      return [
        { upvotes: { _count: 'desc' } },
        { weeklyMessageCount: 'desc' },
        { id: 'desc' },
      ];
    case 'rated':
      return [
        { verified: 'desc' },
        { partnered: 'desc' },
        { upvotes: { _count: 'desc' } },
        { weeklyMessageCount: 'desc' },
        { id: 'desc' },
      ];
    case 'members':
      return [
        { connections: { _count: 'desc' } },
        { weeklyMessageCount: 'desc' },
        { id: 'desc' },
      ];
    case 'growing':
      return [
        { activityMetrics: { memberGrowthRate: 'desc' } },
        { activityMetrics: { newConnectionsLast7d: 'desc' } },
        { createdAt: 'desc' },
        { id: 'desc' },
      ];
    default:
      // Trending: Uses pre-calculated trending score from hub metrics
      return [
        { activityMetrics: { trendingScore: 'desc' } },
        { verified: 'desc' },
        { partnered: 'desc' },
        { id: 'desc' },
      ];
  }
}

export async function getPublicDiscoverHubs(params: DiscoverParams) {
  'use cache';
  cacheLife('discover-data');
  cacheTag('discover', `discover-${params.sort || 'trending'}`);

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE)
  );

  const where = buildWhere(params);
  const orderBy = buildOrderBy(params.sort);

  // Base select without user-specific fields (upvotes)
  const select = getBaseSelect();

  const pageCacheKey = cacheService.generateCacheKey('discover:v4', {
    ...params,
    page,
    pageSize,
  });
  const countCacheKey = cacheService.generateCacheKey(
    'discover:count:v4',
    params
  );

  type PaginatedResult = {
    items: HubCardDTO[];
    page: number;
    pageSize: number;
    total: number;
    nextPage: number | null;
  };

  const cachedResult = await cacheService.get<PaginatedResult>(pageCacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const cachedTotal =
    page > 1 ? await cacheService.get<number>(countCacheKey) : null;

  const itemsPromise = db.hub.findMany({
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
    select,
    relationLoadStrategy: 'join',
  });

  const totalPromise =
    cachedTotal !== null
      ? Promise.resolve(cachedTotal)
      : db.hub.count({ where });

  const [items, total] = await Promise.all([itemsPromise, totalPromise]);
  const hasMore = page * pageSize < total;

  let processedItems: HubCardDTO[] = items.map((item) => {
    return {
      ...item,
      weeklyMessageCount: item._count.messages,
      isUpvoted: false, // Default to false, will be enriched later
      averageRating: item.averageRating,
    };
  });

  if (
    params.memberCount?.min !== undefined ||
    params.memberCount?.max !== undefined
  ) {
    processedItems = processedItems.filter((item) => {
      const memberCount = item._count.connections;
      const meetsMin =
        params.memberCount?.min === undefined ||
        memberCount >= params.memberCount.min;
      const meetsMax =
        params.memberCount?.max === undefined ||
        memberCount <= params.memberCount.max;
      return meetsMin && meetsMax;
    });
  }

  const result: PaginatedResult = {
    items: processedItems,
    page,
    pageSize,
    total,
    nextPage: hasMore ? page + 1 : null,
  };

  const isFiltered = !!(
    params.q ||
    params.tags?.length ||
    params.language ||
    params.region ||
    params.activity?.length ||
    params.features?.verified ||
    params.features?.partnered ||
    params.features?.nsfw ||
    params.memberCount?.min !== undefined ||
    params.memberCount?.max !== undefined ||
    params.minRating !== undefined
  );
  const cacheTtl = page === 1 && !isFiltered ? CACHE_TTL_LONG : CACHE_TTL_SHORT;

  await Promise.all([
    cacheService.set(pageCacheKey, result, cacheTtl),
    cachedTotal === null
      ? cacheService.set(countCacheKey, total, CACHE_TTL_COUNT)
      : Promise.resolve(),
  ]);

  return result;
}

/**
 * Main entry point: Fetches public data then enriches with user data
 */
export async function getDiscoverHubs(params: DiscoverParams, userId?: string) {
  // 1. Get cached public data
  const result = await getPublicDiscoverHubs(params);

  // 2. If no user, return as is
  if (!userId || result.items.length === 0) {
    return result;
  }

  // 3. Enrich with user data (Upvotes)
  // fetch upvotes for the displayed hubs
  const hubIds = result.items.map((h) => h.id);

  const userUpvotes = await db.hubUpvote.findMany({
    where: {
      userId,
      hubId: { in: hubIds },
    },
    select: {
      hubId: true,
    },
  });

  const upvotedHubIds = new Set(userUpvotes.map((u) => u.hubId));

  // Return new object with updated items
  return {
    ...result,
    items: result.items.map((item) => ({
      ...item,
      isUpvoted: upvotedHubIds.has(item.id),
    })),
  };
}
