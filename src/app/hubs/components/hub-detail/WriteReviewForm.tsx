'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTRPC } from '@/utils/trpc';

interface WriteReviewFormProps {
  hubId: string;
  onReviewSubmitted?: (review: {
    id: string;
    rating: number;
    text: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      image?: string;
    };
  }) => void;
}

export default function WriteReviewForm({
  hubId,
  onReviewSubmitted,
}: WriteReviewFormProps) {
  const trpc = useTRPC();
  const reviewTextFieldId = useId();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createReview = useMutation(
    trpc.hub.createHubReview.mutationOptions({
      onSuccess: (newReview) => {
        toast({
          title: 'Review submitted',
          description: 'Thank you for your feedback!',
        });

        setRating(0);
        setReviewText('');

        Promise.all([
          queryClient.invalidateQueries(
            trpc.hub.getHubReviews.queryFilter({ hubId })
          ),
          queryClient.invalidateQueries(
            trpc.hub.getHub.queryFilter({ id: hubId })
          ),
          queryClient.refetchQueries(
            trpc.hub.getHubReviews.queryFilter({ hubId })
          ),
        ]).catch(() => {});

        if (onReviewSubmitted) {
          const r = newReview as {
            id: string;
            rating: number;
            text: string;
            createdAt: Date | string;
            user: { id: string; name: string | null; image: string | null };
          };
          onReviewSubmitted({
            id: r.id,
            rating: r.rating,
            text: r.text,
            createdAt: (r.createdAt instanceof Date
              ? r.createdAt
              : new Date(r.createdAt)
            ).toISOString(),
            user: {
              id: r.user.id,
              name: r.user.name ?? '',
              image: r.user.image ?? undefined,
            },
          });
        }
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to submit review. Please try again.',
          variant: 'destructive',
        });
      },
    })
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting your review.',
        variant: 'destructive',
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: 'Review text required',
        description: 'Please write a review before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    createReview.mutate(
      { hubId, rating, text: reviewText },
      {
        onSettled: () => setIsSubmitting(false),
      }
    );
  };

  return (
    <Card className="mb-6 border border-gray-800/70 bg-gray-900/60 p-5 shadow-lg backdrop-blur-md">
      <h3 className="mb-4 font-semibold text-lg text-white">Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label className="mb-2 block font-medium text-gray-300 text-sm">
            Rating
          </Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="bg-gray-700/20 focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 cursor-pointer ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-600'
                  }`}
                />
              </Button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <Label
            htmlFor={reviewTextFieldId}
            className="mb-2 block font-medium text-gray-300 text-sm"
          >
            Your Review
          </Label>
          <Textarea
            id={reviewTextFieldId}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with this hub..."
            className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 text-gray-200 focus:border-primary focus:ring-primary"
            rows={4}
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-linear-to-r from-primary to-primary-alt py-2 font-medium text-white transition-opacity hover:opacity-90"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </Card>
  );
}
