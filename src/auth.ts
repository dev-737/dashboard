import { db } from '@/lib/prisma';
import type { Adapter, AdapterAccount } from '@auth/core/adapters';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';

const customAdapter = {
  ...PrismaAdapter(db),
  createUser: async (userData) => {
    // The Discord ID should be available in the profile data
    if (!userData.id) {
      console.error('No Discord ID provided in data:', userData);
      throw new Error('No Discord ID provided');
    }

    return await db.user.upsert({
      where: { id: userData.id },
      update: {
        name: userData.name,
        image: userData.image,
        email: userData.email, // Store verified Discord email
      },
      create: {
        id: userData.id,
        name: userData.name,
        image: userData.image,
        email: userData.email, // Store verified Discord email
      },
    });
  },
  linkAccount: async (account) => {
    // Ensure the user exists before linking the account
    const user = await db.user.findUnique({
      where: { id: account.providerAccountId },
    });

    if (!user) {
      console.error('User not found for account linking:', account.providerAccountId);
      throw new Error(`User not found for account linking: ${account.providerAccountId}`);
    }

    return await db.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
      update: {
        userId: user.id,
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state?.toString(),
      },
      create: {
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        userId: user.id,
        session_state: account.session_state?.toString(),
      },
    }) as unknown as AdapterAccount;
  },
} as Adapter;

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: customAdapter,
  session: {
    strategy: 'jwt',
  },
  providers: [
    Discord({
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify guilds',
          prompt: 'none',
        },
        url: 'https://discord.com/api/oauth2/authorize',
      },
      token: 'https://discord.com/api/oauth2/token',
      userinfo: 'https://discord.com/api/users/@me',
    }),
  ],

  callbacks: {
    async signIn({ account, profile, user }) {
      if (profile && account?.provider === 'discord') {
        // Add the Discord ID to the user
        user.id = account.providerAccountId;
        user.name = profile.username as string;
        user.image = profile.image_url as string;
        user.email = profile.email as string; // Capture verified Discord email

        // Link the account
        await db.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account?.provider,
              providerAccountId: account?.providerAccountId,
            },
          },
          update: {
            userId: user.id,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state?.toString(),
            type: account.type,
          },
          create: {
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            user: {
              connectOrCreate: {
                where: { id: user.id },
                create: {
                  id: user.id,
                  name: user.name,
                  image: user.image,
                  email: user.email,
                },
              },
            },
            session_state: account.session_state?.toString(),
          },
        });
      }

      return account?.provider === 'discord' && Boolean(profile);
    },

    async jwt({ token, account }) {
      // Only set ID during initial token creation
      if (account?.provider === 'discord') {
        token.id = account.providerAccountId;
        // Store additional information from the account
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      // If token already has an id (from a previous session), keep using it
      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      // Ensure token has an ID
      if (!token.id) {
        console.error('Token is missing ID and cannot be created', token);
        // Instead of throwing an error, we'll try to recover
        // by using the sub field if available, or a placeholder
        token.id = token.sub || 'unknown-user';
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user || !token.id) {
        throw new Error('Invalid session');
      }

      session.user.id = token.id as string;
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Only allow redirects to same site or relative paths
      return url.startsWith(baseUrl) || url.startsWith('/') ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login/error',
  },
  trustHost: true,
});