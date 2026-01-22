'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

// Types
export interface Tag {
  name: string;
  usageCount?: number;
  category?: string;
  isOfficial?: boolean;
  color?: string;
}

export interface TagsResponse {
  tags: Tag[];
  metadata: {
    count: number;
    query?: string;
    category?: string;
    popular?: boolean;
    limit: number;
  };
}

export interface CategorizedTags {
  categories: Record<string, Array<{ name: string; usageCount: number }>>;
  metadata: {
    totalCategories: number;
    totalTags: number;
  };
}

// Query keys
export const tagKeys = {
  all: ['tags'] as const,
  search: (query: string) => [...tagKeys.all, 'search', query] as const,
  popular: (limit: number) => [...tagKeys.all, 'popular', limit] as const,
  categories: () => [...tagKeys.all, 'categories'] as const,
  suggestions: (text: string) => [...tagKeys.all, 'suggestions', text] as const,
};

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
    title: 'Tag Search Error',
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
 * Hook for tag suggestions based on content
 */
export function useTagSuggestions(hubName?: string, hubDescription?: string) {
  const trpc = useTRPC();
  const text = `${hubName || ''} ${hubDescription || ''}`.trim();

  const queryResult = useQuery(
    trpc.tags.suggest.queryOptions(
      { hubName, hubDescription },
      { enabled: text.length > 0, staleTime: 1000 * 60 * 30 }
    )
  );

  return {
    suggestions: queryResult.data?.suggestions || [],
    metadata: queryResult.data?.metadata,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
  };
}

/**
 * Hook for managing hub tags
 */
export function useHubTagManagement() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
        toast({
          title: 'Tags Added',
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

        toast({
          title: 'Error',
          description: `Failed to add tags to hub: ${error.message}`,
          variant: 'destructive',
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
        toast({
          title: 'Tags Removed',
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

        toast({
          title: 'Error',
          description: `Failed to remove tags from hub: ${error.message}`,
          variant: 'destructive',
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

/**
 * Hook for initializing official tags (admin only)
 */
export function useInitializeOfficialTags() {
  const trpc = useTRPC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.tags.initialize.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Official tags initialized successfully',
        });
        queryClient.invalidateQueries(trpc.pathFilter());
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to initialize official tags',
          variant: 'destructive',
        });
      },
    })
  );

  return {
    initialize: mutation.mutate,
    isInitializing: mutation.isPending,
    error: mutation.error,
  };
}

// Removed REST API helpers (migrated to tRPC)

/**
 * Utility function to validate tag name
 */
export function validateTagName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Tag name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Tag name cannot be empty' };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'Tag name must be 30 characters or less' };
  }

  if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
    return {
      valid: false,
      error:
        'Tag name can only contain letters, numbers, spaces, hyphens, and underscores',
    };
  }

  return { valid: true };
}

/**
 * Utility function to get tag color based on category
 */
export function getTagColor(category?: string): string {
  const colors: Record<string, string> = {
    Gaming: '#10B981',
    Technology: '#3B82F6',
    Creative: '#8B5CF6',
    Entertainment: '#F59E0B',
    Social: '#84CC16',
    Learning: '#6366F1',
    Sports: '#14B8A6',
    Other: '#6B7280',
  };

  return colors[category || 'Other'] || colors.Other;
}
