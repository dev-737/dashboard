import { auth } from "@/auth";
import type { Prisma } from "@/lib/generated/prisma/client";
import { db } from "@/lib/prisma";
import { PerformanceCache } from "@/lib/performance-cache";

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 60;
const CACHE_TTL_SHORT = 300; // 5 minutes
const CACHE_TTL_LONG = 600; // 10 minutes
const CACHE_TTL_COUNT = 900; // 15 minutes

export type DiscoverSort = "trending" | "active" | "new" | "upvoted";

export type DiscoverParams = {
    q?: string;
    tags?: string[];
    features?: { verified?: boolean; partnered?: boolean; nsfw?: boolean };
    language?: string;
    region?: string;
    activity?: ("LOW" | "MEDIUM" | "HIGH")[];
    sort?: DiscoverSort;
    page?: number;
    pageSize?: number;
};

export type HubCardDTO = {
    id: string;
    name: string;
    description: string | null;
    iconUrl: string | null;
    bannerUrl: string | null;
    weeklyMessageCount: number;
    activityLevel: "LOW" | "MEDIUM" | "HIGH";
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

async function getBaseSelect(userId?: string) {
    const baseSelect = {
        id: true,
        name: true,
        description: true,
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

    if (userId) {
        return {
            ...baseSelect,
            upvotes: { where: { userId }, select: { userId: true }, take: 1 },
        };
    }

    return baseSelect;
}

function buildWhere(p: DiscoverParams): Prisma.HubWhereInput {
    const and: Prisma.HubWhereInput[] = [
        { private: false, connections: { some: { connected: true } } },
    ];

    if (p.q) {
        and.push({
            OR: [
                { name: { contains: p.q, mode: "insensitive" } },
                { description: { contains: p.q, mode: "insensitive" } },
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

    return { AND: and };
}

function buildOrderBy(
    sort: DiscoverSort = "trending",
): Prisma.HubOrderByWithRelationInput[] {
    switch (sort) {
        case "active":
            return [
                { activityMetrics: { messagesLast24h: "desc" } },
                { weeklyMessageCount: "desc" },
                { activityMetrics: { activeUsersLast24h: "desc" } },
                { id: "desc" },
            ];
        case "new":
            return [{ createdAt: "desc" }, { id: "desc" }];
        case "upvoted":
            return [
                { upvotes: { _count: "desc" } },
                { weeklyMessageCount: "desc" },
                { id: "desc" },
            ];
        case "trending":
        default:
            return [
                { activityMetrics: { messagesLast24h: "desc" } },
                { activityMetrics: { activeUsersLast24h: "desc" } },
                { activityMetrics: { newConnectionsLast24h: "desc" } },
                { upvotes: { _count: "desc" } },
                { verified: "desc" },
                { partnered: "desc" },
                { createdAt: "desc" },
                { id: "desc" },
            ];
    }
}

export async function getDiscoverHubs(params: DiscoverParams) {
    const session = await auth();
    const userId = session?.user?.id;

    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(
        MAX_PAGE_SIZE,
        Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE),
    );

    const where = buildWhere(params);
    const orderBy = buildOrderBy(params.sort);
    const select = await getBaseSelect(userId);

    const baseCacheParams = { ...params, userId };
    const pageCacheKey = cacheService.generateCacheKey("discover:v3", {
        ...baseCacheParams,
        page,
        pageSize,
    });
    const countCacheKey = cacheService.generateCacheKey(
        "discover:count:v3",
        baseCacheParams,
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
        relationLoadStrategy: "join",
    });

    const totalPromise =
        cachedTotal !== null
            ? Promise.resolve(cachedTotal)
            : db.hub.count({ where });

    const [items, total] = await Promise.all([itemsPromise, totalPromise]);
    const hasMore = page * pageSize < total;

    const processedItems = items.map((item) => {
        const typedItem = item as typeof item & { upvotes?: { userId: string }[] };

        return {
            ...item,
            weeklyMessageCount: item._count.messages,
            isUpvoted: !!(userId && typedItem.upvotes?.length),
        };
    });

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
        params.features?.nsfw
    );
    const cacheTtl =
        page === 1 && !isFiltered ? CACHE_TTL_LONG : CACHE_TTL_SHORT;

    await Promise.all([
        cacheService.set(pageCacheKey, result, cacheTtl),
        cachedTotal === null
            ? cacheService.set(countCacheKey, total, CACHE_TTL_COUNT)
            : Promise.resolve(),
    ]);

    return result;
}
