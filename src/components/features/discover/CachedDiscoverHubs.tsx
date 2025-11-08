import { cacheLife, cacheTag } from 'next/cache';
import type { DiscoverParams } from '@/lib/discover/query';
import { getDiscoverHubs } from '@/lib/discover/query';

interface CachedDiscoverHubsProps {
  params: DiscoverParams;
  userId?: string;
}

/**
 * Cached wrapper component for discover hubs data.
 * Uses public cache with userId passed from parent (auth() called outside cache scope).
 * Cache key varies by userId to show correct upvote status.
 */
export async function CachedDiscoverHubs({
  params,
  userId,
}: CachedDiscoverHubsProps) {
  'use cache';
  cacheLife('discover-data');
  cacheTag('discover-hubs', `discover-${params.sort || 'trending'}`);

  const hubs = await getDiscoverHubs(params, userId);

  return { hubs };
}
