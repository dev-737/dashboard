'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

/**
 * Hook for fetching a hub with optimized caching and error handling
 */
export function useHub(
  hubId: string,
  options?: { enabled?: boolean; staleTime?: number }
) {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.hub.getHub.queryOptions(
      { id: hubId },
      {
        staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutes default
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
    title: 'Hub Error',
    description: 'Failed to load hub details',
  });

  return query;
}

/**
 * Hook for upvoting a hub with optimistic updates and proper error handling
 */
export function useHubUpvote(hubId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    trpc.hub.upvoteHub.mutationOptions({
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(
          trpc.hub.getHub.queryFilter({ id: hubId })
        );

        // Snapshot the previous value
        const previousHub = queryClient.getQueryData(
          trpc.hub.getHub.queryKey({ id: hubId })
        );

        // Optimistically update the cache
        queryClient.setQueryData(
          trpc.hub.getHub.queryKey({ id: hubId }),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              upvotes: variables.hubId
                ? [
                    ...(old.upvotes || []),
                    { id: 'temp', userId: 'temp', createdAt: new Date() },
                  ]
                : (old.upvotes || []).slice(0, -1),
            };
          }
        );

        return { previousHub };
      },
      onSuccess: (data) => {
        toast({
          title: data.upvoted ? 'Upvoted hub' : 'Removed upvote',
          description: data.upvoted
            ? 'Thanks for your support!'
            : "You've removed your upvote",
          duration: 2000,
        });
      },
      onError: (error, _variables, context) => {
        // Revert optimistic update on error
        if (context?.previousHub) {
          queryClient.setQueryData(
            trpc.hub.getHub.queryKey({ id: hubId }),
            context.previousHub
          );
        }

        toast({
          title: 'Error',
          description: `Failed to update upvote status: ${error.message}`,
          variant: 'destructive',
        });
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries(
          trpc.hub.getHub.queryFilter({ id: hubId })
        );
      },
    })
  );
}
