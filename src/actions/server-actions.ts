'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import type {
  Connection,
  Hub,
  ServerBlacklist,
  ServerData,
} from '@/lib/generated/prisma/client/client';
import { cache as perfCache } from '@/lib/performance-cache';
import { db } from '@/lib/prisma';

// Discord API endpoints
const DISCORD_API = 'https://discord.com/api/v10';

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
  approximate_member_count?: number;
  approximate_presence_count?: number;
  verification_level?: number;
}

type ServerDataWithDiscordGuild = ServerData & DiscordGuild;

/** A ServerBlocklist entry with the blocked user and server names loaded from the DB. */
export interface EnrichedBlocklistEntry {
  id: string;
  serverId: string;
  blockedUserId: string | null;
  blockedServerId: string | null;
  reason: string | null;
  createdAt: Date;
  /** Populated when blockedUserId is set */
  User: { id: string; name: string | null; image: string | null } | null;
  /** Populated when blockedServerId is set */
  blockedServer: { id: string; name: string; iconUrl: string | null } | null;
}

export interface ServerDataWithConnections extends ServerDataWithDiscordGuild {
  botAdded: boolean;
  connections: (Connection & {
    hub: Hub;
    server: ServerData | null;
  })[];
  serverBlacklists?: ServerBlacklist[];
  serverBlocklists?: EnrichedBlocklistEntry[];
}

export async function getServers(
  session: { user: { id: string } } | null
): Promise<
  | { error: string; status: number }
  | {
      data: ServerDataWithConnections[];
      status: number;
    }
> {
  try {
    if (!session?.user.id) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Get the user's Discord account to get the access token
    const account = await db.account.findFirst({
      where: {
        providerId: 'discord',
        userId: session.user.id,
      },
    });

    if (!account) {
      return {
        error: 'Discord account not found. Please log out and log back in.',
        status: 400,
      };
    }

    if (!account.accessToken) {
      return {
        error: 'Missing access token. Please log out and log back in.',
        status: 400,
      };
    }

    // Early cache hit: if we have recent guilds, skip Discord/API entirely
    try {
      const cacheKeyEarly = `discord:guilds:${session.user.id}`;
      const cachedGuildsEarly =
        await perfCache.get<DiscordGuild[]>(cacheKeyEarly);
      if (cachedGuildsEarly && Array.isArray(cachedGuildsEarly)) {
        // Filter guilds where the user has the Manage Channels permission (0x10)
        const adminGuilds = cachedGuildsEarly.filter((guild: DiscordGuild) => {
          const permissions = BigInt(guild.permissions);
          return guild.owner || (permissions & BigInt(0x10)) === BigInt(0x10);
        });

        const serverIds = adminGuilds.map((g) => g.id);
        const dbServers = await db.serverData.findMany({
          where: { id: { in: serverIds } },
          include: { connections: { include: { hub: true, server: true } } },
        });

        const servers: ServerDataWithConnections[] = adminGuilds.map(
          (guild: DiscordGuild) => {
            const dbServer = dbServers.find((server) => server.id === guild.id);
            const createdTimestamp = Number(
              (BigInt(guild.id) >> BigInt(22)) + BigInt(1420070400000)
            );
            const createdAt = new Date(createdTimestamp);
            const botAdded = !!dbServer;
            if (!dbServer) {
              const serverData = {
                premiumStatus: false,
                createdAt: createdAt,
                updatedAt: new Date(),
                inviteCode: null,
                messageCount: 0,
                callCount: 0,
                lastMessageAt: new Date(),
                iconUrl: null,
                botAdded,
                connections: [],
              };
              return { ...guild, ...serverData } as ServerDataWithConnections;
            }
            return {
              ...dbServer,
              ...guild,
              createdAt,
              botAdded,
            };
          }
        );

        return { data: servers, status: 200 };
      }
    } catch (e) {
      // Non-fatal: fall through to normal flow on cache errors
      console.warn(
        'Guilds cache early path failed, continuing without cache:',
        e
      );
    }

    // Check if the token is expired and refresh if needed
    let accessToken = account.accessToken;

    if (
      account.accessTokenExpiresAt &&
      account.accessTokenExpiresAt.getTime() < Date.now() &&
      account.refreshToken
    ) {
      try {
        // Token is expired, refresh it
        const response = await fetch('https://discord.com/api/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            // biome-ignore lint/style/noNonNullAssertion: Environment variables are validated at build time
            client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
            // biome-ignore lint/style/noNonNullAssertion: Environment variables are validated at build time
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: account.refreshToken,
          }),
        });
        const tokens = await response.json();

        if (!response.ok) {
          console.error('Discord token refresh failed:', tokens);
          return { error: 'Failed to refresh token', status: 401 };
        }

        // Update the account with the new tokens
        await db.account.update({
          where: {
            id: account.id,
          },
          data: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? account.refreshToken,
            accessTokenExpiresAt: tokens.expires_in
              ? new Date(Date.now() + tokens.expires_in * 1000)
              : null,
          },
        });

        // Use the new access token
        accessToken = tokens.access_token;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return { error: 'Failed to refresh Discord token', status: 401 };
      }
    }

    // Try cache first to avoid unnecessary Discord API calls
    const cacheKey = `discord:guilds:${session.user.id}`;
    const cachedGuilds = await perfCache.get<DiscordGuild[]>(cacheKey);
    let userGuilds: DiscordGuild[];

    if (cachedGuilds && Array.isArray(cachedGuilds)) {
      userGuilds = cachedGuilds;
    } else {
      // Fetch the user's guilds from Discord with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        const userGuildsResponse = await fetch(
          `${DISCORD_API}/users/@me/guilds`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!userGuildsResponse.ok) {
          return {
            error:
              userGuildsResponse.status === 429
                ? 'Discord API rate limit exceeded. Please try again later.'
                : 'Failed to fetch Discord servers',
            status: userGuildsResponse.status,
          };
        }

        userGuilds = (await userGuildsResponse.json()) as DiscordGuild[];

        // Cache the guilds for a short duration (2 minutes Redis, 30s memory)
        void perfCache.set(cacheKey, userGuilds, { ttl: 120, memoryTtl: 30 });
      } catch (error) {
        clearTimeout(timeoutId);

        // Check if it's a timeout/abort error
        const isTimeoutError =
          error instanceof Error &&
          (error.name === 'AbortError' ||
            error.message.includes('aborted') ||
            error.message.includes('timeout'));

        const errorMessage = isTimeoutError
          ? 'Discord API request timed out. Please try again.'
          : error instanceof Error
            ? error.message
            : 'Failed to fetch Discord servers';

        return {
          error: errorMessage,
          status: isTimeoutError ? 408 : 500,
        };
      }
    }

    // Filter guilds where the user has the Manage Channels permission (0x10)
    const adminGuilds = userGuilds.filter((guild: DiscordGuild) => {
      const permissions = BigInt(guild.permissions);
      return guild.owner || (permissions & BigInt(0x10)) === BigInt(0x10);
    });

    // Get all server IDs to check which ones are in our database
    const serverIds = adminGuilds.map((guild: DiscordGuild) => guild.id);

    // Get servers from our database
    const dbServers = await db.serverData.findMany({
      where: {
        id: { in: serverIds },
      },
      include: {
        connections: { include: { hub: true, server: true } },
      },
    });

    // Check serverData model to determine if bot is added
    // If a server exists in our database, the bot is added

    // Map Discord guilds to our server data format
    const servers: ServerDataWithConnections[] = adminGuilds.map(
      (guild: DiscordGuild) => {
        // Find the corresponding server in our database
        const dbServer = dbServers.find((server) => server.id === guild.id);

        // Calculate creation date from Discord snowflake
        const createdTimestamp = Number(
          (BigInt(guild.id) >> BigInt(22)) + BigInt(1420070400000)
        );
        const createdAt = new Date(createdTimestamp);

        // If server exists in database, bot is added
        const botAdded = !!dbServer;

        // If the server doesn't exist in our database, create a minimal object
        if (!dbServer) {
          const serverData = {
            // Basic server data
            premiumStatus: false,
            createdAt: createdAt,
            updatedAt: new Date(),
            inviteCode: null,
            messageCount: 0,
            callCount: 0,
            lastMessageAt: new Date(),
            iconUrl: null,
            // Discord guild data
            botAdded, // Use database presence to determine if bot is added
            connections: [],
          };

          // Combine with guild data (which includes id and name)
          return { ...guild, ...serverData } as ServerDataWithConnections;
        }

        return {
          ...dbServer,
          ...guild,
          createdAt,
          botAdded, // Use database presence to determine if bot is added
        };
      }
    );

    return { data: servers, status: 200 };
  } catch {
    return { error: 'Failed to fetch servers', status: 500 };
  }
}

export async function getServerDetails(
  serverId: string
): Promise<
  | { error: string; status: number }
  | { data: ServerDataWithConnections; status: number }
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: 'Unauthorized', status: 401 };
    }

    const userId = session.user.id;

    const cacheKey = `discord:guilds:${userId}`;
    const cachedGuilds = await perfCache.get<DiscordGuild[]>(cacheKey);

    let userGuilds: DiscordGuild[] | null = null;

    if (cachedGuilds && Array.isArray(cachedGuilds)) {
      userGuilds = cachedGuilds;
    } else {
      const serversResult = await getServers(session);
      if ('error' in serversResult) {
        return { error: serversResult.error, status: serversResult.status };
      }

      userGuilds = serversResult.data.map((server) => ({
        id: server.id,
        name: server.name,
        icon: server.icon || null,
        owner: server.owner || false,
        permissions: server.permissions || '0',
        features: server.features || [],
        verification_level: server.verification_level || 0,
      }));

      await perfCache.set(cacheKey, userGuilds, { ttl: 300 }); // 5 minutes
    }

    // Find the specific guild
    const userGuild = userGuilds.find((guild) => guild.id === serverId);

    if (!userGuild) {
      return { error: "You don't have access to this server", status: 403 };
    }

    // Check permissions
    const hasManageGuildPermission =
      userGuild.owner ||
      (BigInt(userGuild.permissions) & BigInt(0x20)) === BigInt(0x20) ||
      (BigInt(userGuild.permissions) & BigInt(0x8)) === BigInt(0x8);

    if (!hasManageGuildPermission) {
      return {
        error: "You don't have permission to manage this server",
        status: 403,
      };
    }

    // Get server from our database if it exists
    const dbServer = await db.serverData.findUnique({
      where: { id: serverId },
      include: {
        connections: { include: { hub: true, server: true } },
        serversBlockingMe: true,
        serverBlacklists: true,
        blockedServers: {
          include: {
            User: { select: { id: true, name: true, image: true } },
            blockedServer: { select: { id: true, name: true, iconUrl: true } },
          },
        },
      },
    });

    // Calculate server creation date from snowflake ID
    const createdTimestamp = Number(
      (BigInt(serverId) >> BigInt(22)) + BigInt(1420070400000)
    );
    const createdAt = new Date(createdTimestamp);

    // Combine the data
    const serverData: ServerDataWithConnections = {
      id: userGuild.id,
      name: userGuild.name,
      iconUrl: userGuild.icon
        ? `https://cdn.discordapp.com/icons/${userGuild.id}/${userGuild.icon}.png?size=128`
        : null,
      icon: userGuild.icon,
      owner: userGuild.owner,
      permissions: userGuild.permissions,
      features: userGuild.features,
      botAdded: !!dbServer, // Use database presence to determine if bot is added
      inviteCode: dbServer?.inviteCode || null,
      updatedAt: dbServer?.updatedAt || new Date(),
      messageCount: dbServer?.messageCount || 0,
      callCount: 0,

      lastMessageAt: dbServer?.lastMessageAt
        ? dbServer.lastMessageAt
        : new Date(),
      createdAt: createdAt,
      verification_level: userGuild.verification_level || 0,
      connections: dbServer?.connections || [],
      serverBlacklists: dbServer?.serverBlacklists || [],
      serverBlocklists: (dbServer?.blockedServers ||
        []) as EnrichedBlocklistEntry[],
    };

    return { data: serverData, status: 200 };
  } catch {
    return { error: 'Failed to fetch server details', status: 500 };
  }
}

export async function revokeInfraction(infractionId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: 'Unauthorized', status: 401 };
    }

    const moderatorId = session.user.id;

    // Get the infraction with hub details
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
      return { error: 'Infraction not found', status: 404 };
    }

    // Check if the user has permission to revoke infractions
    const isOwner = infraction.hub.ownerId === moderatorId;
    const isModerator = infraction.hub.moderators.length > 0;

    if (!isOwner && !isModerator) {
      return {
        error: 'You do not have permission to revoke this infraction',
        status: 403,
      };
    }

    // Check if infraction is already revoked
    if (infraction.status === 'REVOKED') {
      return { error: 'Infraction is already revoked', status: 400 };
    }

    // Revoke the infraction
    const updatedInfraction = await db.infraction.update({
      where: { id: infractionId },
      data: {
        status: 'REVOKED',
      },
    });

    return { success: true, infraction: updatedInfraction, status: 200 };
  } catch (error) {
    console.error('Error revoking infraction:', error);
    return { error: 'Failed to revoke infraction', status: 500 };
  }
}

export async function updateServerInviteCode(
  serverId: string,
  inviteCode: string | null
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Optional: check user permission again here, or assume they have access based on the UI flow.
    // It is best practice to re-verify permissions.
    const hasAccessResult = await getServerDetails(serverId);
    if ('error' in hasAccessResult) {
      return hasAccessResult;
    }

    const updatedServer = await db.serverData.update({
      where: { id: serverId },
      data: {
        inviteCode: inviteCode,
      },
    });

    return { success: true, data: updatedServer, status: 200 };
  } catch (error) {
    console.error('Error updating invite code:', error);
    return { error: 'Failed to update invite code', status: 500 };
  }
}

export async function addServerBlocklistEntry(
  serverId: string,
  blockedServerId: string | null,
  blockedUserId: string | null,
  reason: string | null
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: 'Unauthorized', status: 401 };
    }

    // Re-verify permission
    const hasAccessResult = await getServerDetails(serverId);
    if ('error' in hasAccessResult) {
      return hasAccessResult;
    }

    const newBlocklist = await db.serverBlocklist.create({
      data: {
        serverId,
        blockedServerId,
        blockedUserId,
        reason,
      },
    });

    return { success: true, data: newBlocklist, status: 200 };
  } catch (error) {
    console.error('Error adding blocklist entry:', error);
    return { error: 'Failed to add blocklist entry', status: 500 };
  }
}

export async function removeServerBlocklistEntry(
  serverId: string,
  blocklistId: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: 'Unauthorized', status: 401 };
    }

    const hasAccessResult = await getServerDetails(serverId);
    if ('error' in hasAccessResult) {
      return hasAccessResult;
    }

    await db.serverBlocklist.delete({
      where: {
        id: blocklistId,
        serverId: serverId, // Extra safety to ensure the blocklist belongs to this server
      },
    });

    return { success: true, status: 200 };
  } catch (error) {
    console.error('Error removing blocklist entry:', error);
    return { error: 'Failed to remove blocklist entry', status: 500 };
  }
}
