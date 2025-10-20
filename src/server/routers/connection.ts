import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { protectedProcedure, router } from '../trpc';
import { getServers } from '@/actions/server-actions';

export const connectionRouter = router({
  listByHub: protectedProcedure
    .input(z.object({ hubId: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const permission = await getUserHubPermission(userId, input.hubId);

      const hub = await db.hub.findUnique({
        where: { id: input.hubId },
        select: { private: true },
      });
      if (hub?.private && permission === PermissionLevel.NONE) {
        // Match previous API semantics: 404 for private without access
        throw Object.assign(new Error('Hub not found'), {
          code: 'NOT_FOUND' as const,
        });
      }

      const connections = await db.connection.findMany({
        where: { hubId: input.hubId },
        select: {
          id: true,
          serverId: true,
          channelId: true,
          connected: true,
          createdAt: true,
          lastActive: true,
          invite: true,
          hubId: true,
          server: { select: { id: true, name: true, iconUrl: true } },
        },
        orderBy: { lastActive: 'desc' },
      });

      return { connections };
    }),

  listByServer: protectedProcedure
    .input(z.object({ serverId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Verify user has access to this server via server-actions
      const serversResult = await getServers(ctx.session);
      if (!('data' in serversResult)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      const hasAccess = serversResult.data.some(
        (server) => server.id === input.serverId
      );
      if (!hasAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this server',
        });
      }

      const connections = await db.connection.findMany({
        where: { serverId: input.serverId },
        select: {
          id: true,
          serverId: true,
          channelId: true,
          connected: true,
          createdAt: true,
          lastActive: true,
          invite: true,
          hubId: true,
          hub: { select: { id: true, name: true, iconUrl: true } },
        },
        orderBy: { lastActive: 'desc' },
      });

      return { connections };
    }),

  remove: protectedProcedure
    .input(z.object({ connectionId: z.string(), hubId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { connectionId } = input;

      try {
        const connection = await db.connection.findUnique({
          where: { id: connectionId },
          include: {
            hub: {
              select: {
                id: true,
                ownerId: true,
                moderators: {
                  where: { userId: ctx.session.user.id },
                  select: { role: true },
                },
              },
            },
            server: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (!connection) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Connection not found',
          });
        }

        const isHubOwner = connection.hub.ownerId === ctx.session.user.id;
        const isHubModerator = connection.hub.moderators.length > 0;

        let hasServerAccess = false;
        try {
          const serversResult = await getServers(ctx.session);
          if ('data' in serversResult) {
            hasServerAccess = serversResult.data.some((server) =>
              server.connections.some((c) => c.id === connectionId)
            );
          }
        } catch (error) {
          console.warn('Failed to check server access:', error);
        }

        // User must have either hub management rights OR server management rights
        if (!isHubOwner && !isHubModerator && !hasServerAccess) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to remove this connection',
          });
        }

        await db.connection.delete({ where: { id: connectionId } });
        return { success: true };
      } catch (error) {
        // Provide better error handling
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Error removing connection:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove connection. Please try again.',
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        connectionId: z.string(),
        connected: z.boolean().optional(),
        invite: z.string().nullable().optional(),
        channelId: z.string().optional(),
        hubId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // First, verify the connection exists and get its details
        const connection = await db.connection.findUnique({
          where: { id: input.connectionId },
          include: {
            hub: {
              select: {
                id: true,
                ownerId: true,
                moderators: {
                  where: { userId: ctx.session.user.id },
                  select: { role: true },
                },
              },
            },
          },
        });

        if (!connection) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Connection not found',
          });
        }

        const isHubOwner = connection.hub.ownerId === ctx.session.user.id;
        const isHubModerator = connection.hub.moderators.length > 0;

        let hasServerAccess = false;
        try {
          const serversResult = await getServers(ctx.session);
          if ('data' in serversResult) {
            hasServerAccess = serversResult.data.some((server) =>
              server.connections.some((c) => c.id === input.connectionId)
            );
          }
        } catch (error) {
          console.warn('Failed to check server access:', error);
          // Don't fail the request if server access check fails, rely on hub permissions
        }

        // User must have either hub management rights OR server management rights
        if (!isHubOwner && !isHubModerator && !hasServerAccess) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this connection',
          });
        }

        const updateData: Partial<{
          connected: boolean;
          invite: string | null;
          channelId: string;
        }> = {};

        if (input.connected !== undefined)
          updateData.connected = input.connected;
        if (input.invite !== undefined) updateData.invite = input.invite;
        if (input.channelId !== undefined)
          updateData.channelId = input.channelId;

        const updatedConnection = await db.connection.update({
          where: { id: input.connectionId },
          data: updateData,
        });

        return { connection: updatedConnection, success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Error updating connection:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update connection. Please try again.',
        });
      }
    }),

  generateInvite: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // First, verify the connection exists and get its details
        const connection = await db.connection.findUnique({
          where: { id: input.connectionId },
          include: {
            hub: {
              select: {
                id: true,
                ownerId: true,
                moderators: {
                  where: { userId: ctx.session.user.id },
                  select: { role: true },
                },
              },
            },
          },
        });

        if (!connection) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Connection not found',
          });
        }

        const isHubOwner = connection.hub.ownerId === ctx.session.user.id;
        const isHubModerator = connection.hub.moderators.length > 0;

        let hasServerAccess = false;
        try {
          const serversResult = await getServers(ctx.session);
          if ('data' in serversResult) {
            hasServerAccess = serversResult.data.some((server) =>
              server.connections.some((c) => c.id === input.connectionId)
            );
          }
        } catch (error) {
          console.warn('Failed to check server access:', error);
        }

        if (!isHubOwner && !isHubModerator && !hasServerAccess) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'You do not have permission to generate invites for this connection',
          });
        }

        const { REST } = await import('@discordjs/rest');
        const { Routes } = await import('discord-api-types/v10');

        const botToken = process.env.DISCORD_BOT_TOKEN;
        if (!botToken) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Bot token not configured',
          });
        }

        const rest = new REST().setToken(botToken);

        const invite = (await rest.post(
          Routes.channelInvites(connection.channelId),
          {
            body: {
              max_age: 0, // Never expires
              max_uses: 0, // Unlimited uses
            },
          }
        )) as { code: string };

        const inviteUrl = `https://discord.gg/${invite.code}`;

        await db.connection.update({
          where: { id: input.connectionId },
          data: { invite: inviteUrl },
        });

        return { invite: inviteUrl, success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Error generating invite:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate invite. Please try again.',
        });
      }
    }),
});
