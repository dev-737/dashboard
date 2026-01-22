'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import type { HubVisibility } from '@/lib/generated/prisma/client/client';
import { useTRPC } from '@/utils/trpc';

// Interface for hub update data
export interface HubUpdateData {
  name?: string;
  description?: string;
  visibility?: HubVisibility;
  welcomeMessage?: string | null;
  rules?: string[];
  language?: string;
  nsfw?: boolean;
}

// Hook for updating hub settings
export function useUpdateHub(hubId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  return useMutation(
    trpc.hub.updateHub.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Hub updated',
          description: 'Your changes have been saved successfully.',
          duration: 2000,
        });

        // Invalidate the hub query to refresh the data
        queryClient.invalidateQueries(
          trpc.hub.getHub.queryFilter({ id: hubId })
        );

        // Refresh the page to show the updated data
        router.refresh();
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to update hub: ${error.message}`,
          variant: 'destructive',
        });
      },
    })
  );
}

// Hook for updating hub bitmask settings
export function useUpdateHubSettings(hubId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    trpc.hub.updateHubSettings.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Settings updated',
          description: 'Hub settings have been saved successfully.',
          duration: 2000,
        });

        // Invalidate the hub query to refresh the data
        queryClient.invalidateQueries(
          trpc.hub.getHub.queryFilter({ id: hubId })
        );
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to update settings: ${error.message}`,
          variant: 'destructive',
        });
      },
    })
  );
}

// Hook for deleting a hub
export function useDeleteHub() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  return useMutation(
    trpc.hub.deleteHub.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Hub deleted',
          description: 'The hub has been deleted successfully.',
          duration: 2000,
        });

        // Invalidate all hub queries
        queryClient.invalidateQueries(trpc.hub.pathFilter());

        // Redirect to the hubs page
        router.push('/dashboard');
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to delete hub: ${error.message}`,
          variant: 'destructive',
        });
      },
    })
  );
}
