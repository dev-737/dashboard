'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useQueryClient } from '@/lib/tanstack-query';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

/**
 * Hook for fetching and managing notifications with optimized caching
 */
export function useNotifications(options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  const trpc = useTRPC();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch announcements with optimized caching
  const query = useQuery(
    trpc.announcement.getAnnouncements.queryOptions(undefined, {
      staleTime: options?.staleTime || 1000 * 60 * 2, // 2 minutes default for notifications
      enabled: options?.enabled ?? true,
      refetchOnWindowFocus: true,
      retry: 2,
    })
  );

  // Mark all as read mutation with optimistic updates
  const markAllAsReadMutation = useMutation(
    trpc.announcement.markAllAsRead.mutationOptions({
      onMutate: async () => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(
          trpc.announcement.getAnnouncements.pathFilter()
        );

        // Snapshot the previous value
        const previousData = queryClient.getQueryData(
          trpc.announcement.getAnnouncements.queryKey()
        );

        // Optimistically update to zero unread count
        queryClient.setQueryData(
          trpc.announcement.getAnnouncements.queryKey(),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              unreadCount: 0,
              announcements:
                old.announcements?.map((announcement) => ({
                  ...announcement,
                  read: true,
                })) || [],
            };
          }
        );

        return { previousData };
      },
      onError: (_error, _variables, context) => {
        // Revert optimistic update on error
        if (context?.previousData) {
          queryClient.setQueryData(
            trpc.announcement.getAnnouncements.queryKey(),
            context.previousData
          );
        }
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries(
          trpc.announcement.getAnnouncements.pathFilter()
        );
      },
    })
  );

  // Handle error with useErrorNotification
  useErrorNotification({
    isError: query.isError,
    error: query.error,
    title: 'Notifications Error',
    description: 'Failed to load notifications',
  });

  // Toggle the notification dropdown
  const toggleNotifications = () => {
    setIsOpen(!isOpen);

    // If opening the dropdown and there are unread notifications, mark them as read
    if (!isOpen && query.data?.unreadCount && query.data.unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  return {
    notifications: query.data?.announcements || [],
    unreadCount: query.data?.unreadCount || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    isOpen,
    toggleNotifications,
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    isMarkingAsRead: markAllAsReadMutation.isPending,
    refetch: query.refetch,
  };
}
