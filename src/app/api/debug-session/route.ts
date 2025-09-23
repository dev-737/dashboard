import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { getUserHubs } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'No session found',
        authenticated: false,
      });
    }

    // Get user's hubs using the same function the dashboard uses
    const userHubs = await getUserHubs(session.user.id);

    const debugInfo = {
      authenticated: true,
      session: {
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name,
        sessionToken: session.sessionToken,
      },
      hubs: {
        count: userHubs.length,
        hubs: userHubs.map(hub => ({
          id: hub.id,
          name: hub.name,
          description: hub.description,
          private: hub.private,
          locked: hub.locked,
        })),
      },
      targetUserCheck: {
        isTargetUser: session.user.id === '1183822371132555325',
        targetHubFound: userHubs.some(h => h.id === '676b112febc6e1be4b4d0cd5'),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error('Debug session error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
