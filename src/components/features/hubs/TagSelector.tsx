'use client';

import { Plus, Search, Sparkles, Tag, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePopularTags, useTagSearch } from '@/hooks/use-tags';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  showPopular?: boolean;
  allowTagCreation?: boolean; // New prop to control tag creation
}

/**
 * Enhanced Tag Selector Component
 * Features autocomplete, popular tags, and smooth animations
 */
export function TagSelector({
  selectedTags,
  onTagsChange,
  placeholder = 'Search for tags...',
  maxTags = 5,
  showPopular = true,
  allowTagCreation = true, // Default to true for backward compatibility
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hooks for tag data
  const { tags: searchResults, isLoading: isSearching } =
    useTagSearch(searchQuery);
  const { tags: popularTags, isLoading: isLoadingPopular } = usePopularTags(12);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const availableTags = searchQuery ? searchResults : popularTags;
    const filteredTags = availableTags.filter(
      (tag) => !selectedTags.includes(tag.name)
    );

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, filteredTags.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && filteredTags[focusedIndex]) {
          addTag(filteredTags[focusedIndex].name);
        } else if (searchQuery.trim() && allowTagCreation) {
          addTag(searchQuery.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      case 'Backspace':
        if (!searchQuery && selectedTags.length > 0) {
          removeTag(selectedTags[selectedTags.length - 1]);
        }
        break;
    }
  };

  const addTag = (tagName: string) => {
    const normalizedTag = tagName.trim();
    if (
      normalizedTag &&
      !selectedTags.includes(normalizedTag) &&
      selectedTags.length < maxTags
    ) {
      onTagsChange([...selectedTags, normalizedTag]);
      setSearchQuery('');
      setFocusedIndex(-1);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tagName: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagName));
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  // Get tags to display in dropdown
  const getDisplayTags = () => {
    const availableTags = searchQuery ? searchResults : popularTags;
    return availableTags.filter((tag) => !selectedTags.includes(tag.name));
  };

  const displayTags = getDisplayTags();
  const canAddMore = selectedTags.length < maxTags;

  return (
    <div className="relative">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-gray-300 text-sm">
              Selected Tags ({selectedTags.length}/{maxTags})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllTags}
              className="h-auto p-1 text-gray-400 hover:text-white"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  variant="secondary"
                  className="group border-blue-600/30 bg-blue-600/20 pr-1 text-blue-300 transition-colors hover:bg-blue-600/30"
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="ml-1 h-auto p-0 text-blue-300 hover:text-white group-hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={
              canAddMore ? placeholder : `Maximum ${maxTags} tags selected`
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
              setFocusedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            disabled={!canAddMore}
            className="border-gray-600 bg-gray-800 pl-10 text-white focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFocusedIndex(-1);
                inputRef.current?.focus();
              }}
              className="-translate-y-1/2 absolute top-1/2 right-2 h-auto transform p-1 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && canAddMore && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 left-0 z-[9999] mt-2"
            >
              <Card className="relative z-[9999] max-h-64 overflow-hidden border-gray-700 bg-gray-800 shadow-xl">
                <CardContent className="p-0">
                  {/* Custom tag creation - only show if allowed */}
                  {allowTagCreation &&
                    searchQuery &&
                    !displayTags.some(
                      (tag) =>
                        tag.name.toLowerCase() === searchQuery.toLowerCase()
                    ) && (
                      <Button
                        onClick={() => addTag(searchQuery)}
                        className={`w-full border-gray-700 border-b px-4 py-3 text-left transition-colors hover:bg-gray-700 ${
                          focusedIndex === -1 ? 'bg-gray-700' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-green-400" />
                          <span className="text-white">Create tag: </span>
                          <Badge
                            variant="outline"
                            className="border-green-400 text-green-400"
                          >
                            {searchQuery}
                          </Badge>
                        </div>
                      </Button>
                    )}

                  {/* Search results or popular tags */}
                  <div className="max-h-48 overflow-y-auto">
                    {isSearching || isLoadingPopular ? (
                      <div className="p-4 text-center text-gray-400">
                        <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        Loading tags...
                      </div>
                    ) : displayTags.length > 0 ? (
                      <>
                        {!searchQuery && showPopular && (
                          <div className="border-gray-700 border-b px-4 py-2">
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Sparkles className="h-4 w-4" />
                              Popular Tags
                            </div>
                          </div>
                        )}
                        {displayTags.map((tag, index) => (
                          <Button
                            key={tag.name}
                            onClick={() => addTag(tag.name)}
                            className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-700 ${
                              index === focusedIndex ? 'bg-gray-700' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <span className="text-white">{tag.name}</span>
                                {'category' in tag && tag.category && (
                                  <Badge
                                    variant="outline"
                                    className="border-gray-600 text-gray-400 text-xs"
                                  >
                                    {tag.category}
                                  </Badge>
                                )}
                              </div>
                              {'usageCount' in tag && tag.usageCount && (
                                <span className="text-gray-500 text-xs">
                                  {tag.usageCount} uses
                                </span>
                              )}
                            </div>
                          </Button>
                        ))}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-400">
                        {searchQuery
                          ? 'No tags found'
                          : 'No popular tags available'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Help Text */}
      <div className="mt-2 text-gray-500 text-xs">
        {canAddMore ? (
          allowTagCreation ? (
            'Press Enter to add a tag, or select from the dropdown'
          ) : (
            'Select from existing tags'
          )
        ) : (
          <>Maximum {maxTags} tags reached</>
        )}
      </div>
    </div>
  );
}
