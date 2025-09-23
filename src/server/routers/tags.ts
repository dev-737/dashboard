/**
 * Tags router for tRPC
 */

import { z } from 'zod/v4';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';
import { tagManagementService } from '@/lib/services/TagManagementService';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const tagsRouter = router({
  // Get tags: search, popular, or by category
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional().prefault(20),
        category: z.string().optional(),
        popular: z.boolean().optional().prefault(false),
      })
    )
    .query(async ({ input }) => {
      const { search, limit = 20, category, popular = false } = input;

      if (search && search.length >= 2) {
        const tags = await tagManagementService.searchTags(search, limit);
        return {
          tags,
          metadata: {
            count: tags.length,
            query: search,
            category,
            popular,
            limit,
          },
        };
      }

      if (popular) {
        const tags = await tagManagementService.getPopularTags(limit);
        return {
          tags,
          metadata: {
            count: tags.length,
            query: search,
            category,
            popular,
            limit,
          },
        };
      }

      if (category) {
        const categorized = await tagManagementService.getTagsByCategory();
        const tags = categorized[category] || [];
        return {
          tags,
          metadata: {
            count: tags.length,
            query: search,
            category,
            popular,
            limit,
          },
        };
      }

      const tags = await tagManagementService.getPopularTags(limit);
      return {
        tags,
        metadata: {
          count: tags.length,
          query: search,
          category,
          popular,
          limit,
        },
      };
    }),

  // Add or remove tags for a hub
  mutate: protectedProcedure
    .input(
      z.object({
        hubId: z.string(),
        tags: z.array(z.string()).min(1).max(5),
        action: z.enum(['add', 'remove']).optional().prefault('add'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { hubId, tags, action = 'add' } = input;

      // Permission: require at least MODERATOR on the hub
      const userId = ctx.session.user.id;
      const permission = await getUserHubPermission(userId, hubId);
      if (permission < PermissionLevel.MODERATOR) {
        throw new Error('Forbidden');
      }

      const valid = tags.filter(
        (t) =>
          typeof t === 'string' && t.trim().length > 0 && t.trim().length <= 30
      );
      if (valid.length === 0) {
        throw new Error('No valid tags provided');
      }

      if (action === 'add') {
        await tagManagementService.addTagsToHub(hubId, valid);
      } else {
        await tagManagementService.removeTagsFromHub(hubId, valid);
      }

      return {
        success: true,
        message: `Successfully ${action}ed ${valid.length} tags`,
        tags: valid,
      };
    }),

  // Get tags organized by category
  categories: publicProcedure.query(async () => {
    const categorized = await tagManagementService.getTagsByCategory();
    const totalCategories = Object.keys(categorized).length;
    const totalTags = Object.values(categorized).reduce(
      (sum, tags) => sum + tags.length,
      0
    );
    return {
      categories: categorized,
      metadata: { totalCategories, totalTags },
    };
  }),

  // Generate tag suggestions based on content
  suggest: publicProcedure
    .input(
      z
        .object({
          hubName: z.string().optional(),
          hubDescription: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const hubName = input?.hubName;
      const hubDescription = input?.hubDescription;
      const suggestions = await tagManagementService.generateTagSuggestions(
        hubName,
        hubDescription
      );
      return {
        suggestions,
        metadata: {
          count: suggestions.length,
          hubName,
          hubDescription: hubDescription ? 'provided' : 'not provided',
        },
      };
    }),

  // Initialize official tags (admin-only)
  initialize: protectedProcedure.mutation(async ({ ctx }) => {
    // Very light admin guard: allow if ADMIN_USER_IDS env is unset (dev) or user is listed
    const adminIds = (process.env.ADMIN_USER_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (adminIds.length > 0 && !adminIds.includes(ctx.session.user.id)) {
      throw new Error('Forbidden');
    }

    await tagManagementService.initializeOfficialTags();
    return { success: true, message: 'Official tags initialized successfully' };
  }),
});
