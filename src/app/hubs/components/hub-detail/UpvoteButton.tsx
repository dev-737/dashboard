'use client';

import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';
import { cn } from '@/lib/utils';
import { useHubUpvote } from '../../hooks/use-hub-upvote';

interface UpvoteButtonProps {
  hubId: string;
  initialUpvotes: SimplifiedHub['upvotes'];
}

export default function UpvoteButton({
  hubId,
  initialUpvotes,
}: UpvoteButtonProps) {
  const { liked, upvoteCount, handleUpvote, isLoading } = useHubUpvote(
    hubId,
    initialUpvotes
  );

  return (
    <Button
      variant="outline"
      className={cn(
        'w-full cursor-pointer rounded-lg border-gray-700 bg-transparent px-3 py-2 text-sm shadow-sm hover:bg-rose-500/10 hover:text-rose-400 hover:shadow-md active:scale-95 sm:px-4 md:w-auto',
        liked && 'border-primary/50'
      )}
      onClick={handleUpvote}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin sm:mr-2 sm:h-5 sm:w-5" />
      ) : (
        <Heart
          className={cn(
            'mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5',
            liked ? 'fill-rose-500 text-rose-500' : 'text-rose-500'
          )}
        />
      )}
      <span className="hidden sm:inline">{liked ? 'Upvoted' : 'Upvote'}</span>
      <span className="ml-1 text-gray-400 sm:ml-2">({upvoteCount})</span>
    </Button>
  );
}
