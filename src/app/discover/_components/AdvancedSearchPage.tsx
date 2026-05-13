'use client';

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  ChartIncreaseIcon,
  Clock01Icon,
  FilterIcon,
  HashtagIcon,
  Search01Icon,
  SparklesIcon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SortOptions } from '@/app/hubs/constants';
import DiscoverHubCard from '@/components/features/discover/DiscoverHubCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { DiscoverSort, getDiscoverHubs } from '@/lib/discover/query';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/utils/trpc';
import { FeaturedHubCarousel } from './FeaturedHubCarousel';

const SORT_OPTIONS = [
  { value: SortOptions.Alive, label: 'Alive' },
  { value: SortOptions.Active, label: 'Active' },
  { value: SortOptions.Growing, label: 'Growing' },
  { value: SortOptions.Big, label: 'Big' },
  { value: SortOptions.Emerging, label: 'Emerging' },
];

interface AdvancedSearchPageProps {
  initialData?: Awaited<ReturnType<typeof getDiscoverHubs>>;
  isAuthenticated: boolean;
}

export default function AdvancedSearchPage({
  initialData,
  isAuthenticated,
}: AdvancedSearchPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const trpc = useTRPC();

  // -- State --
  // Initialize from URL params if present
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [sort, setSort] = useState<string>(
    searchParams.get('sort') || 'trending'
  );
  const [tags, setTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );

  // Advanced filters
  const [minMembers, setMinMembers] = useState<number>(
    parseInt(searchParams.get('minMembers') || '0', 10)
  );
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(
    searchParams.get('verified') === 'true'
  );
  const [partneredOnly, setPartneredOnly] = useState<boolean>(
    searchParams.get('partnered') === 'true'
  );

  const [page, setPage] = useState(1);
  const pageSize = 24;

  // -- Update URL when filters change --
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set('q', debouncedSearchTerm);
    if (sort && sort !== 'trending') params.set('sort', sort);
    if (tags.length > 0) params.set('tags', tags.join(','));
    if (minMembers > 0) params.set('minMembers', minMembers.toString());
    if (verifiedOnly) params.set('verified', 'true');
    if (partneredOnly) params.set('partnered', 'true');

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [
    debouncedSearchTerm,
    sort,
    tags,
    minMembers,
    verifiedOnly,
    partneredOnly,
    router,
    pathname,
  ]);

  const hasActiveFilters =
    !!debouncedSearchTerm ||
    sort !== 'trending' ||
    tags.length > 0 ||
    minMembers > 0 ||
    verifiedOnly ||
    partneredOnly;

  // -- Data Fetching --
  const queryOptions = {
    q: debouncedSearchTerm || undefined,
    sort: sort as DiscoverSort,
    tags: tags.length > 0 ? tags : undefined,
    features: {
      verified: verifiedOnly || undefined,
      partnered: partneredOnly || undefined,
    },
    memberCount: minMembers > 0 ? { min: minMembers } : undefined,
    page,
    pageSize,
  };

  // Main list
  const { data, isLoading } = useQuery({
    ...trpc.discover.list.queryOptions(queryOptions),
    initialData: !hasActiveFilters && page === 1 ? initialData : undefined,
  });

  // Staff Picks
  const { data: featuredData } = useQuery({
    ...trpc.discover.list.queryOptions({ showFeaturedOnly: true, pageSize: 4 }),
    enabled: !hasActiveFilters,
  });

  // Popular New Hubs
  const { data: newHubsData } = useQuery({
    ...trpc.discover.list.queryOptions({ sort: 'emerging', pageSize: 8 }),
    enabled: !hasActiveFilters,
  });

  // Trending Hubs
  const { data: trendingHubsData } = useQuery({
    ...trpc.discover.list.queryOptions({ sort: 'growing', pageSize: 8 }),
    enabled: !hasActiveFilters,
  });

  // Popular Tags for FilterIcon
  const { data: popularTagsData } = useQuery(
    trpc.tags.list.queryOptions({ popular: true, limit: 20 })
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSort('trending');
    setTags([]);
    setMinMembers(0);
    setVerifiedOnly(false);
    setPartneredOnly(false);
    setPage(1);
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      handleTagsChange(tags.filter((t) => t !== tag));
    } else {
      if (tags.length < 10) {
        handleTagsChange([...tags, tag]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-main text-gray-200">
      <div className="sticky top-16 z-30 border-dash-border/50 border-b bg-dash-surface/90 backdrop-blur-xl transition-colors duration-200">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <HugeiconsIcon
                strokeWidth={2}
                icon={Search01Icon}
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500"
              />
              <Input
                placeholder="Search01Icon hubs..."
                className="h-11 border-white/5 bg-white/5 pl-10 text-base text-gray-200 transition-colors placeholder:text-gray-500 focus:border-indigo-500/50 focus:bg-white/10 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={Cancel01Icon}
                    className="h-4 w-4"
                  />
                </Button>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="h-11 w-[160px] border-white/5 bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white">
                  <div className="flex items-center gap-2">
                    {sort === 'new' || sort === 'oldest' ? (
                      <HugeiconsIcon
                        strokeWidth={2}
                        icon={ArrowDown01Icon}
                        className="h-4 w-4 text-gray-400"
                      />
                    ) : (
                      <HugeiconsIcon
                        strokeWidth={2}
                        icon={ArrowUp01Icon}
                        className="h-4 w-4 text-gray-400"
                      />
                    )}
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-gray-800 bg-[#0a101d] text-gray-200">
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="focus:bg-white/5 focus:text-white"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'h-11 gap-2 border-white/5 bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white',
                      (tags.length > 0 ||
                        minMembers > 0 ||
                        verifiedOnly ||
                        partneredOnly) &&
                        'border-indigo-500/50 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                    )}
                  >
                    <HugeiconsIcon
                      strokeWidth={2}
                      icon={FilterIcon}
                      className="h-4 w-4"
                    />
                    Filters
                    {(tags.length > 0 ||
                      minMembers > 0 ||
                      verifiedOnly ||
                      partneredOnly) && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 min-w-5 bg-indigo-500/20 px-1 text-indigo-300"
                      >
                        {tags.length +
                          (minMembers > 0 ? 1 : 0) +
                          (verifiedOnly ? 1 : 0) +
                          (partneredOnly ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="flex h-full w-full flex-col border-l-white/10 bg-[#0a101d] p-0 text-gray-200 sm:max-w-md">
                  <SheetHeader className="px-6 py-4">
                    <SheetTitle className="text-gray-100">Filters</SheetTitle>
                    <SheetDescription className="text-gray-400">
                      Refine your discovery results.
                    </SheetDescription>
                  </SheetHeader>
                  <Separator className="bg-white/10" />

                  <ScrollArea className="flex-1 px-6">
                    <div className="flex flex-col gap-8 py-6">
                      {/* Features Section */}
                      <div className="space-y-4">
                        <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                          Properties
                        </Label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/10 hover:bg-white/10">
                            <Label
                              htmlFor="verified-filter"
                              className="flex cursor-pointer flex-col gap-1"
                            >
                              <span className="font-medium text-gray-200">
                                Verified Only
                              </span>
                              <span className="text-gray-500 text-xs">
                                Official trusted hubs
                              </span>
                            </Label>
                            <Switch
                              id="verified-filter"
                              checked={verifiedOnly}
                              onCheckedChange={setVerifiedOnly}
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/10 hover:bg-white/10">
                            <Label
                              htmlFor="partnered-filter"
                              className="flex cursor-pointer flex-col gap-1"
                            >
                              <span className="font-medium text-gray-200">
                                Partnered Only
                              </span>
                              <span className="text-gray-500 text-xs">
                                InterChat partners
                              </span>
                            </Label>
                            <Switch
                              id="partnered-filter"
                              checked={partneredOnly}
                              onCheckedChange={setPartneredOnly}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-white/10" />

                      {/* Size Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                            Hub Size
                          </Label>
                          <span className="font-mono text-indigo-400 text-sm">
                            {minMembers > 0
                              ? `${minMembers}+ members`
                              : 'Any size'}
                          </span>
                        </div>
                        <Slider
                          defaultValue={[minMembers]}
                          max={1000}
                          step={50}
                          onValueChange={(vals) => setMinMembers(vals[0])}
                          className="py-2"
                        />
                        <div className="flex justify-between text-[10px] text-gray-600 uppercase">
                          <span>0</span>
                          <span>250</span>
                          <span>500</span>
                          <span>750</span>
                          <span>1000+</span>
                        </div>
                      </div>

                      <Separator className="bg-white/10" />

                      {/* Tags Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                            Tags ({tags.length}/10)
                          </Label>
                          {tags.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-red-400 text-xs hover:bg-transparent hover:text-red-300"
                              onClick={() => setTags([])}
                            >
                              Clear
                            </Button>
                          )}
                        </div>

                        {/* Tag Search/Select Input */}
                        <div className="rounded-lg border border-white/5 bg-white/5 p-1">
                          <Command className="bg-transparent">
                            <CommandInput
                              placeholder="Search01Icon tags..."
                              className="h-9 text-gray-200"
                            />
                            <CommandList className="custom-scrollbar max-h-[200px] overflow-y-auto">
                              <CommandEmpty className="py-2 text-center text-gray-500 text-xs">
                                No tags found.
                              </CommandEmpty>
                              <CommandGroup>
                                {(popularTagsData?.tags || []).map((tag) => (
                                  <CommandItem
                                    key={tag.name}
                                    value={tag.name}
                                    onSelect={() => toggleTag(tag.name)}
                                    className="cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                                  >
                                    <div className="flex w-full items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <HugeiconsIcon
                                          strokeWidth={2}
                                          icon={HashtagIcon}
                                          className="h-3 w-3 text-gray-500"
                                        />
                                        <span>{tag.name}</span>
                                      </div>
                                      {tags.includes(tag.name) && (
                                        <HugeiconsIcon
                                          strokeWidth={2}
                                          icon={Tick01Icon}
                                          className="h-3 w-3 text-indigo-400"
                                        />
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </div>

                        {/* Selected Tags Chips */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="gap-1 border-indigo-500/20 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                              >
                                {tag}
                                <HugeiconsIcon
                                  strokeWidth={2}
                                  icon={Cancel01Icon}
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => toggleTag(tag)}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="border-white/10 border-t p-6">
                    <SheetClose asChild>
                      <Button className="w-full bg-indigo-600 text-white shadow-indigo-500/20 shadow-lg hover:bg-indigo-700">
                        View Results
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-medium text-gray-500 text-xs uppercase">
                Active Filters:
              </span>

              {debouncedSearchTerm && (
                <Badge
                  variant="outline"
                  className="gap-1 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                >
                  Search01Icon: {debouncedSearchTerm}
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={Cancel01Icon}
                    className="h-3 w-3 cursor-pointer hover:text-white"
                    onClick={() => setSearchTerm('')}
                  />
                </Badge>
              )}

              {sort !== 'trending' && (
                <Badge
                  variant="outline"
                  className="gap-1 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                >
                  Sort: {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={Cancel01Icon}
                    className="h-3 w-3 cursor-pointer hover:text-white"
                    onClick={() => setSort('trending')}
                  />
                </Badge>
              )}

              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="gap-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                >
                  #{tag}
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={Cancel01Icon}
                    className="h-3 w-3 cursor-pointer hover:text-white"
                    onClick={() =>
                      handleTagsChange(tags.filter((t) => t !== tag))
                    }
                  />
                </Badge>
              ))}

              {minMembers > 0 && (
                <Badge
                  variant="outline"
                  className="gap-1 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                >
                  Members &ge; {minMembers}
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={Cancel01Icon}
                    className="h-3 w-3 cursor-pointer hover:text-white"
                    onClick={() => setMinMembers(0)}
                  />
                </Badge>
              )}

              {verifiedOnly && (
                <Badge
                  variant="outline"
                  className="gap-1 border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                >
                  Verified Only
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={Cancel01Icon}
                    className="h-3 w-3 cursor-pointer hover:text-white"
                    onClick={() => setVerifiedOnly(false)}
                  />
                </Badge>
              )}

              {partneredOnly && (
                <Badge
                  variant="outline"
                  className="gap-1 border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                >
                  Partnered Only
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={Cancel01Icon}
                    className="h-3 w-3 cursor-pointer hover:text-white"
                    onClick={() => setPartneredOnly(false)}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-gray-500 text-xs hover:text-white"
                onClick={handleClearFilters}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto max-w-7xl space-y-12 px-4 py-8">
        {/* Sections: Featured Hubs & Popular New (Only shown when no filters active) */}
        {!hasActiveFilters && (
          <>
            {/* Featured Hubs Banner */}
            {featuredData && featuredData.items.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-yellow-400">
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={SparklesIcon}
                    className="h-5 w-5"
                  />
                  <h2 className="font-bold text-gray-100 text-xl">
                    Featured Hubs
                  </h2>
                </div>

                <ScrollArea className="w-full whitespace-nowrap rounded-2xl">
                  <div className="flex w-max space-x-4 pb-4">
                    {featuredData.items.map((hub) => (
                      <FeaturedHubCarousel key={hub.id} {...hub} />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </section>
            )}

            {/* Trending Hubs */}
            {trendingHubsData && trendingHubsData.items.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-orange-500">
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={ChartIncreaseIcon}
                    className="h-6 w-6"
                  />
                  <h2 className="font-bold text-2xl text-gray-100">
                    Trending Hubs
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {trendingHubsData.items.map((hub) => (
                    <DiscoverHubCard
                      key={hub.id}
                      {...hub}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Popular New Hubs */}
            {newHubsData && newHubsData.items.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-400">
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={Clock01Icon}
                    className="h-6 w-6"
                  />
                  <h2 className="font-bold text-2xl text-gray-100">
                    New & Rising
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {newHubsData.items.map((hub) => (
                    <DiscoverHubCard
                      key={hub.id}
                      {...hub}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Divider if we showed sections */}
            {(featuredData?.items?.length || 0) +
              (newHubsData?.items?.length || 0) +
              (trendingHubsData?.items?.length || 0) >
              0 && <Separator className="my-8 bg-gray-800/60" />}
          </>
        )}

        {/* Main Results */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-100 text-xl">
              {hasActiveFilters ? 'Search01Icon Results' : 'Browse All Hubs'}
            </h2>
            <span className="text-gray-500 text-sm">
              {data?.total || 0} hubs found
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: ur mum
                  key={i}
                  className="h-[320px] animate-pulse rounded-xl border border-gray-800 bg-gray-900/40"
                />
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 border-dashed bg-gray-900/20 py-20 text-center">
              <HugeiconsIcon
                strokeWidth={2}
                icon={Search01Icon}
                className="mb-4 h-10 w-10 text-gray-600"
              />
              <h3 className="font-medium text-gray-300 text-lg">
                No hubs found
              </h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
              <Button
                variant="outline"
                className="mt-4 border-gray-700 hover:bg-gray-800"
                onClick={handleClearFilters}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3.">
                {data?.items.map((hub) => (
                  <DiscoverHubCard
                    key={hub.id}
                    {...hub}
                    isAuthenticated={isAuthenticated}
                    onTagClick={(tag) => {
                      if (!tags.includes(tag)) handleTagsChange([...tags, tag]);
                    }}
                  />
                ))}
              </div>

              {data && data.total > pageSize && (
                <div className="mt-10 flex justify-center gap-2 pt-8">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="border-gray-800 bg-gray-900/50 hover:bg-gray-800"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-4 text-gray-400 text-sm">
                    Page {page} of {Math.ceil(data.total / pageSize)}
                  </div>
                  <Button
                    variant="outline"
                    disabled={!data.nextPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-gray-800 bg-gray-900/50 hover:bg-gray-800"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
