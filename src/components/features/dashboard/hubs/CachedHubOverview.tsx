import { cacheLife, cacheTag } from 'next/cache';
import { db } from '@/lib/prisma';

interface CachedHubOverviewProps {
  hubId: string;
  userId: string;
}

/**
 * Cached wrapper for hub overview data.
 * Uses private cache since data includes user-specific permissions.
 * MUST be wrapped in a Suspense boundary.
 */
export async function CachedHubOverview({
  hubId,
  userId,
}: CachedHubOverviewProps) {
  'use cache: private';
  cacheLife('hub-data');
  cacheTag('hub-overview', `hub-${hubId}`, `user-${userId}`);

  const hub = await db.hub.findUnique({
    where: { id: hubId },
    include: {
      tags: {
        select: { name: true },
      },
      _count: {
        select: {
          connections: {
            where: { connected: true },
          },
          upvotes: true,
        },
      },
    },
  });

  return { hub };
}
