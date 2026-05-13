import type { Badges } from '@/lib/generated/prisma/client/client';
import { db } from '@/lib/prisma';

export interface VoteData {
  bot: string;
  user: string;
  type: 'upvote' | 'test';
  isWeekend: boolean;
  query?: string;
}

interface VoteResult {
  success: boolean;
  voteValue: number;
  totalVotes: number;
  badgesAwarded?: Badges[];
  error?: string;
}

interface DiscordWebhookPayload {
  embeds: DiscordEmbed[];
}

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
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
        lastVoted: new Date(),
        stats: {
          upsert: {
            update: {
              voteCount: {
                increment: voteValue,
              },
              updatedAt: new Date(),
            },
            create: {
              voteCount: voteValue,
            },
          },
        },
      },
      create: {
        id: userId,
        lastVoted: new Date(),
        stats: {
          create: {
            voteCount: voteValue,
          },
        },
      },
      select: {
        badges: true,
        stats: {
          select: {
            voteCount: true,
          },
        },
      },
    });
    const totalVotes = updatedUser.stats?.voteCount ?? 0;

    // Check and award badges based on vote count
    const badgesAwarded = await checkAndAwardVoteBadges(
      userId,
      totalVotes,
      updatedUser.badges
    );

    return {
      success: true,
      voteValue,
      totalVotes,
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
async function checkAndAwardVoteBadges(
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
        badges: true,
        stats: {
          select: {
            voteCount: true,
          },
        },
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
    badges: Badges[];
    stats: {
      voteCount: number;
    } | null;
  } | null
): DiscordEmbed {
  const userName = user?.name || 'Unknown User';
  const userAvatar =
    user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png';
  const voteValue = result.voteValue;
  const totalVotes = user?.stats?.voteCount ?? 0;
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
