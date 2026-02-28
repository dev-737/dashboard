import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  trustedOrigins: [
    'http://localhost:3000',
    'https://interchat.dev',
    'https://beta.interchat.dev',
  ],
  socialProviders: {
    discord: {
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      scope: ['guilds', 'identify'],
      getUserInfo: async (token) => {
        try {
          const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          });

          if (!response.ok) {
            console.error(`Status: ${response.status} ${response.statusText}`);
            console.error(await response.text());
            throw new Error('Failed to fetch user info from Discord');
          }

          const profile = await response.json();

          try {
            const existingUser = await db.user.findUnique({
              where: { id: profile.id },
              include: { accounts: true },
            });

            if (existingUser) {
              const hasDiscordAccount = existingUser.accounts.some(
                (acc) =>
                  acc.providerId === 'discord' && acc.accountId === profile.id
              );

              if (!hasDiscordAccount) {
                console.log(
                  `Linking Discord account for existing user ${existingUser.id}`
                );
                await db.account.create({
                  data: {
                    id: crypto.randomUUID(),
                    userId: existingUser.id,
                    providerId: 'discord',
                    accountId: profile.id,
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                });
              }
            }
          } catch (err) {
            console.error('Error checking/linking existing user:', err);
          }

          return {
            user: {
              id: profile.id, // Discord ID
              discordId: profile.id,
              name: profile.global_name || profile.username,
              email: profile.email,
              image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
              emailVerified: profile.verified,
            },
            data: profile,
          };
        } catch (e) {
          console.error('Discord Auth Error:', e);
          throw e; // Rethrow to let Better Auth handle it, but now we have logs
        }
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          console.log(user);
          return {
            data: { ...user, id: user.discordId as string },
            forceAllowId: true,
          };
        },
        forceAllowId: true,
      },
    },
  },
});
