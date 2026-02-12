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
import { syncHubConnectionCount } from '@/lib/hub-counts';
import { db } from '@/lib/prisma';
import type { ResolvedLogConfigs } from '@/types/logging';
import { protectedProcedure, router } from '../trpc';

interface CacheEntry {
  data: ResolvedLogConfigs;
  timestamp: number;
}

const resolveCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
        const rest = new REST({ version: '10' }).setToken(botToken);

        const discordRoles = (await rest.get(
          Routes.guildRoles(serverId)
        )) as APIRole[];

        const processedRoles = discordRoles
          .filter((role) => role.name !== '@everyone')
          .map((role) => ({
            id: role.id,
            name: role.name,
            color: role.color,
            position: role.position,
            mentionable: role.mentionable,
          }))
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

  getServer: protectedProcedure
    .input(z.object({ serverId: z.string() }))
    .query(async ({ input }) => {
      const { serverId } = input;

      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Bot token not configured',
        });
      }

      try {
        const rest = new REST({ version: '10' }).setToken(botToken);

        const discordServer = (await rest.get(
          Routes.guild(serverId)
        )) as APIGuild;

        const dbServer = await db.serverData.findUnique({
          where: { id: serverId },
        });

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

  getServerChannels: protectedProcedure
    .input(z.object({ serverId: z.string(), hubId: z.string().optional() }))
    .query(async ({ input }) => {
      const { serverId } = input;

      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Bot token not configured',
        });
      }

      try {
        const rest = new REST({ version: '10' }).setToken(botToken);

        const discordChannels = (await rest.get(
          Routes.guildChannels(serverId)
        )) as APIChannel[];

        const existingConnections = await db.connection.findMany({
          where: { connected: true },
          select: { channelId: true },
        });
        const connectedChannelIds = existingConnections.map((c) => c.channelId);

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
            return isEligible && isNotConnected;
          })
          .map((channel) => {
            const isThread =
              channel.type === ChannelType.PublicThread ||
              channel.type === ChannelType.PrivateThread ||
              channel.type === ChannelType.AnnouncementThread;

            let parentChannel: APIChannel | undefined;
            if (isThread && hasParent(channel)) {
              parentChannel = discordChannels.find(
                (c) => c.id === channel.parent_id
              );
            }

            let categoryId: string | null = null;
            let categoryName: string | null = null;
            if (!isThread && hasParent(channel)) {
              const category = discordChannels.find(
                (c) =>
                  c.id === channel.parent_id &&
                  c.type === ChannelType.GuildCategory
              );
              if (category) {
                categoryId = category.id;
                categoryName = hasName(category) ? category.name : null;
              }
            }

            return {
              id: channel.id,
              name: hasName(channel) ? channel.name : 'unknown-channel',
              type: channel.type,
              categoryId,
              categoryName,
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

      const isOwner = hub.ownerId === userId;
      const isModerator = hub.moderators.length > 0;

      if (!isOwner && !isModerator) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to connect servers to this hub',
        });
      }

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

      const connection = await db.connection.create({
        data: {
          serverId,
          hubId,
          channelId,
          webhookURL: '', // FIXME: This should be set by the bot
          connected: true,
          lastActive: new Date(),
        },
      });

      return { connection };
    }),

  disconnectServerFromHub: protectedProcedure
    .input(
      z.object({
        connectionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { connectionId } = input;
      const userId = ctx.session.user.id;

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

      const isOwner = connection.hub.ownerId === userId;
      const isModerator = connection.hub.moderators.length > 0;

      if (!isOwner && !isModerator) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'You do not have permission to disconnect servers from this hub',
        });
      }

      const updatedConnection = await db.connection.update({
        where: { id: connectionId },
        data: {
          connected: false,
        },
      });

      return { connection: updatedConnection };
    }),

  resolveLogConfigDetails: protectedProcedure
    .input(
      z.object({
        configs: z.array(
          z.object({
            logType: z.string(),
            channelId: z.string().optional().nullable(),
            roleId: z.string().optional().nullable(),
          })
        ),
      })
    )
    .query(async ({ input, ctx }) => {
      const { configs } = input;
      const userId = ctx.session.user.id;

      const cacheKey = configs
        .map((c) => `${c.channelId || ''}-${c.roleId || ''}`)
        .sort()
        .join('|');

      const cached = resolveCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Bot token not configured',
        });
      }

      const rest = new REST({ version: '10' }).setToken(botToken);

      const account = await db.account.findFirst({
        where: { userId, providerId: 'discord' },
        select: { accessToken: true },
      });

      let manageableServerIds = new Set<string>();
      if (account?.accessToken) {
        try {
          const userGuildsResponse = await fetch(
            'https://discord.com/api/v10/users/@me/guilds',
            {
              headers: { Authorization: `Bearer ${account.accessToken}` },
            }
          );
          if (userGuildsResponse.ok) {
            const userGuilds = (await userGuildsResponse.json()) as Array<{
              id: string;
              permissions: string;
              owner: boolean;
            }>;
            const manageable = userGuilds.filter((guild) => {
              const permissions = BigInt(guild.permissions);
              return (
                guild.owner ||
                (permissions & BigInt(0x10)) === BigInt(0x10) ||
                (permissions & BigInt(0x8)) === BigInt(0x8)
              );
            });
            manageableServerIds = new Set(manageable.map((g) => g.id));
          }
        } catch (error) {
          console.error('Error fetching user guilds for access check:', error);
        }
      }

      const result: ResolvedLogConfigs = {};

      for (const config of configs) {
        const { logType, channelId, roleId } = config;

        let channelData = null;
        let roleData = null;
        let serverId: string | null = null;
        let serverName: string | null = null;
        // Default to true - only set to false if we can definitively prove no access
        let userHasAccess = true;

        if (channelId) {
          try {
            const channel = (await rest.get(
              Routes.channel(channelId)
            )) as APIChannel;

            if ('guild_id' in channel && channel.guild_id) {
              serverId = channel.guild_id;

              try {
                const guild = (await rest.get(
                  Routes.guild(serverId)
                )) as APIGuild;
                serverName = guild.name;
              } catch (guildError) {
                console.error('Error fetching guild:', guildError);
                serverName = serverId; // Fallback to ID
              }

              if (manageableServerIds.size > 0) {
                userHasAccess = manageableServerIds.has(serverId);
              }

              channelData = {
                id: channel.id,
                name:
                  'name' in channel && typeof channel.name === 'string'
                    ? channel.name
                    : 'unknown',
                serverId,
                serverName,
                exists: true,
              };
            }
          } catch (error: unknown) {
            console.error('Error fetching channel:', error);
            const apiError = error as { status?: number };
            if (apiError.status === 404) {
              channelData = {
                id: channelId,
                name: 'Deleted Channel',
                serverId: 'unknown',
                serverName: 'Unknown Server',
                exists: false,
              };
            } else if (apiError.status === 403) {
              channelData = {
                id: channelId,
                name: 'Access Denied',
                serverId: 'unknown',
                serverName: 'Unknown Server',
                exists: false,
              };
              userHasAccess = false;
            } else {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Discord API temporarily unavailable',
              });
            }
          }
        }

        // Resolve role details
        if (roleId && serverId) {
          try {
            const roles = (await rest.get(
              Routes.guildRoles(serverId)
            )) as APIRole[];
            const role = roles.find((r) => r.id === roleId);

            if (role) {
              roleData = {
                id: role.id,
                name: role.name,
                color: role.color,
                exists: true,
              };
            } else {
              roleData = {
                id: roleId,
                name: 'Deleted Role',
                color: 0,
                exists: false,
              };
            }
          } catch (error: unknown) {
            console.error('Error fetching roles:', error);
            const apiError = error as { status?: number };
            if (apiError.status === 404 || apiError.status === 403) {
              roleData = {
                id: roleId,
                name: 'Deleted Role',
                color: 0,
                exists: false,
              };
            } else {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Discord API temporarily unavailable',
              });
            }
          }
        }

        result[logType] = {
          channel: channelData,
          role: roleData,
          userHasAccess,
        };
      }

      // Cache the result
      resolveCache.set(cacheKey, { data: result, timestamp: Date.now() });

      // Clean up old cache entries (simple cleanup)
      if (resolveCache.size > 100) {
        const now = Date.now();
        for (const [key, entry] of resolveCache.entries()) {
          if (now - entry.timestamp > CACHE_TTL) {
            resolveCache.delete(key);
          }
        }
      }

      return result;
    }),
});
