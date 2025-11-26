import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import { buildWhereClause, getSortedHubs } from '@/app/hubs/utils';
import { db } from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis-config';
import { protectedProcedure, publicProcedure, router } from '../../trpc';
import { createHubSchema, hubSearchSchema } from './schemas';
import { updateHubAverageRating } from './utils';

export const baseRouter = router({
  // Get a list of hubs with pagination and filtering
  getHubs: publicProcedure.input(hubSearchSchema).query(async ({ input }) => {
    const { search, tags, skip, sort } = input;

    // Build the where clause for filtering
    const whereClause = buildWhereClause({
      search: search || undefined,
      tags: tags || undefined,
    });

    // Get sorted hubs with pagination
    const { hubs, totalCount } = await getSortedHubs(whereClause, skip, sort);

    return {
      hubs,
      pagination: {
        totalItems: totalCount,
        hasMore: skip + hubs.length < totalCount,
      },
    };
  }),

  // Search for hubs by term
  searchHubs: publicProcedure
    .input(z.object({ term: z.string().min(1) }))
    .query(async ({ input }) => {
      const { term } = input;

      if (!term) {
        return { hubs: [] };
      }

      const hubs = await db.hub.findMany({
        where: {
          private: false,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { shortDescription: { contains: term, mode: 'insensitive' } },
            { tags: { some: { name: term } } },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          shortDescription: true,
          iconUrl: true,
          bannerUrl: true,
          private: true,
          locked: true,
          nsfw: true,
          verified: true,
          partnered: true,
          language: true,
          region: true,
          createdAt: true,
          lastActive: true,
          connections: {
            where: { connected: true },
            orderBy: { lastActive: 'desc' },
            select: {
              id: true,
              serverId: true,
              connected: true,
              createdAt: true,
              lastActive: true,
              server: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          upvotes: {
            select: {
              id: true,
              userId: true,
              createdAt: true,
            },
          },
          moderators: {
            select: {
              id: true,
              userId: true,
              role: true,

              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              connections: { where: { connected: true } },
              upvotes: true,
              reviews: true,
            },
          },
        },
        take: 12,
      });

      return { hubs };
    }),

  // Get hub reviews
  getHubReviews: publicProcedure
    .input(z.object({ hubId: z.string() }))
    .query(async ({ input }) => {
      const { hubId } = input;

      // Check if the hub exists
      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: { id: true },
      });

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      const reviews = await db.hubReview.findMany({
        where: { hubId },
        select: {
          id: true,
          rating: true,
          text: true,
          createdAt: true,
          updatedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reviews;
    }),

  // Create a hub review
  createHubReview: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        rating: z.number().min(1).max(5),
        text: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { hubId, rating, text } = input;
      const userId = ctx.session.user.id;

      // Check if the hub exists
      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: { id: true },
      });

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      // Check if the user has already reviewed this hub
      const existingReview = await db.hubReview.findUnique({
        where: {
          hubId_userId: {
            hubId,
            userId,
          },
        },
      });

      if (existingReview) {
        const updatedReview = await db.hubReview.update({
          where: {
            hubId_userId: {
              hubId,
              userId,
            },
          },
          data: {
            rating,
            text,
          },
          select: {
            id: true,
            rating: true,
            text: true,
            createdAt: true,
            updatedAt: true,

            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });

        await updateHubAverageRating(hubId);
        return updatedReview;
      }
      const newReview = await db.hubReview.create({
        data: {
          hubId,
          userId,
          rating,
          text,
        },
        select: {
          id: true,
          rating: true,
          text: true,
          createdAt: true,
          updatedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      await updateHubAverageRating(hubId);
      return newReview;
    }),

  // Delete a hub review (only by the author)
  deleteHubReview: protectedProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const review = await db.hubReview.findUnique({
        where: { id: input.reviewId },
        select: { id: true, userId: true, hubId: true },
      });

      if (!review) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Review not found' });
      }

      if (review.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
      }

      await db.hubReview.delete({ where: { id: input.reviewId } });
      await updateHubAverageRating(review.hubId);
      return { success: true } as const;
    }),

  // Get a single hub by ID
  getHub: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const hub = await db.hub.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          description: true,
          shortDescription: true,
          ownerId: true,
          iconUrl: true,
          bannerUrl: true,
          private: true,
          locked: true,
          nsfw: true,
          verified: true,
          partnered: true,
          language: true,
          region: true,
          createdAt: true,
          lastActive: true,
          rules: true,
          tags: { select: { name: true } },
          connections: {
            where: { connected: true },
            orderBy: { lastActive: 'desc' },
            select: {
              id: true,
              serverId: true,
              connected: true,
              createdAt: true,
              lastActive: true,
              server: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          upvotes: {
            select: {
              id: true,
              userId: true,
              createdAt: true,
            },
          },
          moderators: {
            select: {
              id: true,
              userId: true,
              role: true,

              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              connections: { where: { connected: true } },
              upvotes: true,
              reviews: true,
            },
          },
        },
      });

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      return hub;
    }),

  // Create a new hub
  createHub: protectedProcedure
    .input(createHubSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        description,
        shortDescription,
        private: isPrivate,
        rules,
      } = input;

      // Check if the hub name is already taken (case insensitive)
      const existingHub = await db.hub.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
        },
      });

      if (existingHub) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Hub name already taken',
        });
      }

      // Create the hub
      const hub = await db.hub.create({
        data: {
          name,
          description,
          shortDescription,
          ownerId: ctx.session.user.id,
          iconUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}`,
          private: isPrivate,
          settings: 0,
          rules: rules || [],
        },
        select: {
          id: true,
          name: true,
          description: true,
          shortDescription: true,
          ownerId: true,
          iconUrl: true,
          bannerUrl: true,
          private: true,
          locked: true,
          settings: true,
          createdAt: true,
          updatedAt: true,
          rules: true,

          moderators: {
            select: {
              id: true,
              userId: true,
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return hub;
    }),

  // Upvote a hub
  upvoteHub: protectedProcedure
    .input(z.object({ hubId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { hubId } = input;
      const userId = ctx.session.user.id;

      // Check if the hub exists
      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: { id: true },
      });

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      // Check if the user has already upvoted this hub
      const existingUpvote = await db.hubUpvote.findUnique({
        where: {
          hubId_userId: {
            hubId,
            userId,
          },
        },
      });

      if (existingUpvote) {
        // Remove the upvote
        await db.hubUpvote.delete({
          where: {
            hubId_userId: {
              hubId,
              userId,
            },
          },
        });

        return { upvoted: false };
      }
      // Add the upvote
      await db.hubUpvote.create({
        data: {
          hubId,
          userId,
        },
      });

      return { upvoted: true };
    }),

  // Get hub recommendations
  getRecommendations: publicProcedure
    .input(
      z.object({
        type: z
          .enum(['personalized', 'trending', 'activity', 'similar', 'friends'])
          .default('personalized'),
        limit: z.number().min(1).max(50).default(8),
        currentHubId: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { type, limit, currentHubId, tags } = input;
      const userId = ctx.session?.user?.id;

      const cacheKey = `hub:recommendations:${type}:${limit}:${currentHubId || 'none'}:${(tags || []).sort().join(',')}:${userId || 'anon'}`;

      try {
        const redis = await getRedisClient();
        if (redis) {
          const cached = await redis.get(cacheKey);
          if (cached) {
            console.log(`Cache hit for recommendations: ${cacheKey}`);
            return JSON.parse(cached);
          }
        }
      } catch (error) {
        console.error('Redis cache read error for recommendations:', error);
      }

      const baseWhere = {
        private: false,
        locked: false,
        connections: {
          some: { connected: true },
        },
        // Exclude current hub if specified
        ...(currentHubId && { id: { not: currentHubId } }),
      };

      // biome-ignore lint/suspicious/noImplicitAnyLet: Fookin complex Prisma query type
      let hubs;
      // biome-ignore lint/suspicious/noImplicitAnyLet: Dynamic metadata object
      let metadata;

      switch (type) {
        case 'similar': {
          // Find hubs with similar tags
          if (tags && tags.length > 0) {
            hubs = await db.hub.findMany({
              where: {
                ...baseWhere,
                tags: {
                  some: {
                    name: { in: tags },
                  },
                },
              },
              select: {
                id: true,
                name: true,
                description: true,
                shortDescription: true,
                iconUrl: true,
                bannerUrl: true,
                nsfw: true,
                verified: true,
                partnered: true,
                activityLevel: true,
                createdAt: true,
                lastActive: true,
                tags: { select: { name: true } },
                _count: {
                  select: {
                    connections: { where: { connected: true } },
                    upvotes: true,
                    reviews: true,
                  },
                },
              },
              orderBy: [
                // Prioritize hubs with more matching tags
                { connections: { _count: 'desc' } },
                { upvotes: { _count: 'desc' } },
                { lastActive: 'desc' },
              ],
              take: limit * 2, // Get more to filter by tag similarity
            });

            // clculate tag similarity and sort by it
            hubs = hubs
              .map((hub) => ({
                ...hub,
                tagSimilarity: hub.tags.filter((tag) => tags.includes(tag.name))
                  .length,
              }))
              .sort((a, b) => b.tagSimilarity - a.tagSimilarity)
              .slice(0, limit);
          } else {
            // general recommendations if no tags provided
            hubs = await db.hub.findMany({
              where: baseWhere,
              select: {
                id: true,
                name: true,
                description: true,
                shortDescription: true,
                iconUrl: true,
                bannerUrl: true,
                nsfw: true,
                verified: true,
                partnered: true,
                activityLevel: true,
                createdAt: true,
                lastActive: true,
                tags: { select: { name: true } },
                _count: {
                  select: {
                    connections: { where: { connected: true } },
                    upvotes: true,
                    reviews: true,
                  },
                },
              },
              orderBy: [
                { connections: { _count: 'desc' } },
                { upvotes: { _count: 'desc' } },
              ],
              take: limit,
            });
          }

          metadata = {
            type: 'similar',
            count: hubs.length,
            generatedAt: new Date().toISOString(),
            userContext: { authenticated: !!userId, userId },
          };
          break;
        }

        case 'trending': {
          // Get hubs with most upvotes in the last 7 days
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          hubs = await db.hub.findMany({
            where: {
              ...baseWhere,
              upvotes: {
                some: {
                  createdAt: { gte: sevenDaysAgo },
                },
              },
            },
            select: {
              id: true,
              name: true,
              description: true,
              shortDescription: true,
              iconUrl: true,
              bannerUrl: true,
              nsfw: true,
              verified: true,
              partnered: true,
              activityLevel: true,
              createdAt: true,
              lastActive: true,
              tags: { select: { name: true } },
              _count: {
                select: {
                  connections: { where: { connected: true } },
                  upvotes: true,
                  reviews: true,
                  },
              },
              upvotes: {
                where: { createdAt: { gte: sevenDaysAgo } },
                select: { id: true, createdAt: true },
              },
            },
            orderBy: [{ upvotes: { _count: 'desc' } }, { lastActive: 'desc' }],
            take: limit,
          });
          metadata = {
            type: 'trending',
            count: hubs.length,
            generatedAt: new Date().toISOString(),
            userContext: { authenticated: !!userId, userId },
          };
          break;
        }

        case 'activity':
          // Get most recently active hubs
          hubs = await db.hub.findMany({
            where: baseWhere,
            select: {
              id: true,
              name: true,
              description: true,
              shortDescription: true,
              iconUrl: true,
              bannerUrl: true,
              nsfw: true,
              verified: true,
              partnered: true,
              activityLevel: true,
              createdAt: true,
              lastActive: true,
              tags: { select: { name: true } },
              _count: {
                select: {
                  connections: { where: { connected: true } },
                  upvotes: true,
                  reviews: true,
                },
              },
            },
            orderBy: { lastActive: 'desc' },
            take: limit,
          });
          metadata = {
            type: 'activity',
            count: hubs.length,
            generatedAt: new Date().toISOString(),
            userContext: { authenticated: !!userId, userId },
          };
          break;
        default:
          // For now, fallback to general recommendations (most connections + upvotes)
          hubs = await db.hub.findMany({
            where: baseWhere,
            select: {
              id: true,
              name: true,
              description: true,
              shortDescription: true,
              iconUrl: true,
              bannerUrl: true,
              nsfw: true,
              verified: true,
              partnered: true,
              activityLevel: true,
              createdAt: true,
              lastActive: true,
              tags: { select: { name: true } },
              _count: {
                select: {
                  connections: { where: { connected: true } },
                  upvotes: true,
                  reviews: true,
                },
              },
            },
            orderBy: [
              { connections: { _count: 'desc' } },
              { upvotes: { _count: 'desc' } },
              { lastActive: 'desc' },
            ],
            take: limit,
          });
          metadata = {
            type,
            count: hubs.length,
            generatedAt: new Date().toISOString(),
            userContext: { authenticated: !!userId, userId },
          };
          break;
      }

      // Transform to recommendation format with enhanced metrics
      const recommendations = hubs.map((hub) => {
        const connectionCount = hub._count.connections;
        const upvoteCount = hub._count.upvotes;
        const reviewCount = hub._count.reviews;

        // Calculate engagement metrics
        const isHighActivity = hub.activityLevel === 'HIGH';
        const isGrowing = type === 'trending' && upvoteCount > 0;
        const isQuality = reviewCount > 0 || upvoteCount > 5;
        const isTrusted = hub.verified || hub.partnered;

        // Calculate recommendation score
        let score = 0;
        score += connectionCount * 10; // Base score from connections
        score += upvoteCount * 5; // Upvotes boost
        score += reviewCount * 3; // Review boost
        if (isHighActivity) score += 20;
        if (isGrowing) score += 15;
        if (isQuality) score += 10;
        if (isTrusted) score += 25;

        if (type === 'similar' && tags && 'tagSimilarity' in hub) {
          score += (hub.tagSimilarity as number) * 30;
        }

        let reason = 'Popular community';
        if (type === 'similar') {
          const matchingTags = hub.tags.filter((tag) =>
            tags?.includes(tag.name)
          ).length;
          reason =
            matchingTags > 1
              ? `${matchingTags} shared interests`
              : 'Similar community';
        } else if (isTrusted) {
          reason = 'Verified community';
        } else if (isGrowing) {
          reason = 'Trending community';
        } else if (isHighActivity) {
          reason = 'Very active community';
        } else if (connectionCount > 10) {
          reason = 'Large community';
        }

        return {
          hubId: hub.id,
          hub: {
            ...hub,
            activityLevel: hub.activityLevel,
            connectionCount,
            recentMessageCount: 0, // TODO: Would need message tracking
            upvoteCount,
          },
          score,
          reason,
          engagementMetrics: {
            isHighActivity,
            isGrowing,
            isQuality,
            isTrusted,
          },
        };
      });

      const result = {
        recommendations,
        metadata,
      };

      try {
        const redis = await getRedisClient();
        if (redis) {
          const cacheTime = type === 'similar' ? 3600 : 300; // 1 hour for similar, 5 minutes for others
          await redis.set(cacheKey, JSON.stringify(result), 'EX', cacheTime);
          console.log(`Cached recommendations: ${cacheKey} for ${cacheTime}s`);
        }
      } catch (error) {
        console.error('Redis cache write error for recommendations:', error);
      }

      return result;
    }),

  validateName: publicProcedure
    .input(z.object({ name: z.string().min(3).max(32) }))
    .query(async ({ input }) => {
      const { name } = input;

      const existingHub = await db.hub.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        select: { id: true },
      });

      return {
        available: !existingHub,
        name,
      };
    }),
});
