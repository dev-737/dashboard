import { Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
          <HugeiconsIcon
            strokeWidth={2}
            icon={Loading03Icon}
            className="h-8 w-8 animate-spin"
          />
        </div>
      }
    >
      <AdvancedSearchPage
        initialData={initialData}
        isAuthenticated={isAuthenticated}
      />
    </Suspense>
  );
}
