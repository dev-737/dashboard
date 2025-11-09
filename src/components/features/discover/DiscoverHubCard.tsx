'use client';

import {
  Eye,
  Handshake,
  Heart,
  Loader2,
  MessageCircle,
  Star,
  Users,
} from 'lucide-react';
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
import {
  SafeHubAvatar,
  SafeHubBanner,
} from '@/components/ui/HydrationSafeImage';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDiscoverUpvote } from '@/hooks/use-discover-upvote';
import type { HubCardDTO } from '@/lib/discover/query';
import { cn, formatNumber } from '@/lib/utils';

interface DiscoverHubCardProps extends HubCardDTO {
  onTagClick?: (tagName: string) => void;
  isAboveFold?: boolean;
}

const DiscoverHubCard = memo(function DiscoverHubCard({
  id,
  name,
  description,
  shortDescription,
  iconUrl,
  bannerUrl,
  verified,
  partnered,
  tags,
  nsfw,
  weeklyMessageCount,
  _count,
  averageRating,
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

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-800/60 bg-gray-900/90 transition-colors duration-200 hover:border-gray-700/80 hover:bg-gray-900/95 sm:bg-gray-900/40 sm:backdrop-blur-sm sm:hover:bg-gray-900/60">
      {/* Banner */}
      {bannerUrl && (
        <div className="relative h-32 w-full overflow-hidden">
          <SafeHubBanner
            src={bannerUrl}
            name={name}
            className="h-full w-full object-cover"
            priority={isAboveFold}
            quality={isAboveFold ? 75 : 60}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            fetchPriority={isAboveFold ? 'high' : 'low'}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/60" />
        </div>
      )}

      {/* NSFW Badge */}
      {nsfw && (
        <div className={cn(
          "absolute right-3 z-10 rounded-full border border-red-500/50 bg-red-950 px-2.5 py-1 font-medium text-red-300 text-xs sm:bg-red-950/90 sm:backdrop-blur-sm",
          bannerUrl ? "top-3" : "top-3"
        )}>
          🔞 NSFW
        </div>
      )}

      <CardHeader className={cn("relative pb-4", bannerUrl ? "pt-4" : "pt-6")}>
        <div className="flex items-start gap-5">
          <SafeHubAvatar
            src={iconUrl || '/assets/images/defaults/default-hub.svg'}
            name={name}
            size={72}
            className="shrink-0 ring-2 ring-gray-700/50"
            priority={isAboveFold}
            quality={isAboveFold ? 85 : 75}
            sizes="72px"
            fetchPriority={isAboveFold ? 'high' : 'low'}
          />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="truncate font-semibold text-white text-xl">
                {name}
              </CardTitle>
              {verified && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-blue-500">
                      <svg
                        className="h-2.5 w-2.5 text-white"
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Verified Hub</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {partnered && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-violet-600">
                      <Handshake className="h-2.5 w-2.5 text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Partner Hub</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* icon stats */}
            <div className="flex items-center gap-4 text-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1.5">
                    <MessageCircle className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-300">
                      {formatNumber(weeklyMessageCount)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Messages per week</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-400" />
                    <span className="text-gray-300">
                      {formatNumber(_count.connections)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Members</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1.5">
                    <Heart className="h-4 w-4 text-pink-400" />
                    <span className="text-gray-300">
                      {formatNumber(upvoteCount)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upvotes</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Rating Display */}
            {averageRating !== null && averageRating !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((starIndex) => (
                    <Star
                      key={starIndex}
                      className={cn(
                        'h-3.5 w-3.5',
                        starIndex <= Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      )}
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-sm">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative flex-1 space-y-4 pb-5">
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <button
                type="button"
                key={tag.name}
                onClick={() => onTagClick?.(tag.name)}
                className="inline-flex cursor-pointer items-center rounded-full border border-gray-700/40 bg-gray-800/40 px-3 py-1.5 font-medium text-gray-400 text-sm transition-colors hover:border-gray-600/60 hover:bg-gray-800/60 hover:text-gray-300"
              >
                #{tag.name}
              </button>
            ))}
            {tags.length > 3 && (
              <span className="inline-flex items-center rounded-full border border-gray-700/30 bg-gray-800/30 px-3 py-1.5 text-gray-500 text-sm">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <CardDescription className="text-gray-400 text-sm leading-relaxed">
          {shortDescription ||
            description ||
            'A community space for discussions and connections.'}
        </CardDescription>
      </CardContent>

      <CardFooter className="relative border-gray-800/50 border-t pt-5">
        <div className="flex w-full gap-3">
          <Link href={`/hubs/${id}`} className="flex-1">
            <Button className="btn-primary group w-full text-base">
              <Eye className="mr-2 h-4 w-4" />
              View Hub
            </Button>
          </Link>

          <Button
            variant="outline"
            size="icon"
            onClick={handleUpvote}
            disabled={isLoading}
            className={cn(
              'h-10 w-10 shrink-0 rounded-lg border transition-colors',
              liked
                ? 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'border-gray-700/60 bg-gray-900/40 text-gray-400 hover:border-gray-600 hover:bg-gray-800/60 hover:text-white'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={cn('h-4 w-4', liked && 'fill-red-400')} />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});

export default DiscoverHubCard;
