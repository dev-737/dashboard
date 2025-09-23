import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import { PermissionLevel } from '@/lib/constants';
import { AppealStatus, type Prisma } from '@/lib/generated/prisma/client';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { protectedProcedure, router } from '../trpc';

// Schemas
const listAppealsSchema = z.object({
  status: z.enum(AppealStatus).optional(),
  userId: z.string().optional(),
  infractionId: z.string().optional(),
  hubId: z.string().optional(),
  myAppeals: z.boolean().optional(),
  page: z.number().optional().prefault(1),
  limit: z.number().optional().prefault(10),
});

const createAppealSchema = z.object({
  infractionId: z.string(),
  reason: z.string().min(10).max(1000),
});

const updateAppealStatusSchema = z.object({
  appealId: z.string(),
  status: z.enum(['ACCEPTED', 'REJECTED']).transform((s) => s as AppealStatus),
});

export const appealRouter = router({
  // List appeals with filtering/pagination
  list: protectedProcedure
    .input(listAppealsSchema)
    .query(async ({ input, ctx }) => {
      const { status, userId, infractionId, hubId, myAppeals, page, limit } =
        input;
      const skip = (page - 1) * limit;

      const whereClause: Prisma.AppealWhereInput = {};

      if (status) whereClause.status = status;

      if (myAppeals) {
        // Only my appeals
        whereClause.userId = ctx.session.user.id;
      } else {
        // Moderation view: restrict to hubs the user can access
        // Hubs where user is owner
        const ownedHubs = await db.hub.findMany({
          where: { ownerId: ctx.session.user.id },
          select: { id: true },
        });

        // Hubs where user is a moderator/manager
        const moderatedHubs = await db.hubModerator.findMany({
          where: { userId: ctx.session.user.id },
          select: { hubId: true },
        });

        const accessibleHubIds = [
          ...ownedHubs.map((h) => h.id),
          ...moderatedHubs.map((m) => m.hubId),
        ];

        if (accessibleHubIds.length === 0) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });
        }

        // Always restrict to accessible hubs
        whereClause.infraction = { hubId: { in: accessibleHubIds } };

        if (userId) whereClause.userId = userId;

        if (hubId) {
          if (!accessibleHubIds.includes(hubId)) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });
          }
          whereClause.infraction = { hubId };
        }
      }

      if (infractionId) whereClause.infractionId = infractionId;

      const total = await db.appeal.count({ where: whereClause });

      const appeals = await db.appeal.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, image: true } },
          infraction: {
            include: {
              hub: { select: { id: true, name: true, iconUrl: true } },
              user: { select: { id: true, name: true, image: true } },
              moderator: { select: { id: true, name: true, image: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      return {
        appeals,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get a specific appeal with permission check
  getById: protectedProcedure
    .input(z.object({ appealId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { appealId } = input;

      const appeal = await db.appeal.findUnique({
        where: { id: appealId },
        include: {
          user: { select: { id: true, name: true, image: true } },
          infraction: {
            include: {
              hub: {
                select: {
                  id: true,
                  name: true,
                  iconUrl: true,
                  ownerId: true,
                  moderators: {
                    where: { userId: ctx.session.user.id },
                    select: { userId: true, role: true },
                  },
                },
              },
              user: { select: { id: true, name: true, image: true } },
              moderator: { select: { id: true, name: true, image: true } },
            },
          },
        },
      });

      if (!appeal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Appeal not found' });
      }

      const isOwner = appeal.userId === ctx.session.user.id;
      const hubId = appeal.infraction.hubId;
      const permissionLevel = await getUserHubPermission(
        ctx.session.user.id,
        hubId
      );
      const canModerate = permissionLevel >= PermissionLevel.MODERATOR;

      if (!isOwner && !canModerate) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });
      }

      return { appeal };
    }),

  // Create a new appeal
  create: protectedProcedure
    .input(createAppealSchema)
    .mutation(async ({ input, ctx }) => {
      const { infractionId, reason } = input;

      const infraction = await db.infraction.findUnique({
        where: { id: infractionId },
      });
      if (!infraction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Infraction not found',
        });
      }

      // Only the user that received the infraction may appeal
      if (infraction.userId && infraction.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only appeal your own infractions',
        });
      }

      if (infraction.status === 'APPEALED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This infraction has already been appealed',
        });
      }

      const existingAppeal = await db.appeal.findFirst({
        where: { infractionId, status: 'PENDING' },
      });
      if (existingAppeal) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'There is already a pending appeal for this infraction',
        });
      }

      const appeal = await db.appeal.create({
        data: { infractionId, userId: ctx.session.user.id, reason },
        include: {
          user: { select: { id: true, name: true, image: true } },
          infraction: {
            include: {
              hub: { select: { id: true, name: true, iconUrl: true } },
            },
          },
        },
      });

      return { appeal };
    }),

  // Update an appeal status (moderator+)
  updateStatus: protectedProcedure
    .input(updateAppealStatusSchema)
    .mutation(async ({ input, ctx }) => {
      const { appealId, status } = input;

      const appeal = await db.appeal.findUnique({
        where: { id: appealId },
        include: { infraction: true },
      });

      if (!appeal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Appeal not found' });
      }

      // Permission check
      const hubId = appeal.infraction.hubId;
      const permissionLevel = await getUserHubPermission(
        ctx.session.user.id,
        hubId
      );
      if (permissionLevel < PermissionLevel.MODERATOR) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' });
      }

      if (appeal.status === status) {
        return { appeal };
      }

      const result = await db.$transaction(async (tx) => {
        const updatedAppeal = await tx.appeal.update({
          where: { id: appealId },
          data: { status },
          include: {
            user: { select: { id: true, name: true, image: true } },
            infraction: true,
          },
        });

        if (status === 'ACCEPTED') {
          await tx.infraction.update({
            where: { id: appeal.infractionId },
            data: { status: 'APPEALED' },
          });
        }

        return updatedAppeal;
      });

      return { appeal: result };
    }),
});
