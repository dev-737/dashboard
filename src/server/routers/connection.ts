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

  remove: protectedProcedure
    .input(z.object({ connectionId: z.string(), hubId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      // Permission: Only users with Manage Channels on the Discord server per existing API
      // We will keep server-side permission parity by checking via existing server-actions helper
      const serversResult = await getServers(ctx.session);
      if (!('data' in serversResult)) {
        throw new Error('Forbidden');
      }
      const hasAccess = serversResult.data.some((server) =>
        server.connections.some((c) => c.id === input.connectionId)
      );
      if (!hasAccess) {
        throw new Error('Forbidden');
      }

      await db.connection.delete({ where: { id: input.connectionId } });
      return { success: true };
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
      // Permission: Only users with Manage Channels on the Discord server per existing API
      // We will keep server-side permission parity by checking via existing server-actions helper
      const serversResult = await getServers(ctx.session);
      if (!('data' in serversResult)) {
        throw new Error('Forbidden');
      }
      const hasAccess = serversResult.data.some((server) =>
        server.connections.some((c) => c.id === input.connectionId)
      );
      if (!hasAccess) {
        throw new Error('Forbidden');
      }

      // Build update data object
      const updateData: Partial<{
        connected: boolean;
        invite: string | null;
        channelId: string;
      }> = {};
      if (input.connected !== undefined) updateData.connected = input.connected;
      if (input.invite !== undefined) updateData.invite = input.invite;
      if (input.channelId !== undefined) updateData.channelId = input.channelId;

      const updatedConnection = await db.connection.update({
        where: { id: input.connectionId },
        data: updateData,
      });

      return { connection: updatedConnection, success: true };
    }),

  generateInvite: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Permission: Only users with Manage Channels on the Discord server per existing API
      const serversResult = await getServers(ctx.session);
      if (!('data' in serversResult)) {
        throw new Error('Forbidden');
      }
      const hasAccess = serversResult.data.some((server) =>
        server.connections.some((c) => c.id === input.connectionId)
      );
      if (!hasAccess) {
        throw new Error('Forbidden');
      }

      // Get connection details
      const connection = await db.connection.findUnique({
        where: { id: input.connectionId },
        select: { serverId: true, channelId: true },
      });

      if (!connection) {
        throw new Error('Connection not found');
      }

      // Use Discord REST API to generate invite
      try {
        const { REST } = await import('@discordjs/rest');
        const { Routes } = await import('discord-api-types/v10');

        const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

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

        // Update connection with new invite
        await db.connection.update({
          where: { id: input.connectionId },
          data: { invite: inviteUrl },
        });

        return { invite: inviteUrl, success: true };
      } catch (error) {
        console.error('Error generating invite:', error);
        throw new Error('Failed to generate invite');
      }
    }),
});
