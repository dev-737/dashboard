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
 * Hook for fetching hub members
 */
export function useHubMembers(
  hubId: string,
  options?: { enabled?: boolean; staleTime?: number; initialData?: HubMembers }
) {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.hub.getMembers.queryOptions(
      { hubId },
      {
        staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutes
        enabled: options?.enabled ?? true,
        retry: 2,
        refetchOnWindowFocus: false,
        initialData: options?.initialData,
      }
    )
  );

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
      onSuccess: () => {
        toast({
          title: 'Member Added',
          description: 'User has been added to the hub.',
          duration: 3000,
        });
        // Invalidate to fetch the real ID
        queryClient.invalidateQueries({
          queryKey: trpc.hub.getMembers.queryOptions({ hubId }).queryKey,
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
      onSuccess: () => {
        toast({
          title: 'Role Updated',
          description: 'Member role has been updated.',
          duration: 3000,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.hub.getMembers.queryOptions({ hubId }).queryKey,
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
      onSuccess: () => {
        toast({
          title: 'Member Removed',
          description: 'Member has been removed from the hub.',
          duration: 3000,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.hub.getMembers.queryOptions({ hubId }).queryKey,
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
