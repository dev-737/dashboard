import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { authClient } from '@/lib/auth-client';
import { useTRPC } from '@/utils/trpc';

interface UseDiscoverUpvoteProps {
  hubId: string;
  initialUpvoted: boolean;
  initialCount: number;
}

export function useDiscoverUpvote({
  hubId,
  initialUpvoted,
  initialCount,
}: UseDiscoverUpvoteProps) {
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
  const [upvoteCount, setUpvoteCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const upvoteMutation = useMutation(
    trpc.hub.upvoteHub.mutationOptions({
      onSuccess: (res) => {
        toast({
          title: res.upvoted ? 'Upvoted hub' : 'Removed upvote',
          description: res.upvoted
            ? 'Thanks for your support!'
            : "You've removed your upvote",
          duration: 2000,
        });
        // Optionally invalidate hub detail if present elsewhere
        queryClient
          .invalidateQueries(trpc.hub.getHub.queryFilter({ id: hubId }))
          .catch(() => {});
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update upvote status',
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

      if (isLoading) return;

      setIsLoading(true);

      // Optimistic UI update
      const wasUpvoted = isUpvoted;
      setIsUpvoted(!wasUpvoted);
      setUpvoteCount((prevCount) =>
        wasUpvoted ? prevCount - 1 : prevCount + 1
      );

      try {
        const res = await upvoteMutation.mutateAsync({ hubId });
        const newUpvoteState = res.upvoted;
        // Update state to match server response
        setIsUpvoted(newUpvoteState);
        setUpvoteCount((prevCount) => {
          if (newUpvoteState && !wasUpvoted) return prevCount;
          if (!newUpvoteState && wasUpvoted) return prevCount;
          if (newUpvoteState && wasUpvoted) return prevCount + 1;
          if (!newUpvoteState && !wasUpvoted) return prevCount - 1;
          return prevCount;
        });
      } catch {
        // Revert on error
        setIsUpvoted(wasUpvoted);
        setUpvoteCount((prevCount) =>
          wasUpvoted ? prevCount + 1 : prevCount - 1
        );
      } finally {
        setIsLoading(false);
      }
    },
    [hubId, isUpvoted, router, session, toast, isLoading, upvoteMutation]
  );

  return {
    isUpvoted,
    upvoteCount,
    handleUpvote,
    isLoading,
  };
}
