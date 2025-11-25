'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

/**
 * Hook for fetching hub reviews with optimized caching
 */
export function useHubReviews(
  hubId: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    initialData?: any[];
  }
) {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.hub.getHubReviews.queryOptions(
      { hubId },
      {
        staleTime: options?.staleTime || 1000 * 60 * 10, // 10 minutes default for reviews
        enabled: options?.enabled ?? true,
        retry: 2,
        refetchOnWindowFocus: false,
        initialData: options?.initialData,
      }
    )
  );

  // Handle error with useErrorNotification
  useErrorNotification({
    isError: query.isError,
    error: query.error,
    title: 'Reviews Error',
    description: 'Failed to load hub reviews',
  });

  return query;
}
