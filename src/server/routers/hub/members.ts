import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { protectedProcedure, router } from '../../trpc';

export const membersRouter = router({
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

      // Permission check: Managers cannot add other Managers
      if (level === PermissionLevel.MANAGER && role === 'MANAGER') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Managers cannot add other Managers',
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

      // Permission check: Managers cannot modify other Managers
      if (level === PermissionLevel.MANAGER) {
        if (member.role === 'MANAGER' && member.userId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Managers cannot modify other Managers',
          });
        }
        // Managers cannot promote someone to Manager
        if (role === 'MANAGER') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Managers cannot promote members to Manager',
          });
        }
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
          role: true,
        },
      });

      if (!member || member.hubId !== hubId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
      }

      // Permission check: Managers cannot remove other Managers
      if (level === PermissionLevel.MANAGER) {
        if (member.role === 'MANAGER' && member.userId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Managers cannot remove other Managers',
          });
        }
      }

      // Remove the member
      await db.hubModerator.delete({
        where: { id: memberId },
      });

      return { success: true };
    }),
});
