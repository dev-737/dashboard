'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Activity, Link2, Star, TrendingUp } from 'lucide-react';

interface LeaderboardFiltersProps {
  currentCategory: 'active' | 'connected' | 'rated' | 'trending';
  onCategoryChange: (
    category: 'active' | 'connected' | 'rated' | 'trending'
  ) => void;
}

export function LeaderboardFilters({
  currentCategory,
  onCategoryChange,
}: LeaderboardFiltersProps) {
  const categories = [
    {
      id: 'active',
      label: 'Most Active',
      icon: Activity,
      description: 'By messages sent',
    },
    {
      id: 'connected',
      label: 'Most Connected',
      icon: Link2,
      description: 'By server count',
    },
    {
      id: 'rated',
      label: 'Highest Rated',
      icon: Star,
      description: 'By user reviews',
    },
    {
      id: 'trending',
      label: 'Trending',
      icon: TrendingUp,
      description: 'Fastest growing',
    },
  ] as const;

  return (
    <div className="flex flex-wrap justify-center gap-2 p-4">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = currentCategory === category.id;

        return (
          <Button
            key={category.id}
            variant={isActive ? 'default' : 'outline'}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'h-auto flex-col gap-1 px-6 py-3 transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-background/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="font-semibold">{category.label}</span>
            </div>
            <span className="text-[10px] opacity-70">
              {category.description}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
