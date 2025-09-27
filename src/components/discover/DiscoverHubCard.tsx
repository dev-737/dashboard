'use client';

import { Eye, Heart, Loader2, MessageCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SafeHubAvatar, SafeHubBanner } from '@/components/ui/hydration-safe-image';
import { useDiscoverUpvote } from '@/hooks/use-discover-upvote';
import type { HubCardDTO } from '@/lib/discover/query';
import { cn } from '@/lib/utils';

interface DiscoverHubCardProps extends HubCardDTO {
  onTagClick?: (tagName: string) => void;
  isAboveFold?: boolean; // Add prop to identify above-the-fold cards
}

const DiscoverHubCard = memo(function DiscoverHubCard({
  id,
  name,
  description,
  iconUrl,
  bannerUrl,
  verified,
  partnered,
  tags,
  nsfw,
  weeklyMessageCount,
  activityLevel,
  _count,
  isUpvoted = false,
  onTagClick,
  isAboveFold = false,
}: DiscoverHubCardProps) {
  const {
    isUpvoted: liked,
    upvoteCount,
    handleUpvote,
    isLoading,
  } = useDiscoverUpvote({
    hubId: id,
    initialUpvoted: isUpvoted,
    initialCount: _count.upvotes,
  });

  // Activity level configuration with better styling
  const activityConfig = {
    LOW: {
      label: 'Quiet',
      color: 'bg-slate-500',
      textColor: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/20',
    },
    MEDIUM: {
      label: 'Active',
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    HIGH: {
      label: 'Buzzing',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
  };

  const config = activityConfig[activityLevel] || activityConfig.LOW;

  return (
    <Card className="group premium-card relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-[var(--radius)] transition-all duration-500 ease-out hover:scale-[1.01] hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 touch-manipulation sm:min-h-[420px] sm:hover:scale-[1.02]">
      {/* Banner Background with optimized loading */}
      {bannerUrl && (
        <div className="absolute inset-0 opacity-20">
          <SafeHubBanner
            src={bannerUrl}
            name={name}
            className="object-cover"
            priority={isAboveFold}
            quality={isAboveFold ? 75 : 60}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            // @ts-ignore - Next.js Image supports fetchpriority
            fetchPriority={isAboveFold ? 'high' : 'low'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
        </div>
      )}

      {/* NSFW Badge */}
      {nsfw && (
        <div className="absolute top-4 right-4 z-10 rounded-full border border-red-500/50 bg-red-500/20 px-2 py-1 font-medium text-red-400 text-xs backdrop-blur-sm">
          🔞 NSFW
        </div>
      )}

      <CardHeader className="relative pb-4">
        <div className="flex items-start gap-4">
          <SafeHubAvatar
            src={iconUrl || '/default-server.svg'}
            name={name}
            size={64}
            className="ring-2 ring-gray-700/50 transition-all duration-300 group-hover:ring-purple-500/30"
            priority={isAboveFold}
            quality={isAboveFold ? 85 : 75}
            sizes="64px"
            // @ts-ignore - Next.js Image supports fetchpriority
            fetchPriority={isAboveFold ? 'high' : 'low'}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <CardTitle className="truncate font-bold text-white text-xl">
                {name}
              </CardTitle>
              {verified && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title>Verified hub</title>
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              {partnered && (
                <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 font-medium text-white text-xs">
                  Partner
                </div>
              )}
            </div>

            <CardDescription className="line-clamp-2 text-gray-300 leading-relaxed">
              {description ||
                'A community space for meaningful discussions and connections.'}
            </CardDescription>

            {/* TODO: Enable Activity Badge after adding logic to update activity level in the python bot */}
            {/* <div
              className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 ${config.bgColor} ${config.borderColor} border`}
            >
              <div
                className={`h-2 w-2 rounded-full ${config.color} animate-pulse`}
              />
              <span className={`font-medium text-sm ${config.textColor}`}>
                {config.label}
              </span>
            </div> */}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative flex-1 space-y-4">
        {/* Tags */}
        <div className="flex items-center">
          {tags && tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Button
                  key={tag.name}
                  onClick={() => onTagClick?.(tag.name)}
                  className="inline-flex cursor-pointer items-center rounded-2xl border border-gray-700/50 bg-gray-800/60 px-1.5 py-0.5 text-xs font-medium text-gray-300 transition-all duration-200 hover:border-gray-600/50 hover:bg-gray-700/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  #{tag.name}
                </Button>
              ))}
              {tags.length > 3 && (
                <span className="inline-flex items-center rounded-md border border-gray-700/30 bg-gray-800/40 px-1.5 py-0.5 text-xs text-gray-400">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <div className="h-6" /> // Reduced placeholder height
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-700/30 bg-gray-800/40 p-3 text-center">
            <MessageCircle className="mx-auto mb-2 h-5 w-5 text-purple-400" />
            <div className="font-bold text-lg text-white">
              {weeklyMessageCount?.toLocaleString() ?? '0'}
            </div>
            <div className="font-medium text-gray-400 text-xs">Msgs/w</div>
          </div>

          <div className="rounded-lg border border-gray-700/30 bg-gray-800/40 p-3 text-center">
            <Users className="mx-auto mb-2 h-5 w-5 text-blue-400" />
            <div className="font-bold text-lg text-white">
              {_count.connections?.toLocaleString() ?? '0'}
            </div>
            <div className="font-medium text-gray-400 text-xs">Members</div>
          </div>

          <div className="rounded-lg border border-gray-700/30 bg-gray-800/40 p-3 text-center">
            <Heart className="mx-auto mb-2 h-5 w-5 text-red-400" />
            <div className="font-bold text-lg text-white">
              {upvoteCount?.toLocaleString() ?? '0'}
            </div>
            <div className="font-medium text-gray-400 text-xs">Upvotes</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative mt-auto pt-4">
        <div className="flex w-full gap-3">
          <Link href={`/hubs/${id}`} className="flex-1">
            <Button className="btn-primary group w-full">
              <Eye className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              Explore Hub
            </Button>
          </Link>

          <Button
            variant="outline"
            size="icon"
            onClick={handleUpvote}
            disabled={isLoading}
            className={`shrink-0 rounded-[var(--radius-button)] border-2 transition-all duration-300 ${liked
              ? 'border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'border-gray-700/50 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-white'
              }`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={cn(
                  'h-4 w-4 transition-all duration-300',
                  liked ? 'scale-110 fill-red-400' : 'hover:scale-110'
                )}
              />
            )}
          </Button>
        </div>
      </CardFooter>

      <div className="pointer-events-none absolute inset-0 rounded-[var(--radius)] bg-gradient-to-r from-purple-600/0 to-indigo-600/0 transition-all duration-500 group-hover:from-purple-600/5 group-hover:to-indigo-600/5" />
    </Card>
  );
});

export default DiscoverHubCard;
