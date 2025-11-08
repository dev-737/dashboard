import { cacheLife, cacheTag } from 'next/cache';
import { AnimatedEmptyState } from '@/components/features/dashboard/hubs/AnimatedEmptyState';
import { AnimatedHubCard } from '@/components/features/dashboard/hubs/AnimatedHubCard';
import { getUserHubs } from '@/lib/permissions';

interface CachedUserHubsProps {
  userId: string;
}

/**
 * Cached wrapper component for user's hubs.
 * Uses private cache since data is user-specific.
 * MUST be wrapped in a Suspense boundary.
 */
export async function CachedUserHubs({ userId }: CachedUserHubsProps) {
  'use cache: private';
  cacheLife('user-data');
  cacheTag('user-hubs', `user-${userId}-hubs`);

  const userHubs = await getUserHubs(userId);

  if (userHubs.length === 0) {
    return <AnimatedEmptyState type="owned" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
      {userHubs.map((hub, index) => (
        <AnimatedHubCard key={hub.id} hub={hub} index={index} />
      ))}
    </div>
  );
}
