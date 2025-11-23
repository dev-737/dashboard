'use client';

import { Eye, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SafeHubAvatar, SafeHubBanner } from '@/components/ui/HydrationSafeImage';
import { Badge } from '@/components/ui/badge';
import type { HubCardDTO } from '@/lib/discover/query';
import { cn, formatNumber } from '@/lib/utils';

interface FeaturedHubBannerProps extends HubCardDTO {
  className?: string;
}

export function FeaturedHubBanner({
  id,
  name,
  description,
  shortDescription,
  iconUrl,
  bannerUrl,
  verified,
  partnered,
  tags,
  _count,
  averageRating,
  className,
}: FeaturedHubBannerProps) {
  return (
    <div
      className={cn(
        'group relative flex h-[300px] w-[85vw] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0a101d] md:w-[600px] lg:w-[800px]',
        className
      )}
    >
      {/* Background Banner */}
      <div className="absolute inset-0 z-0">
        {bannerUrl ? (
          <SafeHubBanner
            src={bannerUrl}
            name={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 800px"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col justify-end p-6 md:p-8">
        <div className="flex items-end gap-4 md:gap-6">
          {/* Icon */}
          <div className="shrink-0">
            <SafeHubAvatar
              src={iconUrl || '/assets/images/defaults/default-hub.svg'}
              name={name}
              size={80}
              className="h-20 w-20 rounded-2xl border-2 border-gray-700/50 shadow-xl md:h-24 md:w-24"
            />
          </div>

          {/* Text Info */}
          <div className="mb-1 flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {verified && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">
                  Verified
                </Badge>
              )}
              {partnered && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                  Partner
                </Badge>
              )}
              {tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.name}
                  variant="outline"
                  className="border-gray-700 bg-gray-950/30 text-gray-400"
                >
                  #{tag.name}
                </Badge>
              ))}
            </div>

            <h3 className="truncate text-2xl font-bold text-white md:text-3xl">
              {name}
            </h3>

            <p className="line-clamp-2 max-w-2xl text-sm text-gray-300 md:text-base">
              {shortDescription || description}
            </p>

            <div className="flex items-center gap-4 pt-1 text-sm font-medium text-gray-400">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-400" />
                <span>{formatNumber(_count.connections)} Members</span>
              </div>
              {averageRating && (
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span>{averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="absolute right-6 bottom-6 hidden md:block">
          <Link href={`/hubs/${id}`}>
            <Button size="lg" className="btn-primary shadow-lg shadow-indigo-500/20">
              <Eye className="mr-2 h-5 w-5" />
              View Hub
            </Button>
          </Link>
        </div>
        
        {/* Mobile Action Button Overlay */}
         <Link href={`/hubs/${id}`} className="absolute inset-0 md:hidden">
           <span className="sr-only">View {name}</span>
         </Link>
      </div>
    </div>
  );
}
