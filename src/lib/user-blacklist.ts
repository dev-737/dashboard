'use server';

import { db } from '@/lib/prisma';

/**
 * Check if a user is globally blacklisted from InterChat
 * @param userId The Discord user ID to check
 * @returns The blacklist record if active, null otherwise
 */
export async function getUserBlacklist(userId: string) {
  const blacklist = await db.blacklist.findFirst({
    where: {
      userId,
      OR: [
        { expiresAt: null }, // Permanent blacklist
        { expiresAt: { gt: new Date() } }, // Temporary blacklist that hasn't expired
      ],
    },
    select: {
      id: true,
      reason: true,
      expiresAt: true,
      type: true,
      createdAt: true,
    },
  });

  return blacklist;
}

/**
 * Check if a user is blacklisted (boolean only)
 * @param userId The Discord user ID to check
 * @returns True if the user is blacklisted, false otherwise
 */
export async function isUserBlacklisted(userId: string): Promise<boolean> {
  const blacklist = await getUserBlacklist(userId);
  return blacklist !== null;
}
