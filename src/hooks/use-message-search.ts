'use client';

import { useQuery } from '@tanstack/react-query';
import type { Message } from '@/lib/generated/prisma/client';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

export type MessageWithAuthor = Message & {
  authorUsername: string;
  authorAvatar: string | null;
};

export interface MessageSearchResponse {
  messages: MessageWithAuthor[];
}

export function useMessageSearch(
  hubId: string,
  query: string,
  sortBy: 'content' | 'author' | 'server',
  enabled: boolean
) {
  const trpc = useTRPC();

  const queryResult = useQuery({
    ...trpc.message.search.queryOptions({ hubId, query, sortBy }),
    enabled: enabled && query.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useErrorNotification({
    isError: queryResult.isError,
    error: queryResult.error,
    title: 'Message Search Error',
    description: 'Failed to search messages',
  });

  return {
    ...queryResult,
    // The server returns an array of MessageWithAuthor for search
    messages: (queryResult.data as MessageWithAuthor[]) || [],
  };
}
