'use client';

import { Check, ChevronDown, Copy, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { authClient } from '@/lib/auth-client';

interface JoinButtonProps {
  hubName: string;
  hubId: string;
}

export default function JoinButton({ hubName, hubId }: JoinButtonProps) {
  const [copied, setCopied] = useState(false);
  const joinHubCommand = `/connection add hub:${hubName}`;
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleJoin = async () => {
    try {
      await navigator.clipboard.writeText(joinHubCommand);
      setCopied(true);
      toast.success('Command copied!', {
        description:
          'Paste this command in your Discord server to join the hub.',
        className: 'bg-card border-primary/20 text-primary-foreground',
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy', {
        description: 'Please copy the command manually.',
      });
    }
  };

  const handleConnectServer = () => {
    if (!session) {
      router.push(`/login?callbackUrl=/dashboard?hubId=${hubId}`);
      return;
    }

    // Redirect to servers page with hubId parameter
    router.push(`/dashboard?hubId=${hubId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          className="h-8 w-full transform cursor-pointer whitespace-nowrap rounded-lg bg-primary px-3 py-1 font-medium text-white text-xs shadow-sm transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-md sm:h-9 sm:text-sm"
        >
          {copied ? (
            <>
              <Check className="mr-1 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <span>Join</span>
              <ChevronDown className="ml-1 h-3 w-3 shrink-0 sm:ml-2 sm:h-4 sm:w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 border-gray-800 bg-gray-900 sm:w-56"
      >
        <DropdownMenuItem onClick={handleJoin} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy Discord Command</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleConnectServer}
          className="cursor-pointer"
        >
          <Home className="mr-2 h-4 w-4" />
          <span>Connect Server</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
