'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

/**
 * Hook for fetching hub reviews with optimized caching
 */
export function useHubReviews(
  hubId: string,
  options?: { enabled?: boolean; staleTime?: number }
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

/**
 * Hook for creating a hub review
 */
export function useCreateHubReview(hubId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    trpc.hub.createHubReview.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Review Submitted',
          description: 'Your review has been submitted successfully.',
          duration: 3000,
        });

        // Invalidate reviews to show the new review
        queryClient.invalidateQueries(
          trpc.hub.getHubReviews.queryFilter({ hubId })
        );
        // Also invalidate the hub query to update review count
        queryClient.invalidateQueries(
          trpc.hub.getHub.queryFilter({ id: hubId })
        );
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to submit review: ${error.message}`,
          variant: 'destructive',
        });
      },
    })
  );
}

/**
 * Hook for deleting a hub review
 */
export function useDeleteHubReview(hubId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    trpc.hub.deleteHubReview.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Review Deleted',
          description: 'Your review has been deleted successfully.',
          duration: 3000,
        });

        // Invalidate reviews to remove the deleted review
        queryClient.invalidateQueries(
          trpc.hub.getHubReviews.queryFilter({ hubId })
        );
        // Also invalidate the hub query to update review count
        queryClient.invalidateQueries(
          trpc.hub.getHub.queryFilter({ id: hubId })
        );
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to delete review: ${error.message}`,
          variant: 'destructive',
        });
      },
    })
  );
}
