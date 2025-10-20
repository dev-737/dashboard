import type { Badges } from '@/lib/generated/prisma/client';
import { db } from '@/lib/prisma';

export interface VoteData {
  bot: string;
  user: string;
  type: 'upvote' | 'test';
  isWeekend: boolean;
  query?: string;
}

export interface VoteResult {
  success: boolean;
  voteValue: number;
  totalVotes: number;
  badgesAwarded?: Badges[];
  error?: string;
}

export interface DiscordWebhookPayload {
  embeds: DiscordEmbed[];
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields?: DiscordEmbedField[];
  thumbnail?: {
    url: string;
  };
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

/**
 * Process a vote from top.gg webhook
 * @param voteData The vote data from top.gg
 * @returns Promise with vote processing result
 */
export async function processTopGGVote(
  voteData: VoteData
): Promise<VoteResult> {
  try {
    const { user: userId, isWeekend, type } = voteData;

    // Calculate vote value (weekend votes count as 2)
    const voteValue = isWeekend ? 2 : 1;

    // Skip test votes in production
    if (type === 'test' && process.env.NODE_ENV === 'production') {
      return {
        success: false,
        voteValue: 0,
        totalVotes: 0,
        error: 'Test votes not processed in production',
      };
    }

    // Update user's vote count and last voted timestamp
    const updatedUser = await db.user.upsert({
      where: { id: userId },
      update: {
        voteCount: {
          increment: voteValue,
        },
        lastVoted: new Date(),
      },
      create: {
        id: userId,
        voteCount: voteValue,
        lastVoted: new Date(),
      },
      select: {
        voteCount: true,
        badges: true,
      },
    });

    // Check and award badges based on vote count
    const badgesAwarded = await checkAndAwardVoteBadges(
      userId,
      updatedUser.voteCount,
      updatedUser.badges
    );

    return {
      success: true,
      voteValue,
      totalVotes: updatedUser.voteCount,
      badgesAwarded: badgesAwarded.length > 0 ? badgesAwarded : undefined,
    };
  } catch (error) {
    console.error('Error processing top.gg vote:', error);
    return {
      success: false,
      voteValue: 0,
      totalVotes: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a user should receive badges based on their vote count
 * @param userId User ID
 * @param voteCount Current vote count
 * @param currentBadges Current user badges
 * @returns Array of newly awarded badges
 */
export async function checkAndAwardVoteBadges(
  userId: string,
  voteCount: number,
  currentBadges: Badges[]
): Promise<Badges[]> {
  const badgesToAward: Badges[] = [];

  // Award VOTER badge for first vote
  if (voteCount >= 1 && !currentBadges.includes('VOTER')) {
    badgesToAward.push('VOTER');
  }

  // Award SUPPORTER badge for 10+ votes (this could be expanded)
  if (voteCount >= 10 && !currentBadges.includes('SUPPORTER')) {
    badgesToAward.push('SUPPORTER');
  }

  // Update user badges if any new badges should be awarded
  if (badgesToAward.length > 0) {
    const newBadges = [...currentBadges, ...badgesToAward];
    await db.user.update({
      where: { id: userId },
      data: { badges: newBadges },
    });
  }

  return badgesToAward;
}

/**
 * Validate top.gg webhook authorization
 * @param authHeader Authorization header from the request
 * @param expectedSecret Expected webhook secret
 * @returns Whether the authorization is valid
 */
export function validateTopGGAuth(
  authHeader: string | null,
  expectedSecret: string
): boolean {
  if (!authHeader || !expectedSecret) {
    return false;
  }
  return authHeader === expectedSecret;
}

/**
 * Check if a user can vote (cooldown check)
 * @param userId User ID
 * @returns Whether the user can vote
 */
export async function canUserVote(userId: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { lastVoted: true },
    });

    if (!user || !user.lastVoted) {
      return true; // User never voted before
    }

    // Check if 12 hours have passed since last vote
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    return user.lastVoted < twelveHoursAgo;
  } catch (error) {
    console.error('Error checking vote cooldown:', error);
    return false; // Conservative approach - don't allow if we can't check
  }
}

/**
 * Get vote statistics for a user
 * @param userId User ID
 * @returns User's vote statistics
 */
export async function getUserVoteStats(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        voteCount: true,
        lastVoted: true,
        badges: true,
      },
    });

    if (!user) {
      return {
        voteCount: 0,
        lastVoted: null,
        canVote: true,
        badges: [],
      };
    }

    const canVote = user.lastVoted ? await canUserVote(userId) : true;

    return {
      voteCount: user.voteCount,
      lastVoted: user.lastVoted,
      canVote,
      badges: user.badges,
    };
  } catch (error) {
    console.error('Error getting user vote stats:', error);
    return {
      voteCount: 0,
      lastVoted: null,
      canVote: false,
      badges: [],
    };
  }
}

/**
 * Get top voters (leaderboard)
 * @param limit Number of users to return
 * @returns Array of top voters
 */
export async function getTopVoters(limit: number = 10) {
  try {
    const topVoters = await db.user.findMany({
      where: {
        voteCount: {
          gt: 0,
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        voteCount: true,
        lastVoted: true,
        badges: true,
      },
      orderBy: [{ voteCount: 'desc' }, { lastVoted: 'desc' }],
      take: limit,
    });

    return topVoters;
  } catch (error) {
    console.error('Error getting top voters:', error);
    return [];
  }
}

/**
 * Send vote announcement to Discord via webhook
 * @param voteData The vote data from top.gg
 * @param result The vote processing result
 * @returns Promise indicating success or failure
 */
export async function sendDiscordVoteAnnouncement(
  voteData: VoteData,
  result: VoteResult
): Promise<boolean> {
  try {
    const webhookUrl = process.env.DISCORD_VOTE_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn(
        'DISCORD_VOTE_WEBHOOK_URL not configured, skipping Discord announcement'
      );
      return false;
    }

    // Skip announcements for test votes
    if (voteData.type === 'test') {
      console.log('Skipping Discord announcement for test vote');
      return true;
    }

    // Get user information from database
    const user = await db.user.findUnique({
      where: { id: voteData.user },
      select: {
        name: true,
        image: true,
        voteCount: true,
        badges: true,
      },
    });

    const embed = createVoteEmbed(voteData, result, user);
    const payload: DiscordWebhookPayload = {
      embeds: [embed],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Discord webhook failed: ${response.status} ${response.statusText}`
      );
    }

    console.log(`Discord vote announcement sent for user ${voteData.user}`);
    return true;
  } catch (error) {
    console.error('Error sending Discord vote announcement:', error);
    return false;
  }
}

/**
 * Create Discord embed for vote announcement
 * @param voteData Vote data from top.gg
 * @param result Vote processing result
 * @param user User data from database
 * @returns Discord embed object
 */
function createVoteEmbed(
  voteData: VoteData,
  result: VoteResult,
  user: {
    name: string | null;
    image: string | null;
    voteCount: number;
    badges: Badges[];
  } | null
): DiscordEmbed {
  const userName = user?.name || 'Unknown User';
  const userAvatar =
    user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png';
  const voteValue = result.voteValue;
  const totalVotes = result.totalVotes;
  const isWeekend = voteData.isWeekend;

  // Determine embed color based on vote type and weekend status
  const embedColor = isWeekend ? 0xffd700 : 0xec407a; // Gold for weekend, Topgg Pink for regular

  // Create description with vote info
  let description = `Thanks for voting for **InterChat**! 🎉\n`;
  description += `**Vote Value:** ${voteValue} point${voteValue > 1 ? 's' : ''}`;
  if (isWeekend) {
    description += ` ✨ *(Weekend Bonus!)*`;
  }

  // Create fields for additional info
  const fields: DiscordEmbedField[] = [
    {
      name: 'Total Votes',
      value: totalVotes.toString(),
      inline: true,
    },
    {
      name: 'Vote Again',
      value: '[Click Here](https://top.gg/bot/769921109209907241/vote)',
      inline: true,
    },
  ];

  // Add badges field if any were awarded
  if (result.badgesAwarded && result.badgesAwarded.length > 0) {
    const badgeEmojis = {
      VOTER: '🗳️',
      SUPPORTER: '💎',
      TRANSLATOR: '🌐',
      DEVELOPER: '👨‍💻',
      STAFF: '👑',
      BETA_TESTER: '🧪',
      HUB_OWNER: '🏠',
      HUB_MODERATOR: '🔨',
      HUB_MANAGER: '🛡️',
      TOP_CHATTER: '💬',
    };

    const badgeNames = result.badgesAwarded
      .map(
        (badge) => `${badgeEmojis[badge] || '🏅'} ${badge.replace('_', ' ')}`
      )
      .join(', ');

    fields.push({
      name: '🎖️ New Badges Earned!',
      value: badgeNames,
      inline: false,
    });
  }

  return {
    title: '<:topggVote:1359021457132355778> New Vote Received!',
    description,
    color: embedColor,
    fields,
    thumbnail: {
      url: userAvatar,
    },
    footer: {
      text: `User: ${userName} • ${isWeekend ? 'Weekend Vote' : 'Regular Vote'}`,
      icon_url: 'https://top.gg/images/dblnew.png',
    },
    timestamp: new Date().toISOString(),
  };
}
