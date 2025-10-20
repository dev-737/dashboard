'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Handshake, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDebounce } from '@/hooks/use-debounce';
import type { HubCardDTO } from '@/lib/discover/query';
import { formatNumber } from '@/lib/utils';
import { useTRPC } from '@/utils/trpc';

interface HubSearchProps {
  onSearchSubmit?: (query: string) => void;
  className?: string;
}

export function HubSearch({ onSearchSubmit, className }: HubSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<HubCardDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(searchValue, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search function
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const searchHubs = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await queryClient.fetchQuery(
          trpc.discover.list.queryOptions({ q: query, pageSize: 8 })
        );
        setSearchResults(data.items || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    },
    [queryClient, trpc.discover.list]
  );

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearch) {
      searchHubs(debouncedSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch, searchHubs]);

  // Handle search submission
  const handleSearchSubmit = () => {
    if (searchValue.trim() && onSearchSubmit) {
      onSearchSubmit(searchValue.trim());
      setSearchValue('');
      setSearchResults([]);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isFocused && e.target === document.body) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFocused]);

  // Show dropdown when focused and has value or results
  const showDropdown =
    isFocused && (searchValue.trim() !== '' || searchResults.length > 0);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Enhanced search input */}
      <div className="relative">
        <div
          className={`premium-card flex h-12 w-full items-center overflow-hidden rounded-[var(--radius-button)] border bg-gray-900/50 px-3 shadow-lg backdrop-blur-sm transition-all duration-300 sm:h-14 sm:px-4 ${
            isFocused
              ? 'border-purple-500/70 shadow-xl shadow-purple-500/20 ring-2 ring-purple-500/30'
              : 'border-gray-700/50 hover:border-purple-500/50 hover:bg-gray-800/50 hover:shadow-xl'
          }`}
        >
          <Search
            className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-300 ${
              isFocused ? 'text-purple-400' : 'text-gray-400'
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search communities, topics, or tags..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            className="flex-1 bg-transparent text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-base"
          />
          {searchValue && (
            <button
              type="button"
              className="ml-auto flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-full p-0 text-gray-400 transition-all duration-200 hover:bg-gray-700/50 hover:text-white"
              onClick={() => {
                setSearchValue('');
                setSearchResults([]);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Keyboard shortcut hint */}
        {!isFocused && !searchValue && (
          <div className="pointer-events-none absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-1 rounded bg-gray-800/50 px-2 py-1 font-medium text-gray-500 text-xs">
            <kbd className="rounded border border-gray-600/50 bg-gray-900/50 px-1.5 py-0.5 font-mono text-[10px]">
              /
            </kbd>
          </div>
        )}
      </div>

      {/* Search results dropdown */}
      {showDropdown && (
        <div className="absolute top-full z-50 mt-2 w-full animate-in fade-in slide-in-from-top-2 duration-200">
          <Command className="overflow-hidden rounded-[var(--radius-button)] border border-gray-700/60 bg-gray-900/90 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CommandList className="max-h-[500px]">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="relative h-5 w-5">
                      <div className="absolute inset-0 animate-spin rounded-full border-2 border-gray-600 border-t-purple-400" />
                    </div>
                    <span className="text-sm">Searching...</span>
                  </div>
                </div>
              )}

              {!loading && searchValue && searchResults.length === 0 && (
                <CommandEmpty className="py-8 text-center">
                  <div className="text-gray-400">
                    <div className="relative mx-auto mb-3 inline-block">
                      <div className="absolute inset-0 rounded-full bg-gray-700/20 blur-xl" />
                      <Search className="relative mx-auto h-12 w-12 opacity-50" />
                    </div>
                    <p className="font-medium text-sm">
                      No communities found for &ldquo;{searchValue}&rdquo;
                    </p>
                    <p className="mt-1.5 text-gray-500 text-xs">
                      Try different keywords or check your spelling
                    </p>
                  </div>
                </CommandEmpty>
              )}

              {searchResults.length > 0 && (
                <>
                  <CommandGroup
                    heading="Communities"
                    className="p-2 [&_[cmdk-group-heading]]:text-gray-400"
                  >
                    {searchResults.map((hub) => (
                      <CommandItem
                        key={hub.id}
                        value={hub.name}
                        onSelect={() => {
                          setSearchValue('');
                          setIsFocused(false);
                        }}
                        className="rounded-lg p-0 data-[selected=true]:bg-gray-800/40"
                      >
                        <Link
                          href={`/hubs/${hub.id}`}
                          className="flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800/40"
                        >
                          <Avatar className="h-10 w-10 ring-1 ring-gray-700/50">
                            <AvatarImage
                              src={hub.iconUrl || '/assets/images/defaults/default-server.svg'}
                              alt={hub.name}
                            />
                            <AvatarFallback className="bg-gray-800 text-sm text-white">
                              {hub.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="truncate font-medium text-white">
                                {hub.name}
                              </h4>
                              {hub.verified && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-blue-500">
                                      <svg
                                        className="h-2.5 w-2.5 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <title>Verified hub</title>
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Verified Hub</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {hub.partnered && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700">
                                      <Handshake className="h-2.5 w-2.5 text-white" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Partner Hub</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {hub.nsfw && (
                                <div className="rounded border border-red-500/50 bg-red-500/20 px-1.5 py-0.5 font-medium text-red-400 text-xs">
                                  🔞
                                </div>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-gray-400 text-sm">
                              {hub.description ||
                                'A community space for meaningful discussions and connections.'}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-gray-500 text-xs">
                              <span>
                                {formatNumber(hub.weeklyMessageCount)} msgs/week
                              </span>
                              <span>•</span>
                              <span>
                                {formatNumber(hub._count.upvotes)} members
                              </span>
                              {hub.tags.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">
                                    #
                                    {hub.tags
                                      .slice(0, 2)
                                      .map((tag) => tag.name)
                                      .join(', #')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  {searchValue.trim() && (
                    <CommandGroup className="border-gray-800/50 border-t p-2">
                      <CommandItem
                        value={`search-all-${searchValue}`}
                        onSelect={handleSearchSubmit}
                        className="cursor-pointer rounded-lg transition-colors hover:bg-purple-500/15 data-[selected=true]:bg-purple-500/15"
                      >
                        <div className="flex w-full items-center gap-3 p-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                            <Search className="h-4 w-4 text-purple-400" />
                          </div>
                          <span className="font-medium text-purple-400 text-sm">
                            Search all communities for &ldquo;{searchValue}
                            &rdquo;
                          </span>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
