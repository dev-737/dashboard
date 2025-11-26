import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import { PermissionLevel } from '@/lib/constants';
import {
  BlockWordAction,
  type Prisma,
} from '@/lib/generated/prisma/client/client';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { protectedProcedure, router } from '../../trpc';

export const settingsRouter = router({
  // Update basic hub info
  updateHub: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        name: z.string().min(3).max(32).optional(),
        description: z.string().min(10).max(500).optional(),
        private: z.boolean().optional(),
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
        private: isPrivate,
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
          ...(isPrivate !== undefined && { private: isPrivate }),
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
      const { hubId, defaultMuteDurationMinutes } = input;
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
});
