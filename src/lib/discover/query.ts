import { auth } from "@/auth";
import type { Prisma } from "@/lib/generated/prisma/client";
import { db } from "@/lib/prisma";
import { PerformanceCache } from "@/lib/performance-cache";

export type DiscoverSort = "trending" | "active" | "new" | "upvoted";

// Cache helper functions
const cache = PerformanceCache.getInstance();

async function getCachedData<T>(key: string): Promise<T | null> {
    return await cache.get<T>(key);
}

async function setCachedData<T>(
    key: string,
    data: T,
    options?: { ttl?: number },
): Promise<void> {
    return await cache.set(key, data, options);
}

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
        // Optimize tag selection to reduce N+1 queries
        tags: {
            select: { name: true, color: true },
            take: 10, // Limit tags to prevent excessive data transfer
        },
        // Optimize activity metrics selection
        activityMetrics: {
            select: {
                messagesLast24h: true,
                activeUsersLast24h: true,
                newConnectionsLast24h: true,
            },
        },
        // Optimize count queries with specific conditions
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

    // Add upvotes relation if user is authenticated
    if (userId) {
        return {
            ...baseSelect,
            upvotes: {
                where: { userId },
                select: { userId: true },
                take: 1,
            },
        };
    }

    return baseSelect;
}

function buildWhere(p: DiscoverParams): Prisma.HubWhereInput {
    const and: Prisma.HubWhereInput[] = [{ private: false }];

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

    // NSFW Filter Fix: When NSFW is enabled, ONLY show NSFW hubs. When disabled, exclude NSFW hubs.
    if (p.features?.nsfw) {
        and.push({ nsfw: true }); // Only NSFW hubs when filter is enabled
    } else {
        and.push({ nsfw: false }); // Exclude NSFW hubs when filter is disabled
    }

    if (p.tags?.length) {
        // Optimize tag filtering to avoid N+1 queries
        and.push({
            tags: {
                some: {
                    name: { in: p.tags },
                },
            },
        });
    }

    return { AND: and };
}

function buildOrderBy(
    sort: DiscoverSort | undefined,
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
        default: // trending - optimized to use database sorting instead of in-memory calculation
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
    const pageSize = Math.min(60, Math.max(1, params.pageSize ?? 24));
    const where = buildWhere(params);
    const orderBy = buildOrderBy(params.sort);
    const select = await getBaseSelect(userId);

    const baseParams = { ...params, userId, page, pageSize };
    const cacheKey = `discover:v2:${JSON.stringify(baseParams)}`;
    const countCacheKey = `discover:count:v2:${JSON.stringify({ ...params, userId })}`;

    // Try to get from cache first - with improved cache strategy
    const cached = await getCachedData<{
        items: HubCardDTO[];
        page: number;
        pageSize: number;
        total: number;
        nextPage: number | null;
    }>(cacheKey);

    if (cached) {
        return cached;
    }

    let cachedTotal: number | null = null;
    if (page > 1) {
        cachedTotal = await getCachedData<number>(countCacheKey);
    }

    const [items, total] = await Promise.all([
        db.hub.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            select,
            relationLoadStrategy: "join",
        }),
        cachedTotal ?? db.hub.count({ where }),
    ]);

    const hasMore = page * pageSize < total;

    const processedItems = items.map((item) => {
        const typedItem = item as { upvotes?: { userId: string }[] };
        return {
            ...item,
            weeklyMessageCount: item._count.messages,
            isUpvoted: userId ? (typedItem.upvotes?.length || 0) > 0 : false,
        };
    }) as unknown as HubCardDTO[];

    const result = {
        items: processedItems,
        page,
        pageSize,
        total,
        nextPage: hasMore ? page + 1 : null,
    } as const;

    const isFirstPage = page === 1;
    const isFilteredQuery = !!(
        params.q ||
        params.tags?.length ||
        params.language ||
        params.region ||
        params.activity?.length ||
        params.features?.verified ||
        params.features?.partnered ||
        params.features?.nsfw
    );

    const cacheTtl = isFirstPage && !isFilteredQuery ? 600 : 300;

    await setCachedData(cacheKey, result, { ttl: cacheTtl });

    if (!cachedTotal) {
        await setCachedData(countCacheKey, total, { ttl: 900 });
    }

    return result;
}
