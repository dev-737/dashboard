'use client';

import { Share2 } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { GridPattern } from '@/components/magicui/GridPattern';
import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';
import { toast } from '@/hooks/use-toast';

const JOIN_HUB_COMMAND_PREFIX = '/connection add hub:';

export default function BannerSection({ hub }: { hub: SimplifiedHub }) {
  const joinHubCommand = `${JOIN_HUB_COMMAND_PREFIX}${hub.name}`;

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(joinHubCommand);
      toast({
        title: 'Command copied!',
        description: 'Paste this command in your Discord server',
        className: 'bg-green-100 border border-green-400 text-green-700',
      });
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  // Determine what to display in the banner area
  let bannerContent: React.ReactNode;

  if (hub.bannerUrl) {
    bannerContent = (
      <>
        <Image
          src={hub.bannerUrl}
          alt={`${hub.name} banner`}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </>
    );
  } else {
    bannerContent = (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        <GridPattern
          width={40}
          height={40}
          className="absolute inset-0 opacity-[0.15]"
        />
        <div className="absolute top-1/4 left-1/5 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-1/6 bottom-1/4 h-96 w-96 rounded-full bg-primary-alt/20 blur-3xl" />
        {hub.iconUrl ? (
          <div className="relative z-10 h-32 w-32 rounded-full border-4 border-background shadow-lg">
            <Image
              src={hub.iconUrl}
              alt={hub.name}
              fill
              className="rounded-full object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="z-10 flex h-32 w-32 items-center justify-center rounded-full bg-primary/20 font-bold text-6xl text-primary">
            {hub.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 w-full">
      <div className="overflow-hidden rounded-xl border border-border bg-gray-950 shadow-lg">
        <div className="relative h-64 w-full md:h-80">
          {bannerContent}

          <div className="absolute right-0 bottom-0 left-0 z-10 flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-end sm:gap-6 sm:p-6">
            <div className="flex flex-1 items-start gap-4 sm:items-center">
              {hub.iconUrl && hub.bannerUrl && (
                <div className="hidden sm:block">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-background shadow-lg">
                    <Image
                      src={hub.iconUrl}
                      alt={hub.name}
                      fill
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="mb-2 flex items-center gap-2 font-bold text-2xl text-white md:text-3xl">
                  {hub.name}
                </h1>
                <p className="line-clamp-2 max-w-2xl text-sm text-white/80">
                  {hub.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={handleCopyCommand}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
