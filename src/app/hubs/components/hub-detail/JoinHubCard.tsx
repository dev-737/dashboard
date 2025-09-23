'use client';

import { Check, PlusIcon, Terminal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';
import { toast } from '@/hooks/use-toast';

export default function JoinHubCard({ hub }: { hub: SimplifiedHub }) {
  const { name } = hub;
  const [copied, setCopied] = useState(false);

  const joinHubCommand = `/connect hub:${name}`;

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(joinHubCommand);
      setCopied(true);
      toast({
        title: 'Command copied!',
        description:
          'Paste this command in your Discord server to join the hub.',
        duration: 3000,
        className: 'bg-card border-primary/20 text-primary-foreground',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the command manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/3 to-primary/1 shadow-md dark:border-primary/20 dark:bg-gradient-to-br dark:from-primary/15 dark:to-primary/5">
      <div className="border-primary/10 border-b bg-primary/3 p-4 dark:border-primary/20 dark:bg-primary/15">
        <h3 className="flex items-center justify-center gap-2 font-medium text-card text-lg dark:text-card-foreground">
          <PlusIcon className="h-5 w-5 text-primary" />
          Join This Hub
        </h3>
      </div>
      <CardContent className="p-5">
        <p className="mb-4 text-center text-card text-sm dark:text-card-foreground">
          Connect your Discord server to this hub in one easy step
        </p>
        <Button
          className="w-full cursor-pointer bg-primary text-card-foreground shadow-sm hover:bg-primary/90"
          onClick={handleCopyCommand}
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Command Copied
            </>
          ) : (
            <>
              <Terminal className="mr-2 h-4 w-4" />
              Copy Join Command
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
