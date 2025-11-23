import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdvancedSearchPage from './_components/AdvancedSearchPage';

export const metadata: Metadata = {
  title: 'Discover Hubs | InterChat',
  description:
    'Advanced search to find the perfect Discord hub for your community.',
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AdvancedSearchPage />
    </Suspense>
  );
}
