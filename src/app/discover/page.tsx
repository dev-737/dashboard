import { Suspense } from 'react';
import { GridPattern } from '@/components/magicui/GridPattern';
import { CriticalCSS, LayoutOptimizer } from '@/components/ui/LayoutOptimizer';
import {
  type DiscoverParams,
  type DiscoverSort,
  getDiscoverHubs,
} from '@/lib/discover/query';
import { DiscoverClient } from './ui/DiscoverClient';

const SORT_OPTIONS: readonly DiscoverSort[] = [
  'trending',
  'active',
  'new',
  'upvoted',
  'rated',
  'members',
  'growing',
] as const;

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : '';
  const sort =
    typeof params.sort === 'string' &&
    SORT_OPTIONS.includes(params.sort as DiscoverSort)
      ? (params.sort as DiscoverSort)
      : 'trending';
  const language = typeof params.language === 'string' ? params.language : '';
  const activityLevel =
    typeof params.activityLevel === 'string' ? params.activityLevel : '';

  const query: DiscoverParams = {
    q: search || undefined,
    sort: sort,
    language: language || undefined,
    activity: activityLevel
      ? [activityLevel as 'LOW' | 'MEDIUM' | 'HIGH']
      : undefined,
  };

  const initialData = await getDiscoverHubs(query);

  return (
    <LayoutOptimizer>
      <CriticalCSS />
      <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 pt-12 sm:pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 top-[-64px] bg-gradient-to-b from-transparent to-purple-900/10" />

          {/* Grid pattern */}
          <GridPattern
            width={80}
            height={80}
            className="z-0 fill-transparent stroke-primary/10"
            strokeDasharray="6 6"
          />

          {/* Subtle accent gradient */}
          <div
            className="absolute h-96 w-96 rounded-full opacity-20 blur-3xl"
            style={{
              top: '-8rem',
              right: '-8rem',
              background:
                'radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent 70%)',
            }}
          />

          <div
            className="absolute h-96 w-96 rounded-full opacity-10 blur-3xl"
            style={{
              bottom: '-8rem',
              left: '-8rem',
              background:
                'radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent 70%)',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="w-full px-6 py-12">
            <div className="mb-12 text-center">
              <div className="relative mb-6">
                <h1 className="bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text font-bold text-6xl text-transparent tracking-tight">
                  Browse Community Hubs
                </h1>
              </div>

              <div className="relative mx-auto mb-8 max-w-3xl">
                <p className="text-gray-400 text-lg leading-relaxed">
                  Connect across Discord servers. Filter by topics, activity,
                  and language to find hubs that match your interests.
                </p>
              </div>
            </div>

            {/* Server-side rendered initial content for better FCP */}
            <Suspense
              fallback={
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/20 blur-xl" />
                      <div className="relative inline-block h-10 w-10 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-400 border-solid motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                    </div>
                  </div>
                </div>
              }
            >
              <DiscoverClient initial={initialData} />
            </Suspense>
          </div>
        </div>
      </div>
    </LayoutOptimizer>
  );
}
