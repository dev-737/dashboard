import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getDiscoverHubs } from '@/lib/discover/query';
import AdvancedSearchPage from './_components/AdvancedSearchPage';

export const metadata: Metadata = {
  title: 'Discover Hubs | InterChat',
  description:
    'Advanced search to find the perfect Discord hub for your community.',
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAuthenticated = Boolean(session?.user?.id);

  const initialData = await getDiscoverHubs({
    sort: 'trending',
    page: 1,
    pageSize: 24,
  });

  return (
    <AdvancedSearchPage
      initialData={initialData}
      isAuthenticated={isAuthenticated}
    />
  );
}
