import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';
import { useToast } from '@/hooks/use-toast';
import { useTRPC } from '@/utils/trpc';

export function useHubUpvote(
  hubId: string,
  initialUpvotes: SimplifiedHub['upvotes']
) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const trpc = useTRPC();
  const [liked, setLiked] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(initialUpvotes.length);

  useEffect(() => {
    if (session?.user?.id) {
      setLiked(
        initialUpvotes.some((upvote) => upvote.userId === session.user.id)
      );
    }
  }, [session, initialUpvotes]);

  // Use tRPC mutation instead of raw API call
  const upvoteMutation = useMutation(
    trpc.hub.upvoteHub.mutationOptions({
      onSuccess: (data) => {
        const newLikeState = data.upvoted;
        setLiked(newLikeState);

        toast({
          title: newLikeState ? 'Upvoted hub' : 'Removed upvote',
          description: newLikeState
            ? 'Thanks for your support!'
            : "You've removed your upvote",
          duration: 2000,
        });

        router.refresh(); // Refresh server components
      },
      onError: (error) => {
        // Revert optimistic update on error
        setLiked(!liked);
        setUpvoteCount((prevCount) => (liked ? prevCount + 1 : prevCount - 1));

        toast({
          title: 'Error',
          description: error.message || 'Failed to update upvote status',
          variant: 'destructive',
        });
      },
    })
  );

  const handleUpvote = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (!session?.user?.id) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to upvote hubs',
        });
        router.push('/login');
        return;
      }

      if (upvoteMutation.isPending) return;

      // Optimistic UI update
      const wasLiked = liked;
      setLiked(!wasLiked);
      setUpvoteCount((prevCount) => (wasLiked ? prevCount - 1 : prevCount + 1));

      // Trigger the mutation
      upvoteMutation.mutate({ hubId });
    },
    [hubId, liked, router, session, toast, upvoteMutation]
  );

  return {
    liked,
    upvoteCount,
    handleUpvote,
    isLoading: upvoteMutation.isPending,
  };
}
