'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

// Hook for searching users
export function useUserSearch(query: string, options?: { enabled?: boolean }) {
  const trpc = useTRPC();
  const enabled = options?.enabled !== undefined ? options.enabled : !!query;

  const queryResult = useQuery(
    trpc.user.search.queryOptions(
      { query, limit: 10 },
      {
        enabled: enabled && query.length > 0,
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    )
  );

  // Handle error notification
  useErrorNotification({
    isError: queryResult.isError,
    error: queryResult.error,
    title: 'Error',
    description: 'Failed to search users',
  });

  // Transform the response to match the expected format
  const transformedResult = {
    ...queryResult,
    data: queryResult.data?.users || [],
  };

  return transformedResult;
}

// Filter users that are not already members
export function useFilteredUserSearch(
  query: string,
  currentMembers?: {
    owner?: { id: string };
    moderators?: { userId: string }[];
  },
  options?: { enabled?: boolean }
) {
  const { data: users = [], ...rest } = useUserSearch(query, options);

  // Filter out users who are already members
  const filteredUsers = users.filter((user) => {
    // Filter out the owner
    if (currentMembers?.owner?.id === user.id) return false;

    // Filter out existing moderators
    return !currentMembers?.moderators?.some((mod) => mod.userId === user.id);
  });

  return { data: filteredUsers, ...rest };
}
