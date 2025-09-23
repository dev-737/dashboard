'use client';

import { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { TagPicker } from '@/components/discover/TagPicker';
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
  sort: 'trending' | 'active' | 'new' | 'upvoted';
  onSortChange: (v: 'trending' | 'active' | 'new' | 'upvoted') => void;

  tags: string[];
  onTagsChange: (tags: string[]) => void;

  language?: string;
  onLanguageChange: (lang?: string) => void;

  region?: string;
  onRegionChange: (region?: string) => void;

  activity: ('LOW' | 'MEDIUM' | 'HIGH')[];
  onActivityChange: (values: ('LOW' | 'MEDIUM' | 'HIGH')[]) => void;

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
    localStorage.setItem('discover-filters-collapsed', JSON.stringify(isCollapsed));
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
    if (props.features.verified || props.features.partnered || props.features.nsfw) count++;
    return count;
  }, [props.tags, props.language, props.region, props.activity, props.features]);

  return (
    <aside className="premium-card-enhanced rounded-[var(--radius)] border-gray-600/50 shadow-2xl backdrop-blur-md">
      {/* Header with toggle button */}
      <div className="flex items-center justify-between border-gray-700/30 border-b p-4">
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
              props.onSortChange(v as 'trending' | 'active' | 'new' | 'upvoted')
            }
          >
            <SelectTrigger className="select-standard">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="select-content">
              <SelectItem value="trending">🔥 Trending</SelectItem>
              <SelectItem value="active">⚡ Most Active</SelectItem>
              <SelectItem value="new">✨ Newest</SelectItem>
              <SelectItem value="upvoted">👍 Most Upvoted</SelectItem>
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
        {/* Activity */}
        <div className="flex flex-col gap-3">
          <Label className="font-medium text-gray-300 text-xs uppercase tracking-wide">
            Activity Level
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => {
              const checked = props.activity.includes(lvl);
              const activityIcons = { LOW: '🐢', MEDIUM: '🚶', HIGH: '🚀' };
              const activityColors = {
                LOW: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
                MEDIUM: 'text-blue-300 border-blue-500/30 bg-blue-500/10',
                HIGH: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
              };
              return (
                <Label
                  key={lvl}
                  className={`inline-flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] border p-3 transition-all duration-200 hover:bg-gray-800/50 ${
                    checked
                      ? activityColors[lvl]
                      : 'border-gray-700/50 bg-gray-900/30 text-gray-300 hover:border-gray-600/50'
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
                    className="data-[state=checked]:border-current data-[state=checked]:bg-current"
                  />
                  <span className="text-sm">{activityIcons[lvl]}</span>
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
            <Label className="inline-flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] border border-gray-700/50 bg-gray-900/30 p-3 transition-all duration-200 hover:bg-gray-800/50">
              <Checkbox
                checked={!!props.features.verified}
                onCheckedChange={(v) =>
                  props.onFeaturesChange({
                    ...props.features,
                    verified: Boolean(v),
                  })
                }
                className="data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
              />
              <span className="text-sm">✅</span>
              <span className="font-medium text-gray-200 text-sm">
                Verified
              </span>
            </Label>
            <Label className="inline-flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] border border-gray-700/50 bg-gray-900/30 p-3 transition-all duration-200 hover:bg-gray-800/50">
              <Checkbox
                checked={!!props.features.partnered}
                onCheckedChange={(v) =>
                  props.onFeaturesChange({
                    ...props.features,
                    partnered: Boolean(v),
                  })
                }
                className="data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
              />
              <span className="text-sm">🤝</span>
              <span className="font-medium text-gray-200 text-sm">
                Partnered
              </span>
            </Label>
            <Label className="inline-flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] border border-gray-700/50 bg-gray-900/30 p-3 transition-all duration-200 hover:bg-gray-800/50">
              <Checkbox
                checked={!!props.features.nsfw}
                onCheckedChange={(v) =>
                  props.onFeaturesChange({
                    ...props.features,
                    nsfw: Boolean(v),
                  })
                }
                className="data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
              />
              <span className="text-sm">🔞</span>
              <span className="font-medium text-gray-200 text-sm">NSFW</span>
            </Label>
          </div>
        </div>
      </div>
      </div>
      </div>
    </aside>
  );
}