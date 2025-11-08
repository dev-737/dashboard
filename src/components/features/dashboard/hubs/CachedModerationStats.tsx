import { cacheLife, cacheTag } from 'next/cache';
import { db } from '@/lib/prisma';

interface CachedModerationStatsProps {
  hubId: string;
  userId: string;
}

/**
 * Cached wrapper for hub moderation statistics.
 * Uses private cache since it's user/hub-specific.
 * MUST be wrapped in a Suspense boundary.
 */
export async function CachedModerationStats({
  hubId,
  userId,
}: CachedModerationStatsProps) {
  'use cache: private';
  cacheLife('user-data');
  cacheTag('moderation-stats', `hub-${hubId}`, `user-${userId}`);

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

  return {
    pendingReports,
    pendingAppeals,
    activeInfractions,
  };
}
