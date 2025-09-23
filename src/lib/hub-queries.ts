import { unstable_cache as cache } from 'next/cache';
import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';
import type { Role } from '@/lib/generated/prisma/client';
import { db } from '@/lib/prisma';
import { PerformanceCache } from '@/lib/performance-cache';

// Define a more specific type for the hub data fetched for the detail page
export interface HubDetailData
  extends Omit<
    SimplifiedHub,
    'connections' | 'upvotes' | 'reviews' | 'moderators'
  > {
  rules: string[];
  shortDescription: string | null;
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  upvotes: { id: string; userId: string }[];
  moderators: {
    id: string;
    role: Role;
    user: { name: string | null; image: string | null; id: string };
  }[];
  reviews: {
    id: string;
    rating: number;
    text: string;
    createdAt: Date;
    user: { name: string | null; image: string | null; id: string };
  }[];
  _count: {
    connections: number;
  };
}

export interface HubConnectionData {
  id: string;
  serverId: string;
  connected: boolean;
  createdAt: Date;
  lastActive: Date;
  server: {
    id: string;
    name: string | null;
  };
}

export const getHubData = cache(
  async (hubId: string): Promise<HubDetailData | null> => {
    // Try cache first
    const performanceCache = PerformanceCache.getInstance();
    const cacheKey = `hub-data:${hubId}`;
    const cached = await performanceCache.get<HubDetailData>(cacheKey);

    if (cached) {
      return cached;
    }

    const hub = await db.hub.findUnique({
      where: { id: hubId },
      select: {
        id: true,
        name: true,
        description: true,
        iconUrl: true,
        bannerUrl: true,
        createdAt: true,
        lastActive: true,
        rules: true,
        nsfw: true,
        verified: true,
        partnered: true,
        shortDescription: true,
        activityLevel: true,
        reviews: {
          select: {
            id: true,
            rating: true,
            text: true,
            createdAt: true,
            user: { select: { name: true, image: true, id: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        tags: { select: { name: true } },
        upvotes: { select: { id: true, userId: true } },
        moderators: {
          where: { user: { name: { not: null } } },
          select: {
            id: true,
            role: true,
            user: { select: { name: true, image: true, id: true } },
          },
        },
        _count: {
          select: {
            connections: { where: { connected: true } },
          },
        },
      },
    });

    if (hub) {
      // Cache for 5 minutes
      await performanceCache.set(cacheKey, hub, { ttl: 300 });
    }

    return hub;
  },
  ['hub-data'],
  { revalidate: 300 }
);

export const getHubConnections = cache(
  async (hubId: string): Promise<HubConnectionData[] | null> => {
    // Try cache first
    const performanceCache = PerformanceCache.getInstance();
    const cacheKey = `hub-connections:${hubId}`;
    const cached = await performanceCache.get<HubConnectionData[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const connections = await db.hub.findUnique({
      where: { id: hubId },
      select: {
        connections: {
          where: { connected: true },
          select: {
            id: true,
            serverId: true,
            connected: true,
            createdAt: true,
            lastActive: true,
            server: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { lastActive: 'desc' },
        },
      },
    });

    const result = connections?.connections ?? null;

    if (result) {
      // Cache for 5 minutes
      await performanceCache.set(cacheKey, result, { ttl: 300 });
    }

    return result;
  },
  ['hub-connections'],
  { revalidate: 300 }
);
