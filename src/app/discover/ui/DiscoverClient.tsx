'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DiscoverHubCard from '@/components/discover/DiscoverHubCard';
import { DiscoverSkeleton } from '@/components/discover/DiscoverSkeleton';
import { HubSearch } from '@/components/discover/HubSearch';
import { Button } from '@/components/ui/button';
import { StableGrid, LayoutStabilizer } from '@/components/ui/layout-optimizer';
import type { HubCardDTO } from '@/lib/discover/query';
import { useTRPC } from '@/utils/trpc';
import { type FeatureFlags, Filters } from './Filters';

export type DiscoverResponse = {
  items: HubCardDTO[];
  page: number;
  pageSize: number;
  total?: number;
  nextPage?: number | null;
};

export function DiscoverClient({ initial }: { initial: DiscoverResponse }) {
  const [data, setData] = useState<DiscoverResponse>(initial);
  const [searchQuery, setSearchQuery] = useState(''); // For actual filtering
  const [sort, setSort] = useState<'trending' | 'active' | 'new' | 'upvoted'>(
    'trending'
  );
  const [tags, setTags] = useState<string[]>([]);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [region, setRegion] = useState<string | undefined>(undefined);
  const [activity, setActivity] = useState<('LOW' | 'MEDIUM' | 'HIGH')[]>([]);
  const [features, setFeatures] = useState<FeatureFlags>({
    verified: false,
    partnered: false,
    nsfw: false,
  });
  const [page, setPage] = useState<number | null>(initial.nextPage ?? null);
  const [loading, setLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // Read initial params from URL on first mount
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q0 = sp.get('q') || '';
    const sort0 = (sp.get('sort') as typeof sort) || 'trending';
    const tags0 = sp.get('tags')?.split(',').filter(Boolean) ?? [];
    const lang0 = sp.get('lang') || undefined;
    const region0 = sp.get('region') || undefined;
    const activity0 =
      (sp.get('activity')?.split(',').filter(Boolean) as typeof activity) ?? [];
    const features0 = new Set(
      (sp.get('features') || '').split(',').filter(Boolean)
    );

    setSearchQuery(q0);
    setSort(sort0);
    setTags(tags0);
    setLanguage(lang0);
    setRegion(region0);
    setActivity(activity0);
    setFeatures({
      verified: features0.has('verified'),
      partnered: features0.has('partnered'),
      nsfw: features0.has('nsfw'),
    });
  }, []);

  // Build search params from current state
  const buildInput = useCallback(() => {
    const feats: string[] = [];
    if (features.verified) feats.push('verified');
    if (features.partnered) feats.push('partnered');
    if (features.nsfw) feats.push('nsfw');
    return {
      q: searchQuery || undefined,
      tags: tags.length ? tags : undefined,
      language,
      region,
      activity: activity.length ? activity : undefined,
      features: feats.length
        ? {
            verified: features.verified,
            partnered: features.partnered,
            nsfw: features.nsfw,
          }
        : undefined,
      sort,
      pageSize: 24,
    } as const;
  }, [searchQuery, tags, language, region, activity, features, sort]);

  // Sync URL bar (without reload)
  useEffect(() => {
    const sp = new URLSearchParams();
    if (searchQuery) sp.set('q', searchQuery);
    if (tags.length) sp.set('tags', tags.join(','));
    if (language) sp.set('lang', language);
    if (region) sp.set('region', region);
    if (activity.length) sp.set('activity', activity.join(','));
    const feats: string[] = [];
    if (features.verified) feats.push('verified');
    if (features.partnered) feats.push('partnered');
    if (features.nsfw) feats.push('nsfw');
    if (feats.length) sp.set('features', feats.join(','));
    sp.set('sort', sort);
    const qs = sp.toString();
    const nextUrl = qs ? `/discover?${qs}` : '/discover';
    window.history.replaceState(null, '', nextUrl);
  }, [searchQuery, sort, tags, language, region, activity, features]);

  // Debounced fetch on filter changes
  useEffect(() => {
    setLoading(true);
    const id = setTimeout(() => {
      console.log('Fetching initial data with filters:', buildInput());
      queryClient
        .fetchQuery(trpc.discover.list.queryOptions(buildInput()))
        .then((res: DiscoverResponse) => {
          setData(res);
          setPage(res.nextPage ?? null);
        })
        .catch((error) => {
          console.error('Error fetching initial data:', error);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(id);
  }, [buildInput, queryClient, trpc.discover.list]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (first.isIntersecting && page && !loading) {
          console.log('Loading next page:', page);
          setLoading(true);
          queryClient
            .fetchQuery(
              trpc.discover.list.queryOptions({ ...buildInput(), page })
            )
            .then((res: DiscoverResponse) => {
              setData((d) => ({
                ...d,
                items: [...d.items, ...res.items],
                page: res.page,
                nextPage: res.nextPage,
              }));
              setPage(res.nextPage ?? null);
            })
            .catch((error) => {
              console.error('Error loading next page:', error);
            })
            .finally(() => setLoading(false));
        }
      },
      { rootMargin: '200px',threshold: 0 }
    );
    
    io.observe(el);
    return () => io.disconnect();
  }, [page, loading, buildInput, queryClient, trpc.discover.list]);

  // Handle search submission from the search component
  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    // Reset to first page when searching - the debounced effect will handle the fetch
  };

  // Handle tag click from hub cards
  const handleTagClick = (tagName: string) => {
    // Add the tag if it's not already in the list
    if (!tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
    // Reset will happen automatically via the debounced effect
  };

  // Remove the inline skeleton generation since we're using the optimized component

  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto mb-6 max-w-2xl sm:mb-8">
        <HubSearch onSearchSubmit={handleSearchSubmit} />

        {/* Active search indicator */}
        {searchQuery && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2">
              <span className="text-purple-300 text-sm">
                Searching for:{' '}
                <span className="font-medium text-purple-200">
                  &ldquo;{searchQuery}&rdquo;
                </span>
              </span>
              <Button
                onClick={() => setSearchQuery('')}
                className="ml-2 text-purple-400 transition-colors hover:text-purple-300"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Clear search</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:gap-8 lg:grid-cols-12">
        {/* Sidebar - Mobile-responsive with collapsible filters */}
        <div className="lg:col-span-3">
          <div className="scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent hover:scrollbar-thumb-purple-500/40 sticky top-20 z-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <Filters
              q=""
              onQChange={() => {}}
              sort={sort}
              onSortChange={setSort}
              tags={tags}
              onTagsChange={setTags}
              language={language}
              onLanguageChange={setLanguage}
              region={region}
              onRegionChange={setRegion}
              activity={activity}
              onActivityChange={setActivity}
              features={features}
              onFeaturesChange={setFeatures}
            />
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-9">
          {/* Grid - Mobile-responsive with layout stability */}
          <LayoutStabilizer minHeight="800px">
            <StableGrid itemMinHeight="380px">

            {data.items.map((h, index) => (
              <DiscoverHubCard
                key={h.id}
                {...h}
                onTagClick={handleTagClick}
                isAboveFold={index < 12} // First 12 cards are considered above-the-fold
              />
            ))}
            {loading && <DiscoverSkeleton count={8} />}
            </StableGrid>
          </LayoutStabilizer>

          {/* Empty state */}
          {!loading && data.items.length === 0 && (
            <div className="mt-16 w-full text-center">
              <div className="relative inline-block">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-800/20 via-gray-700/20 to-gray-800/20 blur-xl" />
                <div className="relative mx-auto max-w-md rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/90 to-gray-950/90 p-12 backdrop-blur-sm">
                  <div className="mb-4 text-6xl">🔍</div>
                  <h3 className="mb-3 font-semibold text-white text-xl">
                    No hubs found
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    No communities match your current filters. Try adjusting
                    your search criteria or explore different tags.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sentinel */}
          <div ref={sentinelRef} className="h-10" />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
