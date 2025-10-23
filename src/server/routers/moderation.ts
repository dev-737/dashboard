/**
 * Moderation router for tRPC
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import { PermissionLevel } from '@/lib/constants';
import {
  InfractionStatus,
  InfractionType,
  type Prisma,
  ReportStatus,
} from '@/lib/generated/prisma/client';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { protectedProcedure, router } from '../trpc';

const createInfractionSchema = z
  .object({
    hubId: z.string(),
    type: z.enum(InfractionType),
    reason: z.string().min(3).max(500),
    expiresAt: z.string().optional().nullable(),
    userId: z.string().optional(),
    serverId: z.string().optional(),
    serverName: z.string().optional(),
  })
  .refine((d) => !!d.userId || (!!d.serverId && !!d.serverName), {
    message: 'Either userId or serverId with serverName must be provided',
    path: ['userId'],
  });

const getInfractionsSchema = z.object({
  hubId: z.string().optional(),
  type: z.enum(InfractionType).optional(),
  status: z.enum(InfractionStatus).optional(),
  targetType: z.enum(['user', 'server']).optional(),
  userId: z.string().optional(),
  serverId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

const getReportsSchema = z.object({
  hubId: z.string().optional(),
  status: z.enum(ReportStatus).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// Schema for updating report status
const updateReportStatusSchema = z.object({
  reportId: z.string(),
  status: z.enum(ReportStatus),
  resolution: z.string().optional(),
});

export const moderationRouter = router({
  getInfractions: protectedProcedure
    .input(getInfractionsSchema)
    .query(async ({ input, ctx }) => {
      const { hubId, type, status, targetType, userId, serverId, page, limit } =
        input;
      const skip = (page - 1) * limit;

      let effectiveHubIds: string[] | undefined;
      if (!hubId) {
        const moderatorHubs = await db.hub.findMany({
          where: {
            OR: [
              { ownerId: ctx.session.user.id },
              { moderators: { some: { userId: ctx.session.user.id } } },
            ],
          },
          select: { id: true },
        });
        effectiveHubIds = moderatorHubs.map((h) => h.id);
        if (effectiveHubIds.length === 0) {
          return { infractions: [], total: 0, page, limit, totalPages: 0 };
        }
      } else {
        const level = await getUserHubPermission(ctx.session.user.id, hubId);
        if (level < PermissionLevel.MODERATOR) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
      }

      const whereClause: Prisma.InfractionWhereInput = {
        ...(hubId ? { hubId } : { hubId: { in: effectiveHubIds } }),
      };
      if (type) whereClause.type = type;
      if (status) whereClause.status = status;
      if (targetType === 'user') whereClause.userId = { not: null };
      if (targetType === 'server') whereClause.serverId = { not: null };
      if (userId) whereClause.userId = userId;
      if (serverId) whereClause.serverId = serverId;

      const total = await db.infraction.count({ where: whereClause });
      const infractions = await db.infraction.findMany({
        where: whereClause,
        include: {
          hub: { select: { id: true, name: true, iconUrl: true } },
          moderator: { select: { id: true, name: true, image: true } },
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      return {
        infractions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  createInfraction: protectedProcedure
    .input(createInfractionSchema)
    .mutation(async ({ input, ctx }) => {
      const { hubId, type, reason, expiresAt, userId, serverId, serverName } =
        input;
      const moderatorId = ctx.session.user.id;

      const level = await getUserHubPermission(moderatorId, hubId);
      if (level < PermissionLevel.MODERATOR) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const infraction = await db.infraction.create({
        data: {
          hubId,
          type,
          reason,
          moderatorId,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          userId: userId ?? null,
          serverId: serverId ?? null,
          serverName: serverName ?? null,
          status: InfractionStatus.ACTIVE,
        },
        include: {
          hub: { select: { id: true, name: true, iconUrl: true } },
          moderator: { select: { id: true, name: true, image: true } },
          user: { select: { id: true, name: true, image: true } },
        },
      });

      return { infraction };
    }),

  addToBlacklist: protectedProcedure
    .input(
      z.object({
        type: z.enum(['user', 'server']),
        id: z.string(),
        reason: z.string().min(1).max(1000),
        hubId: z.string(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { type, id, reason, hubId, duration } = input;
      const moderatorId = ctx.session.user.id;

      // Validate the ID format
      if (!/^\d+$/.test(id)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid Discord ${type} ID format`,
        });
      }

      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: {
          id: true,
          ownerId: true,
          moderators: {
            where: { userId: moderatorId },
            select: { role: true },
          },
        },
      });

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      const isOwner = hub.ownerId === moderatorId;
      const isModerator = hub.moderators.length > 0;

      if (!isOwner && !isModerator) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to add to blacklist',
        });
      }

      // Check if already blacklisted
      const existingInfraction = await db.infraction.findFirst({
        where: {
          hubId,
          type: InfractionType.BLACKLIST,
          status: InfractionStatus.ACTIVE,
          ...(type === 'user' ? { userId: id } : { serverId: id }),
        },
      });

      if (existingInfraction) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `This ${type} is already blacklisted`,
        });
      }

      // Create the infraction for blacklisting
      const infraction = await db.infraction.create({
        data: {
          hubId,
          moderatorId,
          type: InfractionType.BLACKLIST,
          status: InfractionStatus.ACTIVE,
          reason,
          expiresAt: duration ? new Date(Date.now() + duration * 1000) : null,
          ...(type === 'user'
            ? { userId: id }
            : { serverId: id, serverName: id }),
        },
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              iconUrl: true,
            },
          },
          moderator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          user:
            type === 'user'
              ? {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                }
              : undefined,
        },
      });

      return { infraction };
    }),

  // Remove from blacklist (revoke infraction)
  removeFromBlacklist: protectedProcedure
    .input(
      z.object({
        infractionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { infractionId } = input;
      const moderatorId = ctx.session.user.id;

      // Get the infraction
      const infraction = await db.infraction.findUnique({
        where: { id: infractionId },
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              ownerId: true,
              moderators: {
                where: { userId: moderatorId },
                select: { role: true },
              },
            },
          },
        },
      });

      if (!infraction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Infraction not found',
        });
      }

      // Check if it's a blacklist infraction
      if (infraction.type !== InfractionType.BLACKLIST) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This is not a blacklist infraction',
        });
      }

      // Check if the user has permission to remove from blacklist
      const isOwner = infraction.hub.ownerId === moderatorId;
      const isModerator = infraction.hub.moderators.length > 0;

      if (!isOwner && !isModerator) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to remove from blacklist',
        });
      }

      // Update the infraction status to revoked
      const updatedInfraction = await db.infraction.update({
        where: { id: infractionId },
        data: {
          status: InfractionStatus.REVOKED,
        },
      });

      return { success: true, infraction: updatedInfraction };
    }),

  // Get blacklist (infractions of type BLACKLIST)
  getBlacklist: protectedProcedure
    .input(
      z.object({
        hubId: z.string().optional(),
        page: z.number().optional().prefault(1),
        limit: z.number().optional().prefault(10),
      })
    )
    .query(async ({ input }) => {
      const { hubId, page, limit } = input;
      const skip = (page - 1) * limit;

      // Build the where clause
      const whereClause: Record<string, unknown> = {
        type: InfractionType.BLACKLIST,
        status: InfractionStatus.ACTIVE,
      };

      if (hubId) {
        whereClause.hubId = hubId;
      }

      // Count total blacklist entries
      const total = await db.infraction.count({
        where: whereClause,
      });

      // Get blacklist entries
      const blacklistInfractions = await db.infraction.findMany({
        where: whereClause,
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              iconUrl: true,
            },
          },
          moderator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      });

      return {
        blacklist: blacklistInfractions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get reports with pagination and filtering
  getReports: protectedProcedure
    .input(getReportsSchema)
    .query(async ({ input, ctx }) => {
      const { hubId, status, page, limit } = input;
      const skip = (page - 1) * limit;
      const userId = ctx.session.user.id;

      // Build the where clause
      const whereClause: Prisma.HubReportWhereInput = {};

      if (status) {
        whereClause.status = status;
      }

      if (hubId) {
        whereClause.hubId = hubId;
      } else {
        // If no specific hub, only show reports from hubs the user can moderate
        whereClause.hub = {
          OR: [{ ownerId: userId }, { moderators: { some: { userId } } }],
        };
      }

      // Count total reports
      const total = await db.hubReport.count({
        where: whereClause,
      });

      // Get reports with related data
      const reports = await db.hubReport.findMany({
        where: whereClause,
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              iconUrl: true,
            },
          },
          reporter: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          reportedUser: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          handler: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      });

      // Fetch message data and server information for each report
      const reportsWithEnhancedData = await Promise.all(
        reports.map(async (report) => {
          let messageData = null;
          let serverData = null;

          // Fetch message data if messageId exists
          if (report.messageId) {
            try {
              messageData = await db.message.findUnique({
                where: { id: report.messageId },
                select: {
                  id: true,
                  content: true,
                  imageUrl: true,
                  channelId: true,
                  guildId: true,
                  authorId: true,
                  createdAt: true,
                  reactions: true,
                  referredMessageId: true,
                },
              });
            } catch (error) {
              console.error(
                `Failed to fetch message ${report.messageId}:`,
                error
              );
            }
          }

          // Fetch server data from ServerData model
          if (report.reportedServerId) {
            try {
              serverData = await db.serverData.findUnique({
                where: { id: report.reportedServerId },
                select: {
                  id: true,
                  name: true,
                  iconUrl: true,
                  inviteCode: true,
                },
              });
            } catch (error) {
              console.error(
                `Failed to fetch server ${report.reportedServerId}:`,
                error
              );
            }
          }

          return {
            ...report,
            messageData,
            serverData,
          };
        })
      );

      return {
        reports: reportsWithEnhancedData,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Update report status
  updateReportStatus: protectedProcedure
    .input(updateReportStatusSchema)
    .mutation(async ({ input, ctx }) => {
      const { reportId, status, resolution } = input;
      const userId = ctx.session.user.id;

      // Get the report with hub information
      const report = await db.hubReport.findUnique({
        where: { id: reportId },
        include: {
          hub: {
            select: {
              id: true,
              ownerId: true,
              moderators: {
                where: { userId },
                select: { role: true },
              },
            },
          },
        },
      });

      if (!report) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Report not found',
        });
      }

      // Check if the user has permission to update this report
      const isOwner = report.hub.ownerId === userId;
      const isModerator = report.hub.moderators.length > 0;

      if (!isOwner && !isModerator) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this report',
        });
      }

      // Update the report
      const updatedReport = await db.hubReport.update({
        where: { id: reportId },
        data: {
          status,
          handler: { connect: { id: userId } },
          handledAt: new Date(),
          ...(resolution ? { resolution } : {}),
        },
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              iconUrl: true,
            },
          },
          reporter: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          reportedUser: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          handler: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return { success: true, report: updatedReport };
    }),

  // Create infraction from report (warn, blacklist user/server)
  createInfractionFromReport: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        type: z.enum(InfractionType),
        reason: z.string().min(1).max(1000),
        duration: z.number().optional(), // Duration in seconds
        targetType: z.enum(['user', 'server']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { reportId, type, reason, duration, targetType } = input;
      const moderatorId = ctx.session.user.id;

      // Get the report with hub information
      const report = await db.hubReport.findUnique({
        where: { id: reportId },
        include: {
          hub: {
            select: {
              id: true,
              ownerId: true,
              moderators: {
                where: { userId: moderatorId },
                select: { role: true },
              },
            },
          },
        },
      });

      if (!report) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Report not found',
        });
      }

      // Check if the user has permission to create infractions
      const isOwner = report.hub.ownerId === moderatorId;
      const isModerator = report.hub.moderators.length > 0;

      if (!isOwner && !isModerator) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create infractions',
        });
      }

      // Determine the target based on targetType
      const targetId =
        targetType === 'user' ? report.reportedUserId : report.reportedServerId;

      if (!targetId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `No ${targetType} ID found in report`,
        });
      }

      // Check if already has an active infraction of this type
      if (type === InfractionType.BLACKLIST) {
        const existingInfraction = await db.infraction.findFirst({
          where: {
            hubId: report.hubId,
            type: InfractionType.BLACKLIST,
            status: InfractionStatus.ACTIVE,
            ...(targetType === 'user'
              ? { userId: targetId }
              : { serverId: targetId }),
          },
        });

        if (existingInfraction) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `This ${targetType} is already blacklisted`,
          });
        }
      }

      // Create the infraction
      const infraction = await db.infraction.create({
        data: {
          hubId: report.hubId,
          moderatorId,
          type,
          status: InfractionStatus.ACTIVE,
          reason,
          expiresAt: duration ? new Date(Date.now() + duration * 1000) : null,
          ...(targetType === 'user'
            ? { userId: targetId }
            : { serverId: targetId, serverName: targetId }),
        },
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              iconUrl: true,
            },
          },
          moderator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          user:
            targetType === 'user'
              ? {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                }
              : undefined,
        },
      });

      // Update the report status to resolved with infraction details
      await db.hubReport.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.RESOLVED,
          handledBy: moderatorId,
          handledAt: new Date(),
        },
      });

      return { success: true, infraction };
    }),

  // Get a specific infraction by ID
  getInfractionById: protectedProcedure
    .input(z.object({ infractionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { infractionId } = input;
      const infraction = await db.infraction.findUnique({
        where: { id: infractionId },
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              iconUrl: true,
              ownerId: true,
              moderators: {
                where: { userId: ctx.session.user.id },
                select: { userId: true },
              },
            },
          },
          moderator: { select: { id: true, name: true, image: true } },
          user: { select: { id: true, name: true, image: true } },
          _count: { select: { appeals: true } },
        },
      });
      if (!infraction) throw new TRPCError({ code: 'NOT_FOUND' });
      const canView =
        infraction.hub.ownerId === ctx.session.user.id ||
        infraction.hub.moderators.length > 0;
      if (!canView) throw new TRPCError({ code: 'FORBIDDEN' });
      return { infraction };
    }),

  // Update an infraction
  updateInfraction: protectedProcedure
    .input(
      z.object({
        infractionId: z.string(),
        status: z.enum(InfractionStatus).optional(),
        reason: z.string().min(3).max(500).optional(),
        expiresAt: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { infractionId, status, reason, expiresAt } = input;
      const existing = await db.infraction.findUnique({
        where: { id: infractionId },
        select: { hubId: true },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      const level = await getUserHubPermission(
        ctx.session.user.id,
        existing.hubId
      );
      if (level < PermissionLevel.MODERATOR)
        throw new TRPCError({ code: 'FORBIDDEN' });

      const updated = await db.infraction.update({
        where: { id: infractionId },
        data: {
          ...(status ? { status } : {}),
          ...(reason ? { reason } : {}),
          ...(expiresAt !== undefined
            ? { expiresAt: expiresAt ? new Date(expiresAt) : null }
            : {}),
          ...(status === InfractionStatus.APPEALED
            ? { appealedAt: new Date(), appealedBy: ctx.session.user.id }
            : {}),
        },
        include: {
          hub: { select: { id: true, name: true, iconUrl: true } },
          moderator: { select: { id: true, name: true, image: true } },
          user: { select: { id: true, name: true, image: true } },
          _count: { select: { appeals: true } },
        },
      });
      return { infraction: updated };
    }),

  // Delete an infraction
  deleteInfraction: protectedProcedure
    .input(z.object({ infractionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { infractionId } = input;
      const existing = await db.infraction.findUnique({
        where: { id: infractionId },
        select: { hubId: true },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      const level = await getUserHubPermission(
        ctx.session.user.id,
        existing.hubId
      );
      if (level < PermissionLevel.MANAGER)
        throw new TRPCError({ code: 'FORBIDDEN' });
      await db.infraction.delete({ where: { id: infractionId } });
      return { success: true };
    }),
});
