/**
 * Server router for tRPC
 */

import { REST } from '@discordjs/rest';
import { TRPCError } from '@trpc/server';
import {
  type APIChannel,
  type APIGuild,
  type APIGuildTextChannel,
  type APIRole,
  ChannelType,
  type GuildTextChannelType,
  Routes,
} from 'discord-api-types/v10';
import { z } from 'zod/v4';
import { db } from '@/lib/prisma';
import { protectedProcedure, router } from '../trpc';

export const serverRouter = router({
  // Get Discord server roles
  getServerRoles: protectedProcedure
    .input(z.object({ serverId: z.string() }))
    .query(async ({ input }) => {
      const { serverId } = input;

      // Get bot token from environment variable
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Bot token not configured',
        });
      }

      try {
        // Create REST instance
        const rest = new REST({ version: '10' }).setToken(botToken);

        // Fetch roles from Discord API
        const discordRoles = (await rest.get(
          Routes.guildRoles(serverId)
        )) as APIRole[];

        // Process and filter roles
        const processedRoles = discordRoles
          // Filter out the @everyone role
          .filter((role) => role.name !== '@everyone')
          // Map to a simpler structure
          .map((role) => ({
            id: role.id,
            name: role.name,
            color: role.color,
            position: role.position,
            mentionable: role.mentionable,
          }))
          // Sort by position (higher position roles first)
          .sort((a, b) => b.position - a.position);

        return { roles: processedRoles };
      } catch (error) {
        console.error('Error fetching Discord roles:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch Discord roles',
        });
      }
    }),

  // Get a server by ID
  getServer: protectedProcedure
    .input(z.object({ serverId: z.string() }))
    .query(async ({ input }) => {
      const { serverId } = input;

      // Get bot token from environment variable
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Bot token not configured',
        });
      }

      try {
        // Create REST instance
        const rest = new REST({ version: '10' }).setToken(botToken);

        // Fetch server from Discord API
        const discordServer = (await rest.get(
          Routes.guild(serverId)
        )) as APIGuild;

        // Get server from database
        const dbServer = await db.serverData.findUnique({
          where: { id: serverId },
        });

        // Format the response
        // Keep icon as the raw Discord icon hash to match existing client logic
        const server = {
          id: discordServer.id,
          name: discordServer.name,
          icon: discordServer.icon ?? null,
          botAdded: !!dbServer,
        };

        return { server };
      } catch (error) {
        console.error('Error fetching server:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch server',
        });
      }
    }),

  // Get server channels
  getServerChannels: protectedProcedure
    .input(z.object({ serverId: z.string(), hubId: z.string().optional() }))
    .query(async ({ input }) => {
      const { serverId, hubId } = input;

      // Get bot token from environment variable
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Bot token not configured',
        });
      }

      try {
        // Create REST instance
        const rest = new REST({ version: '10' }).setToken(botToken);

        // Fetch channels from Discord API
        const discordChannels = (await rest.get(
          Routes.guildChannels(serverId)
        )) as APIChannel[];

        // Get all existing connections to filter out already connected channels (across all hubs)
        const existingConnections = await db.connection.findMany({
          where: { connected: true },
          select: { channelId: true },
        });
        const connectedChannelIds = existingConnections.map((c) => c.channelId);

        // If hubId is provided, also get existing connections for this hub and server combination
        let existingHubServerConnection: { id: string } | null = null;
        if (hubId) {
          existingHubServerConnection = await db.connection.findFirst({
            where: { serverId, hubId, connected: true },
            select: { id: true },
          });
        }

        // Process and filter channels (parity with REST route)
        const hasName = (c: APIChannel): c is APIChannel & { name: string } =>
          'name' in (c as unknown as Record<string, unknown>) &&
          typeof (c as { name?: unknown }).name === 'string';
        const hasParent = (
          c: APIChannel
        ): c is APIChannel & { parent_id: string } =>
          'parent_id' in (c as unknown as Record<string, unknown>) &&
          typeof (c as { parent_id?: unknown }).parent_id === 'string';

        const processedChannels = discordChannels
          .filter((channel) => {
            const isTextChannel = channel.type === ChannelType.GuildText;
            const isThread =
              channel.type === ChannelType.PublicThread ||
              channel.type === ChannelType.PrivateThread ||
              channel.type === ChannelType.AnnouncementThread;

            const isEligible = isTextChannel || isThread;
            const isNotConnected = !connectedChannelIds.includes(channel.id);
            const hubServerAlreadyConnected = Boolean(
              hubId && existingHubServerConnection
            );
            return isEligible && isNotConnected && !hubServerAlreadyConnected;
          })
          .map((channel) => {
            const isThread =
              channel.type === ChannelType.PublicThread ||
              channel.type === ChannelType.PrivateThread ||
              channel.type === ChannelType.AnnouncementThread;

            // Find parent channel for threads
            let parentChannel: APIChannel | undefined;
            if (isThread && hasParent(channel)) {
              parentChannel = discordChannels.find(
                (c) => c.id === channel.parent_id
              );
            }

            return {
              id: channel.id,
              name: hasName(channel) ? channel.name : 'unknown-channel',
              type: channel.type,
              parentId:
                isThread && hasParent(channel) ? channel.parent_id : null,
              parentName:
                parentChannel && 'name' in parentChannel && parentChannel.name
                  ? parentChannel.name
                  : null,
              isThread,
              isPrivateThread: channel.type === ChannelType.PrivateThread,
              position:
                (
                  channel as unknown as APIGuildTextChannel<GuildTextChannelType>
                ).position ?? 0,
            };
          })
          .sort((a, b) => {
            // Sort threads after their parent channels
            if (a.isThread && !b.isThread) return 1;
            if (!a.isThread && b.isThread) return -1;

            // If both are threads with the same parent, sort by name
            if (
              a.name &&
              b.name &&
              a.isThread &&
              b.isThread &&
              a.parentId === b.parentId
            ) {
              return a.name.localeCompare(b.name);
            }

            return (
              (a as unknown as APIGuildTextChannel<GuildTextChannelType>)
                .position -
              (b as unknown as APIGuildTextChannel<GuildTextChannelType>)
                .position
            );
          });

        return { channels: processedChannels };
      } catch (error) {
        console.error('Error fetching channels:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch channels',
        });
      }
    }),

  // Connect server to hub
  connectServerToHub: protectedProcedure
    .input(
      z.object({
        serverId: z.string(),
        hubId: z.string(),
        channelId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { serverId, hubId, channelId } = input;
      const userId = ctx.session.user.id;

      // Check if the hub exists
      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: {
          id: true,
          ownerId: true,
          moderators: {
            where: { userId },
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

      // Check if the user has permission to connect servers to this hub
      const isOwner = hub.ownerId === userId;
      const isModerator = hub.moderators.length > 0;

      if (!isOwner && !isModerator) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to connect servers to this hub',
        });
      }

      // Check if the server is already connected to a hub
      const existingConnection = await db.connection.findFirst({
        where: {
          serverId,
          connected: true,
        },
      });

      if (existingConnection) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Server is already connected to a hub',
        });
      }

      // Create the connection
      const connection = await db.connection.create({
        data: {
          serverId,
          hubId,
          channelId,
          webhookURL: '', // FIXME: This would be set by the bot
          connected: true,
          lastActive: new Date(),
        },
      });

      return { connection };
    }),

  // Disconnect server from hub
  disconnectServerFromHub: protectedProcedure
    .input(
      z.object({
        connectionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { connectionId } = input;
      const userId = ctx.session.user.id;

      // Get the connection with hub info
      const connection = await db.connection.findUnique({
        where: { id: connectionId },
        include: {
          hub: {
            select: {
              ownerId: true,
              moderators: {
                where: { userId },
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

      // Check if the user has permission to disconnect servers from this hub
      const isOwner = connection.hub.ownerId === userId;
      const isModerator = connection.hub.moderators.length > 0;

      if (!isOwner && !isModerator) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'You do not have permission to disconnect servers from this hub',
        });
      }

      // Update the connection
      const updatedConnection = await db.connection.update({
        where: { id: connectionId },
        data: {
          connected: false,
        },
      });

      return { connection: updatedConnection };
    }),
});
