'use client';

import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import JoinHubModal from './JoinHubModal';

interface JoinButtonProps extends React.ComponentProps<typeof Button> {
  hubId: string;
  hubName: string;
  isAuthenticated?: boolean;
}

export default function JoinButton({
  hubName,
  hubId,
  isAuthenticated,
  className,
  disabled,
  ...props
}: JoinButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const resolvedAuthenticated =
    typeof isAuthenticated === 'boolean'
      ? isAuthenticated
      : Boolean(session?.user?.id);
  const isSessionLoading =
    typeof isAuthenticated === 'boolean' ? false : isPending;

  const handleJoin = () => {
    if (isSessionLoading) {
      return;
    }

    if (!resolvedAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/hubs/${hubId}`)}`);
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <Button
        variant="default"
        className={cn(
          'w-full transform transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-md',
          className
        )}
        disabled={disabled || isSessionLoading}
        onClick={handleJoin}
        {...props}
      >
        {!resolvedAuthenticated && !isSessionLoading && (
          <LogIn className="mr-2 h-4 w-4" />
        )}
        <span>Join</span>
      </Button>
      <JoinHubModal
        hubId={hubId}
        hubName={hubName}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
