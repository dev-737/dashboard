/**
 * Hub router for tRPC
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import { SortOptions } from '@/app/hubs/constants';
import { buildWhereClause, getSortedHubs } from '@/app/hubs/utils';
import { PermissionLevel } from '@/lib/constants';
import {
  BlockWordAction,
  HubVisibility,
  type Prisma,
} from '@/lib/generated/prisma/client/client';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis-config';
import { protectedProcedure, publicProcedure, router } from '../trpc';

// Schema for creating a hub
const createHubSchema = z.object({
  name: z.string().min(3).max(32),
  description: z.string().min(10).max(500),
  shortDescription: z.string().min(10).max(100).optional(),
  visibility: z.nativeEnum(HubVisibility).optional().prefault(HubVisibility.PRIVATE),
  rules: z.array(z.string()).optional(),
  settings: z.any().optional(),
});

// Schema for hub search
const hubSearchSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  skip: z.number().optional().prefault(0),
  limit: z.number().optional().prefault(12),
  sort: z.enum(SortOptions).optional().prefault(SortOptions.Trending),
});

async function updateHubAverageRating(hubId: string) {
  const reviews = await db.hubReview.findMany({
    where: { hubId },
    select: { rating: true },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  await db.hub.update({
    where: { id: hubId },
    data: { averageRating },
  });
}

export const hubRouter = router({
  // Validate hub invite code and return hub details
  validateInvite: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const { code } = input;
      const userId = ctx.session.user.id;

      const invite = await db.hubInvite.findUnique({
        where: { code },
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              description: true,
              iconUrl: true,
              visibility: true,
            },
          },
        },
      });

      if (!invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid invite code',
        });
      }

      if (invite.expires && new Date(invite.expires) < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invite code expired',
        });
      }

      // Blacklist check
      const blacklisted = await (await import('@/lib/hub-bans')).isUserBanned(
        userId,
        invite.hub.id
      );
      if (blacklisted) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are blacklisted from this hub',
        });
      }

      return { hub: invite.hub };
    }),
  // Update basic hub info
  updateHub: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        name: z.string().min(3).max(32).optional(),
        description: z.string().min(10).max(500).optional(),
        visibility: z.nativeEnum(HubVisibility).optional(),
        welcomeMessage: z.string().max(1000).nullable().optional(),
        rules: z.array(z.string()).max(100).optional(),
        language: z.string().optional(),
        nsfw: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        hubId,
        name,
        description,
        visibility,
        welcomeMessage,
        rules,
        language,
        nsfw,
      } = input;
      const userId = ctx.session.user.id;

      const level = await getUserHubPermission(userId, hubId);
      if (level < PermissionLevel.MANAGER) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        });
      }

      // Ensure name uniqueness (case-insensitive) if changed
      if (name !== undefined) {
        const existing = await db.hub.findUnique({
          where: { id: hubId },
          select: { name: true },
        });
        if (!existing)
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Hub not found' });
        if (existing.name.toLowerCase() !== name.toLowerCase()) {
          const taken = await db.hub.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } },
          });
          if (taken)
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Hub name already taken',
            });
        }
      }

      const updated = await db.hub.update({
        where: { id: hubId },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(visibility !== undefined && { visibility }),
          ...(welcomeMessage !== undefined && {
            welcomeMessage: welcomeMessage ?? null,
          }),
          ...(rules !== undefined && { rules: rules ?? [] }),
          ...(language !== undefined && { language }),
          ...(nsfw !== undefined && { nsfw }),
        },
        select: { id: true },
      });

      return { success: true as const, id: updated.id };
    }),

  // Update bitmask settings (modules)
  updateHubSettings: protectedProcedure
    .input(
      z.object({ hubId: z.string(), settings: z.number().int().nonnegative() })
    )
    .mutation(async ({ input, ctx }) => {
      const { hubId, settings } = input;
      const userId = ctx.session.user.id;
      const level = await getUserHubPermission(userId, hubId);
      if (level < PermissionLevel.MANAGER)
        throw new TRPCError({ code: 'FORBIDDEN' });

      await db.hub.update({ where: { id: hubId }, data: { settings } });
      return { success: true as const };
    }),

  updateAutomodSettings: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        automodEnabled: z.boolean().optional(),
        defaultMuteDurationMinutes: z
          .number()
          .int()
          .min(1)
          .max(43200)
          .optional(),
        alertModsEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        hubId,
        automodEnabled,
        defaultMuteDurationMinutes,
        alertModsEnabled,
      } = input;
      const userId = ctx.session.user.id;
      const level = await getUserHubPermission(userId, hubId);
      if (level < PermissionLevel.MANAGER)
        throw new TRPCError({ code: 'FORBIDDEN' });

      const hub = await db.hub.findUnique({ where: { id: hubId } });
      if (!hub)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Hub not found' });

      const updateData: Prisma.HubUpdateInput = {};

      if (defaultMuteDurationMinutes !== undefined) {
        updateData.appealCooldownHours = Math.round(
          defaultMuteDurationMinutes / 60
        );
      }

      await db.hub.update({
        where: { id: hubId },
        data: updateData,
      });

      return { success: true as const };
    }),

  // Update or create logging configuration
  updateLogConfig: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        modLogsChannelId: z.string().nullable().optional(),
        modLogsRoleId: z.string().nullable().optional(),
        joinLeavesChannelId: z.string().nullable().optional(),
        joinLeavesRoleId: z.string().nullable().optional(),
        appealsChannelId: z.string().nullable().optional(),
        appealsRoleId: z.string().nullable().optional(),
        reportsChannelId: z.string().nullable().optional(),
        reportsRoleId: z.string().nullable().optional(),
        networkAlertsChannelId: z.string().nullable().optional(),
        networkAlertsRoleId: z.string().nullable().optional(),
        messageModerationChannelId: z.string().nullable().optional(),
        messageModerationRoleId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { hubId, ...config } = input;
      const userId = ctx.session.user.id;
      const level = await getUserHubPermission(userId, hubId);
      if (level < PermissionLevel.MANAGER)
        throw new TRPCError({ code: 'FORBIDDEN' });

      await db.hubLogConfig.upsert({
        where: { hubId },
        update: { ...config },
        create: { hubId, ...config },
      });

      return { success: true as const };
    }),

  // Anti-swear rules
  getAntiSwearRules: protectedProcedure
    .input(z.object({ hubId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { hubId } = input;
      const level = await getUserHubPermission(ctx.session.user.id, hubId);
      if (level < PermissionLevel.MODERATOR)
        throw new TRPCError({ code: 'FORBIDDEN' });

      const rules = await db.antiSwearRule.findMany({
        where: { hubId },
        orderBy: { createdAt: 'desc' },
        include: { patterns: { select: { id: true, pattern: true } } },
      });

      return rules.map((r) => ({
        id: r.id,
        name: r.name,
        enabled: r.enabled,
        muteDurationMinutes: r.muteDurationMinutes,
        actions: r.actions as BlockWordAction[],
        patterns: r.patterns.map((p) => ({ id: p.id, pattern: p.pattern })),
      }));
    }),

  createAntiSwearRule: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        name: z.string().min(3).max(64),
        actions: z.array(z.enum(BlockWordAction)).min(1),
        patterns: z
          .array(z.object({ pattern: z.string().min(1).max(64) }))
          .min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { hubId, name, actions, patterns } = input;
      const userId = ctx.session.user.id;
      const level = await getUserHubPermission(userId, hubId);
      if (level < PermissionLevel.MANAGER)
        throw new TRPCError({ code: 'FORBIDDEN' });

      const created = await db.antiSwearRule.create({
        data: {
          hubId,
          name,
          actions,
          createdBy: userId,
          patterns: {
            createMany: { data: patterns.map((p) => ({ pattern: p.pattern })) },
          },
        },
        include: { patterns: { select: { id: true, pattern: true } } },
      });

      return {
        id: created.id,
        name: created.name,
        actions: created.actions as BlockWordAction[],
        patterns: created.patterns.map((p) => ({
          id: p.id,
          pattern: p.pattern,
        })),
      };
    }),

  updateAntiSwearRule: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).max(64),
        enabled: z.boolean().optional(),
        muteDurationMinutes: z
          .number()
          .int()
          .min(0)
          .max(43200)
          .nullable()
          .optional(),
        actions: z.array(z.enum(BlockWordAction)).min(1),
        patterns: z
          .array(
            z.object({
              id: z.string().optional(),
              pattern: z.string().min(1).max(64),
            })
          )
          .min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name, enabled, muteDurationMinutes, actions, patterns } =
        input;
      const existing = await db.antiSwearRule.findUnique({
        where: { id },
        select: { hubId: true },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      const level = await getUserHubPermission(
        ctx.session.user.id,
        existing.hubId
      );
      if (level < PermissionLevel.MANAGER)
        throw new TRPCError({ code: 'FORBIDDEN' });

      await db.antiSwearRule.update({
        where: { id },
        data: {
          name,
          enabled: enabled !== undefined ? enabled : undefined,
          muteDurationMinutes:
            muteDurationMinutes !== undefined ? muteDurationMinutes : undefined,
          actions,

          patterns: {
            deleteMany: {},
            createMany: {
              data: patterns.map((p) => ({ pattern: p.pattern })),
            },
          },
        },
      });

      const updated = await db.antiSwearRule.findUnique({
        where: { id },
        include: { patterns: { select: { id: true, pattern: true } } },
      });
      if (!updated) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      return {
        id: updated.id,
        name: updated.name,
        enabled: updated.enabled,
        muteDurationMinutes: updated.muteDurationMinutes,
        actions: updated.actions as BlockWordAction[],
        patterns: updated.patterns.map((p) => ({
          id: p.id,
          pattern: p.pattern,
        })),
      };
    }),

  deleteAntiSwearRule: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const existing = await db.antiSwearRule.findUnique({
        where: { id },
        select: { hubId: true },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      const level = await getUserHubPermission(
        ctx.session.user.id,
        existing.hubId
      );
      if (level < PermissionLevel.MANAGER)
        throw new TRPCError({ code: 'FORBIDDEN' });

      await db.antiSwearRule.delete({ where: { id } });
      return { success: true as const };
    }),

  getAntiSwearWhitelist: protectedProcedure
    .input(z.object({ ruleId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { ruleId } = input;
      // Verify user has access to this rule
      const rule = await db.antiSwearRule.findUnique({
        where: { id: ruleId },
        select: { hubId: true },
      });
      if (!rule) throw new TRPCError({ code: 'NOT_FOUND' });

      const level = await getUserHubPermission(ctx.session.user.id, rule.hubId);
      if (level < PermissionLevel.MODERATOR)
        throw new TRPCError({ code: 'FORBIDDEN' });

      const whitelist = await db.antiSwearWhitelist.findMany({
        where: { ruleId },
        orderBy: { createdAt: 'desc' },
        include: {
          User: {
            select: { id: true, name: true },
          },
        },
      });

      return whitelist.map((item) => ({
        id: item.id,
        word: item.word,
        reason: item.reason,
        createdAt: item.createdAt,
        createdBy: {
          id: item.User.id,
          name: item.User.name,
        },
      }));
    }),

  addAntiSwearWhitelist: protectedProcedure
    .input(
      z.object({
        ruleId: z.string(),
        word: z.string().min(1).max(64),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { ruleId, word, reason } = input;
      const userId = ctx.session.user.id;

      // Verify user has access to this rule
      const rule = await db.antiSwearRule.findUnique({
        where: { id: ruleId },
        select: { hubId: true },
      });
      if (!rule) throw new TRPCError({ code: 'NOT_FOUND' });

      const level = await getUserHubPermission(userId, rule.hubId);
      if (level < PermissionLevel.MANAGER)
        throw new TRPCError({ code: 'FORBIDDEN' });

      const created = await db.antiSwearWhitelist.create({
        data: {
          id: `${ruleId}-${word}`.toLowerCase(),
          ruleId,
          word: word.toLowerCase(),
          reason,
          createdBy: userId,
        },
        include: {
          User: {
            select: { id: true, name: true },
          },
        },
      });

      return {
        id: created.id,
        word: created.word,
        reason: created.reason,
        createdAt: created.createdAt,
        createdBy: {
          id: created.User.id,
          name: created.User.name,
        },
      };
    }),

  deleteAntiSwearWhitelist: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      // Verify user has access to this whitelist item
      const whitelistItem = await db.antiSwearWhitelist.findUnique({
        where: { id },
        include: {
          AntiSwearRule: {
            select: { hubId: true },
          },
        },
      });
      if (!whitelistItem) throw new TRPCError({ code: 'NOT_FOUND' });

      const level = await getUserHubPermission(
        ctx.session.user.id,
        whitelistItem.AntiSwearRule.hubId
      );
      if (level < PermissionLevel.MANAGER)
        throw new TRPCError({ code: 'FORBIDDEN' });

      await db.antiSwearWhitelist.delete({ where: { id } });
      return { success: true as const };
    }),

  // Delete hub (owner only)
  deleteHub: protectedProcedure
    .input(z.object({ hubId: z.string(), confirmName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { hubId, confirmName } = input;
      const userId = ctx.session.user.id;

      const hub = await db.hub.findUnique({ where: { id: hubId } });
      if (!hub) throw new TRPCError({ code: 'NOT_FOUND' });

      const level = await getUserHubPermission(userId, hubId);
      if (level < PermissionLevel.OWNER)
        throw new TRPCError({ code: 'FORBIDDEN' });

      if (hub.name !== confirmName)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Confirmation name does not match',
        });

      await db.$transaction(async (tx) => {
        await tx.appeal.deleteMany({
          where: {
            infraction: {
              hubId: hubId,
            },
          },
        });

        await tx.infraction.deleteMany({
          where: { hubId: hubId },
        });

        await tx.antiSwearPattern.deleteMany({
          where: { rule: { hubId: hubId } },
        });

        await tx.antiSwearWhitelist.deleteMany({
          where: {
            AntiSwearRule: {
              hubId: hubId,
            },
          },
        });

        await tx.hubMessageReaction.deleteMany({
          where: { Message: { hubId: hubId } },
        });

        await tx.globalReport.updateMany({
          where: { Message: { hubId: hubId } },
          data: { messageId: null },
        });

        await tx.broadcast.deleteMany({ where: { message: { hubId: hubId } } });

        await tx.hub.delete({ where: { id: hubId } });
      });

      return { success: true as const };
    }),
  // Get a list of hubs with pagination and filtering
  getHubs: publicProcedure.input(hubSearchSchema).query(async ({ input }) => {
    const { search, tags, skip, sort } = input;

    // Build the where clause for filtering
    const whereClause = buildWhereClause({
      search: search || undefined,
      tags: tags || undefined,
    });

    // Get sorted hubs with pagination
    const { hubs, totalCount } = await getSortedHubs(whereClause, skip, sort);

    return {
      hubs,
      pagination: {
        totalItems: totalCount,
        hasMore: skip + hubs.length < totalCount,
      },
    };
  }),

  // Search for hubs by term
  searchHubs: publicProcedure
    .input(z.object({ term: z.string().min(1) }))
    .query(async ({ input }) => {
      const { term } = input;

      if (!term) {
        return { hubs: [] };
      }

      const hubs = await db.hub.findMany({
        where: {
          visibility: HubVisibility.PUBLIC,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { shortDescription: { contains: term, mode: 'insensitive' } },
            { tags: { some: { name: term } } },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          shortDescription: true,
          iconUrl: true,
          bannerUrl: true,
          visibility: true,
          locked: true,
          nsfw: true,
          verified: true,
          partnered: true,
          language: true,
          region: true,
          createdAt: true,
          lastActive: true,
          connections: {
            where: { connected: true },
            orderBy: { lastActive: 'desc' },
            select: {
              id: true,
              serverId: true,
              connected: true,
              createdAt: true,
              lastActive: true,
              server: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          upvotes: {
            select: {
              id: true,
              userId: true,
              createdAt: true,
            },
          },
          moderators: {
            select: {
              id: true,
              userId: true,
              role: true,

              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              connections: { where: { connected: true } },
              upvotes: true,
              reviews: true,
            },
          },
        },
        take: 12,
      });

      return { hubs };
    }),

  // Get hub reviews
  getHubReviews: publicProcedure
    .input(z.object({ hubId: z.string() }))
    .query(async ({ input }) => {
      const { hubId } = input;

      // Check if the hub exists
      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: { id: true },
      });

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      const reviews = await db.hubReview.findMany({
        where: { hubId },
        select: {
          id: true,
          rating: true,
          text: true,
          createdAt: true,
          updatedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reviews;
    }),

  // Create a hub review
  createHubReview: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        rating: z.number().min(1).max(5),
        text: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { hubId, rating, text } = input;
      const userId = ctx.session.user.id;

      // Check if the hub exists
      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: { id: true },
      });

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      // Check if the user has already reviewed this hub
      const existingReview = await db.hubReview.findUnique({
        where: {
          hubId_userId: {
            hubId,
            userId,
          },
        },
      });

      if (existingReview) {
        const updatedReview = await db.hubReview.update({
          where: {
            hubId_userId: {
              hubId,
              userId,
            },
          },
          data: {
            rating,
            text,
          },
          select: {
            id: true,
            rating: true,
            text: true,
            createdAt: true,
            updatedAt: true,

            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });

        await updateHubAverageRating(hubId);
        return updatedReview;
      }
      const newReview = await db.hubReview.create({
        data: {
          hubId,
          userId,
          rating,
          text,
        },
        select: {
          id: true,
          rating: true,
          text: true,
          createdAt: true,
          updatedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      await updateHubAverageRating(hubId);
      return newReview;
    }),

  // Delete a hub review (only by the author)
  deleteHubReview: protectedProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const review = await db.hubReview.findUnique({
        where: { id: input.reviewId },
        select: { id: true, userId: true, hubId: true },
      });

      if (!review) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Review not found' });
      }

      if (review.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
      }

      await db.hubReview.delete({ where: { id: input.reviewId } });
      await updateHubAverageRating(review.hubId);
      return { success: true } as const;
    }),

  // Get a single hub by ID
  getHub: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const hub = await db.hub.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          description: true,
          shortDescription: true,
          ownerId: true,
          iconUrl: true,
          bannerUrl: true,
          visibility: true,
          locked: true,
          nsfw: true,
          verified: true,
          partnered: true,
          language: true,
          region: true,
          createdAt: true,
          lastActive: true,
          rules: true,
          tags: { select: { name: true } },
          connections: {
            where: { connected: true },
            orderBy: { lastActive: 'desc' },
            select: {
              id: true,
              serverId: true,
              connected: true,
              createdAt: true,
              lastActive: true,
              server: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          upvotes: {
            select: {
              id: true,
              userId: true,
              createdAt: true,
            },
          },
          moderators: {
            select: {
              id: true,
              userId: true,
              role: true,

              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              connections: { where: { connected: true } },
              upvotes: true,
              reviews: true,
            },
          },
        },
      });

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      return hub;
    }),

  // Create a new hub
  createHub: protectedProcedure
    .input(createHubSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        description,
        shortDescription,
        visibility,
        rules,
      } = input;

      // Check if the hub name is already taken (case insensitive)
      const existingHub = await db.hub.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
        },
      });

      if (existingHub) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Hub name already taken',
        });
      }

      // Create the hub
      const hub = await db.hub.create({
        data: {
          name,
          description,
          shortDescription,
          ownerId: ctx.session.user.id,
          iconUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}`,
          visibility,
          settings: 0,
          rules: rules || [],
        },
        select: {
          id: true,
          name: true,
          description: true,
          shortDescription: true,
          ownerId: true,
          iconUrl: true,
          bannerUrl: true,
          visibility: true,
          locked: true,
          settings: true,
          createdAt: true,
          updatedAt: true,
          rules: true,

          moderators: {
            select: {
              id: true,
              userId: true,
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return hub;
    }),

  // Upvote a hub
  upvoteHub: protectedProcedure
    .input(z.object({ hubId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { hubId } = input;
      const userId = ctx.session.user.id;

      // Check if the hub exists
      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: { id: true },
      });

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      // Check if the user has already upvoted this hub
      const existingUpvote = await db.hubUpvote.findUnique({
        where: {
          hubId_userId: {
            hubId,
            userId,
          },
        },
      });

      if (existingUpvote) {
        // Remove the upvote
        await db.hubUpvote.delete({
          where: {
            hubId_userId: {
              hubId,
              userId,
            },
          },
        });

        return { upvoted: false };
      }
      // Add the upvote
      await db.hubUpvote.create({
        data: {
          hubId,
          userId,
        },
      });

      return { upvoted: true };
    }),

  // Get hub members (owner and moderators)
  getMembers: protectedProcedure
    .input(z.object({ hubId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { hubId } = input;
      const userId = ctx.session.user.id;

      const level = await getUserHubPermission(userId, hubId);
      if (level < PermissionLevel.MODERATOR) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        });
      }

      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: {
          ownerId: true,
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          moderators: {
            select: {
              id: true,
              userId: true,
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (!hub) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Hub not found' });
      }

      return {
        owner: hub.owner,
        moderators: hub.moderators,
      };
    }),

  // Add a member to the hub
  addMember: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        userId: z.string(),
        role: z.enum(['MODERATOR', 'MANAGER']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { hubId, userId: targetUserId, role } = input;
      const userId = ctx.session.user.id;

      const level = await getUserHubPermission(userId, hubId);
      if (level < PermissionLevel.MANAGER) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        });
      }

      // Check if hub exists
      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: { id: true, ownerId: true },
      });

      if (!hub) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Hub not found' });
      }

      // Check if target user exists
      const targetUser = await db.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true, image: true },
      });

      if (!targetUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      // Check if user is already owner
      if (hub.ownerId === targetUserId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is already the hub owner',
        });
      }

      // Check if user is already a moderator
      const existingModerator = await db.hubModerator.findUnique({
        where: {
          hubId_userId: {
            hubId,
            userId: targetUserId,
          },
        },
      });

      if (existingModerator) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is already a moderator',
        });
      }

      // Create the moderator
      const moderator = await db.hubModerator.create({
        data: {
          hubId,
          userId: targetUserId,
          role,
        },
        select: {
          id: true,
          userId: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return { moderator };
    }),

  // Update a member's role
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        memberId: z.string(),
        role: z.enum(['MODERATOR', 'MANAGER']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { hubId, memberId, role } = input;
      const userId = ctx.session.user.id;

      const level = await getUserHubPermission(userId, hubId);
      if (level < PermissionLevel.MANAGER) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        });
      }

      // Check if the member exists
      const member = await db.hubModerator.findUnique({
        where: { id: memberId },
        select: {
          id: true,
          hubId: true,
          userId: true,
          role: true,
        },
      });

      if (!member || member.hubId !== hubId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
      }

      // Update the member's role
      const updatedMember = await db.hubModerator.update({
        where: { id: memberId },
        data: { role },
        select: {
          id: true,
          userId: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return { moderator: updatedMember };
    }),

  // Remove a member from the hub
  removeMember: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        memberId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { hubId, memberId } = input;
      const userId = ctx.session.user.id;

      const level = await getUserHubPermission(userId, hubId);
      if (level < PermissionLevel.MANAGER) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        });
      }

      // Check if the member exists
      const member = await db.hubModerator.findUnique({
        where: { id: memberId },
        select: {
          id: true,
          hubId: true,
          userId: true,
        },
      });

      if (!member || member.hubId !== hubId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
      }

      // Remove the member
      await db.hubModerator.delete({
        where: { id: memberId },
      });

      return { success: true };
    }),

  // Get hub recommendations
  getRecommendations: publicProcedure
    .input(
      z.object({
        type: z
          .enum(['personalized', 'trending', 'activity', 'similar', 'friends'])
          .default('personalized'),
        limit: z.number().min(1).max(50).default(8),
        currentHubId: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { type, limit, currentHubId, tags } = input;
      const userId = ctx.session?.user?.id;

      const cacheKey = `hub:recommendations:${type}:${limit}:${currentHubId || 'none'}:${(tags || []).sort().join(',')}:${userId || 'anon'}`;

      try {
        const redis = await getRedisClient();
        if (redis) {
          const cached = await redis.get(cacheKey);
          if (cached) {
            console.log(`Cache hit for recommendations: ${cacheKey}`);
            return JSON.parse(cached);
          }
        }
      } catch (error) {
        console.error('Redis cache read error for recommendations:', error);
      }

      const baseWhere = {
        visibility: HubVisibility.PUBLIC,
        locked: false,
        connections: {
          some: { connected: true },
        },
        // Exclude current hub if specified
        ...(currentHubId && { id: { not: currentHubId } }),
      };

      // biome-ignore lint/suspicious/noImplicitAnyLet: Fookin complex Prisma query type
      let hubs;
      // biome-ignore lint/suspicious/noImplicitAnyLet: Dynamic metadata object
      let metadata;

      switch (type) {
        case 'similar': {
          // Find hubs with similar tags
          if (tags && tags.length > 0) {
            hubs = await db.hub.findMany({
              where: {
                ...baseWhere,
                tags: {
                  some: {
                    name: { in: tags },
                  },
                },
              },
              select: {
                id: true,
                name: true,
                description: true,
                shortDescription: true,
                iconUrl: true,
                bannerUrl: true,
                nsfw: true,
                verified: true,
                partnered: true,
                activityLevel: true,
                createdAt: true,
                lastActive: true,
                tags: { select: { name: true } },
                _count: {
                  select: {
                    connections: { where: { connected: true } },
                    upvotes: true,
                    reviews: true,
                  },
                },
              },
              orderBy: [
                // Prioritize hubs with more matching tags
                { connections: { _count: 'desc' } },
                { upvotes: { _count: 'desc' } },
                { lastActive: 'desc' },
              ],
              take: limit * 2, // Get more to filter by tag similarity
            });

            // clculate tag similarity and sort by it
            hubs = hubs
              .map((hub) => ({
                ...hub,
                tagSimilarity: hub.tags.filter((tag) => tags.includes(tag.name))
                  .length,
              }))
              .sort((a, b) => b.tagSimilarity - a.tagSimilarity)
              .slice(0, limit);
          } else {
            // general recommendations if no tags provided
            hubs = await db.hub.findMany({
              where: baseWhere,
              select: {
                id: true,
                name: true,
                description: true,
                shortDescription: true,
                iconUrl: true,
                bannerUrl: true,
                nsfw: true,
                verified: true,
                partnered: true,
                activityLevel: true,
                createdAt: true,
                lastActive: true,
                tags: { select: { name: true } },
                _count: {
                  select: {
                    connections: { where: { connected: true } },
                    upvotes: true,
                    reviews: true,
                  },
                },
              },
              orderBy: [
                { connections: { _count: 'desc' } },
                { upvotes: { _count: 'desc' } },
              ],
              take: limit,
            });
          }

          metadata = {
            type: 'similar',
            count: hubs.length,
            generatedAt: new Date().toISOString(),
            userContext: { authenticated: !!userId, userId },
          };
          break;
        }

        case 'trending': {
          // Get hubs with most upvotes in the last 7 days
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          hubs = await db.hub.findMany({
            where: {
              ...baseWhere,
              upvotes: {
                some: {
                  createdAt: { gte: sevenDaysAgo },
                },
              },
            },
            select: {
              id: true,
              name: true,
              description: true,
              shortDescription: true,
              iconUrl: true,
              bannerUrl: true,
              nsfw: true,
              verified: true,
              partnered: true,
              activityLevel: true,
              createdAt: true,
              lastActive: true,
              tags: { select: { name: true } },
              _count: {
                select: {
                  connections: { where: { connected: true } },
                  upvotes: true,
                  reviews: true,
                },
              },
              upvotes: {
                where: { createdAt: { gte: sevenDaysAgo } },
                select: { id: true, createdAt: true },
              },
            },
            orderBy: [{ upvotes: { _count: 'desc' } }, { lastActive: 'desc' }],
            take: limit,
          });
          metadata = {
            type: 'trending',
            count: hubs.length,
            generatedAt: new Date().toISOString(),
            userContext: { authenticated: !!userId, userId },
          };
          break;
        }

        case 'activity':
          // Get most recently active hubs
          hubs = await db.hub.findMany({
            where: baseWhere,
            select: {
              id: true,
              name: true,
              description: true,
              shortDescription: true,
              iconUrl: true,
              bannerUrl: true,
              nsfw: true,
              verified: true,
              partnered: true,
              activityLevel: true,
              createdAt: true,
              lastActive: true,
              tags: { select: { name: true } },
              _count: {
                select: {
                  connections: { where: { connected: true } },
                  upvotes: true,
                  reviews: true,
                },
              },
            },
            orderBy: { lastActive: 'desc' },
            take: limit,
          });
          metadata = {
            type: 'activity',
            count: hubs.length,
            generatedAt: new Date().toISOString(),
            userContext: { authenticated: !!userId, userId },
          };
          break;
        default:
          // For now, fallback to general recommendations (most connections + upvotes)
          hubs = await db.hub.findMany({
            where: baseWhere,
            select: {
              id: true,
              name: true,
              description: true,
              shortDescription: true,
              iconUrl: true,
              bannerUrl: true,
              nsfw: true,
              verified: true,
              partnered: true,
              activityLevel: true,
              createdAt: true,
              lastActive: true,
              tags: { select: { name: true } },
              _count: {
                select: {
                  connections: { where: { connected: true } },
                  upvotes: true,
                  reviews: true,
                },
              },
            },
            orderBy: [
              { connections: { _count: 'desc' } },
              { upvotes: { _count: 'desc' } },
              { lastActive: 'desc' },
            ],
            take: limit,
          });
          metadata = {
            type,
            count: hubs.length,
            generatedAt: new Date().toISOString(),
            userContext: { authenticated: !!userId, userId },
          };
          break;
      }

      // Transform to recommendation format with enhanced metrics
      const recommendations = hubs.map((hub) => {
        const connectionCount = hub._count.connections;
        const upvoteCount = hub._count.upvotes;
        const reviewCount = hub._count.reviews;

        // Calculate engagement metrics
        const isHighActivity = hub.activityLevel === 'HIGH';
        const isGrowing = type === 'trending' && upvoteCount > 0;
        const isQuality = reviewCount > 0 || upvoteCount > 5;
        const isTrusted = hub.verified || hub.partnered;

        // Calculate recommendation score
        let score = 0;
        score += connectionCount * 10; // Base score from connections
        score += upvoteCount * 5; // Upvotes boost
        score += reviewCount * 3; // Review boost
        if (isHighActivity) score += 20;
        if (isGrowing) score += 15;
        if (isQuality) score += 10;
        if (isTrusted) score += 25;

        if (type === 'similar' && tags && 'tagSimilarity' in hub) {
          score += (hub.tagSimilarity as number) * 30;
        }

        let reason = 'Popular community';
        if (type === 'similar') {
          const matchingTags = hub.tags.filter((tag) =>
            tags?.includes(tag.name)
          ).length;
          reason =
            matchingTags > 1
              ? `${matchingTags} shared interests`
              : 'Similar community';
        } else if (isTrusted) {
          reason = 'Verified community';
        } else if (isGrowing) {
          reason = 'Trending community';
        } else if (isHighActivity) {
          reason = 'Very active community';
        } else if (connectionCount > 10) {
          reason = 'Large community';
        }

        return {
          hubId: hub.id,
          hub: {
            ...hub,
            activityLevel: hub.activityLevel,
            connectionCount,
            recentMessageCount: 0, // TODO: Would need message tracking
            upvoteCount,
          },
          score,
          reason,
          engagementMetrics: {
            isHighActivity,
            isGrowing,
            isQuality,
            isTrusted,
          },
        };
      });

      const result = {
        recommendations,
        metadata,
      };

      try {
        const redis = await getRedisClient();
        if (redis) {
          const cacheTime = type === 'similar' ? 3600 : 300; // 1 hour for similar, 5 minutes for others
          await redis.set(cacheKey, JSON.stringify(result), 'EX', cacheTime);
          console.log(`Cached recommendations: ${cacheKey} for ${cacheTime}s`);
        }
      } catch (error) {
        console.error('Redis cache write error for recommendations:', error);
      }

      return result;
    }),

  validateName: publicProcedure
    .input(z.object({ name: z.string().min(3).max(32) }))
    .query(async ({ input }) => {
      const { name } = input;

      const existingHub = await db.hub.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        select: { id: true },
      });

      return {
        available: !existingHub,
        name,
      };
    }),
});
