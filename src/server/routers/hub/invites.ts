import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';
import { db } from '@/lib/prisma';
import { protectedProcedure, router } from '../../trpc';

export const invitesRouter = router({
  // Validate hub invite code and return hub details
  validateInvite: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const { code } = input;
      const userId = ctx.session.user.id;

      const invite = await db.hubInvite.findUnique({
        where: { code },
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              description: true,
              iconUrl: true,
              private: true,
            },
          },
        },
      });

      if (!invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid invite code',
        });
      }

      if (invite.expires && new Date(invite.expires) < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invite code expired',
        });
      }

      // Blacklist check
      const blacklisted = await (await import('@/lib/hub-bans')).isUserBanned(
        userId,
        invite.hub.id
      );
      if (blacklisted) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are blacklisted from this hub',
        });
      }

      return { hub: invite.hub };
    }),
});
