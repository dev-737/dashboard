import { z } from 'zod';
import { db } from '@/lib/prisma';
import { publicProcedure, router } from '../trpc';
import type { Prisma } from '@/lib/generated/prisma/client/client';

export const leaderboardRouter = router({
  getGlobal: publicProcedure
    .input(
      z.object({
        category: z.enum(['active', 'connected', 'rated', 'trending']).default('active'),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      const { category, limit } = input;

      let orderBy: Prisma.HubOrderByWithRelationInput = {};

      switch (category) {
        case 'active':
          // Sort by weekly message count
          orderBy = { weeklyMessageCount: 'desc' };
          break;
        case 'connected':
          // Sort by number of connections
          orderBy = {
            connections: {
              _count: 'desc',
            },
          };
          break;
        case 'rated':
          // Sort by average rating
          orderBy = { averageRating: 'desc' };
          break;
        case 'trending':
          // Sort by trending score from activity metrics
          orderBy = {
            activityMetrics: {
              trendingScore: 'desc',
            },
          };
          break;
      }

      const hubs = await db.hub.findMany({
        where: {
          private: false, // Only public hubs
          verified: category === 'trending' ? undefined : undefined, // Optional: require verification for some lists?
        },
        orderBy,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          iconUrl: true,
          bannerUrl: true,
          verified: true,
          averageRating: true,
          weeklyMessageCount: true,
          activityMetrics: {
            select: {
              trendingScore: true,
              memberGrowthRate: true,
            },
          },
          _count: {
            select: {
              connections: true,
              reviews: true,
              upvotes: true,
            },
          },
        },
      });

      return hubs.map((hub, index) => ({
        ...hub,
        rank: index + 1,
      }));
    }),
});
