'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BasicHubConnection,
  ServerData,
} from '@/app/dashboard/hubs/[hubId]/connections/client';
import { useToast } from '@/components/ui/use-toast';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

// Query keys
export const connectionKeys = {
  all: ['connections'] as const,
  lists: () => [...connectionKeys.all, 'list'] as const,
  list: (hubId: string) => ['connections', hubId] as const, // Simplified to match server prefetching
  details: () => [...connectionKeys.all, 'detail'] as const,
  detail: (id: string) => [...connectionKeys.details(), id] as const,
};

/**
 * Hook for fetching hub connections with optimized caching and sorting
 */
export function useConnections(
  hubId: string,
  options?: { enabled?: boolean; staleTime?: number }
) {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.connection.listByHub.queryOptions(
      { hubId },
      {
        staleTime: options?.staleTime || 60 * 1000, // 1 minute default
        gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
        enabled: options?.enabled ?? true,
        retry: 2,
        refetchOnWindowFocus: false,
        select: (res) =>
          [
            ...(res.connections as (BasicHubConnection & {
              server: ServerData | null;
            })[]),
          ].sort(
            (a, b) =>
              new Date(b.lastActive).getTime() -
              new Date(a.lastActive).getTime()
          ),
      }
    )
  );

  // Handle error with useErrorNotification
  useErrorNotification({
    isError: query.isError,
    error: query.error,
    title: 'Connections Error',
    description: 'Failed to load hub connections',
  });

  return query;
}

// Hook for removing a connection
export function useRemoveConnection(hubId?: string) {
  const trpc = useTRPC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.connection.remove.mutationOptions({
      onMutate: async (vars) => {
        // Cancel and snapshot current data
        const previousConnections = hubId
          ? queryClient.getQueryData(
              trpc.connection.listByHub.queryKey({ hubId })
            )
          : undefined;
        if (hubId)
          await queryClient.cancelQueries(
            trpc.connection.listByHub.queryFilter({ hubId })
          );

        if (hubId) {
          queryClient.setQueryData(
            trpc.connection.listByHub.queryKey({ hubId }),
            (old) => {
              if (!old) return old;
              return {
                connections: old.connections.filter(
                  (c) => c.id !== vars.connectionId
                ),
              };
            }
          );
        }

        return { previousConnections };
      },
      onSuccess: () => {
        toast({
          description: 'Connection removed successfully',
        });
      },
      onError: (error, _, context) => {
        // Revert the optimistic update
        if (hubId && context?.previousConnections) {
          queryClient.setQueryData(
            trpc.connection.listByHub.queryKey({ hubId }),
            context.previousConnections
          );
        }

        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Failed to remove connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      },
      onSettled: () => {
        // Invalidate and refetch using trpc utils
        if (hubId)
          queryClient
            .invalidateQueries(trpc.connection.listByHub.queryFilter({ hubId }))
            .catch(() => {});
        else
          queryClient
            .invalidateQueries(trpc.connection.listByHub.pathFilter())
            .catch(() => {});
      },
    })
  );

  return {
    remove: (connectionId: string) => mutation.mutate({ connectionId, hubId }),
    ...mutation,
  } as const;
}
