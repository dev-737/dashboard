'use client';

import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import JoinHubModal from './JoinHubModal';

interface JoinButtonProps {
  hubId: string;
  hubName: string;
}

export default function JoinButton({ hubName, hubId }: JoinButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleJoin = () => {
    if (!session) {
      router.push(`/login?callbackUrl=/hubs/${hubId}`);
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <Button
        variant="default"
        className="h-8 w-full transform cursor-pointer whitespace-nowrap rounded-lg bg-primary px-3 py-1 font-medium text-white text-xs shadow-sm transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-md sm:h-9 sm:text-sm"
        onClick={handleJoin}
      >
        {!session && <LogIn className="mr-1 h-4 w-4 sm:mr-2" />}
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
