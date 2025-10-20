'use client';

import { Tag, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useHubRecommendations,
  type HubRecommendation,
} from '@/hooks/use-hub-recommendations';
import { useEffect, useState } from 'react';

interface SimilarHubsCardProps {
  currentHubId: string;
  hubTags?: string[];
}

const SimilarHubsCard = ({
  currentHubId,
  hubTags = [],
}: SimilarHubsCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Lazy load when component becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`similar-hubs-${currentHubId}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [currentHubId]);

  const { data, isLoading, isError } = useHubRecommendations('similar', 6, {
    enabled: isVisible,
    staleTime: 1000 * 30, // 30 seconds for testing variety
    currentHubId,
    tags: hubTags,
  });

  const recommendations = data?.recommendations || [];

  const SimilarHubSkeleton = () => (
    <div className="flex items-center gap-3 rounded-lg p-2">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );

  return (
    <div
      id={`similar-hubs-${currentHubId}`}
      className="rounded-xl border border-gray-800/70 bg-gray-900/60 p-4 shadow-lg backdrop-blur-md sm:p-6"
    >
      <h3 className="mb-3 flex items-center font-semibold text-lg text-white sm:mb-5 sm:text-xl">
        <Tag className="mr-2 h-4 w-4 text-primary sm:h-5 sm:w-5" />
        Similar Hubs
      </h3>

      <div className="space-y-3">
        {!isVisible || isLoading ? (
          // Show skeleton while loading
          Array.from({ length: 3 }).map((_, i) => (
            <SimilarHubSkeleton key={i} />
          ))
        ) : isError ? (
          <div className="text-center text-gray-400 text-sm py-4">
            Unable to load similar hubs
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-4">
            No similar hubs found
          </div>
        ) : (
          recommendations.slice(0, 3).map((rec) => (
            <Link
              key={rec.hubId}
              href={`/hubs/${rec.hubId}`}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-800/40 group"
            >
              <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-700/50 relative">
                <Image
                  src={
                    rec.hub.iconUrl ||
                    `https://api.dicebear.com/7.x/shapes/svg?seed=${rec.hub.name}`
                  }
                  alt={rec.hub.name}
                  width={40}
                  height={40}
                  className="object-cover"
                  unoptimized
                />
                {rec.hub.verified && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-200 text-sm">
                  {rec.hub.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{rec.hub.connectionCount} servers</span>
                  {rec.hub.tags?.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="truncate">
                        {rec.hub.tags
                          .slice(0, 2)
                          .map((tag: { name: string }) => tag.name)
                          .join(', ')}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ExternalLink className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default SimilarHubsCard;
