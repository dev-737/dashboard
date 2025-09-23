'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';
import type { SimplifiedHub } from './use-infinite-hubs';

// Types for enhanced recommendations
export interface HubRecommendation {
  hubId: string;
  hub: EnhancedHub;
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

/**
 * Hook for fetching hub recommendations
 */
export function useHubRecommendations(
  type: RecommendationType = 'personalized',
  limit = 8,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.hub.getRecommendations.queryOptions(
      { type, limit },
      {
        staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutes
        enabled: options?.enabled ?? true,
      }
    )
  );

  // Handle error notifications
  useErrorNotification({
    isError: query.isError,
    error: query.error,
    title: 'Recommendation Error',
    description: 'Failed to load hub recommendations',
  });

  return {
    recommendations: query.data?.recommendations || [],
    metadata: query.data?.metadata,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for multiple recommendation types (for dashboard sections)
 */
export function useMultipleRecommendations(
  types: { type: RecommendationType; limit?: number }[],
  options?: { enabled?: boolean }
) {
  const trpc = useTRPC();
  // Create stable queries for each type
  const query1 = useQuery(
    trpc.hub.getRecommendations.queryOptions(
      { type: types[0]?.type || 'personalized', limit: types[0]?.limit || 8 },
      {
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: (options?.enabled ?? true) && types.length > 0,
      }
    )
  );

  const query2 = useQuery(
    trpc.hub.getRecommendations.queryOptions(
      { type: types[1]?.type || 'trending', limit: types[1]?.limit || 8 },
      {
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: (options?.enabled ?? true) && types.length > 1,
      }
    )
  );

  const query3 = useQuery(
    trpc.hub.getRecommendations.queryOptions(
      { type: types[2]?.type || 'activity', limit: types[2]?.limit || 8 },
      {
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: (options?.enabled ?? true) && types.length > 2,
      }
    )
  );

  const queries = [query1, query2, query3].slice(0, types.length);

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const errors = queries.filter((q) => q.isError).map((q) => q.error);

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
      recommendations: queries[index].data?.recommendations || [],
      metadata: queries[index].data?.metadata,
      isLoading: queries[index].isLoading,
      isError: queries[index].isError,
      error: queries[index].error,
    })),
    isLoading,
    isError,
    errors,
    refetchAll: () =>
      queries.forEach((q) => {
        q.refetch();
      }),
  };
}

/**
 * Utility function to get activity level color for UI
 */
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

/**
 * Utility function to get activity level description
 */
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

/**
 * Utility function to format recommendation reason for display
 */
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

/**
 * Utility function to track recommendation interactions for analytics
 */
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
