import { cacheLife, cacheTag } from 'next/cache';
import { db } from '@/lib/prisma';

interface CachedConnectionDetailsProps {
  connectionId: string;
  userId: string;
}

/**
 * Cached wrapper for connection details.
 * Uses private cache since data is user-specific.
 * MUST be wrapped in a Suspense boundary.
 */
export async function CachedConnectionDetails({
  connectionId,
  userId,
}: CachedConnectionDetailsProps) {
  'use cache: private';
  cacheLife('hub-data');
  cacheTag(
    'connection-details',
    `connection-${connectionId}`,
    `user-${userId}`
  );

  const connection = await db.connection.findUnique({
    where: { id: connectionId },
    include: {
      hub: {
        select: {
          id: true,
          name: true,
          description: true,
          iconUrl: true,
          ownerId: true,
          moderators: {
            where: { userId },
            select: { role: true },
          },
        },
      },
      server: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return { connection };
}
