/**
 * User router for tRPC
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import type { Prisma } from '@/lib/generated/prisma/client/client';
import { db } from '@/lib/prisma';
import { protectedProcedure, router } from '../trpc';

// Discord guild interface
interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

// Define supported languages enum
const supportedLanguages = ['en', 'hi', 'es', 'pt', 'zh', 'ru', 'et'] as const;

export const userRouter = router({
  // Search for users
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().optional().prefault(10),
      })
    )
    .query(async ({ input }) => {
      const { query, limit } = input;

      if (!query) {
        return { users: [] };
      }

      // Search for users by name
      const users = await db.user.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
        take: limit,
      });

      return { users };
    }),

  // Get accessible hubs for the current user
  getAccessibleHubs: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get hubs where user is owner
    const ownedHubs = await db.hub.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        iconUrl: true,
      },
    });

    // Get hubs where user is a moderator or manager
    const moderatedHubs = await db.hubModerator.findMany({
      where: { userId },
      select: {
        role: true,
        hub: {
          select: {
            id: true,
            name: true,
            iconUrl: true,
          },
        },
      },
    });

    // Format the response
    const accessibleHubs = [
      ...ownedHubs.map((hub) => ({
        ...hub,
        role: 'OWNER' as const,
      })),
      ...moderatedHubs.map((mod) => ({
        ...mod.hub,
        role: mod.role,
      })),
    ];

    return { hubs: accessibleHubs };
  }),

  // Get manageable Discord servers for the current user
  getManageableServers: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get the user's Discord account to get the access token
    const account = await db.account.findFirst({
      where: {
        userId,
        provider: 'discord',
      },
      select: {
        access_token: true,
      },
    });

    if (!account || !account.access_token) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Discord account not connected',
      });
    }

    const accessToken = account.access_token;
    const DISCORD_API = 'https://discord.com/api/v10';

    try {
      // Fetch the user's guilds from Discord
      const userGuildsResponse = await fetch(
        `${DISCORD_API}/users/@me/guilds`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!userGuildsResponse.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch Discord servers',
        });
      }

      const userGuilds = (await userGuildsResponse.json()) as DiscordGuild[];

      // Filter guilds where the user has manage permissions
      const manageableGuilds = userGuilds.filter((guild: DiscordGuild) => {
        const permissions = BigInt(guild.permissions);
        return (
          guild.owner ||
          // Check for MANAGE_CHANNELS (0x10) or ADMINISTRATOR (0x8) permissions
          (permissions & BigInt(0x10)) === BigInt(0x10) ||
          (permissions & BigInt(0x8)) === BigInt(0x8)
        );
      });

      // Check which servers have the bot present (exist in ServerData)
      const manageableGuildIds = manageableGuilds.map((g) => g.id);
      const serversWithBot = await db.serverData.findMany({
        where: { id: { in: manageableGuildIds } },
        select: { id: true },
      });

      const botServerIds = new Set(serversWithBot.map((s) => s.id));

      // Filter to only servers where bot is present
      const serversWithBotPresent = manageableGuilds.filter((guild) =>
        botServerIds.has(guild.id)
      );

      // Format the response
      const servers = serversWithBotPresent.map((guild: DiscordGuild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
          : null,
        owner: guild.owner,
      }));

      return { servers };
    } catch (error) {
      console.error('Error fetching manageable servers:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch manageable servers',
      });
    }
  }),

  // Get user settings
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mentionOnReply: true,
        locale: true,
        showNsfwHubs: true,
        email: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return { user };
  }),

  // Update user settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        mentionOnReply: z.boolean().optional(),
        locale: z.enum(supportedLanguages).optional(),
        showNsfwHubs: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const { mentionOnReply, locale, showNsfwHubs } = input;

      // Build update object with only provided fields
      const updateData: Prisma.UserUpdateInput = {};
      if (mentionOnReply !== undefined)
        updateData.mentionOnReply = mentionOnReply;
      if (locale !== undefined) updateData.locale = locale;
      if (showNsfwHubs !== undefined) updateData.showNsfwHubs = showNsfwHubs;

      // Update user settings in database
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          mentionOnReply: true,
          locale: true,
          showNsfwHubs: true,
        },
      });

      return {
        user: updatedUser,
        message: 'Settings updated successfully',
      };
    }),
});
