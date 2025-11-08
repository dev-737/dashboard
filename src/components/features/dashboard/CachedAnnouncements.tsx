import { cacheLife, cacheTag } from 'next/cache';
import { db } from '@/lib/prisma';

interface CachedAnnouncementsProps {
  userId: string;
  limit?: number;
}

/**
 * Cached wrapper for user announcements.
 * Uses private cache since data is user-specific.
 * MUST be wrapped in a Suspense boundary.
 */
export async function CachedAnnouncements({
  userId,
  limit = 10,
}: CachedAnnouncementsProps) {
  'use cache: private';
  cacheLife('user-data');
  cacheTag('announcements', `user-${userId}-announcements`);

  const announcements = await db.devAlerts.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return { announcements };
}
