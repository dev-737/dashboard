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
 * Hook for adding a hub member
 */
export function useAddHubMember(hubId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    trpc.hub.addMember.mutationOptions({
      onSuccess: async (_data, variables) => {
        // Wait for the refetch to complete before considering the mutation successful
        await queryClient.invalidateQueries({
          queryKey: trpc.hub.getMembers.queryKey({ hubId }),
        });

        toast({
          title: 'Member Added',
          description: `User has been added as a ${variables.role.toLowerCase()}.`,
          duration: 3000,
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to add member: ${error.message}`,
          variant: 'destructive',
        });
      },
    })
  );
}

/**
 * Hook for updating a member's role
 */
export function useUpdateMemberRole(hubId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    trpc.hub.updateMemberRole.mutationOptions({
      onSuccess: async (_data, variables) => {
        // Wait for the refetch to complete
        await queryClient.invalidateQueries({
          queryKey: trpc.hub.getMembers.queryKey({ hubId }),
        });
        console.log('Members query invalidated');

        toast({
          title: 'Role Updated',
          description: `Member's role has been updated to ${variables.role.toLowerCase()}.`,
          duration: 3000,
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to update role: ${error.message}`,
          variant: 'destructive',
        });
      },
    })
  );
}

/**
 * Hook for removing a member
 */
export function useRemoveMember(hubId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    trpc.hub.removeMember.mutationOptions({
      onSuccess: async (_data, variables) => {
        // Wait for the refetch to complete
        await queryClient.invalidateQueries({
          queryKey: trpc.hub.getMembers.queryKey({ hubId }),
        });

        toast({
          title: 'Member Removed',
          description: 'Member has been removed from the hub.',
          duration: 3000,
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to remove member: ${error.message}`,
          variant: 'destructive',
        });
      },
    })
  );
}
