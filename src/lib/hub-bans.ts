'use server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

/**
 * Check if a user is blacklisted from a hub
 * @param userId The user's ID
 * @param hubId The hub's ID
 * @returns Whether the user is blacklisted
 */
export async function isUserBanned(
  userId: string,
  hubId: string
): Promise<boolean> {
  if (!userId || !hubId) return false;

  // Check for active blacklist infractions for this user in this hub
  const blacklist = await db.infraction.findFirst({
    where: {
      hubId,
      userId,
      type: 'BLACKLIST',
      status: 'ACTIVE',
      OR: [
        { expiresAt: null }, // Permanent blacklist
        { expiresAt: { gt: new Date() } }, // Temporary blacklist that hasn't expired
      ],
    },
  });

  return !!blacklist;
}

/**
 * Check if a server is blacklisted from a hub
 * @param serverId The server's ID
 * @param hubId The hub's ID
 * @returns Whether the server is blacklisted
 */
export async function isServerBanned(
  serverId: string,
  hubId: string
): Promise<boolean> {
  if (!serverId || !hubId) return false;

  // Check for active blacklist infractions for this server in this hub
  const blacklist = await db.infraction.findFirst({
    where: {
      hubId,
      serverId,
      type: 'BLACKLIST',
      status: 'ACTIVE',
      OR: [
        { expiresAt: null }, // Permanent blacklist
        { expiresAt: { gt: new Date() } }, // Temporary blacklist that hasn't expired
      ],
    },
  });

  return !!blacklist;
}

/**
 * Check if a user or server is blacklisted from a hub and return an appropriate error response if so
 * @param userId The user's ID
 * @param serverId The server's ID (optional)
 * @param hubId The hub's ID
 * @returns NextResponse with error if blacklisted, null if not blacklisted
 */
export async function checkBanAndReturnError(
  userId: string,
  hubId: string,
  serverId?: string
): Promise<NextResponse | null> {
  // Check if the user is blacklisted
  const userBlacklisted = await isUserBanned(userId, hubId);
  if (userBlacklisted) {
    return NextResponse.json(
      { error: 'You are blacklisted from this hub' },
      { status: 403 }
    );
  }

  // If a server ID is provided, check if it's blacklisted
  if (serverId) {
    const serverBlacklisted = await isServerBanned(serverId, hubId);
    if (serverBlacklisted) {
      return NextResponse.json(
        { error: 'This server is blacklisted from this hub' },
        { status: 403 }
      );
    }
  }

  // Not blacklisted
  return null;
}
