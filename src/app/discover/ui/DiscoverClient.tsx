'use client';

import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DiscoverHubCard from '@/components/features/discover/DiscoverHubCard';
import { DiscoverSkeleton } from '@/components/features/discover/DiscoverSkeleton';
import { HubSearch } from '@/components/features/discover/HubSearch';
import { Button } from '@/components/ui/button';
import { LayoutStabilizer, StableGrid } from '@/components/ui/LayoutOptimizer';
import type { HubCardDTO } from '@/lib/discover/query';
import { useTRPC } from '@/utils/trpc';
import { type FeatureFlags, Filters } from './Filters';
import { QuickFilters, type QuickFilterType } from './QuickFilters';

export type DiscoverResponse = {
  items: HubCardDTO[];
  page: number;
  pageSize: number;
  total?: number;
  nextPage?: number | null;
};

// Utility function to parse member range - moved outside component for stability
function parseMemberRange(range?: string) {
  if (!range) return undefined;
  switch (range) {
    case 'small':
      return { min: 0, max: 49 };
    case 'medium':
      return { min: 50, max: 199 };
    case 'large':
      return { min: 200, max: 999 };
    case 'huge':
      return { min: 1000, max: undefined };
    default:
      return undefined;
  }
}

export function DiscoverClient({ initial }: { initial: DiscoverResponse }) {
  const [data, setData] = useState<DiscoverResponse>(initial);
  const [searchQuery, setSearchQuery] = useState(''); // For actual filtering
  const [sort, setSort] = useState<
    'trending' | 'active' | 'new' | 'upvoted' | 'rated' | 'members' | 'growing'
  >('trending');
  const [tags, setTags] = useState<string[]>([]);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [region, setRegion] = useState<string | undefined>(undefined);
  const [activity, setActivity] = useState<('LOW' | 'MEDIUM' | 'HIGH')[]>([]);
  const [memberRange, setMemberRange] = useState<string | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [features, setFeatures] = useState<FeatureFlags>({
    verified: false,
    partnered: false,
    nsfw: false,
  });
  const [activeQuickFilter, setActiveQuickFilter] =
    useState<QuickFilterType | null>(null);
  const [page, setPage] = useState<number | null>(initial.nextPage ?? null);
  const [loading, setLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);
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
    const memberRange0 = sp.get('memberRange') || undefined;
    const minRating0 = sp.get('minRating')
      ? Number.parseFloat(sp.get('minRating')!)
      : undefined;
    const features0 = new Set(
      (sp.get('features') || '').split(',').filter(Boolean)
    );

    setSearchQuery(q0);
    setSort(sort0);
    setTags(tags0);
    setLanguage(lang0);
    setRegion(region0);
    setActivity(activity0);
    setMemberRange(memberRange0);
    setMinRating(minRating0);
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

    const memberCount = parseMemberRange(memberRange);

    return {
      q: searchQuery || undefined,
      tags: tags.length ? tags : undefined,
      language,
      region,
      activity: activity.length ? activity : undefined,
      memberCount,
      minRating,
      showFeaturedOnly: activeQuickFilter === 'featured' ? true : undefined,
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
  }, [
    searchQuery,
    tags,
    language,
    region,
    activity,
    memberRange,
    minRating,
    features,
    sort,
    activeQuickFilter,
  ]);

  // Sync URL bar (without reload)
  useEffect(() => {
    const sp = new URLSearchParams();
    if (searchQuery) sp.set('q', searchQuery);
    if (tags.length) sp.set('tags', tags.join(','));
    if (language) sp.set('lang', language);
    if (region) sp.set('region', region);
    if (activity.length) sp.set('activity', activity.join(','));
    if (memberRange) sp.set('memberRange', memberRange);
    if (minRating) sp.set('minRating', minRating.toString());
    const feats: string[] = [];
    if (features.verified) feats.push('verified');
    if (features.partnered) feats.push('partnered');
    if (features.nsfw) feats.push('nsfw');
    if (feats.length) sp.set('features', feats.join(','));
    sp.set('sort', sort);
    const qs = sp.toString();
    const nextUrl = qs ? `/discover?${qs}` : '/discover';
    window.history.replaceState(null, '', nextUrl);
  }, [
    searchQuery,
    sort,
    tags,
    language,
    region,
    activity,
    memberRange,
    minRating,
    features,
  ]);

  // Create a stable input object using useMemo
  const queryInput = useMemo(() => buildInput(), [buildInput]);

  // Create a stable key for dependency tracking
  const _queryKey = useMemo(() => JSON.stringify(queryInput), [queryInput]);

  // Debounced fetch on filter changes
  useEffect(() => {
    // Cancel any in-flight request
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
    }

    setLoading(true);
    const id = setTimeout(() => {
      // Create new abort controller for this request
      fetchAbortControllerRef.current = new AbortController();

      queryClient
        .fetchQuery(trpc.discover.list.queryOptions(queryInput))
        .then((res: DiscoverResponse) => {
          setData(res);
          setPage(res.nextPage ?? null);
        })
        .catch((error) => {
          // Ignore abort errors
          if (error.name !== 'AbortError') {
            console.error('Error fetching initial data:', error);
          }
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      clearTimeout(id);
      // Don't abort here - let the next effect cancel if needed
    };
  }, [queryClient, trpc.discover.list, queryInput]);

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
      { rootMargin: '200px', threshold: 0 }
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

  const handleQuickFilterClick = (type: QuickFilterType) => {
    if (activeQuickFilter === type) {
      setActiveQuickFilter(null);
      if (type === 'featured') {
      } else if (type === 'new') {
        setSort('trending');
      } else if (type === 'rated') {
        setSort('trending');
        setMinRating(undefined);
      } else if (type === 'popular') {
        setSort('trending');
      } else if (type === 'rising') {
        setSort('trending');
      }
      return;
    }

    setActiveQuickFilter(type);

    switch (type) {
      case 'popular':
        setSort('active');
        break;
      case 'rising':
        setSort('growing');
        break;
      case 'new':
        setSort('new');
        break;
      case 'rated':
        setSort('rated');
        setMinRating(4.5);
        break;
      case 'featured':
        break;
      case 'random':
        setSort('new');
        // TODO: Redirect to a random ass hub
        break;
    }
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setTags([]);
    setLanguage(undefined);
    setRegion(undefined);
    setActivity([]);
    setMemberRange(undefined);
    setMinRating(undefined);
    setFeatures({ verified: false, partnered: false, nsfw: false });
    setActiveQuickFilter(null);
    setSort('trending');
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchQuery ||
      tags.length > 0 ||
      language ||
      region ||
      activity.length > 0 ||
      memberRange ||
      minRating ||
      features.verified ||
      features.partnered ||
      features.nsfw ||
      activeQuickFilter
    );
  }, [
    searchQuery,
    tags,
    language,
    region,
    activity,
    memberRange,
    minRating,
    features,
    activeQuickFilter,
  ]);

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

      {/* Quick Filters */}
      <QuickFilters
        onFilterClick={handleQuickFilterClick}
        activeFilter={activeQuickFilter}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">
        {/* Filters Sidebar - Appears first on mobile, right side on desktop */}
        <div className="lg:order-2 lg:col-span-3">
          <div className="discover-scrollbar lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
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
              memberRange={memberRange}
              onMemberRangeChange={setMemberRange}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              features={features}
              onFeaturesChange={setFeatures}
            />
          </div>
        </div>

        {/* Content - Appears second on mobile, left side on desktop */}
        <div className="lg:order-1 lg:col-span-9">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            {hasActiveFilters && (
              <Button
                onClick={handleClearAllFilters}
                variant="outline"
                className="group flex items-center gap-2 rounded-[var(--radius-button)] border-gray-700/50 bg-gray-900/50 text-gray-300 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
              >
                <X className="h-4 w-4" />
                <span>Clear All Filters</span>
              </Button>
            )}
          </div>

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
                <div className="relative mx-auto max-w-md rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900 to-gray-950 p-12 sm:from-gray-900/90 sm:to-gray-950/90 sm:backdrop-blur-sm">
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
