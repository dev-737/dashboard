'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import Link from 'next/link';

interface PodiumProps {
  hubs: {
    id: string;
    name: string;
    iconUrl: string | null;
    rank: number;
    weeklyMessageCount?: number;
    connections?: number;
    averageRating?: number | null;
    activityMetrics?: {
      trendingScore: number;
    } | null;
  }[];
  category: 'active' | 'connected' | 'rated' | 'trending';
}

export function Podium({ hubs, category }: PodiumProps) {
  if (hubs.length < 3) return null;

  const [first, second, third] = hubs;

  const getMetricDisplay = (hub: PodiumProps['hubs'][0]) => {
    switch (category) {
      case 'active':
        return `${hub.weeklyMessageCount?.toLocaleString() ?? 0} msgs`;
      case 'connected':
        return `${hub.connections?.toLocaleString() ?? 0} servers`;
      case 'rated':
        return `${hub.averageRating?.toFixed(1) ?? '0.0'} ★`;
      case 'trending':
        return `+${hub.activityMetrics?.trendingScore.toFixed(0) ?? 0}% growth`;
    }
  };

  return (
    <div className="flex w-full items-end justify-center gap-4 py-12 md:gap-8">
      {/* Second Place */}
      <PodiumStep
        hub={second}
        rank={2}
        metric={getMetricDisplay(second)}
        delay={100}
        className="h-48 w-1/3 max-w-[200px] bg-slate-800/50 border-slate-700/50"
        iconColor="text-slate-400"
      />

      {/* First Place */}
      <PodiumStep
        hub={first}
        rank={1}
        metric={getMetricDisplay(first)}
        delay={0}
        className="h-64 w-1/3 max-w-[220px] bg-yellow-900/20 border-yellow-600/50 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]"
        iconColor="text-yellow-500"
        isFirst
      />

      {/* Third Place */}
      <PodiumStep
        hub={third}
        rank={3}
        metric={getMetricDisplay(third)}
        delay={200}
        className="h-40 w-1/3 max-w-[200px] bg-orange-900/20 border-orange-800/50"
        iconColor="text-orange-700"
      />
    </div>
  );
}

function PodiumStep({
  hub,
  rank,
  metric,
  delay,
  className,
  iconColor,
  isFirst = false,
}: {
  hub: PodiumProps['hubs'][0];
  rank: number;
  metric: string;
  delay: number;
  className?: string;
  iconColor: string;
  isFirst?: boolean;
}) {
  return (
    <Link
      href={`/hubs/${hub.id}`}
      className={cn(
        'group relative flex flex-col items-center justify-end rounded-t-lg border-x border-t p-4 transition-all hover:bg-opacity-80',
        'animate-in slide-in-from-bottom-10 fade-in duration-700 fill-mode-both',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          'absolute -top-12 flex flex-col items-center gap-2 transition-transform group-hover:-translate-y-2',
          isFirst ? '-top-16' : ''
        )}
      >
        {isFirst && (
          <Crown className="h-8 w-8 animate-bounce text-yellow-500" />
        )}
        <Avatar
          className={cn(
            'border-4',
            isFirst
              ? 'h-24 w-24 border-yellow-500'
              : 'h-16 w-16 border-slate-700'
          )}
        >
          <AvatarImage src={hub.iconUrl || undefined} alt={hub.name} />
          <AvatarFallback>{hub.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <div className="font-bold text-foreground line-clamp-1">
            {hub.name}
          </div>
          <Badge variant="secondary" className="mt-1 text-xs font-normal">
            {metric}
          </Badge>
        </div>
      </div>

      <div className={cn('mb-4 text-4xl font-black opacity-20', iconColor)}>
        #{rank}
      </div>
    </Link>
  );
}
