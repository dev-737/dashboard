import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  socialProviders: {
    discord: {

      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      scope: ["guilds", "identify"],
      getUserInfo: async (token) => {
        const response = await fetch("https://discord.com/api/users/@me", {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        });
        const profile = await response.json();
        console.log(profile);
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
      },
      mapProfileToUser: (profile) => {
        console.log(profile);
        return {
          id: profile.id,
        };
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          console.log(user);
          return {
            data: {...user, id: user.discordId as string},
            forceAllowId: true,
          };
        },
        forceAllowId: true,
      },
    },
  },
});
