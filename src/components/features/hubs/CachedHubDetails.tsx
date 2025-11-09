import { cacheLife, cacheTag } from 'next/cache';
import { getHubData } from '@/lib/hub-queries';

interface CachedHubDetailsProps {
  hubId: string;
  userId?: string;
}

/**
 * Cached wrapper component for hub details.
 * Uses public cache by default, or private cache if userId is provided.
 * MUST be wrapped in a Suspense boundary if using private cache.
 */
export async function CachedHubDetails({
  hubId,
  userId,
}: CachedHubDetailsProps) {
  if (userId) {
    ('use cache: private');
    cacheLife('hub-data');
    cacheTag('hub-details', `hub-${hubId}`, `user-${userId}`);
  } else {
    ('use cache');
    cacheLife('hub-data');
    cacheTag('hub-details', `hub-${hubId}`);
  }

  const hubData = await getHubData(hubId, userId);

  if (!hubData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 font-bold text-2xl text-white">Hub Not Found</h2>
          <p className="text-gray-400">
            The hub you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return { hubData };
}
