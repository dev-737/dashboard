import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';
import type { Prisma } from '@/lib/generated/prisma/client/client';
import { db } from '@/lib/prisma';
import {
  ActivityLevel,
  ContentFilter,
  HUBS_PER_PAGE,
  SortOptions,
  VerificationStatus,
} from './constants';

// sorting algorithm constants
const TRENDING_WINDOW_DAYS = 7;
const NEW_HUB_WINDOW_DAYS = 30;
const RECENT_ACTIVITY_WINDOW_DAYS = 30;
// trending weights
const WEIGHT_RECENT_CONNECTION = 15;
const WEIGHT_RECENT_UPVOTE = 8;
const WEIGHT_RECENT_REVIEW = 5;
const WEIGHT_MESSAGE_FREQUENCY = 12;
const WEIGHT_CONNECTION_GROWTH = 10;

// decay factors for trending
const TRENDING_DECAY_BASE = 1.5;
const TRENDING_DECAY_RATE = 0.4;

export interface FilterOptions {
  search?: string;
  tags?: string[];
  contentFilter?: ContentFilter;
  verificationStatus?: VerificationStatus;
  language?: string;
  region?: string;
  minServers?: number;
  maxServers?: number;
  activityLevels?: ActivityLevel[];
}

export function buildWhereClause({
  search,
  tags,
  contentFilter = ContentFilter.All,
  verificationStatus = VerificationStatus.All,
  language,
  region,
  minServers,
  maxServers,
  activityLevels,
}: FilterOptions): Prisma.HubWhereInput {
  const searchTerms = search?.trim().split(/\s+/).filter(Boolean) || [];

  const filterConditions: Prisma.HubWhereInput[] = [
    { private: false }, // Always filter out private hubs
  ];

  // Filter by tags - hub must have ALL selected tags
  if (tags && tags.length > 0) {
    filterConditions.push({
      AND: tags.map((tag) => ({
        tags: { some: { name: { equals: tag, mode: 'insensitive' } } },
      })),
    });
  }

  // Filter by content type (SFW/NSFW)
  if (contentFilter !== ContentFilter.All) {
    filterConditions.push({
      nsfw: contentFilter === ContentFilter.NSFW,
    });
  }

  // Filter by verification status
  if (verificationStatus !== VerificationStatus.All) {
    if (verificationStatus === VerificationStatus.VerifiedOrPartnered) {
      filterConditions.push({
        OR: [{ verified: true }, { partnered: true }],
      });
    } else if (verificationStatus === VerificationStatus.Verified) {
      filterConditions.push({ verified: true });
    } else if (verificationStatus === VerificationStatus.Partnered) {
      filterConditions.push({ partnered: true });
    }
  }

  // Filter by language
  if (language && language !== 'all') {
    filterConditions.push({ language });
  }

  // Filter by region
  if (region && region !== 'all') {
    filterConditions.push({ region });
  }

  // Filter by server count range (using connection count)
  if (minServers !== undefined || maxServers !== undefined) {
    // We'll add a basic filter for connections
    // The actual count filtering will be done after the query
    // This make sures we at least get hubs with connections
    if (minServers !== undefined && minServers > 0) {
      filterConditions.push({
        connections: {
          some: {
            connected: true,
          },
        },
      });
    }

    // NOTE: We can't directly filter by count in the where clause
    // We'll handle the actual min/max server filtering in the getSortedHubs function
  }

  // Activity level filtering - now done at database level
  if (activityLevels && activityLevels.length > 0) {
    // Map frontend ActivityLevel enum to database HubActivityLevel enum
    const dbActivityLevels = activityLevels.map((level) => {
      switch (level) {
        case ActivityLevel.HIGH:
          return 'HIGH';
        case ActivityLevel.MEDIUM:
          return 'MEDIUM';
        case ActivityLevel.LOW:
          return 'LOW';
        default:
          return 'LOW';
      }
    });

    filterConditions.push({
      activityLevel: { in: dbActivityLevels },
    });
  }

  // Search terms
  if (searchTerms.length > 0) {
    searchTerms.forEach((term) => {
      filterConditions.push({
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { shortDescription: { contains: term, mode: 'insensitive' } },
          { tags: { some: { name: { contains: term, mode: 'insensitive' } } } },
          {
            moderators: {
              some: {
                OR: [
                  { userId: term }, // Maybe check if term looks like a user ID?
                  { user: { name: { contains: term, mode: 'insensitive' } } },
                ],
              },
            },
          },
        ],
      });
    });
  }

  return { AND: filterConditions };
}

// --- Main Sorting Function ---
export async function getSortedHubs(
  whereClause: Prisma.HubWhereInput,
  skip: number,
  sort: SortOptions,
  minServers?: number,
  maxServers?: number,
  activityLevels?: ActivityLevel[]
) {
  const now = new Date();
  const trendingWindowStart = new Date(
    now.getTime() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );
  const newHubWindowStart = new Date(
    now.getTime() - NEW_HUB_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );
  const recentActivityWindowStart = new Date(
    now.getTime() - RECENT_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );

  // Get total count based on the initial filter (for pagination)
  let totalCount = await db.hub.count({ where: whereClause });

  // Flag to indicate if we need post-query filtering for server counts
  const needsServerCountFiltering =
    minServers !== undefined || maxServers !== undefined;
  // Activity filtering is now done at database level, no post-query filtering needed

  let hubs: SimplifiedHub[] = [];

  // Define standard includes needed for display
  const standardIncludes = {
    _count: {
      select: {
        connections: { where: { connected: true } },
        upvotes: true,
        reviews: true,
        messages: true, // Add messages count for display
      },
    },
    moderators: {
      include: { user: { select: { id: true, name: true, image: true } } },
    },
    reviews: {
      include: { user: { select: { id: true, name: true, image: true } } },
    },
    connections: {
      where: { connected: true },
      select: { id: true, serverId: true, lastActive: true },
    },
    upvotes: true,
    tags: { select: { name: true } },
  } as const;

  // --- Sorting Logic ---

  if (sort === SortOptions.Trending) {
    // **Trending Sort (Application-Side Scoring)**
    // to prioritize hubs with actual activity over newly created but inactive hubs
    const hubsForScoring = await db.hub.findMany({
      where: {
        ...whereClause,
        // Require at least one connection AND some activity indicators
        AND: [
          // Must have at least one connection
          { connections: { some: { connected: true } } },
          // AND must have some activity indicators
          {
            OR: [
              // Has recent activity (last 14 days)
              {
                lastActive: {
                  gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
                },
              },
              // Has engagement
              { upvotes: { some: {} } },
              { reviews: { some: {} } },
              // Has messages
              // Is verified/partnered (quality signal)
              { verified: true },
              { partnered: true },
            ],
          },
        ],
      },
      include: {
        ...standardIncludes,
        _count: {
          select: {
            connections: {
              where: {
                connected: true,
                lastActive: { gte: trendingWindowStart },
              },
            },
            upvotes: { where: { createdAt: { gte: trendingWindowStart } } },
            reviews: { where: { createdAt: { gte: trendingWindowStart } } },
          },
        },
      },
      orderBy: { lastActive: 'desc' },
    });

    // 2. Calculate trending score for each hub
    const scoredHubs = hubsForScoring.map((hub) => {
      // Recent activity scores
      const recentConnectionsScore =
        (hub._count?.connections ?? 0) * WEIGHT_RECENT_CONNECTION;
      const recentUpvotesScore =
        (hub._count?.upvotes ?? 0) * WEIGHT_RECENT_UPVOTE;
      const recentReviewsScore =
        (hub._count?.reviews ?? 0) * WEIGHT_RECENT_REVIEW;

      // message frequency calculation
      const daysSinceLastActive = Math.max(
        0,
        (now.getTime() - hub.lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );
      const messageFrequencyScore =
        daysSinceLastActive < 1
          ? WEIGHT_MESSAGE_FREQUENCY
          : daysSinceLastActive < 3
            ? WEIGHT_MESSAGE_FREQUENCY * 0.7
            : daysSinceLastActive < 7
              ? WEIGHT_MESSAGE_FREQUENCY * 0.4
              : 0;

      // Connection growth rate calculation
      const totalConnections = hub.connections?.length || 0;
      const recentConnections = hub._count?.connections ?? 0;
      const connectionGrowthRate =
        totalConnections > 0 ? recentConnections / totalConnections : 0;
      const connectionGrowthScore =
        connectionGrowthRate * WEIGHT_CONNECTION_GROWTH;

      // time decay calculation - reduced impact for very new hubs
      const ageInHours = Math.max(
        1,
        (now.getTime() - hub.createdAt.getTime()) / (1000 * 60 * 60)
      );
      const timeDecay =
        1 / (ageInHours + TRENDING_DECAY_BASE) ** TRENDING_DECAY_RATE;

      // Bonus for verified/partnered hubs
      const verificationBonus =
        (hub.verified ? 5 : 0) + (hub.partnered ? 8 : 0);

      // Activity requirement bonus - heavily penalize hubs with no real activity
      const totalActivityScore =
        recentConnectionsScore +
        recentUpvotesScore +
        recentReviewsScore +
        messageFrequencyScore +
        connectionGrowthScore;
      const hasConnections = totalConnections > 0;
      const activityMultiplier =
        totalActivityScore > 0 && hasConnections
          ? 1
          : hasConnections
            ? 0.5 // Has connections but no recent activity
            : totalActivityScore > 0
              ? 0.3 // Has activity but no connections
              : 0.05; // No connections and no activity

      // Calculate final trending score
      const baseScore =
        (totalActivityScore + verificationBonus) * activityMultiplier;
      const trendingScore = baseScore * timeDecay;

      return {
        id: hub.id,
        trendingScore,
        debugInfo: {
          recentConnections: recentConnectionsScore,
          recentUpvotes: recentUpvotesScore,
          recentReviews: recentReviewsScore,
          messageFrequency: messageFrequencyScore,
          connectionGrowth: connectionGrowthScore,
          activityMultiplier,
          timeDecay,
          baseScore,
          finalScore: trendingScore,
        },
      };
    });

    // 3. Sort by trending score
    scoredHubs.sort((a, b) => b.trendingScore - a.trendingScore);

    // 4. Apply server count filtering before pagination if needed
    let filteredScoredHubs = scoredHubs;
    if (needsServerCountFiltering) {
      // Convert to SimplifiedHub format for filtering
      const hubsForFiltering = scoredHubs.map((scored) => ({
        ...scored,
        // Ensure the hub has the required properties for filtering
      })) as unknown as SimplifiedHub[];

      const filteredHubs = filterHubsByServerCount(
        hubsForFiltering,
        minServers,
        maxServers
      );
      filteredScoredHubs = scoredHubs.filter((scored) =>
        filteredHubs.some((filtered) => filtered.id === scored.id)
      );
    }

    // Set total count based on filtered results
    totalCount = filteredScoredHubs.length;

    // 5. Get the paginated results
    const paginatedScoredHubs = filteredScoredHubs.slice(
      skip,
      skip + HUBS_PER_PAGE
    );

    // 6. Fetch full hub data for the trending results
    const trendingHubIds = paginatedScoredHubs.map((h) => h.id);

    if (trendingHubIds.length > 0) {
      // Fetch full hub data for trending hubs
      const trendingHubsData = await db.hub.findMany({
        where: { id: { in: trendingHubIds } },
        include: standardIncludes,
      });

      // Re-order according to trending score order
      const orderedTrendingHubs = trendingHubIds
        .map((id) => trendingHubsData.find((hub) => hub.id === id))
        .filter(Boolean) as SimplifiedHub[];

      // 7. If we don't have enough trending hubs on first page, fall back to most active hubs
      if (orderedTrendingHubs.length < HUBS_PER_PAGE && skip === 0) {
        const additionalNeeded = HUBS_PER_PAGE - orderedTrendingHubs.length;
        const usedIds = orderedTrendingHubs.map((h) => h.id);

        const fallbackHubs = await db.hub.findMany({
          where: {
            ...whereClause,
            id: { notIn: usedIds }, // Exclude already selected hubs
            connections: { some: { connected: true } }, // Must have connections
          },
          include: standardIncludes,
          orderBy: [
            { connections: { _count: 'desc' } },
            { lastActive: 'desc' },
          ],
          take: additionalNeeded,
        });

        // Add fallback hubs to the results
        hubs = [...orderedTrendingHubs, ...fallbackHubs];
        // Update total count to include fallback hubs
        totalCount += fallbackHubs.length;
      } else {
        // Use only the trending hubs
        hubs = orderedTrendingHubs;
      }
    } else {
      hubs = [];
    }
  } else if (sort === SortOptions.Rating) {
    // **Rating Sort (Application-Side Scoring)**
    // Sort by average review rating
    const hubsForRatingScoring = await db.hub.findMany({
      where: {
        ...whereClause,
        // Require at least one connection for Rating sort
        connections: { some: { connected: true } },
      },
      include: {
        ...standardIncludes,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate average rating for each hub and sort
    const hubsWithRating = hubsForRatingScoring.map((hub) => {
      const ratings = hub.reviews.map((review) => review.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;
      const reviewCount = ratings.length;

      // Weighted score: average rating with minimum review threshold
      // Hubs with more reviews get slight boost, but rating is primary factor
      const weightedScore =
        reviewCount >= 3
          ? averageRating + Math.log(reviewCount) * 0.1
          : averageRating * (reviewCount / 3); // Penalize hubs with very few reviews

      return {
        ...hub,
        averageRating,
        reviewCount,
        weightedScore,
      };
    });

    // Sort by weighted score (highest first), then by review count as tiebreaker
    hubsWithRating.sort((a, b) => {
      if (b.weightedScore !== a.weightedScore) {
        return b.weightedScore - a.weightedScore;
      }
      return b.reviewCount - a.reviewCount;
    });

    // Apply server count filtering before pagination if needed
    let filteredRatingHubs = hubsWithRating;
    if (needsServerCountFiltering) {
      const filteredHubs = filterHubsByServerCount(
        hubsWithRating as unknown as SimplifiedHub[],
        minServers,
        maxServers
      );
      filteredRatingHubs = hubsWithRating.filter((hub) =>
        filteredHubs.some((filtered) => filtered.id === hub.id)
      );
    }

    // Set total count based on filtered results
    totalCount = filteredRatingHubs.length;

    // Apply pagination AFTER sorting and filtering
    hubs = filteredRatingHubs.slice(
      skip,
      skip + HUBS_PER_PAGE
    ) as unknown as SimplifiedHub[];
  } else if (sort === SortOptions.Activity) {
    // **Consolidated Activity Sort** - algorithm combining total activity + recent engagement
    // For better performance with pagination, we'll use a hybrid approach

    // First, get total count for pagination
    totalCount = await db.hub.count({
      where: {
        ...whereClause,
        connections: { some: { connected: true } },
      },
    });

    // For Activity sort, we need to score all hubs to get proper ranking
    // This is necessary because activity scoring can't be done at database level
    const hubsForActivityScoring = await db.hub.findMany({
      where: {
        ...whereClause,
        // Must have at least one connection for Activity sort
        connections: { some: { connected: true } },
      },
      include: standardIncludes,
      orderBy: { lastActive: 'desc' },
    });

    // Calculate comprehensive activity scores
    const scoredActivityHubs = hubsForActivityScoring.map((hub) => {
      // Core activity metrics (70% weight)
      const totalConnections = hub._count?.connections || 0;
      const totalMessages = hub._count?.messages || 0;
      const totalUpvotes = hub.upvotes?.length || 0;
      const totalReviews = hub.reviews?.length || 0;

      // Calculate base activity score
      const baseActivityScore =
        totalConnections * 10 + // Server count is very important
        totalMessages * 0.1 + // Message volume matters
        totalUpvotes * 5 + // Community approval
        totalReviews * 8; // Reviews are valuable

      // Recent activity factor (30% weight) - more prominent than before
      const daysSinceLastActive = Math.max(
        0,
        (now.getTime() - hub.lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );

      // recency scoring with stronger penalties for inactive hubs
      let recencyScore: number;
      if (daysSinceLastActive <= 1) {
        recencyScore = 100; // Very recent activity
      } else if (daysSinceLastActive <= 3) {
        recencyScore = 85; // Recent activity
      } else if (daysSinceLastActive <= 7) {
        recencyScore = 70; // Moderately recent
      } else if (daysSinceLastActive <= 14) {
        recencyScore = 50; // Somewhat recent
      } else if (daysSinceLastActive <= 30) {
        recencyScore = 25; // Old activity
      } else {
        recencyScore = 5; // Very old activity - significant penalty
      }

      // Combine scores: 70% base activity + 30% recency
      const finalActivityScore = baseActivityScore * 0.7 + recencyScore * 0.3;

      return {
        ...hub,
        activityScore: finalActivityScore,
      };
    });

    // Sort by activity score (highest first)
    scoredActivityHubs.sort((a, b) => b.activityScore - a.activityScore);

    // Apply server count filtering before pagination if needed
    let filteredHubs = scoredActivityHubs;
    if (needsServerCountFiltering) {
      filteredHubs = filterHubsByServerCount(
        scoredActivityHubs as unknown as SimplifiedHub[],
        minServers,
        maxServers
      ) as typeof scoredActivityHubs;
      // Update total count to reflect filtering
      totalCount = filteredHubs.length;
    }

    // Get paginated results AFTER sorting and filtering
    const paginatedActivityHubs = filteredHubs.slice(
      skip,
      skip + HUBS_PER_PAGE
    );
    hubs = paginatedActivityHubs as unknown as SimplifiedHub[];
  } else {
    // **Database-Side Sorting for other options**
    let orderBy:
      | Prisma.HubOrderByWithRelationInput
      | Prisma.HubOrderByWithRelationInput[]
      | undefined;

    // Add connection filtering to ALL sort options to prevent dead hubs from showing
    let finalWhereClause: Prisma.HubWhereInput = {
      ...whereClause,
      // Require at least one connection for ALL sorts
      connections: { some: { connected: true } },
    };

    switch (sort) {
      case SortOptions.MostUpvotedNew:
        // Filter for hubs created within the 'new' window, sort by total upvotes
        finalWhereClause = {
          AND: [
            whereClause,
            { createdAt: { gte: newHubWindowStart } },
            // Require connections for this sort too
            { connections: { some: { connected: true } } },
          ],
        };
        orderBy = { upvotes: { _count: 'desc' } };
        break;

      case SortOptions.MostRecentPopular:
        // Filter for hubs active recently, sort by total upvotes
        finalWhereClause = {
          AND: [
            whereClause,
            { lastActive: { gte: recentActivityWindowStart } },
            // Require connections for this sort too
            { connections: { some: { connected: true } } },
          ],
        };
        orderBy = { upvotes: { _count: 'desc' } };
        break;

      case SortOptions.Created:
        // newest sort will be handled with application-side scoring
        // For now, use simple creation date ordering
        orderBy = { createdAt: 'desc' };
        break;
      case SortOptions.Name:
        orderBy = { name: 'asc' };
        break;
      case SortOptions.Upvotes:
        orderBy = { upvotes: { _count: 'desc' } };
        break;
      case SortOptions.Servers:
        // servers sort with tie-breaking by recent activity
        orderBy = [{ connections: { _count: 'desc' } }, { lastActive: 'desc' }];
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // For sorts that modify the where clause, we need to recalculate totalCount
    if (
      sort === SortOptions.MostUpvotedNew ||
      sort === SortOptions.MostRecentPopular
    ) {
      totalCount = await db.hub.count({ where: finalWhereClause });
    }

    // Type assertion to handle the type mismatch
    hubs = (await db.hub.findMany({
      where: finalWhereClause,
      include: standardIncludes,
      orderBy,
      skip,
      take: HUBS_PER_PAGE,
    })) as unknown as SimplifiedHub[];

    // Apply filtering
    if (needsServerCountFiltering) {
      hubs = filterHubsByServerCount(hubs, minServers, maxServers);
      // Recalculate total count if we filtered
      totalCount = await getFilteredTotalCount(
        whereClause,
        minServers,
        maxServers,
        activityLevels
      );
    }
  }

  return { hubs, totalCount };
}

// Helper function to filter hubs by server count
function filterHubsByServerCount(
  hubs: SimplifiedHub[],
  minServers?: number,
  maxServers?: number
): SimplifiedHub[] {
  if (!minServers && !maxServers) return hubs;

  return hubs.filter((hub) => {
    // Count connected servers - all connections in the result are already connected
    const connectedServerCount = hub._count.connections;

    // Apply min filter if specified
    if (minServers !== undefined && connectedServerCount < minServers) {
      return false;
    }

    // Apply max filter if specified
    if (maxServers !== undefined && connectedServerCount > maxServers) {
      return false;
    }

    return true;
  });
}

// Helper function to get the total count after filtering
async function getFilteredTotalCount(
  whereClause: Prisma.HubWhereInput,
  minServers?: number,
  maxServers?: number,
  activityLevels?: ActivityLevel[]
): Promise<number> {
  // If no filtering, return the original count
  if (
    !minServers &&
    !maxServers &&
    (!activityLevels || activityLevels.length === 0)
  ) {
    return db.hub.count({ where: whereClause });
  }

  // Otherwise, we need to fetch all matching hubs and filter them
  const allHubs = await db.hub.findMany({
    where: whereClause,
    include: {
      connections: {
        where: { connected: true },
        select: { id: true, lastActive: true },
      },
      _count: {
        select: {
          connections: { where: { connected: true } },
          upvotes: true,
          reviews: true,
          messages: true,
        },
      },
      upvotes: true,
      reviews: true,
    },
  });

  // Apply all filters
  const filteredHubs = allHubs.filter((hub) => {
    // Server count filtering
    if (minServers !== undefined || maxServers !== undefined) {
      const connectedServerCount = hub.connections?.length || 0;

      if (minServers !== undefined && connectedServerCount < minServers) {
        return false;
      }

      if (maxServers !== undefined && connectedServerCount > maxServers) {
        return false;
      }
    }

    // Activity level filtering is now done at database level, no need for post-query filtering

    return true;
  });

  return filteredHubs.length;
}
