'use client';

import { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { TagPicker } from '@/components/features/discover/TagPicker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { useMobile } from '@/hooks/use-mobile';

export type FeatureFlags = {
  verified?: boolean;
  partnered?: boolean;
  nsfw?: boolean;
};

export function Filters(props: {
  q: string;
  onQChange: (v: string) => void;
  sort:
    | 'trending'
    | 'active'
    | 'new'
    | 'upvoted'
    | 'rated'
    | 'members'
    | 'growing';
  onSortChange: (
    v:
      | 'trending'
      | 'active'
      | 'new'
      | 'upvoted'
      | 'rated'
      | 'members'
      | 'growing'
  ) => void;

  tags: string[];
  onTagsChange: (tags: string[]) => void;

  language?: string;
  onLanguageChange: (lang?: string) => void;

  region?: string;
  onRegionChange: (region?: string) => void;

  activity: ('LOW' | 'MEDIUM' | 'HIGH')[];
  onActivityChange: (values: ('LOW' | 'MEDIUM' | 'HIGH')[]) => void;

  memberRange?: string;
  onMemberRangeChange: (range?: string) => void;

  minRating?: number;
  onMinRatingChange: (rating?: number) => void;

  features: FeatureFlags;
  onFeaturesChange: (f: FeatureFlags) => void;
}) {
  const languageOptions = useMemo(() => SUPPORTED_LANGUAGES, []);
  const isMobile = useMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('discover-filters-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    } else {
      // Default to collapsed on mobile devices for better UX
      setIsCollapsed(isMobile);
    }
  }, [isMobile]);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem(
      'discover-filters-collapsed',
      JSON.stringify(isCollapsed)
    );
  }, [isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (props.tags.length > 0) count++;
    if (props.language) count++;
    if (props.region) count++;
    if (props.activity.length > 0) count++;
    if (props.memberRange) count++;
    if (props.minRating) count++;
    if (
      props.features.verified ||
      props.features.partnered ||
      props.features.nsfw
    )
      count++;
    return count;
  }, [
    props.tags,
    props.language,
    props.region,
    props.activity,
    props.memberRange,
    props.minRating,
    props.features,
  ]);

  return (
    <aside className="rounded-lg border border-gray-800 bg-gray-900/95 shadow-lg sm:bg-gray-900/50 sm:backdrop-blur-sm">
      {/* Header with toggle button */}
      <div className="flex items-center justify-between border-gray-800 border-b p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-purple-400" />
          <h2 className="font-semibold text-sm text-white">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs font-medium text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
          aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
        >
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Collapsible content with optimized animations */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isCollapsed
            ? 'transform scale-y-0 opacity-0 ease-in'
            : 'transform scale-y-100 opacity-100 ease-out'
        }`}
        style={{
          transformOrigin: 'top',
          willChange: 'transform, opacity',
          height: isCollapsed ? '0px' : 'auto',
        }}
      >
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-6">
            {/* Sort */}
            <div className="flex flex-col gap-3">
              <Label className="font-medium text-gray-300 text-xs uppercase tracking-wide">
                Sort by
              </Label>
              <Select
                value={props.sort}
                onValueChange={(v: string) =>
                  props.onSortChange(v as typeof props.sort)
                }
              >
                <SelectTrigger className="select-standard">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="active">Most Active</SelectItem>
                  <SelectItem value="new">Newest</SelectItem>
                  <SelectItem value="upvoted">Most Upvoted</SelectItem>
                  <SelectItem value="rated">Best Rated</SelectItem>
                  <SelectItem value="members">Most Members</SelectItem>
                  <SelectItem value="growing">Fastest Growing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <TagPicker
              selectedTags={props.tags}
              onTagsChange={props.onTagsChange}
              maxTags={5}
            />

            {/* Language */}
            <div className="flex flex-col gap-3">
              <Label className="font-medium text-gray-300 text-xs uppercase tracking-wide">
                Language
              </Label>
              <Select
                value={props.language ?? 'any'}
                onValueChange={(v) =>
                  props.onLanguageChange(v === 'any' ? undefined : v)
                }
              >
                <SelectTrigger className="select-standard">
                  <SelectValue placeholder="Any language" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  <SelectItem value="any">Any language</SelectItem>
                  {languageOptions.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <Label className="font-medium text-gray-300 text-xs uppercase tracking-wide">
                Member Count
              </Label>
              <Select
                value={props.memberRange ?? 'any'}
                onValueChange={(v) =>
                  props.onMemberRangeChange(v === 'any' ? undefined : v)
                }
              >
                <SelectTrigger className="select-standard">
                  <SelectValue placeholder="Any size" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  <SelectItem value="any">Any size</SelectItem>
                  <SelectItem value="small">Small (&lt;50)</SelectItem>
                  <SelectItem value="medium">Medium (50-200)</SelectItem>
                  <SelectItem value="large">Large (200-1000)</SelectItem>
                  <SelectItem value="huge">Huge (1000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Minimum Rating */}
            <div className="flex flex-col gap-3">
              <Label className="font-medium text-gray-300 text-xs uppercase tracking-wide">
                Minimum Rating
              </Label>
              <Select
                value={props.minRating?.toString() ?? 'any'}
                onValueChange={(v) =>
                  props.onMinRatingChange(
                    v === 'any' ? undefined : Number.parseFloat(v)
                  )
                }
              >
                <SelectTrigger className="select-standard">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  <SelectItem value="any">Any rating</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity */}
            <div className="flex flex-col gap-3">
              <Label className="font-medium text-gray-300 text-xs uppercase tracking-wide">
                Activity Level
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => {
                  const checked = props.activity.includes(lvl);
                  return (
                    <Label
                      key={lvl}
                      className={`inline-flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                        checked
                          ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                          : 'border-gray-700 bg-gray-900/30 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(val) => {
                          const on = Boolean(val);
                          let next = props.activity;
                          if (on && !next.includes(lvl)) next = [...next, lvl];
                          if (!on) next = next.filter((x) => x !== lvl);
                          props.onActivityChange(next);
                        }}
                      />
                      <span className="font-medium text-sm capitalize">
                        {lvl.toLowerCase()}
                      </span>
                    </Label>
                  );
                })}
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-3">
              <Label className="font-medium text-gray-300 text-xs uppercase tracking-wide">
                Features
              </Label>
              <div className="grid grid-cols-1 gap-2">
                <Label className="inline-flex cursor-pointer items-center gap-3 rounded-lg border border-gray-700 bg-gray-900/30 p-3 transition-colors hover:border-gray-600 hover:bg-gray-800/50">
                  <Checkbox
                    checked={!!props.features.verified}
                    onCheckedChange={(v) =>
                      props.onFeaturesChange({
                        ...props.features,
                        verified: Boolean(v),
                      })
                    }
                  />
                  <span className="font-medium text-gray-200 text-sm">
                    Verified Only
                  </span>
                </Label>
                <Label className="inline-flex cursor-pointer items-center gap-3 rounded-lg border border-gray-700 bg-gray-900/30 p-3 transition-colors hover:border-gray-600 hover:bg-gray-800/50">
                  <Checkbox
                    checked={!!props.features.partnered}
                    onCheckedChange={(v) =>
                      props.onFeaturesChange({
                        ...props.features,
                        partnered: Boolean(v),
                      })
                    }
                  />
                  <span className="font-medium text-gray-200 text-sm">
                    Partnered Only
                  </span>
                </Label>
                <Label className="inline-flex cursor-pointer items-center gap-3 rounded-lg border border-gray-700 bg-gray-900/30 p-3 transition-colors hover:border-gray-600 hover:bg-gray-800/50">
                  <Checkbox
                    checked={!!props.features.nsfw}
                    onCheckedChange={(v) =>
                      props.onFeaturesChange({
                        ...props.features,
                        nsfw: Boolean(v),
                      })
                    }
                  />
                  <span className="text-sm">🔞</span>
                  <span className="font-medium text-gray-200 text-sm">
                    NSFW Content
                  </span>
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
