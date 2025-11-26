'use client';

import { LeaderboardFilters } from '@/app/_components/leaderboard/Filters';
import { LeaderboardTable } from '@/app/_components/leaderboard/LeaderboardTable';
import { Podium } from '@/app/_components/leaderboard/Podium';
import { useTRPC } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function LeaderboardPage() {
  const [category, setCategory] = useState<
    'active' | 'connected' | 'rated' | 'trending'
  >('active');

  const trpc = useTRPC();
  const { data: hubs, isLoading } = useQuery(
    trpc.leaderboard.getGlobal.queryOptions({
      category,
      limit: 50,
    })
  );

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Hall of Fame
          </span>
        </h1>
        <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
          Discover the most active, connected, and beloved communities on
          InterChat.
        </p>
      </div>

      <LeaderboardFilters
        currentCategory={category}
        onCategoryChange={setCategory}
      />

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : hubs && hubs.length > 0 ? (
        <div className="space-y-12">
          <Podium hubs={hubs} category={category} />
          <LeaderboardTable hubs={hubs} category={category} />
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
          No hubs found for this category yet.
        </div>
      )}
    </div>
  );
}
