'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';
import type { SimplifiedHub } from './use-infinite-hubs';
import { SortOptions } from '@/app/hubs/constants';

export interface HubRecommendation {
  hubId: string;
  hub: Hub & {
    connectionCount: number;
    upvoteCount: number;
  };
  score: number;
  reason: string;
  engagementMetrics: {
    isHighActivity: boolean;
    isGrowing: boolean;
    isQuality: boolean;
    isTrusted: boolean;
  };
}

export interface EnhancedHub extends SimplifiedHub {
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  connectionCount: number;
  recentMessageCount: number;
  upvoteCount: number;
}

export interface RecommendationsResponse {
  recommendations: HubRecommendation[];
  metadata: {
    type: string;
    count: number;
    generatedAt: string;
    userContext: {
      authenticated: boolean;
      userId?: string;
    };
  };
}

export type RecommendationType =
  | 'personalized'
  | 'trending'
  | 'activity'
  | 'similar'
  | 'friends';

interface UseHubRecommendationsOptions {
  enabled?: boolean;
  staleTime?: number;
  currentHubId?: string;
  tags?: string[];
}

interface Hub {
  id: string;
  name: string;
  verified: boolean;
  partnered: boolean;
  activityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  tags: { name: string }[];
  _count: {
    connections: number;
  };
  upvotes: unknown[];
  reviews: unknown[];
  iconUrl?: string;
  description?: string;
  shortDescription?: string | null;
  bannerUrl?: string | null;
  createdAt?: Date;
  lastActive?: Date;
  rules?: string[];
  moderators?: any[];
  nsfw?: boolean;
}

interface RecommendationStrategy {
  search: string;
  sort: SortOptions;
  tags?: string[];
  skip?: number;
}

interface UseHubRecommendationsOptions {
  currentHubId?: string;
  tags?: string[];
  staleTime?: number;
  enabled?: boolean;
}


function generateStrategies(tags: string[] = [], seed: number): RecommendationStrategy[] {
  const tagStrategies: RecommendationStrategy[] = tags.length > 0 ? [
    { search: tags.join(' '), sort: SortOptions.Trending, tags },
    { search: tags.slice(0, 2).join(' '), sort: SortOptions.Upvotes, tags: tags.slice(0, 2) },
    ...tags.slice(0, 3).map((tag, idx) => ({
      search: tag,
      sort: [SortOptions.Trending, SortOptions.Upvotes, SortOptions.Activity][idx % 3],
      skip: (seed + idx * 3) % 15,
    })),
  ] : [];

  const fallbackSortOptions: SortOptions[] = [
    SortOptions.Upvotes,
    SortOptions.Created,
    SortOptions.Activity,
    SortOptions.Servers,
    SortOptions.Rating,
    SortOptions.Trending,
    SortOptions.Name,
    SortOptions.MostUpvotedNew,
    SortOptions.MostRecentPopular,
  ];

  const fallbackStrategies: RecommendationStrategy[] = fallbackSortOptions.map((sort, idx) => ({
    search: '',
    sort,
    skip: (seed * (idx + 1)) % 40,
  }));

  const allStrategies = [...tagStrategies, ...fallbackStrategies];

  return allStrategies
    .map((strategy, index) => ({ strategy, sortKey: (seed + index * 13) % 1000 }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(item => item.strategy);
}

function calculateVarietyScore(hub: Hub, tags: string[] = []): number {
  const scoringRules = [
    { condition: tags.some(tag => hub.tags.some(ht => ht.name === tag)), points: 30 },
    { condition: hub.verified, points: 20 },
    { condition: hub.partnered, points: 20 },
    { condition: hub.activityLevel === 'HIGH', points: 15 },
    { condition: hub._count.connections > 50, points: 12 },
    { condition: hub.upvotes.length > 5, points: 10 },
    { condition: hub.reviews.length > 2, points: 8 },
  ];

  let score = scoringRules.reduce((acc, rule) => acc + (rule.condition ? rule.points : 0), 0);

  const hubHash = parseInt(hub.id.slice(-4), 16) || 0;
  score += (hubHash % 15) - 7;

  return score;
}

function determineRecommendationReason(hub: Hub, sourceTags: string[] = [], index: number): string {
    const matchingTags = hub.tags.filter(tag => sourceTags.includes(tag.name)).length;

    const reasonRules: [boolean, string][] = [
        [matchingTags > 2, 'Many shared interests'],
        [matchingTags > 0, 'Similar topic'],
        [hub.verified && hub.partnered, 'Official verified partner'],
        [hub.verified, 'Verified community'],
        [hub.partnered, 'Partnered community'],
        [hub.activityLevel === 'HIGH' && hub._count.connections > 100, 'Very active & popular'],
        [hub.activityLevel === 'HIGH', 'Highly active'],
        [hub._count.connections > 100, 'Large community'],
        [hub._count.connections > 50, 'Growing community'],
        [hub.upvotes.length > 10, 'Highly rated'],
        [hub.reviews.length > 5, 'Well-reviewed'],
    ];

    for (const [condition, reason] of reasonRules) {
        if (condition) return reason;
    }
    
    const genericReasons = ['Recommended for you', 'Interesting community', 'Popular choice', 'Community pick'];
    return genericReasons[index % genericReasons.length];
}

export function useHubRecommendations(
  type: RecommendationType = 'personalized',
  limit = 8,
  options?: UseHubRecommendationsOptions
) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['hub-recommendations', type, limit, options?.currentHubId, options?.tags],
    queryFn: async () => {
      if (type === 'personalized') {
        const result = await queryClient.fetchQuery(
          trpc.hub.getHubs.queryOptions({
            search: '',
            sort: SortOptions.Trending,
            limit,
          })
        );
        
        return {
          recommendations: result.hubs.map((hub, index) => ({
            hubId: hub.id,
            hub: {
              ...hub,
              connectionCount: hub._count?.connections || 0,
              upvoteCount: hub.upvotes?.length || 0,
            },
            score: 100 - index * 5,
            reason: 'Trending community',
            engagementMetrics: {
              isHighActivity: hub.activityLevel === 'HIGH',
              isGrowing: (hub._count?.connections || 0) > 20,
              isQuality: (hub.upvotes?.length || 0) > 5,
              isTrusted: hub.verified || hub.partnered,
            },
          })),
          metadata: {
            type,
            count: result.hubs.length,
            generatedAt: new Date().toISOString(),
          },
        };
      }

      if (type !== 'similar' || !options?.currentHubId) {
        return { recommendations: [], metadata: { type, count: 0 } };
      }

      const seed = parseInt(options.currentHubId.slice(-4), 16) || 0;
      const strategies = generateStrategies(options.tags, seed);

      const results = await Promise.allSettled(
        strategies.map(strategy =>
          queryClient.fetchQuery(
            trpc.hub.getHubs.queryOptions({ ...strategy, limit: 15 })
          )
        )
      );

      const seenIds = new Set([options.currentHubId]);
      const allHubs: Hub[] = [];
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value?.hubs) {
          for (const hub of result.value.hubs) {
            if (!seenIds.has(hub.id)) {
              allHubs.push(hub);
              seenIds.add(hub.id);
            }
          }
        } else if (result.status === 'rejected') {
          console.warn('A recommendation strategy failed:', result.reason);
        }
      }

      const scoredHubs = allHubs.map(hub => ({
        hub,
        varietyScore: calculateVarietyScore(hub, options.tags),
      }));

      const selectedHubs = scoredHubs
        .sort((a, b) => b.varietyScore - a.varietyScore)
        .slice(0, limit)
        .map(({ hub }, index) => {
          const reason = determineRecommendationReason(hub, options.tags, index);
          return {
            hubId: hub.id,
            hub: {
              ...hub,
              connectionCount: hub._count?.connections || 0,
              upvoteCount: hub.upvotes?.length || 0,
            },
            score: 100 - index * 5,
            reason,
            engagementMetrics: {
              isHighActivity: hub.activityLevel === 'HIGH',
              isGrowing: (hub._count?.connections || 0) > 20,
              isQuality: (hub.upvotes?.length || 0) > 5,
              isTrusted: hub.verified || hub.partnered,
            },
          };
        });

      return {
        recommendations: selectedHubs,
        metadata: {
          type: 'similar',
          count: selectedHubs.length,
          generatedAt: new Date().toISOString(),
        },
      };
    },
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // Default to 5 minutes
    enabled: (options?.enabled ?? true) && type === 'similar',
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for multiple recommendation types (for dashboard sections)
 */
export function useMultipleRecommendations(
  types: { type: RecommendationType; limit?: number }[],
  options?: { enabled?: boolean }
) {
  // Create individual queries for each type
  const results = types.map((config, index) => 
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useHubRecommendations(
      config.type,
      config.limit || 8,
      {
        enabled: options?.enabled ?? true,
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    )
  );

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);
  const errors = results.filter((r) => r.isError).map((r) => r.error);

  // Handle error notifications
  useErrorNotification({
    isError,
    error: errors[0], // Show first error
    title: 'Recommendation Error',
    description: 'Failed to load some hub recommendations',
  });

  return {
    results: types.map((config, index) => ({
      type: config.type,
      recommendations: results[index]?.data?.recommendations || [],
      metadata: results[index]?.data?.metadata,
      isLoading: results[index]?.isLoading || false,
      isError: results[index]?.isError || false,
      error: results[index]?.error,
    })),
    isLoading,
    isError,
    errors,
    refetchAll: () => {
      results.forEach((r) => {
        r.refetch();
      });
    },
  };
}

export function getActivityLevelColor(
  level: 'LOW' | 'MEDIUM' | 'HIGH'
): string {
  switch (level) {
    case 'HIGH':
      return 'text-green-500';
    case 'MEDIUM':
      return 'text-yellow-500';
    case 'LOW':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
}

export function getActivityLevelDescription(
  level: 'LOW' | 'MEDIUM' | 'HIGH'
): string {
  switch (level) {
    case 'HIGH':
      return 'Very Active';
    case 'MEDIUM':
      return 'Active';
    case 'LOW':
      return 'Quiet';
    default:
      return 'Unknown';
  }
}

export function formatRecommendationReason(reason: string): {
  primary: string;
  secondary?: string;
} {
  const parts = reason.split(' • ');
  return {
    primary: parts[0],
    secondary: parts[1],
  };
}

export function trackRecommendationClick(
  hubId: string,
  recommendationType: RecommendationType,
  position: number
): void {
  // TODO: Implement analytics tracking
  // This would send events to analytics service to track:
  // - Which recommendations users click
  // - Position of clicked recommendations
  // - Conversion rates from recommendation to hub join
  console.log('Recommendation clicked:', {
    hubId,
    recommendationType,
    position,
  });
}
