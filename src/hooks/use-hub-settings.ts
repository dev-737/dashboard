'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTRPC } from '@/utils/trpc';

// Interface for hub update data

// Hook for updating hub settings
export function useUpdateHub(hubId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const router = useRouter();

  return useMutation(
    trpc.hub.updateHub.mutationOptions({
      onSuccess: () => {
        toast.success('Hub updated', {
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
        toast.error('Error', {
          description: `Failed to update hub: ${error.message}`,
        });
      },
    })
  );
}
