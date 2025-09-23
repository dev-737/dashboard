'use server';

import { db } from '@/lib/prisma';
import { PermissionLevel } from './constants';

/**
 * Check if a user has permission to access a hub
 * @param userId The user's ID
 * @param hubId The hub's ID
 * @returns The permission level for the user on the hub
 */
export async function getUserHubPermission(
  userId: string,
  hubId: string
): Promise<PermissionLevel> {
  if (!userId || !hubId) return PermissionLevel.NONE;

  // Get the hub
  const hub = await db.hub.findUnique({
    where: { id: hubId },
    select: {
      ownerId: true,
      moderators: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  if (!hub) return PermissionLevel.NONE;

  // Check if user is hub owner
  if (hub.ownerId === userId) {
    return PermissionLevel.OWNER;
  }

  // Check if user is a moderator or manager
  if (hub.moderators.length > 0) {
    const role = hub.moderators[0].role;
    return role === 'MANAGER'
      ? PermissionLevel.MANAGER
      : PermissionLevel.MODERATOR;
  }

  return PermissionLevel.NONE;
}

/**
 * Get all hubs a user has access to with their permission level
 * @param userId The user's ID
 * @returns An array of hubs with permission levels
 */
export async function getUserHubs(userId: string) {
  if (!userId) return [];

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      modPositions: {
        include: {
          hub: {
            include: {
              connections: { where: { connected: true }, select: { id: true } },
              upvotes: true,
            },
          },
        },
      },
      ownedHubs: {
        include: {
          connections: {
            where: { connected: true },
            select: { id: true },
          },
          upvotes: true,
        },
      },
    },
  });

  // Combine and add permission level
  const hubsWithPermission =
    user?.ownedHubs.map((hub) => ({
      ...hub,
      permissionLevel: PermissionLevel.OWNER,
    })) || [];

  const moderatedHubsWithPermission =
    user?.modPositions.map((modPosition) => ({
      ...modPosition.hub,
      permissionLevel:
        modPosition.role === 'MANAGER'
          ? PermissionLevel.MANAGER
          : PermissionLevel.MODERATOR,
    })) || [];

  // Combine and remove duplicates
  const allHubs = [...hubsWithPermission];

  // biome-ignore lint/complexity/noForEach: <explanation>
  moderatedHubsWithPermission.forEach((hub) => {
    if (!allHubs.some((h) => h.id === hub.id)) {
      allHubs.push(hub);
    }
  });

  return allHubs;
}

/**
 * Check if a user has permission to perform an action on a hub
 * @param userId The user's ID
 * @param hubId The hub's ID
 * @param requiredPermission The required permission level
 * @returns Whether the user has the required permission
 */
export async function hasHubPermission(
  userId: string,
  hubId: string,
  requiredPermission: PermissionLevel
): Promise<boolean> {
  const userPermission = await getUserHubPermission(userId, hubId);
  return userPermission >= requiredPermission;
}
