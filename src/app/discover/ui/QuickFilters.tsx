'use client';

import { Flame, Sparkles, Star, TrendingUp, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type QuickFilterType =
  | 'popular'
  | 'rising'
  | 'new'
  | 'rated'
  | 'featured'
  | 'random';

interface QuickFiltersProps {
  onFilterClick: (type: QuickFilterType) => void;
  activeFilter?: QuickFilterType | null;
}

const QUICK_FILTERS = [
  {
    type: 'popular' as const,
    label: 'Popular',
    icon: Flame,
    activeColor: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
  },
  {
    type: 'rising' as const,
    label: 'Growing Fast',
    icon: TrendingUp,
    activeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  },
  {
    type: 'new' as const,
    label: 'New',
    icon: Sparkles,
    activeColor: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  },
  {
    type: 'rated' as const,
    label: 'Top Rated',
    icon: Trophy,
    activeColor: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
  },
  {
    type: 'featured' as const,
    label: 'Featured',
    icon: Star,
    activeColor: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
  },
  {
    type: 'random' as const,
    label: 'Surprise Me',
    icon: Zap,
    activeColor: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
  },
];

export function QuickFilters({
  onFilterClick,
  activeFilter,
}: QuickFiltersProps) {
  return (
    <div className="mb-8 w-full">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-medium text-gray-300 text-sm">Quick Filters</h2>
      </div>

      <div className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent -mx-2 overflow-x-auto px-2 pb-2 sm:mx-0 sm:px-0">
        <div className="flex gap-2 sm:flex-wrap">
          {QUICK_FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.type;

            return (
              <Button
                key={filter.type}
                onClick={() => onFilterClick(filter.type)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 font-medium text-sm transition-colors sm:shrink ${
                  isActive
                    ? filter.activeColor
                    : 'border-gray-700 bg-gray-900/30 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{filter.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
