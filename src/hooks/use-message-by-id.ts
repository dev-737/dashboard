'use client';

import { useQuery } from '@tanstack/react-query';
import type { Message } from '@/lib/generated/prisma/client';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

export type MessageWithAuthor = Message & {
  authorUsername: string;
  authorAvatar: string | null;
};

export interface MessageByIdResponse {
  message: MessageWithAuthor;
  messagesBefore: MessageWithAuthor[];
  messagesAfter: MessageWithAuthor[];
}

export function useMessageById(id: string | null) {
  const trpc = useTRPC();

  const queryResult = useQuery({
    ...trpc.message.getById.queryOptions({ id: id ?? '' }),
    enabled: !!id,
  });

  useErrorNotification({
    isError: queryResult.isError,
    error: queryResult.error,
    title: 'Message Error',
    description: 'Failed to load message',
  });

  return queryResult;
}
