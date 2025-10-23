'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTRPC } from '@/utils/trpc';

/**
 * Hook to manage user NSFW content preferences
 * Uses tRPC for type-safe API calls
 */
export function useNSFWPreference() {
  const trpc = useTRPC();
  const { data: session, status: sessionStatus } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for user settings
  const { data: userSettings, isLoading } = useQuery(
    trpc.user.getSettings.queryOptions(undefined, {
      enabled: !!session?.user?.id && sessionStatus === 'authenticated',
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    })
  );

  // Mutation for updating NSFW preference
  const updateMutation = useMutation(
    trpc.user.updateSettings.mutationOptions({
      onMutate: async ({ showNsfwHubs }) => {
        // Optimistic update
        await queryClient.cancelQueries(trpc.user.getSettings.pathFilter());

        const previousSettings = queryClient.getQueryData(
          trpc.user.getSettings.queryKey()
        );

        queryClient.setQueryData(trpc.user.getSettings.queryKey(), (old) =>
          old
            ? { ...old, user: { ...old.user, showNsfwHubs: showNsfwHubs! } }
            : undefined
        );

        return { previousSettings };
      },
      onError: (error, _variables, context) => {
        // Rollback on error
        if (context?.previousSettings) {
          queryClient.setQueryData(
            trpc.user.getSettings.queryKey(),
            context.previousSettings
          );
        }
        toast({
          title: 'Error',
          description: `Failed to update NSFW preference: ${error.message}`,
          variant: 'destructive',
        });
      },
      onSuccess: (_data, { showNsfwHubs }) => {
        toast({
          title: showNsfwHubs
            ? 'NSFW Content Enabled'
            : 'NSFW Content Disabled',
          description: showNsfwHubs
            ? 'NSFW hubs will now appear in your search results.'
            : 'NSFW hubs are now hidden from your search results.',
        });
        queryClient.invalidateQueries(trpc.user.getSettings.pathFilter());
      },
    })
  );

  // Update NSFW preference
  const updateNSFWPreference = async (
    showNsfwHubs: boolean
  ): Promise<boolean> => {
    if (!session?.user?.id) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to change NSFW content settings.',
        variant: 'destructive',
      });
      return false;
    }

    setIsUpdating(true);

    try {
      await updateMutation.mutateAsync({
        showNsfwHubs,
      });
      setIsUpdating(false);
      return true;
    } catch {
      setIsUpdating(false);
      return false;
    }
  };

  // Toggle NSFW preference with age verification
  const toggleNSFWPreference = async (
    skipVerification = false
  ): Promise<boolean> => {
    const currentValue = userSettings?.user?.showNsfwHubs ?? false;
    const newValue = !currentValue;

    // If enabling NSFW and not skipping verification, caller should handle age verification
    if (newValue && !skipVerification) {
      return false; // Caller should show age verification modal
    }

    return await updateNSFWPreference(newValue);
  };

  return {
    showNsfwHubs: userSettings?.user?.showNsfwHubs ?? false,
    isLoading: isLoading && sessionStatus === 'authenticated',
    isUpdating: isUpdating || updateMutation.isPending,
    isAuthenticated: !!session?.user?.id,
    updateNSFWPreference,
    toggleNSFWPreference,
  };
}
