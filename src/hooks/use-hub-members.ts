'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

// Types (match the tRPC router outputs)
export interface User {
  id: string;
  name: string | null;
  image: string | null;
}

export interface Moderator {
  id: string;
  userId: string;
  role: 'MODERATOR' | 'MANAGER';
  user: User;
}

export interface HubMembers {
  owner: User;
  moderators: Moderator[];
}

/**
 * Hook for fetching hub members with optimized caching
 */
export function useHubMembers(
  hubId: string,
  options?: { enabled?: boolean; staleTime?: number }
) {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.hub.getMembers.queryOptions(
      { hubId },
      {
        staleTime: options?.staleTime || 1000 * 60 * 10, // 10 minutes default for members
        enabled: options?.enabled ?? true,
        retry: 2,
        refetchOnWindowFocus: false,
      }
    )
  );

  // Handle error notification
  useErrorNotification({
    isError: query.isError,
    error: query.error,
    title: 'Members Error',
    description: 'Failed to load hub members',
  });

  return query;
}

/**
 * Hook for adding a hub member with optimistic updates
 */
export function useAddHubMember(hubId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    trpc.hub.addMember.mutationOptions({
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(
          trpc.hub.getMembers.queryFilter({ hubId })
        );

        // Snapshot the previous value
        const previousMembers = queryClient.getQueryData(
          trpc.hub.getMembers.queryKey({ hubId })
        );

        // Optimistically update the members list
        queryClient.setQueryData(
          trpc.hub.getMembers.queryKey({ hubId }),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              moderators: [
                ...(old.moderators || []),
                {
                  id: `temp-${Date.now()}`,
                  userId: variables.userId,
                  role: variables.role,
                  user: {
                    id: variables.userId,
                    name: 'Loading...',
                    image: null,
                  },
                },
              ],
            };
          }
        );

        return { previousMembers };
      },
      onSuccess: (_data, variables) => {
        toast({
          title: 'Member Added',
          description: `User has been added as a ${variables.role.toLowerCase()}.`,
          duration: 3000,
        });
      },
      onError: (error, _variables, context) => {
        // Revert optimistic update on error
        if (context?.previousMembers) {
          queryClient.setQueryData(
            trpc.hub.getMembers.queryKey({ hubId }),
            context.previousMembers
          );
        }

        toast({
          title: 'Error',
          description: `Failed to add member: ${error.message}`,
          variant: 'destructive',
        });
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries(
          trpc.hub.getMembers.queryFilter({ hubId })
        );
      },
    })
  );
}

/**
 * Hook for updating a member's role with optimistic updates
 */
export function useUpdateMemberRole(hubId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    trpc.hub.updateMemberRole.mutationOptions({
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(
          trpc.hub.getMembers.queryFilter({ hubId })
        );

        // Snapshot the previous value
        const previousMembers = queryClient.getQueryData(
          trpc.hub.getMembers.queryKey({ hubId })
        );

        // Optimistically update the member's role
        queryClient.setQueryData(
          trpc.hub.getMembers.queryKey({ hubId }),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              moderators:
                old.moderators?.map((mod) =>
                  mod.id === variables.memberId
                    ? { ...mod, role: variables.role }
                    : mod
                ) || [],
            };
          }
        );

        return { previousMembers };
      },
      onSuccess: (_data, variables) => {
        toast({
          title: 'Role Updated',
          description: `Member's role has been updated to ${variables.role.toLowerCase()}.`,
          duration: 3000,
        });
      },
      onError: (error, _variables, context) => {
        // Revert optimistic update on error
        if (context?.previousMembers) {
          queryClient.setQueryData(
            trpc.hub.getMembers.queryKey({ hubId }),
            context.previousMembers
          );
        }

        toast({
          title: 'Error',
          description: `Failed to update role: ${error.message}`,
          variant: 'destructive',
        });
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries(
          trpc.hub.getMembers.queryFilter({ hubId })
        );
      },
    })
  );
}

/**
 * Hook for removing a member with optimistic updates
 */
export function useRemoveMember(hubId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    trpc.hub.removeMember.mutationOptions({
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(
          trpc.hub.getMembers.queryFilter({ hubId })
        );

        // Snapshot the previous value
        const previousMembers = queryClient.getQueryData(
          trpc.hub.getMembers.queryKey({ hubId })
        );

        // Optimistically remove the member
        queryClient.setQueryData(
          trpc.hub.getMembers.queryKey({ hubId }),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              moderators:
                old.moderators?.filter(
                  (mod) => mod.id !== variables.memberId
                ) || [],
            };
          }
        );

        return { previousMembers };
      },
      onSuccess: () => {
        toast({
          title: 'Member Removed',
          description: 'Member has been removed from the hub.',
          duration: 3000,
        });
      },
      onError: (error, _variables, context) => {
        // Revert optimistic update on error
        if (context?.previousMembers) {
          queryClient.setQueryData(
            trpc.hub.getMembers.queryKey({ hubId }),
            context.previousMembers
          );
        }

        toast({
          title: 'Error',
          description: `Failed to remove member: ${error.message}`,
          variant: 'destructive',
        });
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries(
          trpc.hub.getMembers.queryFilter({ hubId })
        );
      },
    })
  );
}
