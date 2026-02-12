import { db } from '@/lib/prisma';

export async function syncHubConnectionCount(hubId: string) {
  const connectionCount = await db.connection.count({
    where: { hubId, connected: true },
  });

  await db.hub.update({
    where: { id: hubId },
    data: { connectionCount },
  });

  return connectionCount;
}

export async function syncHubUpvoteCount(hubId: string) {
  const upvoteCount = await db.hubUpvote.count({
    where: { hubId },
  });

  await db.hub.update({
    where: { id: hubId },
    data: { upvoteCount },
  });

  return upvoteCount;
}

export async function syncHubReviewCount(hubId: string) {
  const reviewCount = await db.hubReview.count({
    where: { hubId },
  });

  await db.hub.update({
    where: { id: hubId },
    data: { reviewCount },
  });

  return reviewCount;
}
