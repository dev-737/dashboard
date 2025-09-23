import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db } from '@/lib/prisma';
import { protectedProcedure, router } from '../trpc';

// Admin check helper
const isAdmin = (userId: string): boolean => {
  const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  return adminUserIds.includes(userId);
};

export const announcementRouter = router({
  // Get all announcements
  getAnnouncements: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get the user's last read date
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { inboxLastReadDate: true },
    });

    // Get all announcements
    const announcements = await db.devAlerts.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Mark which announcements are unread
    const lastReadDate = user?.inboxLastReadDate || new Date(0);

    return {
      announcements: announcements.map((announcement) => ({
        ...announcement,
        isUnread: announcement.createdAt > lastReadDate,
      })),
      unreadCount: announcements.filter((a) => a.createdAt > lastReadDate)
        .length,
    };
  }),

  // Mark all announcements as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Update the user's last read date to now
    await db.user.update({
      where: { id: userId },
      data: { inboxLastReadDate: new Date() },
    });

    return { success: true };
  }),

  // Get all announcements for admin (without user-specific read status)
  getAllForAdmin: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    if (!isAdmin(userId)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Admin access required',
      });
    }

    const announcements = await db.devAlerts.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return announcements;
  }),

  // Create announcement (admin only)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        content: z.string().min(1, 'Content is required'),
        thumbnailUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!isAdmin(userId)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Admin access required',
        });
      }

      const announcement = await db.devAlerts.create({
        data: {
          title: input.title,
          content: input.content,
          thumbnailUrl: input.thumbnailUrl,
        },
      });

      return announcement;
    }),

  // Delete announcement (admin only)
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'Announcement ID is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!isAdmin(userId)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Admin access required',
        });
      }

      await db.devAlerts.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
