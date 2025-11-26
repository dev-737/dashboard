'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { TrendingUp, Users, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';

interface LeaderboardTableProps {
  hubs: {
    id: string;
    name: string;
    description: string;
    iconUrl: string | null;
    rank: number;
    verified: boolean;
    weeklyMessageCount?: number;
    connections?: number;
    averageRating?: number | null;
    activityMetrics?: {
      trendingScore: number;
    } | null;
  }[];
  category: 'active' | 'connected' | 'rated' | 'trending';
}

export function LeaderboardTable({ hubs, category }: LeaderboardTableProps) {
  // Skip top 3 as they are shown in Podium
  const listHubs = hubs.slice(3);

  const getMetricValue = (hub: LeaderboardTableProps['hubs'][0]) => {
    switch (category) {
      case 'active':
        return (
          <div className="flex items-center gap-2 text-blue-400">
            <MessageSquare className="h-4 w-4" />
            <span>{hub.weeklyMessageCount?.toLocaleString() ?? 0}</span>
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center gap-2 text-purple-400">
            <Users className="h-4 w-4" />
            <span>{hub.connections?.toLocaleString() ?? 0}</span>
          </div>
        );
      case 'rated':
        return (
          <div className="flex items-center gap-2 text-yellow-400">
            <Star className="h-4 w-4 fill-yellow-400" />
            <span>{hub.averageRating?.toFixed(1) ?? '0.0'}</span>
          </div>
        );
      case 'trending':
        return (
          <div className="flex items-center gap-2 text-green-400">
            <TrendingUp className="h-4 w-4" />
            <span>+{hub.activityMetrics?.trendingScore.toFixed(0) ?? 0}%</span>
          </div>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="w-[80px] text-center">Rank</TableHead>
            <TableHead>Hub</TableHead>
            <TableHead className="text-right">Metric</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listHubs.map((hub) => (
            <TableRow
              key={hub.id}
              className="border-slate-800 transition-colors hover:bg-slate-800/50"
            >
              <TableCell className="text-center font-mono text-slate-500">
                #{hub.rank}
              </TableCell>
              <TableCell>
                <Link
                  href={`/hubs/${hub.id}`}
                  className="flex items-center gap-3 hover:opacity-80"
                >
                  <Avatar className="h-10 w-10 border border-slate-700">
                    <AvatarImage
                      src={hub.iconUrl || undefined}
                      alt={hub.name}
                    />
                    <AvatarFallback>{hub.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200">
                        {hub.name}
                      </span>
                      {hub.verified && (
                        <Badge
                          variant="secondary"
                          className="h-5 bg-blue-500/10 px-1.5 text-[10px] text-blue-400 hover:bg-blue-500/20"
                        >
                          VERIFIED
                        </Badge>
                      )}
                    </div>
                    <span className="line-clamp-1 text-xs text-slate-500">
                      {hub.description}
                    </span>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">{getMetricValue(hub)}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
