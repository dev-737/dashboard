'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Hash, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTRPC } from '@/utils/trpc';
import { Label } from '../ui/label';

interface Tag {
  name: string;
  count?: number;
  category?: string;
}

interface TagPickerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

type ServerTag =
  | { name: string; usageCount: number; category: string | null }
  | { name: string; usageCount: number }
  | { name: string; category: string | null; isOfficial: boolean };

export function TagPicker({
  selectedTags,
  onTagsChange,
  maxTags = 10,
}: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // Fetch popular tags on mount
  useEffect(() => {
    const fetchPopularTags = async () => {
      setIsLoading(true);
      try {
        const data = await queryClient.fetchQuery(
          trpc.tags.list.queryOptions({ popular: true, limit: 50 })
        );
        const mapped = (data.tags || []).map((t: ServerTag) => ({
          name: t.name,
          count: 'usageCount' in t ? t.usageCount : undefined,
          category: 'category' in t ? (t.category ?? undefined) : undefined,
        }));
        setAvailableTags(mapped);
      } catch (error) {
        console.error('Failed to fetch popular tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularTags();
  }, [queryClient, trpc.tags.list]);

  // Search tags when user types
  useEffect(() => {
    if (searchQuery.length < 2) return;

    const searchTags = async () => {
      setIsLoading(true);
      try {
        const data = await queryClient.fetchQuery(
          trpc.tags.list.queryOptions({ search: searchQuery, limit: 20 })
        );
        const mapped = (data.tags || []).map((t: ServerTag) => ({
          name: t.name,
          count: 'usageCount' in t ? t.usageCount : undefined,
          category: 'category' in t ? (t.category ?? undefined) : undefined,
        }));
        setAvailableTags(mapped);
      } catch (error) {
        console.error('Failed to search tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchTags, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, queryClient, trpc.tags.list]);

  const addTag = (tagName: string) => {
    if (selectedTags.includes(tagName) || selectedTags.length >= maxTags)
      return;
    onTagsChange([...selectedTags, tagName]);
  };

  const removeTag = (tagName: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagName));
  };

  const filteredTags = availableTags.filter(
    (tag) => !selectedTags.includes(tag.name)
  );

  return (
    <div className="flex flex-col gap-3">
      <Label className="font-medium text-gray-300 text-xs uppercase tracking-wide">
        Tags
      </Label>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/20 px-2 py-1 text-purple-300 text-xs transition-colors hover:bg-purple-500/30"
            >
              <Hash className="h-3 w-3" />
              {tag}
              <Button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 transition-colors hover:text-purple-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Picker */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="input-standard w-full justify-between text-left font-normal"
            disabled={selectedTags.length >= maxTags}
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {selectedTags.length >= maxTags
                ? `Maximum ${maxTags} tags selected`
                : 'Add tags...'}
            </span>
            <Hash className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command className="w-full">
            <CommandInput
              placeholder="Search tags..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-none focus:ring-0"
            />
            <CommandList className="max-h-[200px]">
              {isLoading ? (
                <div className="py-6 text-center text-gray-400 text-sm">
                  Loading tags...
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    {searchQuery.length >= 2 ? (
                      <div className="py-6 text-center text-sm">
                        <p className="mb-2 text-gray-400">
                          No tags found for &ldquo;{searchQuery}&rdquo;
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              searchQuery.trim() &&
                              !selectedTags.includes(searchQuery.trim())
                            ) {
                              addTag(searchQuery.trim());
                              setSearchQuery('');
                              setOpen(false);
                            }
                          }}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Create &ldquo;{searchQuery.trim()}&rdquo;
                        </Button>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-gray-400 text-sm">
                        Type to search for tags...
                      </div>
                    )}
                  </CommandEmpty>

                  {filteredTags.length > 0 && (
                    <CommandGroup heading="Available Tags">
                      {filteredTags.map((tag) => (
                        <CommandItem
                          key={tag.name}
                          value={tag.name}
                          onSelect={() => {
                            addTag(tag.name);
                            setSearchQuery('');
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4 text-gray-400" />
                              <span>{tag.name}</span>
                            </div>
                            {tag.count && (
                              <span className="text-gray-400 text-xs">
                                {tag.count} hubs
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Helper text */}
      <p className="text-gray-500 text-xs">
        Select up to {maxTags} tags to filter hubs. Click tags on hub cards to
        add them here.
      </p>
    </div>
  );
}
