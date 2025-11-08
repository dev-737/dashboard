import { cacheLife, cacheTag } from 'next/cache';
import { db } from '@/lib/prisma';

interface CachedHubLayoutDataProps {
  hubId: string;
  userId: string;
  includeModerationCounts?: boolean;
}

/**
 * Cached wrapper for hub layout data.
 * Returns hub info and optionally moderation counts.
 * Uses private cache since data is user/hub-specific.
 * MUST be wrapped in a Suspense boundary.
 */
export async function CachedHubLayoutData({
  hubId,
  userId,
  includeModerationCounts = false,
}: CachedHubLayoutDataProps) {
  'use cache: private';
  cacheLife('hub-data');
  cacheTag('hub-layout', `hub-${hubId}`, `user-${userId}`);

  // Get hub details
  const hub = await db.hub.findUnique({
    where: { id: hubId },
    select: {
      id: true,
      name: true,
      description: true,
      iconUrl: true,
      bannerUrl: true,
      private: true,
      nsfw: true,
      _count: {
        select: {
          connections: {
            where: { connected: true },
          },
        },
      },
    },
  });

  if (!hub) {
    return null;
  }

  const hubData = {
    id: hub.id,
    name: hub.name,
    description: hub.description,
    iconUrl: hub.iconUrl,
    bannerUrl: hub.bannerUrl,
    private: hub.private,
    nsfw: hub.nsfw,
    connectionCount: hub._count.connections,
  };

  // Optionally fetch moderation stats
  let pendingCounts;
  if (includeModerationCounts) {
    const [pendingReports, pendingAppeals, activeInfractions] =
      await db.$transaction([
        db.hubReport.count({
          where: { hubId, status: 'PENDING' },
        }),
        db.appeal.count({
          where: {
            status: 'PENDING',
            infraction: { hubId },
          },
        }),
        db.infraction.count({
          where: {
            hubId,
            status: 'ACTIVE',
          },
        }),
      ]);

    pendingCounts = {
      reports: pendingReports,
      appeals: pendingAppeals,
      infractions: activeInfractions,
    };
  }

  return { hub: hubData, pendingCounts };
}
