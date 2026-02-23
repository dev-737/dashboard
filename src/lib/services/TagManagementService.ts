import { Search01Icon } from '@hugeicons/core-free-icons';
import { db } from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis-config';

class TagManagementService {
  private readonly MAX_TAGS_PER_HUB = 5;
  private readonly CACHE_TTL = 3600; // 1 hour

  async getPopularTags(
    limit = 50
  ): Promise<
    Array<{ name: string; usageCount: number; category: string | null }>
  > {
    const cacheKey = `popular_tags:${limit}`;

    try {
      // Try to get from cache first
      const redis = await getRedisClient();
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Get tags ordered by usage count
      const tags = await db.tag.findMany({
        orderBy: [{ usageCount: 'desc' }, { name: 'asc' }],
        take: limit,
        select: {
          name: true,
          usageCount: true,
          category: true,
          isOfficial: true,
        },
      });

      // Cache the results
      if (redis) {
        await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(tags));
      }

      return tags;
    } catch (error) {
      console.error('Failed to fetch popular tags:', error);
      return this.getDefaultTags();
    }
  }

  /**
   * Search01Icon tags for autocomplete functionality with caching
   */
  async searchTags(
    query: string,
    limit = 20
  ): Promise<
    Array<{ name: string; category: string | null; isOfficial: boolean }>
  > {
    if (!query || query.length < 2) {
      return [];
    }

    const cacheKey = `search_tags:${query.toLowerCase()}:${limit}`;

    try {
      // Try to get from cache first (shorter cache time for search)
      const redis = await getRedisClient();
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const tags = await db.tag.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        orderBy: [
          { isOfficial: 'desc' }, // Official tags first
          { usageCount: 'desc' },
          { name: 'asc' },
        ],
        take: limit,
        select: {
          name: true,
          category: true,
          isOfficial: true,
        },
      });

      // Cache the search results (shorter TTL for search)
      if (redis) {
        await redis.setex(cacheKey, 900, JSON.stringify(tags)); // 15 minutes
      }

      return tags;
    } catch (error) {
      console.error('Failed to search tags:', error);
      return [];
    }
  }

  /**
   * Create or get existing tag
   */
  async createOrGetTag(
    name: string,
    category?: string
  ): Promise<{ id: string; name: string }> {
    const normalizedName = this.normalizeTagName(name);

    try {
      // Try to find existing tag
      let tag = await db.tag.findUnique({
        where: { name: normalizedName },
        select: { id: true, name: true },
      });

      if (!tag) {
        // Create new tag
        tag = await db.tag.create({
          data: {
            name: normalizedName,
            category: category || this.categorizeTag(normalizedName),
            isOfficial: false,
            usageCount: 1,
          },
          select: { id: true, name: true },
        });

        console.log(`Created new tag: ${normalizedName}`);
      } else {
        // Increment usage count
        await db.tag.update({
          where: { id: tag.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      return tag;
    } catch (error) {
      console.error('Failed to create or get tag:', error);
      throw new Error('Failed to process tag');
    }
  }

  /**
   * Add tags to a hub with validation
   */
  async addTagsToHub(hubId: string, tagNames: string[]): Promise<void> {
    if (tagNames.length > this.MAX_TAGS_PER_HUB) {
      throw new Error(`Maximum ${this.MAX_TAGS_PER_HUB} tags allowed per hub`);
    }

    try {
      // Get or create all tags
      const tags = await Promise.all(
        tagNames.map((name) => this.createOrGetTag(name))
      );

      // Connect tags to hub
      await db.hub.update({
        where: { id: hubId },
        data: {
          tags: {
            connect: tags.map((tag) => ({ id: tag.id })),
          },
        },
      });

      console.log(`Added ${tags.length} tags to hub ${hubId}`);
    } catch (error) {
      console.error('Failed to add tags to hub:', error);
      throw new Error('Failed to add tags to hub');
    }
  }

  /**
   * Remove tags from a hub
   */
  async removeTagsFromHub(hubId: string, tagNames: string[]): Promise<void> {
    try {
      // Find existing tags
      const tags = await db.tag.findMany({
        where: {
          name: { in: tagNames.map((name) => this.normalizeTagName(name)) },
        },
        select: { id: true, name: true },
      });

      if (tags.length === 0) {
        return; // No tags to remove
      }

      // Disconnect tags from hub
      await db.hub.update({
        where: { id: hubId },
        data: {
          tags: {
            disconnect: tags.map((tag) => ({ id: tag.id })),
          },
        },
      });

      console.log(`Removed ${tags.length} tags from hub ${hubId}`);
    } catch (error) {
      console.error('Failed to remove tags from hub:', error);
      throw new Error('Failed to remove tags from hub');
    }
  }

  /**
   * Get tags organized by category
   */
  async getTagsByCategory(): Promise<
    Record<string, Array<{ name: string; usageCount: number }>>
  > {
    try {
      const tags = await db.tag.findMany({
        where: {
          usageCount: { gt: 0 }, // Only include used tags
        },
        orderBy: [{ category: 'asc' }, { usageCount: 'desc' }],
        select: {
          name: true,
          category: true,
          usageCount: true,
        },
      });

      const categorized: Record<
        string,
        Array<{ name: string; usageCount: number }>
      > = {};

      tags.forEach((tag) => {
        const category = tag.category || 'Other';
        if (!categorized[category]) {
          categorized[category] = [];
        }
        categorized[category].push({
          name: tag.name,
          usageCount: tag.usageCount,
        });
      });

      return categorized;
    } catch (error) {
      console.error('Failed to get tags by category:', error);
      return {};
    }
  }

  /**
   * Generate tag suggestions based on hub content
   */
  async generateTagSuggestions(
    hubName?: string,
    hubDescription?: string
  ): Promise<string[]> {
    const suggestions: string[] = [];
    const text = `${hubName || ''} ${hubDescription || ''}`.toLowerCase();

    // Gaming-related keywords
    const gamingKeywords = [
      'game',
      'gaming',
      'play',
      'player',
      'esports',
      'competitive',
      'tournament',
      'stream',
      'twitch',
    ];
    if (gamingKeywords.some((keyword) => text.includes(keyword))) {
      suggestions.push('Gaming');
    }

    // Art-related keywords
    const artKeywords = [
      'art',
      'draw',
      'paint',
      'design',
      'creative',
      'artist',
      'illustration',
      'digital art',
    ];
    if (artKeywords.some((keyword) => text.includes(keyword))) {
      suggestions.push('Art');
    }

    // Technology keywords
    const techKeywords = [
      'tech',
      'programming',
      'code',
      'developer',
      'software',
      'web',
      'app',
      'ai',
      'machine learning',
    ];
    if (techKeywords.some((keyword) => text.includes(keyword))) {
      suggestions.push('Technology');
    }

    // Music keywords
    const musicKeywords = [
      'music',
      'song',
      'band',
      'musician',
      'audio',
      'sound',
      'producer',
      'beat',
    ];
    if (musicKeywords.some((keyword) => text.includes(keyword))) {
      suggestions.push('Music');
    }

    // Anime/Manga keywords
    const animeKeywords = [
      'anime',
      'manga',
      'otaku',
      'weeb',
      'japanese',
      'cosplay',
    ];
    if (animeKeywords.some((keyword) => text.includes(keyword))) {
      suggestions.push('Anime');
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Initialize official tags
   */
  async initializeOfficialTags(): Promise<void> {
    const officialTags = [
      { name: 'Gaming', category: 'Entertainment' },
      { name: 'Art', category: 'Creative' },
      { name: 'Music', category: 'Creative' },
      { name: 'Technology', category: 'Education' },
      { name: 'Anime', category: 'Entertainment' },
      { name: 'Memes', category: 'Entertainment' },
      { name: 'General', category: 'Community' },
      { name: 'Support', category: 'Community' },
      { name: 'Trading', category: 'Business' },
      { name: 'Education', category: 'Education' },
    ];

    try {
      for (const tagData of officialTags) {
        await db.tag.upsert({
          where: { name: tagData.name },
          update: { isOfficial: true },
          create: {
            name: tagData.name,
            category: tagData.category,
            isOfficial: true,
            usageCount: 0,
          },
        });
      }

      console.log('Official tags initialized successfully');
    } catch (error) {
      console.error('Failed to initialize official tags:', error);
      throw new Error('Failed to initialize official tags');
    }
  }

  /**
   * Normalize tag name
   */
  private normalizeTagName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Categorize tag based on name
   */
  private categorizeTag(name: string): string {
    const lowerName = name.toLowerCase();

    if (
      ['gaming', 'game', 'esports', 'competitive'].some((keyword) =>
        lowerName.includes(keyword)
      )
    ) {
      return 'Entertainment';
    }
    if (
      ['art', 'creative', 'design', 'music'].some((keyword) =>
        lowerName.includes(keyword)
      )
    ) {
      return 'Creative';
    }
    if (
      ['tech', 'programming', 'code', 'development'].some((keyword) =>
        lowerName.includes(keyword)
      )
    ) {
      return 'Technology';
    }
    if (
      ['learn', 'education', 'study', 'tutorial'].some((keyword) =>
        lowerName.includes(keyword)
      )
    ) {
      return 'Education';
    }
    if (
      ['community', 'social', 'chat', 'general'].some((keyword) =>
        lowerName.includes(keyword)
      )
    ) {
      return 'Community';
    }

    return 'Other';
  }

  /**
   * Get default tags when database fails
   */
  private getDefaultTags(): Array<{
    name: string;
    usageCount: number;
    category: string | null;
  }> {
    return [
      { name: 'Gaming', usageCount: 100, category: 'Entertainment' },
      { name: 'General', usageCount: 80, category: 'Community' },
      { name: 'Art', usageCount: 60, category: 'Creative' },
      { name: 'Music', usageCount: 50, category: 'Creative' },
      { name: 'Technology', usageCount: 40, category: 'Education' },
    ];
  }
}

// Export singleton instance
export const tagManagementService = new TagManagementService();
