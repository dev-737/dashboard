import type { Prisma } from '@/lib/generated/prisma/client/client';
import { HubVisibility } from '@/lib/generated/prisma/client/client';
import { db } from '@/lib/prisma';
import { cacheLife } from 'next/cache';
import { z } from 'zod/v4';

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 60;

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
    _count: { connections: number; messages: number };
    averageRating: number | null;
    serializedCreatedAt: string;
};

const DISCOVERY_THRESHOLDS = {
    MIN_WEEKLY_MESSAGES: 10,
    MIN_CONNECTIONS: 3,
    MAX_INACTIVE_DAYS: 7,

    HIGH_DENSITY: 50,
    MEDIUM_DENSITY: 15,
    LOW_DENSITY: 5,
} as const;

export const DiscoverSortSchema = z.enum([
    'alive',
    'active',
    'growing',
    'big',
    'emerging',
]);

export type DiscoverSort = z.infer<typeof DiscoverSortSchema>;

function buildWhereClause(p: DiscoverParams): Prisma.HubWhereInput {
    const conditions: Prisma.HubWhereInput[] = [
        { visibility: HubVisibility.PUBLIC },
        { weeklyMessageCount: { gte: DISCOVERY_THRESHOLDS.MIN_WEEKLY_MESSAGES } },
        { connectionCount: { gte: DISCOVERY_THRESHOLDS.MIN_CONNECTIONS } },
        { lastActive: { gte: new Date(Date.now() - DISCOVERY_THRESHOLDS.MAX_INACTIVE_DAYS * 24 * 60 * 60 * 1000) } },
    ];

    if (p.q?.trim()) {
        const term = p.q.trim();
        conditions.push({
            OR: [
                { name: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
            ],
        });
    }

    if (p.language) conditions.push({ language: p.language });
    if (p.region) conditions.push({ region: p.region });
    if (p.tags?.length) conditions.push({ tags: { some: { name: { in: p.tags } } } });

    conditions.push({ nsfw: p.features?.nsfw === true });
    if (p.features?.verified) conditions.push({ verified: true });
    if (p.features?.partnered) conditions.push({ partnered: true });

    return { AND: conditions };
}


function buildAliveSort(): Prisma.HubOrderByWithRelationInput[] {
    return [
        { weeklyMessageCount: 'desc' },
        { connectionCount: 'asc' },
        { lastActive: 'desc' },
        { id: 'desc' },
    ];
}

function buildActiveSort(): Prisma.HubOrderByWithRelationInput[] {
    return [
        { activityMetrics: { messagesLast24h: 'desc' } },
        { activityMetrics: { activeUsersLast24h: 'desc' } },
        { weeklyMessageCount: 'desc' },
        { connectionCount: 'asc' },
        { id: 'desc' },
    ];
}

function buildGrowingSort(): Prisma.HubOrderByWithRelationInput[] {
    return [
        { activityMetrics: { memberGrowthRate: 'desc' } },
        { activityMetrics: { newConnectionsLast7d: 'desc' } },
        { weeklyMessageCount: 'desc' },
        { id: 'desc' },
    ];
}

function buildBigSort(): Prisma.HubOrderByWithRelationInput[] {
    return [
        { connectionCount: 'desc' },
        { weeklyMessageCount: 'desc' },
        { averageRating: 'desc' },
        { id: 'desc' },
    ];
}

function buildEmergingSort(): Prisma.HubOrderByWithRelationInput[] {
    return [
        { createdAt: 'desc' },
        { weeklyMessageCount: 'desc' },
        { connectionCount: 'desc' },
        { id: 'desc' },
    ];
}

function buildOrderBy(sort: DiscoverSort = 'alive'): Prisma.HubOrderByWithRelationInput[] {
    switch (sort) {
        case 'alive': return buildAliveSort();
        case 'active': return buildActiveSort();
        case 'growing': return buildGrowingSort();
        case 'big': return buildBigSort();
        case 'emerging': return buildEmergingSort();
        default: return buildAliveSort();
    }
}

function buildEmergingWhere(baseWhere: Prisma.HubWhereInput): Prisma.HubWhereInput {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return {
        AND: [
            baseWhere,
            { createdAt: { gte: thirtyDaysAgo } },
            { weeklyMessageCount: { gte: 100 } },
        ],
    };
}

async function getCachedHubs(params: DiscoverParams) {
    'use cache';
    cacheLife('discover-data');

    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * pageSize;

    let where = buildWhereClause(params);

    if (params.sort === 'emerging') {
        where = buildEmergingWhere(where);
    }

    const orderBy = buildOrderBy(params.sort);

    const [hubs, total] = await Promise.all([
        db.hub.findMany({
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
                connectionCount: true,

                tags: {
                    select: { name: true, color: true },
                    take: 8,
                },

                activityMetrics: {
                    select: {
                        messagesLast24h: true,
                        activeUsersLast24h: true,
                        memberGrowthRate: true,
                    },
                },

                _count: {
                    select: {
                        connections: { where: { connected: true } },
                        reviews: true,
                    },
                },
            },
        }),
        db.hub.count({ where }),
    ]);

    const items: HubCardDTO[] = hubs.map((hub) => ({
        ...hub,
        serializedCreatedAt: hub.createdAt.toISOString(),
        tags: hub.tags,
        _count: {
            connections: hub._count.connections,
            messages: hub.weeklyMessageCount,
        },
        density: hub.weeklyMessageCount / Math.max(hub.connectionCount, 1),
    }));

    return {
        items,
        page,
        pageSize,
        total,
        nextPage: skip + items.length < total ? page + 1 : null,
    };
}

export async function getDiscoverHubs(params: DiscoverParams, userId?: string) {
    void userId;
    return getCachedHubs(params);
}
