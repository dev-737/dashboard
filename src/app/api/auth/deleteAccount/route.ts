import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/prisma';
import {
  createCustomRateLimit,
  withCriticalRateLimit,
} from '@/lib/rate-limit-middleware';

async function handleDELETE() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Only allow authenticated users
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // SECURITY FIX: Use correct field names for deletion
  await db.account.deleteMany({ where: { userId: userId } });
  await db.session.deleteMany({ where: { userId: userId } });
  await db.user.delete({ where: { id: userId } });

  return NextResponse.json({ message: 'Account deleted' });
}

// Apply critical rate limiting to account deletion
export const DELETE = withCriticalRateLimit(handleDELETE, {
  tier: createCustomRateLimit(2, 3600), // 2 attempts per hour
  customMessage:
    'Account deletion is heavily rate limited for security. Please wait before attempting again.',
});
