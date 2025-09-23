import { db } from '@/lib/prisma';
import { CACHE_KEYS, cache } from './performance-cache';

export interface PlatformStats {
  activeServers: number;
  publicHubs: number;
  weeklyMessages: number;
  totalHubs: number;
  totalConnections: number;
  dailyMessages: number;
  totalUsers: number;
  activeUsers: number;
  growth: {
    hubsThisWeek: number;
    connectionsThisWeek: number;
    messagesGrowth: number;
  };
  engagement: {
    averageMessagesPerHub: number;
    averageServersPerHub: number;
    activeHubPercentage: number;
  };
  lastUpdated: string;
  cacheExpiry: number;
}

export interface PlatformStatsResponse {
  success: boolean;
  data: PlatformStats;
  fallback?: boolean;
}

/**
 * Server-side function to fetch platform statistics
 * Used for SSR instead of API route
 */
export async function getPlatformStats(): Promise<PlatformStatsResponse> {
  try {
    // Check cache first
    const cachedStats = await cache.get<PlatformStats>(
      CACHE_KEYS.PLATFORM_STATS
    );
    if (cachedStats) {
      return {
        success: true,
        data: cachedStats,
      };
    }

    console.log('Cache miss for platform stats, querying database');

    // Get current date for time-based queries
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Run all queries in parallel for better performance
    const [
      totalHubs,
      publicHubs,
      totalConnections,
      activeConnections,
      weeklyMessages,
      dailyMessages,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      // Total hubs count
      db.hub.count(),

      // Public hubs count (not private)
      db.hub.count({
        where: { private: false },
      }),

      // Total connections count
      db.connection.count(),

      // Active connections (connected and active in last 7 days)
      db.connection.count({
        where: {
          connected: true,
          lastActive: {
            gte: oneWeekAgo,
          },
        },
      }),

      // Weekly message count (sum of weeklyMessageCount from all hubs)
      db.message.count({
        where: {
          createdAt: { gte: oneWeekAgo },
        },
      }),

      // Daily message count (sum of dailyMessageCount from all hubs)
      db.message.aggregate({
        _count: {
          id: true,
        },
        where: {
          createdAt: {
            gte: oneDayAgo,
          },
        },
      }),

      // Total users count
      db.user.count(),

      // Active users (users who have activity in last 24 hours)
      db.user.count({
        where: {
          lastHubJoinAt: {
            gte: oneDayAgo,
          },
        },
      }),
    ]);

    // Calculate derived statistics
    const stats: PlatformStats = {
      // Core metrics for stats bar
      activeServers: activeConnections,
      publicHubs: publicHubs,
      weeklyMessages: weeklyMessages,

      // Additional metrics
      totalHubs,
      totalConnections,
      dailyMessages: dailyMessages._count.id || 0,
      totalUsers,
      activeUsers,

      // Growth metrics (would be calculated from historical data in production)
      growth: {
        hubsThisWeek: Math.floor(totalHubs * 0.05), // Mock 5% growth
        connectionsThisWeek: Math.floor(activeConnections * 0.08), // Mock 8% growth
        messagesGrowth: 15.2, // Mock percentage growth
      },

      // Engagement metrics
      engagement: {
        averageMessagesPerHub:
          totalHubs > 0 ? Math.floor(weeklyMessages / totalHubs) : 0,
        averageServersPerHub:
          totalHubs > 0 ? Math.floor(totalConnections / totalHubs) : 0,
        activeHubPercentage:
          totalHubs > 0 ? Math.round((publicHubs / totalHubs) * 100) : 0,
      },

      // Metadata
      lastUpdated: now.toISOString(),
      cacheExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds
    };

    // Update cache
    await cache.set(CACHE_KEYS.PLATFORM_STATS, stats, {
      ttl: 300,
      memoryTtl: 60,
    });

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Error fetching platform statistics:', error);

    // Return fallback stats in case of error
    const fallbackStats: PlatformStats = {
      activeServers: 1200,
      publicHubs: 60,
      weeklyMessages: 300000,
      totalHubs: 75,
      totalConnections: 1500,
      dailyMessages: 45000,
      totalUsers: 25000,
      activeUsers: 3500,
      growth: {
        hubsThisWeek: 4,
        connectionsThisWeek: 96,
        messagesGrowth: 15.2,
      },
      engagement: {
        averageMessagesPerHub: 4000,
        averageServersPerHub: 20,
        activeHubPercentage: 80,
      },
      lastUpdated: new Date().toISOString(),
      cacheExpiry: 5 * 60 * 1000,
    };

    return {
      success: true,
      data: fallbackStats,
      fallback: true,
    };
  }
}

/**
 * Extract stats bar data from platform stats
 */
export function getStatsBarData(platformStats: PlatformStats) {
  return {
    activeServers: platformStats.activeServers,
    publicHubs: platformStats.publicHubs,
    weeklyMessages: platformStats.weeklyMessages,
  };
}

/**
 * Extract growth metrics from platform stats
 */
export function getGrowthMetrics(platformStats: PlatformStats) {
  return {
    hubsThisWeek: platformStats.growth.hubsThisWeek,
    connectionsThisWeek: platformStats.growth.connectionsThisWeek,
    messagesGrowth: platformStats.growth.messagesGrowth,
    totalHubs: platformStats.totalHubs,
    totalConnections: platformStats.totalConnections,
  };
}

/**
 * Extract engagement metrics from platform stats
 */
export function getEngagementMetrics(platformStats: PlatformStats) {
  return {
    averageMessagesPerHub: platformStats.engagement.averageMessagesPerHub,
    averageServersPerHub: platformStats.engagement.averageServersPerHub,
    activeHubPercentage: platformStats.engagement.activeHubPercentage,
    totalUsers: platformStats.totalUsers,
    activeUsers: platformStats.activeUsers,
  };
}

// Leaderboard types and functions
export interface LeaderboardHub {
  id: string;
  name: string;
  iconUrl: string;
  bannerUrl?: string;
  newServersJoined: number;
  activitySpike: number; // percentage
  totalServers: number;
  rank: number;
  verified?: boolean;
  partnered?: boolean;
}

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardHub[];
  metadata?: {
    period: string;
    calculatedAt: string;
    totalHubsAnalyzed: number;
  };
  fallback?: boolean;
  error?: string;
}

/**
 * Server-side function to fetch leaderboard data
 * Used for SSR instead of API route
 */
export async function getLeaderboardData(): Promise<LeaderboardResponse> {
  try {
    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get all hubs with their connection and message data
    const hubs = await db.hub.findMany({
      where: {
        private: false, // Only public hubs
        connections: {
          some: { connected: true }, // Must have at least one connection
        },
      },
      include: {
        connections: {
          where: { connected: true },
          select: {
            id: true,
            createdAt: true,
            lastActive: true,
          },
        },
        _count: {
          select: {
            connections: { where: { connected: true } },
          },
        },
      },
    });

    // Calculate growth metrics for each hub
    const leaderboardData: LeaderboardHub[] = hubs.map((hub) => {
      const totalConnections = hub._count.connections;

      // Calculate new connections this week
      const newConnectionsThisWeek = hub.connections.filter(
        (conn) => new Date(conn.createdAt) >= oneWeekAgo
      ).length;

      // Calculate connections from previous week for comparison
      const connectionsPreviousWeek = hub.connections.filter(
        (conn) =>
          new Date(conn.createdAt) >= twoWeeksAgo &&
          new Date(conn.createdAt) < oneWeekAgo
      ).length;

      // Calculate activity spike percentage
      const activitySpike =
        connectionsPreviousWeek > 0
          ? Math.round(
              ((newConnectionsThisWeek - connectionsPreviousWeek) /
                connectionsPreviousWeek) *
                100
            )
          : newConnectionsThisWeek > 0
            ? 100
            : 0;

      return {
        id: hub.id,
        name: hub.name,
        iconUrl: hub.iconUrl || '/api/placeholder/64/64',
        bannerUrl: hub.bannerUrl || undefined,
        newServersJoined: newConnectionsThisWeek,
        activitySpike: Math.max(0, activitySpike), // Ensure non-negative
        totalServers: totalConnections,
        rank: 0, // Will be set after sorting
        verified: hub.verified,
        partnered: hub.partnered,
      };
    });

    // Sort by growth metrics (prioritize new connections, then activity spike)
    const sortedHubs = leaderboardData
      .sort((a, b) => {
        // Primary sort: new servers joined this week
        if (b.newServersJoined !== a.newServersJoined) {
          return b.newServersJoined - a.newServersJoined;
        }
        // Secondary sort: activity spike percentage
        if (b.activitySpike !== a.activitySpike) {
          return b.activitySpike - a.activitySpike;
        }
        // Tertiary sort: total servers
        return b.totalServers - a.totalServers;
      })
      .slice(0, 10) // Top 10 hubs
      .map((hub, index) => ({
        ...hub,
        rank: index + 1,
      }));

    return {
      success: true,
      data: sortedHubs,
      metadata: {
        period: 'weekly',
        calculatedAt: now.toISOString(),
        totalHubsAnalyzed: hubs.length,
      },
    };
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);

    // Return fallback data in case of error
    const fallbackData: LeaderboardHub[] = [
      {
        id: 'fallback-1',
        name: 'Gaming Central',
        iconUrl: '/api/placeholder/64/64',
        newServersJoined: 45,
        activitySpike: 156,
        totalServers: 234,
        rank: 1,
      },
      {
        id: 'fallback-2',
        name: 'Art & Design Hub',
        iconUrl: '/api/placeholder/64/64',
        newServersJoined: 38,
        activitySpike: 142,
        totalServers: 189,
        rank: 2,
      },
      {
        id: 'fallback-3',
        name: 'Tech Innovators',
        iconUrl: '/api/placeholder/64/64',
        newServersJoined: 32,
        activitySpike: 128,
        totalServers: 156,
        rank: 3,
      },
    ];

    return {
      success: true,
      data: fallbackData,
      fallback: true,
      error: 'Using fallback data due to database error',
    };
  }
}

// Featured hubs types and functions
export interface FeaturedHub {
  id: string;
  name: string;
  shortDescription: string;
  iconUrl: string;
  bannerUrl?: string;
  tags: Array<{ name: string }>;
  serverCount: number;
  dailyActivity: number;
  verified: boolean;
  partnered: boolean;
  featured: boolean;
}

export interface FeaturedHubsResponse {
  success: boolean;
  data: FeaturedHub[];
  metadata?: {
    totalFeatured: number;
    lastUpdated: string;
  };
  fallback?: boolean;
  error?: string;
}

/**
 * Server-side function to fetch featured hubs data
 * Used for SSR instead of API route
 */
export async function getFeaturedHubsData(): Promise<FeaturedHubsResponse> {
  try {
    // Get featured hubs from database
    const featuredHubs = await db.hub.findMany({
      where: {
        featured: true,
        private: false, // Only public hubs
        connections: {
          some: { connected: true }, // Must have at least one connection
        },
      },
      include: {
        tags: {
          select: { name: true },
        },
        _count: {
          select: {
            connections: { where: { connected: true } },
            messages: true,
          },
        },
      },
      orderBy: [
        { verified: 'desc' }, // Verified hubs first
        { partnered: 'desc' }, // Then partnered hubs
        { weeklyMessageCount: 'desc' }, // Then by activity
        { createdAt: 'desc' }, // Finally by creation date
      ],
      take: 6, // Limit to 6 featured hubs for carousel
    });

    // If we don't have enough featured hubs, fill with high-quality hubs
    let allHubs = featuredHubs;

    if (featuredHubs.length < 3) {
      const additionalHubs = await db.hub.findMany({
        where: {
          featured: false, // Not already featured
          private: false,
          OR: [
            { verified: true },
            { partnered: true },
            { weeklyMessageCount: { gte: 100 } }, // High activity
          ],
          connections: {
            some: { connected: true },
          },
        },
        include: {
          tags: {
            select: { name: true },
          },
          _count: {
            select: {
              connections: { where: { connected: true } },
              messages: true,
            },
          },
        },
        orderBy: [
          { verified: 'desc' },
          { partnered: 'desc' },
          { weeklyMessageCount: 'desc' },
        ],
        take: 6 - featuredHubs.length,
      });

      allHubs = [...featuredHubs, ...additionalHubs];
    }

    // Transform to the expected format
    const transformedHubs: FeaturedHub[] = allHubs.map((hub) => ({
      id: hub.id,
      name: hub.name,
      shortDescription:
        hub.description ||
        `Join ${hub.name} to connect with like-minded community members.`,
      iconUrl: hub.iconUrl || '/api/placeholder/64/64',
      bannerUrl: hub.bannerUrl || undefined,
      tags: hub.tags,
      serverCount: hub._count.connections,
      dailyActivity: hub._count.messages || 0,
      verified: hub.verified,
      partnered: hub.partnered,
      featured: hub.featured,
    }));

    return {
      success: true,
      data: transformedHubs,
      metadata: {
        totalFeatured: transformedHubs.length,
        lastUpdated: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching featured hubs:', error);

    // Return fallback data in case of error
    const fallbackData: FeaturedHub[] = [
      {
        id: 'fallback-1',
        name: 'Gaming Central',
        shortDescription:
          'Connect with gamers worldwide. Share strategies, find teammates, and discover new games together.',
        iconUrl: '/api/placeholder/64/64',
        bannerUrl: '/api/placeholder/400/200',
        tags: [
          { name: 'gaming' },
          { name: 'community' },
          { name: 'multiplayer' },
        ],
        serverCount: 342,
        dailyActivity: 5200,
        verified: true,
        partnered: true,
        featured: true,
      },
      {
        id: 'fallback-2',
        name: 'Art & Design Hub',
        shortDescription:
          'Showcase your creativity, get feedback, and collaborate with artists and designers from around the world.',
        iconUrl: '/api/placeholder/64/64',
        bannerUrl: '/api/placeholder/400/200',
        tags: [{ name: 'art' }, { name: 'design' }, { name: 'creative' }],
        serverCount: 267,
        dailyActivity: 3800,
        verified: true,
        partnered: false,
        featured: true,
      },
      {
        id: 'fallback-3',
        name: 'Tech Innovators',
        shortDescription:
          'Connect with developers, engineers, and tech enthusiasts. Share projects, get help, and stay updated with tech trends.',
        iconUrl: '/api/placeholder/64/64',
        bannerUrl: '/api/placeholder/400/200',
        tags: [
          { name: 'technology' },
          { name: 'programming' },
          { name: 'innovation' },
        ],
        serverCount: 198,
        dailyActivity: 3100,
        verified: true,
        partnered: false,
        featured: true,
      },
    ];

    return {
      success: true,
      data: fallbackData,
      fallback: true,
      error: 'Using fallback data due to database error',
    };
  }
}

// Hub recommendations types and functions
export interface HubRecommendation {
  hubId: string;
  hub: {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    verified: boolean;
    partnered: boolean;
    activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    connectionCount: number;
    recentMessageCount: number;
    lastActive: string | Date;
    tags: { name: string }[];
  };
  score: number;
  reason: string;
  engagementMetrics: {
    isHighActivity: boolean;
    isGrowing: boolean;
    isQuality: boolean;
    isTrusted: boolean;
  };
}

export interface HubRecommendationsResponse {
  success: boolean;
  data: {
    recommendations: HubRecommendation[];
    metadata: {
      type: string;
      count: number;
      generatedAt: string;
    };
  };
  fallback?: boolean;
  error?: string;
}

export type RecommendationType =
  | 'personalized'
  | 'trending'
  | 'activity'
  | 'similar'
  | 'friends';

/**
 * Server-side function to fetch hub recommendations
 * Used for SSR instead of API route
 */
export async function getHubRecommendations(
  type: RecommendationType = 'trending',
  limit: number = 8
): Promise<HubRecommendationsResponse> {
  try {
    // biome-ignore lint/suspicious/noImplicitAnyLet: nuh uh
    let hubs;

    // Get hubs based on recommendation type
    switch (type) {
      case 'trending':
        hubs = await db.hub.findMany({
          where: {
            private: false,
            connections: {
              some: { connected: true },
            },
          },
          include: {
            tags: {
              select: { name: true },
            },
            _count: {
              select: {
                connections: { where: { connected: true } },
                messages: true,
                upvotes: true,
              },
            },
          },
          orderBy: [{ weeklyMessageCount: 'desc' }, { createdAt: 'desc' }],
          take: limit,
        });
        break;

      case 'activity':
        hubs = await db.hub.findMany({
          where: {
            private: false,
            connections: {
              some: { connected: true },
            },
          },
          include: {
            tags: {
              select: { name: true },
            },
            _count: {
              select: {
                connections: { where: { connected: true } },
                messages: true,
                upvotes: true,
              },
            },
          },
          orderBy: [{ weeklyMessageCount: 'desc', lastActive: 'desc' }],
          take: limit,
        });
        break;
      default:
        // For personalized, fall back to trending if no user ID
        hubs = await db.hub.findMany({
          where: {
            private: false,
            connections: {
              some: { connected: true },
            },
          },
          include: {
            tags: {
              select: { name: true },
            },
            _count: {
              select: {
                connections: { where: { connected: true } },
                messages: true,
                upvotes: true,
              },
            },
          },
          orderBy: [
            { verified: 'desc' },
            { partnered: 'desc' },
            { weeklyMessageCount: 'desc' },
          ],
          take: limit,
        });
        break;
    }

    // Transform to recommendation format
    const recommendations: HubRecommendation[] = hubs.map(
      (hub, index: number) => {
        const connectionCount = hub._count.connections;
        const messageCount = hub._count.messages || 0;
        const upvoteCount = hub._count.upvotes || 0;

        // Determine activity level
        let activityLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        if (messageCount >= 100 || connectionCount >= 10) {
          activityLevel = 'HIGH';
        } else if (messageCount >= 20 || connectionCount >= 5) {
          activityLevel = 'MEDIUM';
        }

        // Generate reason based on type and hub characteristics
        let reason = 'Popular community';
        if (type === 'trending') {
          reason = 'Trending with high activity';
        } else if (type === 'activity') {
          reason = 'Very active today';
        } else if (hub.verified) {
          reason = 'Verified community';
        } else if (hub.partnered) {
          reason = 'Partner community';
        }

        return {
          hubId: hub.id,
          hub: {
            id: hub.id,
            name: hub.name,
            description:
              hub.description ||
              `Join ${hub.name} to connect with the community.`,
            iconUrl: hub.iconUrl || '/api/placeholder/64/64',
            verified: hub.verified,
            partnered: hub.partnered,
            activityLevel,
            connectionCount,
            recentMessageCount: hub._count.messages || 0,
            lastActive: hub.lastActive || new Date(),
            tags: hub.tags,
          },
          score: 100 - index, // Simple scoring based on order
          reason,
          engagementMetrics: {
            isHighActivity: messageCount >= 50,
            isGrowing: connectionCount >= 5,
            isQuality: upvoteCount >= 5,
            isTrusted: hub.verified || hub.partnered,
          },
        };
      }
    );

    return {
      success: true,
      data: {
        recommendations,
        metadata: {
          type,
          count: recommendations.length,
          generatedAt: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    console.error('Error fetching hub recommendations:', error);

    // Return fallback data in case of error
    const fallbackRecommendations: HubRecommendation[] = [
      {
        hubId: 'fallback-1',
        hub: {
          id: 'fallback-1',
          name: 'Gaming Central',
          description:
            'Connect with gamers worldwide. Share strategies, find teammates, and discover new games.',
          iconUrl: '/api/placeholder/64/64',
          verified: true,
          partnered: true,
          activityLevel: 'HIGH',
          connectionCount: 342,
          recentMessageCount: 1200,
          lastActive: new Date(),
          tags: [{ name: 'gaming' }, { name: 'community' }],
        },
        score: 95,
        reason: 'Verified gaming community',
        engagementMetrics: {
          isHighActivity: true,
          isGrowing: true,
          isQuality: true,
          isTrusted: true,
        },
      },
      {
        hubId: 'fallback-2',
        hub: {
          id: 'fallback-2',
          name: 'Tech Innovators',
          description:
            'Connect with developers and tech enthusiasts. Share projects and stay updated.',
          iconUrl: '/api/placeholder/64/64',
          verified: true,
          partnered: false,
          activityLevel: 'MEDIUM',
          connectionCount: 198,
          recentMessageCount: 850,
          lastActive: new Date(),
          tags: [{ name: 'technology' }, { name: 'programming' }],
        },
        score: 90,
        reason: 'Active tech community',
        engagementMetrics: {
          isHighActivity: true,
          isGrowing: true,
          isQuality: true,
          isTrusted: true,
        },
      },
    ];

    return {
      success: true,
      data: {
        recommendations: fallbackRecommendations,
        metadata: {
          type,
          count: fallbackRecommendations.length,
          generatedAt: new Date().toISOString(),
        },
      },
      fallback: true,
      error: 'Using fallback data due to database error',
    };
  }
}
