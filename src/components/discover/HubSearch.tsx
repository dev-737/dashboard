'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import type { HubCardDTO } from '@/lib/discover/query';
import { useTRPC } from '@/utils/trpc';

interface HubSearchProps {
  onSearchSubmit?: (query: string) => void;
  className?: string;
}

export function HubSearch({ onSearchSubmit, className }: HubSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<HubCardDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(searchValue, 300);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setOpen(false);
      setSearchValue('');
      setSearchResults([]);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Auto-focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !open && e.target === document.body) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [open]);

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-expanded={open}
            className="premium-card flex h-12 w-full cursor-pointer items-center rounded-[var(--radius-button)] border border-gray-700/50 bg-gray-900/50 px-3 text-base shadow-lg transition-all duration-300 hover:border-purple-500/50 hover:bg-gray-800/50 hover:shadow-xl sm:h-14 sm:px-4 touch-manipulation"
            onClick={() => setOpen(!open)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(!open);
              }
            }}
          >
            <Search className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
            <span className="flex-1 text-left text-gray-400 text-sm sm:text-base">
              {searchValue || (
                <>
                  <span className="sm:hidden">Search communities...</span>
                  <span className="hidden sm:inline">Search for communities, topics, or interests...</span>
                </>
              )}
            </span>
            {searchValue && (
              <button
                type="button"
                className="ml-auto flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded p-0 transition-colors hover:bg-gray-700/50"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchValue('');
                  setSearchResults([]);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <div className="ml-2 hidden flex-shrink-0 text-gray-500 text-xs sm:block">
              Press / to search
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-[300px] border-gray-600/50 bg-gray-900/95 p-0 sm:min-w-[600px]"
          align="start"
          sideOffset={8}
        >
          <Command className="border-none bg-transparent">
            <CommandInput
              ref={inputRef}
              placeholder="Search for communities, topics, or interests..."
              value={searchValue}
              onValueChange={setSearchValue}
              onKeyDown={handleKeyDown}
              className="h-12 border-none bg-transparent text-base text-white placeholder:text-gray-500 focus:ring-0"
            />
            <CommandList className="max-h-[400px]">
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-purple-400"></div>
                    <span>Searching...</span>
                  </div>
                </div>
              )}

              {!loading && searchValue && searchResults.length === 0 && (
                <CommandEmpty className="py-6 text-center">
                  <div className="text-gray-400">
                    <Search className="mx-auto mb-2 h-12 w-12 opacity-50" />
                    <p className="text-sm">
                      No communities found for &ldquo;{searchValue}&rdquo;
                    </p>
                    <p className="mt-1 text-gray-500 text-xs">
                      Try different keywords or check your spelling
                    </p>
                  </div>
                </CommandEmpty>
              )}

              {searchResults.length > 0 && (
                <>
                  <CommandGroup heading="Communities" className="p-2">
                    {searchResults.map((hub) => (
                      <CommandItem
                        key={hub.id}
                        value={hub.name}
                        onSelect={() => {
                          setOpen(false);
                          setSearchValue('');
                        }}
                        className="p-0 data-[selected=true]:bg-gray-800/50"
                      >
                        <Link
                          href={`/hubs/${hub.id}`}
                          className="flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800/30"
                        >
                          <Avatar className="h-10 w-10 ring-1 ring-gray-700/50">
                            <AvatarImage
                              src={hub.iconUrl || '/default-server.svg'}
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
                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
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
                              )}
                              {hub.partnered && (
                                <div className="rounded bg-gradient-to-r from-purple-500 to-pink-500 px-1.5 py-0.5 font-medium text-white text-xs">
                                  Partner
                                </div>
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
                                {hub.weeklyMessageCount?.toLocaleString() ??
                                  '0'}{' '}
                                msgs/week
                              </span>
                              <span>•</span>
                              <span>
                                {hub._count.upvotes?.toLocaleString() ?? '0'}{' '}
                                members
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
                    <CommandGroup className="border-gray-700/50 border-t p-2">
                      <CommandItem
                        value={`search-all-${searchValue}`}
                        onSelect={handleSearchSubmit}
                        className="hover:bg-purple-500/10 data-[selected=true]:bg-purple-500/10"
                      >
                        <div className="flex w-full items-center gap-3 p-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                            <Search className="h-4 w-4 text-purple-400" />
                          </div>
                          <span className="font-medium text-purple-400">
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
