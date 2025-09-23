import { Suspense } from 'react';
import {
  type DiscoverParams,
  type DiscoverSort,
  getDiscoverHubs,
} from '@/lib/discover/query';
import { LayoutOptimizer, CriticalCSS } from '@/components/ui/layout-optimizer';
import { DiscoverClient } from './ui/DiscoverClient';

export const revalidate = 60;

const SORT_OPTIONS: readonly DiscoverSort[] = [
  'trending',
  'active',
  'new',
  'upvoted',
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
      <div className="relative min-h-screen bg-gray-950 pt-12 sm:pt-16">
        <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient background - InterChat style */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-gray-950/95" />

        {/* Static radial gradients with InterChat colors - fixed positioning to prevent CLS */}
        <div
          className="absolute h-80 w-80 rounded-full blur-3xl"
          style={{
            top: '-10rem',
            right: '-10rem',
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.04) 50%, transparent 100%)',
          }}
        />
        <div
          className="absolute h-80 w-80 rounded-full blur-3xl"
          style={{
            bottom: '-10rem',
            left: '-10rem',
            background:
              'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.04) 50%, transparent 100%)',
          }}
        />
        <div
          className="absolute h-96 w-96 rounded-full blur-3xl"
          style={{
            top: '33.333333%',
            right: '33.333333%',
            background:
              'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, rgba(16, 185, 129, 0.03) 50%, transparent 100%)',
          }}
        />

        {/* Refined grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.3'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Static subtle glows - InterChat colors (no animation to prevent CLS) */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/5 h-40 w-40 rounded-full bg-purple-400/4 blur-3xl" />
          <div className="absolute right-1/5 bottom-1/3 h-40 w-40 rounded-full bg-indigo-400/4 blur-3xl" />
          <div className="absolute top-2/3 left-1/2 h-32 w-32 rounded-full bg-emerald-400/3 blur-3xl" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="w-full px-6 py-12">
          <div className="mb-12 text-center">
            <div className="relative mb-6 inline-block">
              {/* Glow effect behind title */}
              <div className="absolute inset-0 scale-110 rounded-full bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-purple-500/15 blur-2xl" />
              <h1 className="relative bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text font-bold text-6xl text-transparent">
                ✨ Discover Hubs
              </h1>
            </div>

            <div className="relative mx-auto mb-8 max-w-3xl">
              {/* Subtle background glow for description */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-800/20 via-gray-700/20 to-gray-800/20 blur-lg" />
              <p className="relative px-8 py-4 text-gray-300 text-xl leading-relaxed">
                Explore amazing communities and connect with people who share
                your interests
              </p>
            </div>
          </div>

          {/* Server-side rendered initial content for better FCP */}
          <Suspense
            fallback={
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/20 blur-xl"></div>
                    <div className="relative inline-block h-10 w-10 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-400 border-solid motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
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
