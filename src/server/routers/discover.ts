import { z } from 'zod/v4';
import { DiscoverSortSchema, getDiscoverHubs } from '@/lib/discover/query';
import { publicProcedure, router } from '../trpc';

const discoverInput = z.object({
  q: z.string().optional(),
  tags: z.array(z.string()).optional(),
  features: z
    .object({
      verified: z.boolean().optional(),
      partnered: z.boolean().optional(),
      nsfw: z.boolean().optional(),
    })
    .optional(),
  language: z.string().optional(),
  region: z.string().optional(),
  activity: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH'])).optional(),
  memberCount: z
    .object({
      min: z.number().int().min(0).optional(),
      max: z.number().int().min(0).optional(),
    })
    .optional(),
  minRating: z.number().min(0).max(5).optional(),
  showFeaturedOnly: z.boolean().optional(),
  sort: DiscoverSortSchema.optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(60).optional(),
});

export const discoverRouter = router({
  list: publicProcedure.input(discoverInput).query(async ({ input, ctx }) => {
    const userId = ctx.session?.user?.id;
    return getDiscoverHubs(
      {
        q: input.q,
        tags: input.tags,
        features: input.features,
        language: input.language,
        region: input.region,
        activity: input.activity,
        memberCount: input.memberCount,
        minRating: input.minRating,
        showFeaturedOnly: input.showFeaturedOnly,
        sort: input.sort ?? 'trending',
        page: input.page ?? 1,
        pageSize: input.pageSize ?? 24,
      },
      userId
    );
  }),
});
