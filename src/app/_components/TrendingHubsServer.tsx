import { getDiscoverHubs } from '@/lib/discover/query';
import { TrendingHubsClient } from './TrendingHubs';

export async function TrendingHubs() {
  // Fetch trending hubs (server-side)
  const { items: hubs } = await getDiscoverHubs({
    sort: 'growing', // FIXME: Make a better trending algorithm, then change this
    pageSize: 3,
  });

  return <TrendingHubsClient hubs={hubs} />;
}
