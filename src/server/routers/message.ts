import { z } from 'zod';
import type { Prisma } from '@/lib/generated/prisma/client/client';
import { db } from '@/lib/prisma';
import { protectedProcedure, router } from '@/server/trpc';

export const messageRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { hubId, limit, cursor } = input;
      const messages = await db.message.findMany({
        where: {
          hubId,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'asc', // Changed to ascending - oldest first, newest at bottom
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      // Fetch unique author IDs and get user info from Discord API
      const uniqueAuthorIds = [...new Set(messages.map((m) => m.authorId))];
      const authorInfoMap = new Map<
        string,
        { username: string; avatar: string | null }
      >();

      // Fetch user info from the User table (these are users who have logged in)
      const users = await db.user.findMany({
        where: {
          id: { in: uniqueAuthorIds },
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
      });

      users.forEach((user) => {
        authorInfoMap.set(user.id, {
          username: user.name || 'Unknown User',
          avatar: user.image,
        });
      });

      // For users not in our database, use a default username
      uniqueAuthorIds.forEach((id) => {
        if (!authorInfoMap.has(id)) {
          authorInfoMap.set(id, {
            username: `User ${id.slice(0, 4)}`,
            avatar: null,
          });
        }
      });

      return {
        messages: messages.map((msg) => ({
          ...msg,
          authorUsername:
            authorInfoMap.get(msg.authorId)?.username || 'Unknown User',
          authorAvatar: authorInfoMap.get(msg.authorId)?.avatar || null,
        })),
        nextCursor,
      };
    }),
  search: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        query: z.string(),
        sortBy: z.enum(['content', 'author', 'server']).default('content'),
      })
    )
    .query(async ({ input }) => {
      const { hubId, query, sortBy } = input;

      const whereClause: Prisma.MessageWhereInput & { AND: Prisma.MessageWhereInput[] } = { hubId, AND: []};

      if (sortBy === 'author') {
        whereClause.AND.push({
          authorId: { contains: query, mode: 'insensitive' as const },
        });
      } else if (sortBy === 'server') {
        whereClause.AND.push({
          guildId: { contains: query, mode: 'insensitive' as const },
        });
      } else {
        whereClause.AND.push({
          content: { contains: query, mode: 'insensitive' as const },
        });
      }

      const messages = await db.message.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Fetch user info for search results
      const uniqueAuthorIds = [...new Set(messages.map((m) => m.authorId))];
      const users = await db.user.findMany({
        where: {
          id: { in: uniqueAuthorIds },
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
      });

      const authorInfoMap = new Map<
        string,
        { username: string; avatar: string | null }
      >();
      users.forEach((user) => {
        authorInfoMap.set(user.id, {
          username: user.name || 'Unknown User',
          avatar: user.image,
        });
      });

      uniqueAuthorIds.forEach((id) => {
        if (!authorInfoMap.has(id)) {
          authorInfoMap.set(id, {
            username: `User ${id.slice(0, 4)}`,
            avatar: null,
          });
        }
      });

      return messages.map((msg) => ({
        ...msg,
        authorUsername:
          authorInfoMap.get(msg.authorId)?.username || 'Unknown User',
        authorAvatar: authorInfoMap.get(msg.authorId)?.avatar || null,
      }));
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { id } = input;
      const message = await db.message.findUnique({ where: { id } });

      if (!message) {
        throw new Error('Message not found');
      }

      const messagesBefore = await db.message.findMany({
        where: {
          hubId: message.hubId,
          createdAt: {
            lt: message.createdAt,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      const messagesAfter = await db.message.findMany({
        where: {
          hubId: message.hubId,
          createdAt: {
            gt: message.createdAt,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 5,
      });

      // Fetch user info for all messages
      const allMessages = [message, ...messagesBefore, ...messagesAfter];
      const uniqueAuthorIds = [...new Set(allMessages.map((m) => m.authorId))];
      const users = await db.user.findMany({
        where: {
          id: { in: uniqueAuthorIds },
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
      });

      const authorInfoMap = new Map<
        string,
        { username: string; avatar: string | null }
      >();
      users.forEach((user) => {
        authorInfoMap.set(user.id, {
          username: user.name || 'Unknown User',
          avatar: user.image,
        });
      });

      uniqueAuthorIds.forEach((id) => {
        if (!authorInfoMap.has(id)) {
          authorInfoMap.set(id, {
            username: `User ${id.slice(0, 4)}`,
            avatar: null,
          });
        }
      });

      const enrichMessage = (msg: typeof message) => ({
        ...msg,
        authorUsername:
          authorInfoMap.get(msg.authorId)?.username || 'Unknown User',
        authorAvatar: authorInfoMap.get(msg.authorId)?.avatar || null,
      });

      return {
        message: enrichMessage(message),
        messagesBefore: messagesBefore.reverse().map(enrichMessage),
        messagesAfter: messagesAfter.map(enrichMessage),
      };
    }),
});
