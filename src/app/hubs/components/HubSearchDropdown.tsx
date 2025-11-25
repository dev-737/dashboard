import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowUp,
  Clock,
  Loader2,
  MessageCircle,
  Sparkles,
  Tag as TagIcon,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/utils/trpc';
import { POPULAR_TAGS } from '../constants';

interface HubSearchDropdownProps {
  searchTerm: string;
  onTagSelect?: (tag: string) => void;
  onSearch?: (term: string) => void;
}

export function HubSearchDropdown({
  searchTerm,
  onTagSelect,
  onSearch,
}: HubSearchDropdownProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SimplifiedHub[]>([]);
  const [relatedTags, setRelatedTags] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const commandRef = useRef<HTMLDivElement>(null);

  // tRPC utils for imperative calls
  const queryClient = useQueryClient();

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentHubSearches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5)); // Keep only the 5 most recent
        }
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Save a search term to recent searches
  const saveRecentSearch = useCallback(
    (term: string) => {
      try {
        const newSearches = [
          term,
          ...recentSearches.filter((s) => s !== term),
        ].slice(0, 5);

        setRecentSearches(newSearches);
        localStorage.setItem('recentHubSearches', JSON.stringify(newSearches));
      } catch (error) {
        console.error('Error saving recent search:', error);
      }
    },
    [recentSearches]
  );

  // Handle hub selection
  const handleHubSelect = useCallback(
    (hub: SimplifiedHub) => {
      saveRecentSearch(hub.name);
      router.push(`/hubs/${hub.id}`);
    },
    [router, saveRecentSearch]
  );

  // Handle tag selection
  const handleTagSelect = useCallback(
    (tag: string) => {
      if (onTagSelect) {
        onTagSelect(tag);
      } else {
        router.push(`/hubs/search?tags=${encodeURIComponent(tag)}`);
      }
    },
    [router, onTagSelect]
  );

  // Handle search submission
  const handleSearchSubmit = useCallback(
    (term: string) => {
      saveRecentSearch(term);
      if (onSearch) {
        onSearch(term);
      } else {
        router.push(`/hubs/search?search=${encodeURIComponent(term)}`);
      }
    },
    [router, saveRecentSearch, onSearch]
  );

  // Find related tags based on search results and search term
  useEffect(() => {
    if (searchResults.length > 0) {
      // Extract tags from search results
      const tagsFromResults = new Set<string>();
      searchResults.forEach((hub) => {
        hub.tags?.forEach((tag) => {
          if (typeof tag === 'string') {
            tagsFromResults.add(tag);
          } else if (tag && typeof tag === 'object' && 'name' in tag) {
            tagsFromResults.add(tag.name as string);
          }
        });
      });

      // Find popular tags that match the search term
      const matchingPopularTags = POPULAR_TAGS.filter((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Combine and deduplicate
      const allRelatedTags = [
        ...new Set([...tagsFromResults, ...matchingPopularTags]),
      ];

      // Limit to 8 tags
      setRelatedTags(allRelatedTags.slice(0, 8));
    } else if (searchTerm) {
      // If no results but we have a search term, show matching popular tags
      const matchingTags = POPULAR_TAGS.filter((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8);
      setRelatedTags(matchingTags);
    } else {
      setRelatedTags([]);
    }
  }, [searchResults, searchTerm]);

  // Fetch search results
  useEffect(() => {
    const searchHubs = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await queryClient.fetchQuery(
          trpc.hub.searchHubs.queryOptions({ term: searchTerm })
        );
        // Transform the data to match SimplifiedHub interface
        const transformedHubs = data.hubs.map((hub) => ({
          ...hub,
          rules: [],
          reviews: [],
          activityLevel: 'MEDIUM' as const,
        })) as SimplifiedHub[];
        setSearchResults(transformedHubs);
      } catch (error) {
        console.error('Error searching hubs:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchHubs, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, queryClient, trpc.hub.searchHubs]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!commandRef.current) return;

      // Count total selectable items
      const hubCount = searchResults.length;
      const tagCount = relatedTags.length;
      const recentCount = recentSearches.length;
      const totalItems =
        hubCount + tagCount + recentCount + (searchTerm ? 1 : 0); // +1 for "Search for..."

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();

        // Determine which section the selected item belongs to
        if (selectedIndex < hubCount) {
          // Hub item
          handleHubSelect(searchResults[selectedIndex]);
        } else if (selectedIndex < hubCount + tagCount) {
          // Tag item
          handleTagSelect(relatedTags[selectedIndex - hubCount]);
        } else if (selectedIndex < hubCount + tagCount + recentCount) {
          // Recent search item
          handleSearchSubmit(
            recentSearches[selectedIndex - hubCount - tagCount]
          );
        } else if (searchTerm) {
          // "Search for..." item
          handleSearchSubmit(searchTerm);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedIndex,
    searchResults,
    relatedTags,
    recentSearches,
    searchTerm,
    handleHubSelect,
    handleTagSelect,
    handleSearchSubmit,
  ]);

  return (
    <Command
      ref={commandRef}
      className="hub-search-dropdown relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/95 shadow-2xl backdrop-blur-xl"
      style={{ zIndex: 10000 }}
    >
      <CommandInput
        placeholder="Search hubs..."
        value={searchTerm}
        className="border-none bg-transparent text-white placeholder:text-gray-400 focus:ring-0"
        disabled
      />

      <CommandList className="scrollbar-thin scrollbar-thumb-gray-600 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent max-h-[400px] overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-6 text-gray-400 text-sm">
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-blue-500" />
            <span>Searching for hubs...</span>
          </div>
        )}

        {!isLoading && searchTerm && (
          <CommandItem
            value={`search-for-${searchTerm}`}
            onSelect={() => handleSearchSubmit(searchTerm)}
            className={cn(
              'mx-2 my-1 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-blue-400 hover:bg-gray-700/50',
              selectedIndex ===
                searchResults.length +
                  relatedTags.length +
                  recentSearches.length
                ? 'bg-gray-700/50'
                : ''
            )}
          >
            <span>
              Search for{' '}
              <span className="font-medium text-white">
                &quot;{searchTerm}&quot;
              </span>
            </span>
          </CommandItem>
        )}

        {!isLoading && searchResults.length > 0 && (
          <CommandGroup heading="Matching Hubs">
            {searchResults.map((hub, index) => (
              <CommandItem
                key={hub.id}
                value={hub.name}
                onSelect={() => handleHubSelect(hub)}
                className={cn(
                  'mx-2 my-1 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-3 hover:bg-gray-700/50',
                  selectedIndex === index ? 'bg-gray-700/50' : ''
                )}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-700">
                  {hub.iconUrl ? (
                    <Image
                      unoptimized
                      src={hub.iconUrl}
                      alt={hub.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-blue-400" />
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-white">
                    {hub.name}
                  </span>
                  {hub.description && (
                    <span className="truncate text-gray-400 text-xs">
                      {hub.description}
                    </span>
                  )}
                  <div className="mt-1 flex items-center gap-3 text-gray-400 text-xs">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-blue-400" />
                      {hub._count.connections.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3 text-blue-400" />
                      {hub._count.messages?.toLocaleString() || '0'}
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowUp className="h-3 w-3 text-blue-400" />
                      {hub.upvotes.length.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoading && relatedTags.length > 0 && (
          <>
            <CommandSeparator className="my-2 bg-gray-700/50" />
            <CommandGroup heading="Related Tags">
              <div className="flex flex-wrap gap-2 p-3">
                {relatedTags.map((tag, index) => (
                  <Badge
                    key={tag}
                    className={cn(
                      'flex cursor-pointer items-center gap-1 border border-gray-600/50 bg-gray-700/50 px-3 py-1.5 text-gray-200 transition-all duration-200 hover:border-gray-500/50 hover:bg-gray-600/50 hover:text-white',
                      selectedIndex === searchResults.length + index
                        ? 'border-blue-500/50 bg-blue-600/20 text-blue-400'
                        : ''
                    )}
                    onClick={() => handleTagSelect(tag)}
                  >
                    <TagIcon className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CommandGroup>
          </>
        )}

        {!isLoading && recentSearches.length > 0 && !searchTerm && (
          <>
            <CommandSeparator className="my-2 bg-gray-700/50" />
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((term, index) => (
                <CommandItem
                  key={`recent-${term}`}
                  value={`recent-${term}`}
                  onSelect={() => handleSearchSubmit(term)}
                  className={cn(
                    'mx-2 my-1 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-3 hover:bg-gray-700/50',
                    selectedIndex ===
                      searchResults.length + relatedTags.length + index
                      ? 'bg-gray-700/50'
                      : ''
                  )}
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-200">{term}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {!isLoading &&
          searchResults.length === 0 &&
          searchTerm &&
          relatedTags.length === 0 && (
            <CommandEmpty className="py-8 text-center">
              <div className="flex flex-col items-center">
                <p className="font-medium text-sm text-white">
                  No matching hubs found
                </p>
                <p className="mt-1 text-gray-400 text-xs">
                  Try adjusting your search or browse by category
                </p>
              </div>
            </CommandEmpty>
          )}
      </CommandList>
    </Command>
  );
}
