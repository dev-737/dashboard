import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { z } from 'zod/v4';
import { auth } from '@/auth';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';

const f = createUploadthing();

/**
 * UploadThing File Router Configuration
 * Handles hub banner and icon uploads with proper authentication and permissions
 */
export const ourFileRouter = {
  // Hub banner upload endpoint
  hubBannerUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .input(z.object({ hubId: z.string() }))
    .middleware(async ({ input }) => {
      // Get the session
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError('Unauthorized');
      }

      const { hubId } = input;

      // Check permissions
      const permissionLevel = await getUserHubPermission(
        session.user.id,
        hubId
      );
      if (permissionLevel < PermissionLevel.MANAGER) {
        throw new UploadThingError('Insufficient permissions');
      }

      // Verify hub exists
      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: { id: true, name: true },
      });

      if (!hub) {
        throw new UploadThingError('Hub not found');
      }

      return {
        userId: session.user.id,
        hubId,
        hubName: hub.name,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update the hub with the new banner URL
      await db.hub.update({
        where: { id: metadata.hubId },
        data: { bannerUrl: file.ufsUrl },
      });

      return {
        uploadedBy: metadata.userId,
        hubId: metadata.hubId,
        bannerUrl: file.ufsUrl,
      };
    }),

  // Hub icon upload endpoint
  hubIconUploader: f({
    image: {
      maxFileSize: '2MB',
      maxFileCount: 1,
    },
  })
    .input(z.object({ hubId: z.string() }))
    .middleware(async ({ input }) => {
      // Get the session
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError('Unauthorized');
      }

      const { hubId } = input;

      // Check permissions
      const permissionLevel = await getUserHubPermission(
        session.user.id,
        hubId
      );
      if (permissionLevel < PermissionLevel.MANAGER) {
        throw new UploadThingError('Insufficient permissions');
      }

      // Verify hub exists
      const hub = await db.hub.findUnique({
        where: { id: hubId },
        select: { id: true, name: true },
      });

      if (!hub) {
        throw new UploadThingError('Hub not found');
      }

      return {
        userId: session.user.id,
        hubId,
        hubName: hub.name,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update the hub with the new icon URL
      await db.hub.update({
        where: { id: metadata.hubId },
        data: { iconUrl: file.ufsUrl },
      });

      return {
        uploadedBy: metadata.userId,
        hubId: metadata.hubId,
        iconUrl: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
