'use server';

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
