import { REST } from '@discordjs/rest';
import { FilterIcon } from '@hugeicons/core-free-icons';
import { TRPCError } from '@trpc/server';
import {
  type APIChannel,
  type APIGuild,
  type APIGuildMember,
  type APIGuildTextChannel,
  type APIRole,
  type APIUser,
  type APIWebhook,
  ChannelType,
  type GuildFeature,
  type GuildTextChannelType,
  PermissionFlagsBits,
  Routes,
  WebhookType,
} from 'discord-api-types/v10';
import { z } from 'zod/v4';
import { HubVisibility } from '@/lib/generated/prisma/client/client';
import { syncHubConnectionCount } from '@/lib/hub-counts';
import { db } from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis-config'; // Ensure you have this
import type { ResolvedLogConfigs } from '@/types/logging';
import { protectedProcedure, router } from '../trpc';

const CACHE_TTL_USER_GUILDS = 60; // 1 minute
const CACHE_TTL_GUILD_ROLES = 60 * 5; // 5 minutes
const CACHE_TTL_LOG_RESOLVE = 60 * 5; // 5 minutes
const WEBHOOK_LOCK_TTL = 10; // 10 seconds

const MANAGE_CHANNELS = BigInt(PermissionFlagsBits.ManageChannels);
const ADMINISTRATOR = BigInt(PermissionFlagsBits.Administrator);

const getDiscordClient = () => {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Bot token not configured',
    });
  }
  return new REST({ version: '10' }).setToken(token);
};

const hasGuildId = <T extends APIChannel>(
  channel: T
): channel is T & { guild_id: string } =>
  'guild_id' in channel && typeof channel.guild_id === 'string';

const hasParentId = <T extends APIChannel>(
  channel: T
): channel is T & { parent_id: string } =>
  'parent_id' in channel && typeof channel.parent_id === 'string';

const hasPermissionOverwrites = <T extends APIChannel>(
  channel: T
): channel is T & {
  permission_overwrites: Array<{ id: string; allow: string; deny: string }>;
} =>
  'permission_overwrites' in channel &&
  Array.isArray(channel.permission_overwrites);

/**
 * Calculates permissions with overwrites
 */
const applyPermissionOverwrites = (
  basePermissions: bigint,
  channel: APIChannel,
  guildId: string,
  userId: string,
  memberRoleIds: Set<string>
) => {
  if (!hasPermissionOverwrites(channel)) return basePermissions;

  let permissions = basePermissions;
  const overwrites = channel.permission_overwrites;

  // 1. @everyone overwrites
  const everyoneOverwrite = overwrites.find((ow) => ow.id === guildId);
  if (everyoneOverwrite) {
    permissions &= ~BigInt(everyoneOverwrite.deny);
    permissions |= BigInt(everyoneOverwrite.allow);
  }

  // 2. Role overwrites
  let roleDeny = BigInt(0);
  let roleAllow = BigInt(0);
  for (const overwrite of overwrites) {
    if (memberRoleIds.has(overwrite.id)) {
      roleDeny |= BigInt(overwrite.deny);
      roleAllow |= BigInt(overwrite.allow);
    }
  }
  permissions &= ~roleDeny;
  permissions |= roleAllow;

  // 3. Member overwrites
  const memberOverwrite = overwrites.find((ow) => ow.id === userId);
  if (memberOverwrite) {
    permissions &= ~BigInt(memberOverwrite.deny);
    permissions |= BigInt(memberOverwrite.allow);
  }

  return permissions;
};

/**
 * Fetch and cache Guild Roles (Heavy API call optimization)
 */
const getCachedGuildRoles = async (rest: REST, serverId: string) => {
  const cacheKey = `discord:roles:${serverId}`;
  const redis = await getRedisClient();
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached) as APIRole[];
  }

  try {
    const roles = (await rest.get(Routes.guildRoles(serverId))) as APIRole[];
    // Cache for 5 minutes
    await redis.setex(cacheKey, CACHE_TTL_GUILD_ROLES, JSON.stringify(roles));
    return roles;
  } catch (error) {
    console.error(`Failed to fetch roles for ${serverId}`, error);
    return [];
  }
};

/**
 * Fetch and cache User Guilds (Heavy API call optimization)
 */
const getCachedUserGuilds = async (accessToken: string, userId: string) => {
  const cacheKey = `discord:user:guilds:${userId}`;
  const redis = await getRedisClient();
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached) as Array<{
      id: string;
      name: string;
      icon: string | null;
      owner: boolean;
      permissions: string;
    }>;
  }

  const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch Discord servers',
    });
  }

  const guilds = await response.json();
  await redis.setex(cacheKey, CACHE_TTL_USER_GUILDS, JSON.stringify(guilds));
  return guilds as Array<{
    id: string;
    name: string;
    icon: string;
    banner: string;
    owner: true;
    permissions: string;
    features: GuildFeature[];
    approximate_member_count: number;
    approximate_presence_count: number;
  }>;
};

/**
 * High-performance permission checker
 */
const hasManageChannelsPermissionInChannel = async (
  rest: REST,
  serverId: string,
  channelId: string,
  userId: string
) => {
  // Parallelize the fetch of Guild, Roles, Member, and Channel
  const [guild, roles, member, rawChannel] = await Promise.all([
    rest.get(Routes.guild(serverId)) as Promise<APIGuild>,
    getCachedGuildRoles(rest, serverId),
    rest.get(Routes.guildMember(serverId, userId)) as Promise<APIGuildMember>,
    rest.get(Routes.channel(channelId)) as Promise<APIChannel>,
  ]);

  if (!hasGuildId(rawChannel) || rawChannel.guild_id !== serverId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Channel does not belong to the selected server',
    });
  }

  // Owner check
  if (guild.owner_id === userId) return true;

  const memberRoleIds = new Set(member.roles);
  const everyoneRole = roles.find((r) => r.id === serverId);

  // Base Permissions from Roles
  let permissions = BigInt(everyoneRole?.permissions ?? '0');
  for (const roleId of memberRoleIds) {
    const role = roles.find((r) => r.id === roleId);
    if (role) permissions |= BigInt(role.permissions);
  }

  // Admin Check
  if ((permissions & ADMINISTRATOR) === ADMINISTRATOR) return true;

  // Apply Overwrites (Thread handling logic)
  if (
    rawChannel.type === ChannelType.PublicThread ||
    rawChannel.type === ChannelType.PrivateThread ||
    rawChannel.type === ChannelType.AnnouncementThread
  ) {
    if (hasParentId(rawChannel)) {
      const parentChannel = (await rest.get(
        Routes.channel(rawChannel.parent_id)
      )) as APIChannel;
      permissions = applyPermissionOverwrites(
        permissions,
        parentChannel,
        serverId,
        userId,
        memberRoleIds
      );
    }
  }

  // Apply Channel Overwrites
  permissions = applyPermissionOverwrites(
    permissions,
    rawChannel,
    serverId,
    userId,
    memberRoleIds
  );

  return (permissions & MANAGE_CHANNELS) === MANAGE_CHANNELS;
};

/**
 * Webhook Logic
 */
const isInterchatWebhook = (webhook: APIWebhook, botUserId: string) => {
  if (webhook.type !== WebhookType.Incoming || !webhook.url) return false;
  return (
    webhook.user?.id === botUserId ||
    (webhook.name?.toLowerCase().includes('interchat') ?? false)
  );
};

const createInterchatWebhook = async (
  rest: REST,
  channelId: string,
  name: string
) => {
  const created = (await rest.post(Routes.channelWebhooks(channelId), {
    body: { name },
  })) as APIWebhook;

  if (!created.url) throw new Error('Failed to create webhook');
  return created.url;
};

// --- Router ---

export const serverRouter = router({
  getHubJoinServers: protectedProcedure
    .input(z.object({ hubId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { hubId } = input;
      const userId = ctx.session.user.id;

      const account = await db.account.findFirst({
        where: { userId, providerId: 'discord' },
        select: { accessToken: true },
      });

      if (!account?.accessToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Discord account not connected',
        });
      }

      // Use cached guild fetch
      const userGuilds = await getCachedUserGuilds(account.accessToken, userId);

      // FilterIcon manageable guilds
      const manageableGuilds = userGuilds.filter((guild) => {
        const p = BigInt(guild.permissions);
        return (
          guild.owner ||
          (p & BigInt(0x10)) === BigInt(0x10) || // MANAGE_CHANNELS
          (p & BigInt(0x8)) === BigInt(0x8) // ADMINISTRATOR
        );
      });

      if (manageableGuilds.length === 0) return { servers: [] };

      const guildIds = manageableGuilds.map((g) => g.id);

      const servers = await db.serverData.findMany({
        where: { id: { in: guildIds } },
        select: {
          id: true,
          connections: {
            where: { connected: true },
            select: { hubId: true },
          },
        },
      });

      const serverMap = new Map(servers.map((s) => [s.id, s]));

      const mappedServers = manageableGuilds.map((guild) => {
        const dbServer = serverMap.get(guild.id);
        const hasConnectionToCurrentHub =
          dbServer?.connections.some((c) => c.hubId === hubId) || false;

        return {
          id: guild.id,
          name: guild.name,
          icon: guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
            : null,
          owner: guild.owner,
          botAdded: !!dbServer,
          alreadyConnectedToHub: hasConnectionToCurrentHub,
        };
      });

      return { servers: mappedServers };
    }),

  getServerRoles: protectedProcedure
    .input(z.object({ serverId: z.string() }))
    .query(async ({ input }) => {
      const { serverId } = input;
      const rest = getDiscordClient();

      try {
        const discordRoles = await getCachedGuildRoles(rest, serverId);

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
      const rest = getDiscordClient();

      try {
        const [discordServer, dbServer] = await Promise.all([
          rest.get(Routes.guild(serverId)) as Promise<APIGuild>,
          db.serverData.findUnique({ where: { id: serverId } }),
        ]);

        return {
          server: {
            id: discordServer.id,
            name: discordServer.name,
            icon: discordServer.icon ?? null,
            botAdded: !!dbServer,
          },
        };
      } catch (error) {
        console.error('Error fetching server:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch server',
        });
      }
    }),

  getServerChannels: protectedProcedure
    .input(
      z.object({
        serverId: z.string(),
        hubId: z.string().optional(),
        includeConnected: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const { serverId, hubId, includeConnected = false } = input;
      const rest = getDiscordClient();

      try {
        const [discordChannels, existingConnections] = await Promise.all([
          rest.get(Routes.guildChannels(serverId)) as Promise<APIChannel[]>,
          db.connection.findMany({
            where: { connected: true },
            select: {
              channelId: true,
              hubId: true,
              hub: { select: { name: true } },
            },
          }),
        ]);

        const connectedByChannelId = new Map(
          existingConnections.map((c) => [
            c.channelId,
            { hubId: c.hubId, hubName: c.hub.name },
          ])
        );

        // Filters
        const eligibleChannels = discordChannels.filter((channel) => {
          const isText = channel.type === ChannelType.GuildText;
          const isThread = [
            ChannelType.PublicThread,
            ChannelType.PrivateThread,
            ChannelType.AnnouncementThread,
          ].includes(channel.type);

          if (!isText && !isThread) return false;
          if (includeConnected) return true;
          return !connectedByChannelId.has(channel.id);
        });

        const processedChannels = eligibleChannels.map((channel) => {
          const connectedInfo = connectedByChannelId.get(channel.id);
          const isThread = [
            ChannelType.PublicThread,
            ChannelType.PrivateThread,
            ChannelType.AnnouncementThread,
          ].includes(channel.type);

          let parentId: string | null = null;
          let parentName: string | null = null;
          let categoryId: string | null = null;
          let categoryName: string | null = null;

          if (isThread && hasParentId(channel)) {
            parentId = channel.parent_id;
            const p = discordChannels.find((c) => c.id === parentId);
            parentName = p && 'name' in p ? (p.name as string) : null;
          } else if (hasParentId(channel)) {
            // It's a regular channel with a category
            categoryId = channel.parent_id;
            const c = discordChannels.find((ch) => ch.id === categoryId);
            categoryName = c && 'name' in c ? (c.name as string) : null;
          }

          return {
            id: channel.id,
            name: 'name' in channel ? (channel.name as string) : 'unknown',
            type: channel.type,
            categoryId,
            categoryName,
            parentId,
            parentName,
            isThread,
            isPrivateThread: channel.type === ChannelType.PrivateThread,
            isConnectedElsewhere: !!connectedInfo,
            isConnectedToCurrentHub: connectedInfo?.hubId === hubId,
            connectedHubId: connectedInfo?.hubId ?? null,
            connectedHubName: connectedInfo?.hubName ?? null,
            position:
              (channel as unknown as APIGuildTextChannel<GuildTextChannelType>)
                .position ?? 0,
          };
        });

        // Sort: Threads after parents, then position
        processedChannels.sort((a, b) => {
          if (a.isThread && !b.isThread) return 1;
          if (!a.isThread && b.isThread) return -1;
          if (a.isThread && b.isThread && a.parentId === b.parentId) {
            return a.name.localeCompare(b.name);
          }
          return a.position - b.position;
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

      // 1. Validate Hub
      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: { id: true, visibility: true },
      });

      if (!hub)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      if (
        hub.visibility !== HubVisibility.PUBLIC &&
        hub.visibility !== HubVisibility.UNLISTED
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This hub is private',
        });
      }

      // 2. Validate Permissions
      const rest = getDiscordClient();
      try {
        const hasPerms = await hasManageChannelsPermissionInChannel(
          rest,
          serverId,
          channelId,
          userId
        );
        if (!hasPerms) throw new Error('No permission');
      } catch (error) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You must have Manage Channels permission.',
        });
      }

      // 3. Database Checks (Parallel)
      const [existingServerHubConnection, existingChannelConnection] =
        await Promise.all([
          db.connection.findFirst({
            where: { serverId, hubId },
            select: { id: true, channelId: true, connected: true },
          }),
          db.connection.findUnique({
            where: { channelId },
            select: { id: true, hubId: true, connected: true },
          }),
        ]);

      if (
        existingChannelConnection?.connected &&
        existingChannelConnection.hubId !== hubId
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Channel already connected to another hub.',
        });
      }

      if (
        existingServerHubConnection?.connected &&
        existingServerHubConnection.channelId !== channelId
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Server already connected via another channel.',
        });
      }

      // 4. Distributed Lock & Webhook Provisioning
      const lockKey = `webhook:provision:${channelId}`;
      const redis = await getRedisClient();
      const lockAcquired = await redis.set(lockKey, 'locked', 'EX', 10, 'NX');

      if (!lockAcquired) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Another process is connecting this channel. Please retry.',
        });
      }

      let primaryWebhookURL: string;
      let secondaryWebhookURL: string;

      try {
        const botUser = (await rest.get(Routes.user('@me'))) as APIUser;
        const webhooks = (await rest.get(
          Routes.channelWebhooks(channelId)
        )) as APIWebhook[];
        const interchatWebhooks = webhooks.filter((w) =>
          isInterchatWebhook(w, botUser.id)
        );

        primaryWebhookURL = interchatWebhooks[0]?.url ?? '';
        secondaryWebhookURL = interchatWebhooks[1]?.url ?? '';

        if (!primaryWebhookURL)
          primaryWebhookURL = await createInterchatWebhook(
            rest,
            channelId,
            'InterChat Webhook 1'
          );
        if (!secondaryWebhookURL)
          secondaryWebhookURL = await createInterchatWebhook(
            rest,
            channelId,
            'InterChat Webhook 2'
          );
      } catch (error) {
        // Release lock on failure
        await redis.del(lockKey);
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Failed to provision webhooks. Check permissions.',
        });
      } finally {
        // Release lock
        await redis.del(lockKey);
      }

      // 5. Commit to DB
      const connection = await db.$transaction(async (tx) => {
        const now = new Date();

        // Handle switching channels for same hub
        if (
          existingServerHubConnection &&
          existingChannelConnection &&
          existingServerHubConnection.id !== existingChannelConnection.id
        ) {
          // Delete the 'orphan' channel entry if it exists
          await tx.connection.delete({
            where: { id: existingChannelConnection.id },
          });
          return tx.connection.update({
            where: { id: existingServerHubConnection.id },
            data: {
              channelId,
              webhookURL: primaryWebhookURL,
              webhookSecondaryURL: secondaryWebhookURL,
              connected: true,
              lastActive: now,
            },
          });
        }

        const data = {
          serverId,
          hubId,
          channelId,
          webhookURL: primaryWebhookURL,
          webhookSecondaryURL: secondaryWebhookURL,
          connected: true,
          lastActive: now,
        };

        if (existingServerHubConnection) {
          return tx.connection.update({
            where: { id: existingServerHubConnection.id },
            data,
          });
        }

        if (existingChannelConnection) {
          return tx.connection.update({
            where: { id: existingChannelConnection.id },
            data,
          });
        }

        return tx.connection.create({ data });
      });

      // Fire and forget sync (don't await to speed up response)
      syncHubConnectionCount(hubId).catch(console.error);

      return { connection };
    }),

  disconnectServerFromHub: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { connectionId } = input;
      const userId = ctx.session.user.id;

      const connection = await db.connection.findUnique({
        where: { id: connectionId },
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

      if (!connection)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Not found',
        });

      if (
        connection.hub.ownerId !== userId &&
        connection.hub.moderators.length === 0
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No permission',
        });
      }

      const updatedConnection = await db.connection.update({
        where: { id: connectionId },
        data: { connected: false },
      });

      syncHubConnectionCount(connection.hub.id).catch(console.error);

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
      const rest = getDiscordClient();

      // 1. Check Redis for Cached Result
      const cacheKey = `logs:resolve:${userId}:${JSON.stringify(configs)}`;
      const redis = await getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as ResolvedLogConfigs;

      // 2. Resolve User Access (Manageable Guilds)
      const account = await db.account.findFirst({
        where: { userId, providerId: 'discord' },
        select: { accessToken: true },
      });

      let manageableServerIds = new Set<string>();
      if (account?.accessToken) {
        try {
          const guilds = await getCachedUserGuilds(account.accessToken, userId);
          const manageable = guilds.filter((g) => {
            const p = BigInt(g.permissions);
            return (
              g.owner ||
              (p & BigInt(0x10)) === BigInt(0x10) ||
              (p & BigInt(0x8)) === BigInt(0x8)
            );
          });
          manageableServerIds = new Set(manageable.map((g) => g.id));
        } catch (e) {
          /* ignore */
        }
      }

      // 3. Batch Fetch Channels (Parallel)
      const uniqueChannelIds = [
        ...new Set(configs.map((c) => c.channelId).filter(Boolean)),
      ] as string[];

      const channels = await Promise.all(
        uniqueChannelIds.map(async (id) => {
          try {
            return (await rest.get(Routes.channel(id))) as APIChannel;
          } catch (e) {
            return { id, error: true };
          }
        })
      );

      const channelMap = new Map();
      const serversToFetchRolesFor = new Set<string>();

      for (const c of channels) {
        if ('error' in c) continue;
        channelMap.set(c.id, c);
        if ('guild_id' in c && c.guild_id) {
          serversToFetchRolesFor.add(c.guild_id);
        }
      }

      // 4. Batch Fetch Roles (Parallel per Server)
      const guildRolesMap = new Map<string, APIRole[]>();
      await Promise.all(
        Array.from(serversToFetchRolesFor).map(async (sid) => {
          const roles = await getCachedGuildRoles(rest, sid);
          guildRolesMap.set(sid, roles);
        })
      );

      // 5. Construct Result
      const result: ResolvedLogConfigs = {};

      for (const config of configs) {
        const { logType, channelId, roleId } = config;
        let channelData = null;
        let roleData = null;
        let userHasAccess = true;
        let serverId: string | null = null;

        // Process Channel
        if (channelId) {
          const channel = channelMap.get(channelId);
          if (channel) {
            serverId = channel.guild_id;
            if (manageableServerIds.size > 0 && serverId) {
              userHasAccess = manageableServerIds.has(serverId);
            }
            channelData = {
              id: channel.id,
              name: channel.name,
              serverId: channel.guild_id,
              serverName: 'Loaded', // optimizing out extra guild name fetch
              exists: true,
            };
          } else {
            // If channelMap doesn't have it, it failed to load
            channelData = {
              id: channelId,
              name: 'Deleted/No Access',
              serverId: 'unknown',
              serverName: 'unknown',
              exists: false,
            };
            // If we can't see the channel, we assume no access for safety
            userHasAccess = false;
          }
        }

        // Process Role
        if (roleId) {
          // We need a serverId to check roles.
          // We try to get it from the channel, but if channel is missing/deleted, we can't reliably resolve the role.
          if (serverId) {
            const roles = guildRolesMap.get(serverId) || [];
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
          } else {
            // Cannot resolve role without knowing the server
            roleData = {
              id: roleId,
              name: 'Unknown Role',
              color: 0,
              exists: false,
            };
          }
        }

        result[logType] = {
          channel: channelData,
          role: roleData,
          userHasAccess,
        };
      }

      // Cache the final complex object
      await redis.setex(
        cacheKey,
        CACHE_TTL_LOG_RESOLVE,
        JSON.stringify(result)
      );

      return result;
    }),
});
