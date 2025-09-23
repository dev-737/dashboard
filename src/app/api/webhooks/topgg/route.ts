import { type NextRequest, NextResponse } from 'next/server';
import {
  processTopGGVote,
  sendDiscordVoteAnnouncement,
  type VoteData,
  validateTopGGAuth,
} from '@/lib/topgg-votes';

export async function POST(request: NextRequest) {
  try {
    // Verify the webhook authorization
    const authHeader = request.headers.get('Authorization');
    const expectedAuth = process.env.TOPGG_WEBHOOK_SECRET;

    if (!expectedAuth) {
      console.error('TOPGG_WEBHOOK_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    if (!validateTopGGAuth(authHeader, expectedAuth)) {
      console.error('Invalid authorization header for top.gg webhook');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the webhook data
    const voteData: VoteData = await request.json();

    // Validate required fields
    if (!voteData.bot || !voteData.user || !voteData.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process the vote
    const result = await processTopGGVote(voteData);

    if (!result.success) {
      await sendDiscordVoteAnnouncement(voteData, result);
      return NextResponse.json(
        { error: result.error || 'Failed to process vote' },
        {
          status:
            result.error === 'Test votes not processed in production'
              ? 200
              : 500,
        }
      );
    }

    const res = await sendDiscordVoteAnnouncement(voteData, result);

    return NextResponse.json(
      { success: true, sentNotif: res },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing top.gg webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
