import { cacheLife, cacheTag } from 'next/cache';
import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';
import type { Role } from '@/lib/generated/prisma/client/client';
import { db } from '@/lib/prisma';

// Define a more specific type for the hub data fetched for the detail page
export interface HubDetailData
  extends Omit<
    SimplifiedHub,
    'connections' | 'reviews' | 'moderators'
  > {
  rules: string[];
  shortDescription: string | null;
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  ownerId: string;
  moderators: {
    id: string;
    role: Role;
    userId: string;
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

export async function getHubData(
  hubId: string,
  _userId?: string
): Promise<HubDetailData | null> {
  'use cache';
  cacheLife('hub-data');
  cacheTag('hub', `hub-${hubId}`);

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
      ownerId: true,
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
      moderators: {
        where: { user: { name: { not: null } } },
        select: {
          id: true,
          role: true,
          userId: true,
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

  return hub;
}

export async function getHubConnections(
  hubId: string
): Promise<HubConnectionData[] | null> {
  'use cache';
  cacheLife('hub-data');
  cacheTag('hub-connections', `hub-${hubId}-connections`);

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

  return connections?.connections ?? null;
}
