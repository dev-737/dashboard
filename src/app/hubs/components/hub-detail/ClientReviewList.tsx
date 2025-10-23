'use client';

import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useHubReviews } from '@/hooks/use-hub-reviews';
import ReviewItem from './ReviewItem';

interface ClientReviewListProps {
  hubId: string;
  initialReviews?: any[];
}

export default function ClientReviewList({
  hubId,
  initialReviews = [],
}: ClientReviewListProps) {
  const {
    data: reviews,
    isLoading,
    error,
  } = useHubReviews(hubId, {
    enabled: true,
    staleTime: 0,
    initialData: initialReviews,
  });

  const reviewsToShow = reviews || [];

  if (isLoading && !reviewsToShow?.length) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`review-skeleton-${index + 1}`}
            className="space-y-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Skeleton key={starIndex} className="h-4 w-4" />
                  ))}
                </div>
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-gray-400">
        <MessageSquare className="mb-3 h-8 w-8 text-red-500" />
        <p className="text-center text-red-400">Failed to load reviews</p>
        <p className="mt-1 text-center text-gray-500 text-sm">
          Please refresh the page to try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviewsToShow?.length > 0 ? (
        reviewsToShow.map((review) => (
          <ReviewItem key={review.id} review={review} hubId={hubId} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center p-10 text-gray-400">
          <MessageSquare className="mb-3 h-12 w-12 text-gray-500 opacity-50" />
          <p className="text-center text-gray-400">No reviews yet</p>
          <p className="mt-1 text-center text-gray-500 text-sm">
            Be the first to review this hub!
          </p>
        </div>
      )}
    </div>
  );
}
