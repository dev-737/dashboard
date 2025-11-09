'use client';

import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Crown,
  EyeOff,
  Filter,
  Flame,
  HeartHandshake,
  Languages,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
import { useMobile } from '@/hooks/use-mobile';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export type FeatureFlags = {
  verified?: boolean;
  partnered?: boolean;
  nsfw?: boolean;
};

type FilterProps = {
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
};

// Improved data structure for filters
const filterSections = [
  {
    title: 'Sort by',
    icon: Sparkles,
    content: (props: FilterProps) => (
      <Select
        value={props.sort}
        onValueChange={(v) => props.onSortChange(v as typeof props.sort)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="trending">Trending</SelectItem>
          <SelectItem value="active">Most Active</SelectItem>
          <SelectItem value="new">Newest</SelectItem>
          <SelectItem value="upvoted">Most Upvoted</SelectItem>
          <SelectItem value="rated">Best Rated</SelectItem>
          <SelectItem value="members">Most Members</SelectItem>
          <SelectItem value="growing">Fastest Growing</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  {
    title: 'Tags',
    icon: Zap,
    content: (props: FilterProps) => (
      <TagPicker
        selectedTags={props.tags}
        onTagsChange={props.onTagsChange}
        maxTags={5}
      />
    ),
  },
  {
    title: 'Language',
    icon: Languages,
    content: (props: FilterProps) => (
      <Select
        value={props.language ?? 'any'}
        onValueChange={(v) =>
          props.onLanguageChange(v === 'any' ? undefined : v)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Any language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any language</SelectItem>
          {SUPPORTED_LANGUAGES.map((l) => (
            <SelectItem key={l.code} value={l.code}>
              {l.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
  },
  {
    title: 'Member Count',
    icon: Users,
    content: (props: FilterProps) => (
      <Select
        value={props.memberRange ?? 'any'}
        onValueChange={(v) =>
          props.onMemberRangeChange(v === 'any' ? undefined : v)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Any size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any size</SelectItem>
          <SelectItem value="small">Small (&lt;50)</SelectItem>
          <SelectItem value="medium">Medium (50-200)</SelectItem>
          <SelectItem value="large">Large (200-1000)</SelectItem>
          <SelectItem value="huge">Huge (1000+)</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  {
    title: 'Minimum Rating',
    icon: Star,
    content: (props: FilterProps) => (
      <Select
        value={props.minRating?.toString() ?? 'any'}
        onValueChange={(v) =>
          props.onMinRatingChange(
            v === 'any' ? undefined : Number.parseFloat(v)
          )
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Any rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any rating</SelectItem>
          <SelectItem value="3">3+ stars</SelectItem>
          <SelectItem value="4">4+ stars</SelectItem>
          <SelectItem value="4.5">4.5+ stars</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  {
    title: 'Activity Level',
    icon: Flame,
    content: (props: FilterProps) => (
      <div className="grid grid-cols-1 gap-2">
        {(['LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => {
          const checked = props.activity.includes(lvl);
          return (
            <Label
              key={lvl}
              className={cn(
                'inline-flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors',
                checked
                  ? 'border-accent bg-accent/10 text-accent-foreground'
                  : 'border-border bg-card/50 hover:bg-muted/50'
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(val) => {
                  const on = Boolean(val);
                  let next = props.activity;
                  if (on && !next.includes(lvl)) next = [...next, lvl];
                  if (!on) next = next.filter((x: 'LOW' | 'MEDIUM' | 'HIGH') => x !== lvl);
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
    ),
  },
  {
    title: 'Features',
    icon: Crown,
    content: (props: FilterProps) => (
      <div className="grid grid-cols-1 gap-2">
        <FeatureCheckbox
          checked={!!props.features.verified}
          onCheckedChange={(v) =>
            props.onFeaturesChange({ ...props.features, verified: Boolean(v) })
          }
          icon={BadgeCheck}
          label="Verified Only"
        />
        <FeatureCheckbox
          checked={!!props.features.partnered}
          onCheckedChange={(v) =>
            props.onFeaturesChange({ ...props.features, partnered: Boolean(v) })
          }
          icon={HeartHandshake}
          label="Partnered Only"
        />
        <FeatureCheckbox
          checked={!!props.features.nsfw}
          onCheckedChange={(v) =>
            props.onFeaturesChange({ ...props.features, nsfw: Boolean(v) })
          }
          icon={EyeOff}
          label="NSFW Content"
        />
      </div>
    ),
  },
];

function FeatureCheckbox({
  checked,
  onCheckedChange,
  icon: Icon,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Label
      className={cn(
        'inline-flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors',
        checked
          ? 'border-accent bg-accent/10 text-accent-foreground'
          : 'border-border bg-card/50 hover:bg-muted/50'
      )}
    >
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium text-sm">{label}</span>
    </Label>
  );
}

export function Filters(props: FilterProps) {
  const isMobile = useMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  useEffect(() => {
    const saved = localStorage.getItem('discover-filters-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    } else {
      setIsCollapsed(isMobile);
    }
  }, [isMobile]);

  useEffect(() => {
    localStorage.setItem(
      'discover-filters-collapsed',
      JSON.stringify(isCollapsed)
    );
  }, [isCollapsed]);

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
    <aside className="rounded-xl border border-border/80 bg-card/80 shadow-sm backdrop-blur-sm">
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg text-foreground">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
              {activeFilterCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
        >
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div
        className={cn(
          'overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out',
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
        )}
      >
        <div className="p-4 pt-0">
          <div className="space-y-6 border-t border-border/80 pt-6">
            {filterSections.map((section, index) => (
              <div key={index} className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <section.icon className="h-4 w-4" />
                  {section.title}
                </Label>
                {section.content(props)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
