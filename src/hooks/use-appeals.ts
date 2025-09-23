'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import type {
  Appeal,
  AppealStatus,
  Hub,
  Infraction,
} from '@/lib/generated/prisma/client';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

// Types
export interface AppealWithInfraction extends Appeal {
  infraction: Infraction & { hub: Hub };
}

export interface AppealsResponse {
  appeals: AppealWithInfraction[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

/**
 * Hook for fetching appeals with optimized caching and error handling
 */
export function useAppeals(
  params: {
    myAppeals?: boolean;
    page?: number;
    limit?: number;
    hubId?: string;
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    userId?: string;
    infractionId?: string;
  },
  options?: { enabled?: boolean; staleTime?: number }
) {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.appeal.list.queryOptions(
      {
        myAppeals: params.myAppeals,
        page: params.page,
        limit: params.limit,
        hubId: params.hubId,
        status: params.status as AppealStatus | undefined,
        userId: params.userId,
        infractionId: params.infractionId,
      },
      {
        staleTime: options?.staleTime || 1000 * 60 * 3, // 3 minutes default for appeals
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
    title: 'Appeals Error',
    description: 'Failed to load appeals',
  });

  return query;
}

/**
 * Hook for fetching my appeals with optimized defaults
 */
export function useMyAppeals(
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean }
) {
  return useAppeals({ myAppeals: true, page, limit }, options);
}

/**
 * Mutation for updating appeal status with optimistic updates
 */
export function useUpdateAppealStatus() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    trpc.appeal.updateStatus.mutationOptions({
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(trpc.appeal.list.pathFilter());

        // Snapshot the previous value
        const previousAppeals = queryClient.getQueriesData(
          trpc.appeal.list.pathFilter()
        );

        // Optimistically update the appeal status
        queryClient.setQueriesData<AppealsResponse>(
          trpc.appeal.list.pathFilter(),
          (old) => {
            if (!old?.appeals) return old;
            return {
              ...old,
              appeals: old.appeals.map((appeal: AppealWithInfraction) =>
                appeal.id === variables.appealId
                  ? { ...appeal, status: variables.status }
                  : appeal
              ),
            };
          }
        );

        return { previousAppeals };
      },
      onSuccess: (_data, variables) => {
        toast({
          title: 'Appeal Updated',
          description: `Appeal has been ${variables.status.toLowerCase()}.`,
          duration: 3000,
        });
      },
      onError: (error, _variables, context) => {
        // Revert optimistic update on error
        if (context?.previousAppeals) {
          context.previousAppeals.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }

        toast({
          title: 'Error',
          description: `Failed to update appeal status: ${error.message}`,
          variant: 'destructive',
        });
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries(trpc.appeal.list.pathFilter());
      },
    })
  );
}

/**
 * Mutation for creating a new appeal
 */
export function useCreateAppeal() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    trpc.appeal.create.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Appeal Submitted',
          description: 'Your appeal has been submitted successfully.',
          duration: 3000,
        });

        // Invalidate appeals to show the new appeal
        queryClient.invalidateQueries(trpc.appeal.list.pathFilter());
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to submit appeal: ${error.message}`,
          variant: 'destructive',
        });
      },
    })
  );
}
