import { db } from '@/lib/prisma';

export async function updateHubAverageRating(hubId: string) {
  const reviews = await db.hubReview.findMany({
    where: { hubId },
    select: { rating: true },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  await db.hub.update({
    where: { id: hubId },
    data: { averageRating },
  });
}
