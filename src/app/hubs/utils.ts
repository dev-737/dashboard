import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';
import type { Prisma } from '@/lib/generated/prisma/client/client';
import { db } from '@/lib/prisma';
import {
    ActivityLevel,
    ContentFilter,
    HUBS_PER_PAGE,
    SortOptions,
    VerificationStatus,
} from './constants';

const SURVIVAL_THRESHOLDS = {
    MIN_WEEKLY_MESSAGES: 50,
    MIN_CONNECTIONS: 3,
    MAX_INACTIVE_DAYS: 7,
    MIN_DENSITY: 5.0,
} as const;

interface FilterOptions {
    search?: string;
    tags?: string[];
    contentFilter?: ContentFilter;
    verificationStatus?: VerificationStatus;
    language?: string;
    region?: string;
    minServers?: number;
    maxServers?: number;
    activityLevels?: ActivityLevel[];
}

export function buildWhereClause({
    search,
    tags,
    contentFilter = ContentFilter.All,
    verificationStatus = VerificationStatus.All,
    language,
    region,
    minServers,
    maxServers,
    activityLevels,
}: FilterOptions): Prisma.HubWhereInput {
    const conditions: Prisma.HubWhereInput[] = [
        { visibility: 'PUBLIC' },
        { weeklyMessageCount: { gte: SURVIVAL_THRESHOLDS.MIN_WEEKLY_MESSAGES } },
        { connectionCount: { gte: SURVIVAL_THRESHOLDS.MIN_CONNECTIONS } },
        { lastActive: { gte: new Date(Date.now() - SURVIVAL_THRESHOLDS.MAX_INACTIVE_DAYS * 24 * 60 * 60 * 1000) } },
    ];

    if (tags?.length) {
        conditions.push({
            AND: tags.map((tag) => ({
                tags: { some: { name: { equals: tag, mode: 'insensitive' } } },
            })),
        });
    }

    if (contentFilter !== ContentFilter.All) {
        conditions.push({ nsfw: contentFilter === ContentFilter.NSFW });
    }

    if (verificationStatus !== VerificationStatus.All) {
        if (verificationStatus === VerificationStatus.VerifiedOrPartnered) {
            conditions.push({ OR: [{ verified: true }, { partnered: true }] });
        } else if (verificationStatus === VerificationStatus.Verified) {
            conditions.push({ verified: true });
        } else if (verificationStatus === VerificationStatus.Partnered) {
            conditions.push({ partnered: true });
        }
    }

    if (language && language !== 'all') conditions.push({ language });
    if (region && region !== 'all') conditions.push({ region });

    if (minServers !== undefined || maxServers !== undefined) {
        conditions.push({
            connectionCount: {
                gte: minServers ?? 0,
                lte: maxServers ?? undefined,
            },
        });
    }

    if (activityLevels?.length) {
        const dbLevels = activityLevels.map((level) =>
            level === ActivityLevel.HIGH ? 'HIGH' :
                level === ActivityLevel.MEDIUM ? 'MEDIUM' : 'LOW'
        );
        conditions.push({ activityLevel: { in: dbLevels } });
    }

    if (search?.trim()) {
        const term = search.trim();
        conditions.push({
            OR: [
                { name: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
                { shortDescription: { contains: term, mode: 'insensitive' } },
                { tags: { some: { name: { contains: term, mode: 'insensitive' } } } },
            ],
        });
    }

    return { AND: conditions };
}

function buildAliveOrderBy(): Prisma.HubOrderByWithRelationInput[] {
    return [
        { weeklyMessageCount: 'desc' },
        { connectionCount: 'asc' },
        { lastActive: 'desc' },
    ];
}

function buildActiveOrderBy(): Prisma.HubOrderByWithRelationInput[] {
    return [
        { activityMetrics: { messagesLast24h: 'desc' } },
        { activityMetrics: { activeUsersLast24h: 'desc' } },
        { weeklyMessageCount: 'desc' },
    ];
}

function buildGrowingOrderBy(): Prisma.HubOrderByWithRelationInput[] {
    return [
        { activityMetrics: { memberGrowthRate: 'desc' } },
        { activityMetrics: { newConnectionsLast7d: 'desc' } },
        { weeklyMessageCount: 'desc' },
    ];
}

function buildBigOrderBy(): Prisma.HubOrderByWithRelationInput[] {
    return [
        { connectionCount: 'desc' },
        { weeklyMessageCount: 'desc' },
        { averageRating: 'desc' },
    ];
}


function buildCreatedOrderBy(): Prisma.HubOrderByWithRelationInput[] {
    return [
        { createdAt: 'desc' },
        { weeklyMessageCount: 'desc' },
    ];
}


function buildOrderBy(sort: SortOptions): Prisma.HubOrderByWithRelationInput[] {
    switch (sort) {
        case SortOptions.Alive:
            return buildAliveOrderBy();
        case SortOptions.Active:
            return buildActiveOrderBy();
        case SortOptions.Growing:
            return buildGrowingOrderBy();
        case SortOptions.Big:
            return buildBigOrderBy();
        case SortOptions.Emerging:
            return buildCreatedOrderBy();
        default:
            return buildAliveOrderBy();
    }
}

export async function getSortedHubs(
    whereClause: Prisma.HubWhereInput,
    skip: number,
    sort: SortOptions,
    _minServers?: number,
    _maxServers?: number,
    _activityLevels?: ActivityLevel[],
    skipCount = false
) {
    const orderBy = buildOrderBy(sort);

    // Parallel count + fetch
    const [totalCount, hubs] = await Promise.all([
        skipCount ? 0 : db.hub.count({ where: whereClause }),
        db.hub.findMany({
            where: whereClause,
            orderBy,
            skip,
            take: HUBS_PER_PAGE,
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
                reviews: { include: { user: { select: { id: true, name: true, image: true } } } },
                moderators: { include: { user: { select: { id: true, name: true, image: true } } } },
                welcomeMessage: true,
                rules: true,

                tags: {
                    select: { name: true, color: true },
                    take: 8,
                },

                _count: {
                    select: {
                        connections: { where: { connected: true } },
                        reviews: true,
                        messages: true,
                    },
                },
            },
        }),
    ]);

    // Map to SimplifiedHub
    const simplifiedHubs: SimplifiedHub[] = hubs.map((hub) => ({
        id: hub.id,
        name: hub.name,
        description: hub.description,
        shortDescription: hub.shortDescription,
        iconUrl: hub.iconUrl,
        bannerUrl: hub.bannerUrl,
        activityLevel: hub.activityLevel,
        language: hub.language,
        region: hub.region,
        verified: hub.verified,
        partnered: hub.partnered,
        nsfw: hub.nsfw,
        createdAt: hub.createdAt,
        lastActive: hub.lastActive,
        averageRating: hub.averageRating,
        weeklyMessageCount: hub.weeklyMessageCount,
        connectionCount: hub.connectionCount,
        tags: hub.tags,
        _count: hub._count,
        reviewCount: hub._count.reviews,
        rules: hub.rules,
        moderators: hub.moderators,
        welcomeMessage: hub.welcomeMessage,
        reviews: hub.reviews,
        // Computed for UI display
        density: hub.weeklyMessageCount / Math.max(hub.connectionCount, 1),
    }));

    return { hubs: simplifiedHubs, totalCount };
}
