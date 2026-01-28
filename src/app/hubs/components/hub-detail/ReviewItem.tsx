'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/utils/trpc';

interface ReviewItemProps {
  review: SimplifiedHub['reviews'][0];
  hubId: string;
}

export default function ReviewItem({ review, hubId }: ReviewItemProps) {
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const deleteReview = useMutation(
    trpc.hub.deleteHubReview.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Review deleted',
          description: 'Your review has been successfully deleted.',
        });
        queryClient
          .invalidateQueries(trpc.hub.getHubReviews.queryFilter({ hubId }))
          .catch(() => {});
        queryClient
          .invalidateQueries(trpc.hub.getHub.queryFilter({ id: hubId }))
          .catch(() => {});
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to delete review. Please try again.',
          variant: 'destructive',
        });
      },
    })
  );

  const isOwnReview = session?.user?.id === review.user.id;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setIsDeleting(true);
    deleteReview.mutate(
      { reviewId: review.id },
      {
        onSettled: () => {
          setIsDeleting(false);
          router.refresh();
        },
      }
    );
  };

  return (
    <div className="rounded-lg border border-gray-800/60 bg-gray-900/40 p-5 transition-colors duration-200 hover:bg-gray-800/30">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-700/50">
            <Image
              src={
                review.user?.image ||
                '/assets/images/defaults/default-avatar.png'
              }
              alt={review.user?.name || 'User'}
              width={40}
              height={40}
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h4 className="font-medium text-sm text-white">
              {review.user?.name || 'Anonymous'}
            </h4>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={`review-star-${i + 1}`}
                className={cn(
                  'h-4 w-4',
                  i < review.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-600'
                )}
              />
            ))}
          </div>
          {isOwnReview && (
            <Button
              variant="ghost"
              size="sm"
              className="-mr-2 h-8 w-8 p-0 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete review"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>
      </div>
      <p className="text-gray-300 text-sm">{review.text}</p>
    </div>
  );
}
