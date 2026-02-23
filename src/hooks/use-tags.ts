'use client';

import { Search01Icon } from '@hugeicons/core-free-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

/**
 * Hook for searching tags (autocomplete) with optimized caching
 */
export function useTagSearch(
  query: string,
  options?: { enabled?: boolean; staleTime?: number }
) {
  const trpc = useTRPC();

  const queryResult = useQuery(
    trpc.tags.list.queryOptions(
      { search: query, limit: 20 },
      {
        enabled: (options?.enabled ?? true) && query.length >= 2,
        staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutes default
        retry: 2,
        refetchOnWindowFocus: false,
      }
    )
  );

  useErrorNotification({
    isError: queryResult.isError,
    error: queryResult.error,
    title: 'Tag Search01Icon Error',
    description: 'Failed to search tags',
  });

  return {
    tags: queryResult.data?.tags || [],
    metadata: queryResult.data?.metadata,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

/**
 * Hook for getting popular tags with optimized caching
 */
export function usePopularTags(
  limit = 20,
  options?: { enabled?: boolean; staleTime?: number }
) {
  const trpc = useTRPC();

  const queryResult = useQuery(
    trpc.tags.list.queryOptions(
      { popular: true, limit },
      {
        staleTime: options?.staleTime || 1000 * 60 * 10, // 10 minutes default for popular tags
        enabled: options?.enabled ?? true,
        retry: 2,
        refetchOnWindowFocus: false,
      }
    )
  );

  useErrorNotification({
    isError: queryResult.isError,
    error: queryResult.error,
    title: 'Popular Tags Error',
    description: 'Failed to load popular tags',
  });

  return {
    tags: queryResult.data?.tags || [],
    metadata: queryResult.data?.metadata,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

/**
 * Hook for managing hub tags
 */
export function useHubTagManagement() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const addTagsMutation = useMutation(
    trpc.tags.mutate.mutationOptions({
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(
          trpc.hub.getHub.queryFilter({ id: variables.hubId })
        );

        // Snapshot the previous value
        const previousHub = queryClient.getQueryData(
          trpc.hub.getHub.queryKey({ id: variables.hubId })
        );

        // Optimistically update the hub tags
        queryClient.setQueryData(
          trpc.hub.getHub.queryKey({ id: variables.hubId }),
          (old) => {
            if (!old) return old;
            const existingTags =
              (old as { tags?: Array<{ name: string }> }).tags || [];
            return {
              ...old,
              tags: [
                ...existingTags,
                ...variables.tags.map((tag: string) => ({ name: tag })),
              ],
            };
          }
        );

        return { previousHub };
      },
      onSuccess: (_data, variables) => {
        toast.success('Tags Added', {
          description: `Successfully added ${variables.tags.length} tag${variables.tags.length > 1 ? 's' : ''} to the hub`,
          duration: 3000,
        });
      },
      onError: (error, variables, context) => {
        // Revert optimistic update on error
        if (context?.previousHub) {
          queryClient.setQueryData(
            trpc.hub.getHub.queryKey({ id: variables.hubId }),
            context.previousHub
          );
        }

        toast.error('Error', {
          description: `Failed to add tags to hub: ${error.message}`,
        });
      },
      onSettled: (_data, _error, variables) => {
        // Always refetch after error or success
        queryClient.invalidateQueries(
          trpc.hub.getHub.queryFilter({ id: variables.hubId })
        );
        queryClient.invalidateQueries(trpc.tags.list.pathFilter());
      },
    })
  );

  const removeTagsMutation = useMutation(
    trpc.tags.mutate.mutationOptions({
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(
          trpc.hub.getHub.queryFilter({ id: variables.hubId })
        );

        // Snapshot the previous value
        const previousHub = queryClient.getQueryData(
          trpc.hub.getHub.queryKey({ id: variables.hubId })
        );

        // Optimistically update the hub tags
        queryClient.setQueryData(
          trpc.hub.getHub.queryKey({ id: variables.hubId }),
          (old) => {
            if (!old) return old;
            const existingTags =
              (old as { tags?: Array<{ name: string }> }).tags || [];
            return {
              ...old,
              tags: existingTags.filter(
                (tag: { name: string }) => !variables.tags.includes(tag.name)
              ),
            };
          }
        );

        return { previousHub };
      },
      onSuccess: (_data, variables) => {
        toast.success('Tags Removed', {
          description: `Successfully removed ${variables.tags.length} tag${variables.tags.length > 1 ? 's' : ''} from the hub`,
          duration: 3000,
        });
      },
      onError: (error, variables, context) => {
        // Revert optimistic update on error
        if (context?.previousHub) {
          queryClient.setQueryData(
            trpc.hub.getHub.queryKey({ id: variables.hubId }),
            context.previousHub
          );
        }

        toast.error('Error', {
          description: `Failed to remove tags from hub: ${error.message}`,
        });
      },
      onSettled: (_data, _error, variables) => {
        // Always refetch after error or success
        queryClient.invalidateQueries(
          trpc.hub.getHub.queryFilter({ id: variables.hubId })
        );
        queryClient.invalidateQueries(trpc.tags.list.pathFilter());
      },
    })
  );

  return {
    addTagsMutation,
    removeTagsMutation,
    addTags: (args: { hubId: string; tags: string[] }) =>
      addTagsMutation.mutate({ ...args, action: 'add' }),
    removeTags: (args: { hubId: string; tags: string[] }) =>
      removeTagsMutation.mutate({ ...args, action: 'remove' }),
    isAdding: addTagsMutation.isPending,
    isRemoving: removeTagsMutation.isPending,
    addError: addTagsMutation.error,
    removeError: removeTagsMutation.error,
  };
}
