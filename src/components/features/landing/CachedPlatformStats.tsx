import { cacheLife, cacheTag } from 'next/cache';
import { StatsBar } from '@/components/features/hubs/StatsBar';
import { getPlatformStats } from '@/lib/platform-stats';

/**
 * Cached wrapper component for platform statistics on the landing page.
 * Uses public cache since stats are the same for all users.
 */
export async function CachedPlatformStats() {
  'use cache';
  cacheLife('platform-stats');
  cacheTag('platform-stats', 'landing-stats');

  const platformStatsResponse = await getPlatformStats();
  const stats = platformStatsResponse.data;

  return (
    <StatsBar
      stats={{
        activeServers: stats.activeServers,
        publicHubs: stats.publicHubs,
        weeklyMessages: stats.weeklyMessages,
      }}
    />
  );
}
