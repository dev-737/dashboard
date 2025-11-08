'use client';

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { Message } from '@/lib/generated/prisma/client';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

export type MessageWithAuthor = Message & {
  authorUsername: string;
  authorAvatar: string | null;
};

export interface MessagesResponse {
  messages: MessageWithAuthor[];
  nextCursor: string | null | undefined;
}

export function useInfiniteMessages(hubId: string, limit = 50) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const query = useInfiniteQuery<MessagesResponse>({
    queryKey: ['infiniteMessages', hubId],
    queryFn: async ({ pageParam }) => {
      const res = await queryClient.fetchQuery(
        trpc.message.list.queryOptions({
          hubId,
          limit,
          cursor: pageParam as string | undefined,
        })
      );
      return res;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: 2,
    refetchOnWindowFocus: false,
  });

  useErrorNotification({
    isError: query.isError,
    error: query.error,
    title: 'Messages Error',
    description: 'Failed to load messages',
  });

  const messages =
    query.data?.pages.reduce<MessageWithAuthor[]>((acc, page) => {
      const uniqueMessages = page.messages.filter(
        (message: MessageWithAuthor) =>
          !acc.some((existing) => existing.id === message.id)
      );
      acc.push(...uniqueMessages);
      return acc;
    }, []) || [];

  return {
    ...query,
    messages,
  };
}
