import { getDiscoverHubs } from '@/lib/discover/query';
import { TrendingHubsClient } from './TrendingHubs';

export async function TrendingHubs() {
  // Fetch trending hubs (server-side)
  const { items: hubs } = await getDiscoverHubs({
    sort: 'trending',
    pageSize: 3
  });

  return <TrendingHubsClient hubs={hubs} />;
}
