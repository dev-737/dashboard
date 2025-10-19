'use client';

import { Check, Edit2, HelpCircle, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  type AntiSwearPattern,
  formatWordWithPattern,
  getMatchPatternFromPattern,
  MatchPattern,
  parseWordPattern,
  wordAndMatchPatternToPattern,
} from '@/lib/types/anti-swear';

interface WordTagInputProps {
  patterns: AntiSwearPattern[];
  onChange: (patterns: AntiSwearPattern[]) => void;
  className?: string;
}

export function WordTagInput({
  patterns,
  onChange,
  className,
}: WordTagInputProps) {
  const [tags, setTags] = useState<AntiSwearPattern[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editPattern, setEditPattern] = useState<MatchPattern>(
    MatchPattern.EXACT
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Initialize tags from patterns
  useEffect(() => {
    setTags(patterns);
  }, [patterns]);

  // Update the parent component when tags change
  const updatePatterns = (newTags: AntiSwearPattern[]) => {
    onChange(newTags);
  };

  const addTag = () => {
    if (inputValue.trim()) {
      // Split by commas and process each word
      const words = inputValue
        .split(',')
        .map((word) => word.trim())
        .filter((word) => word.length > 0);

      // Create new patterns for each word
      const newPatterns = words.map((word) =>
        wordAndMatchPatternToPattern(word, MatchPattern.EXACT)
      );

      const newTags = [...tags, ...newPatterns];
      setTags(newTags);
      updatePatterns(newTags);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
    updatePatterns(newTags);
  };

  const startEditing = (index: number) => {
    const tag = tags[index];
    setEditingIndex(index);

    const { word, pattern } = parseWordPattern(tag.pattern);
    setEditValue(word);
    setEditPattern(pattern);

    // Focus the edit input after it's rendered
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 10);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newTags = [...tags];

      newTags[editingIndex] = {
        pattern: formatWordWithPattern(editValue.trim(), editPattern),
      };

      setTags(newTags);
      updatePatterns(newTags);
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const getPatternClass = (pattern: AntiSwearPattern) => {
    const matchPattern = getMatchPatternFromPattern(pattern);
    switch (matchPattern) {
      case MatchPattern.EXACT:
        return 'bg-blue-900/40 border-blue-700/50 text-blue-200';
      case MatchPattern.PREFIX:
        return 'bg-green-900/40 border-green-700/50 text-green-200';
      case MatchPattern.SUFFIX:
        return 'bg-purple-900/40 border-purple-700/50 text-purple-200';
      case MatchPattern.WILDCARD:
        return 'bg-amber-900/40 border-amber-700/50 text-amber-200';
      default:
        return 'bg-gray-900/40 border-gray-700/50 text-gray-200';
    }
  };

  const cyclePattern = (currentPattern: MatchPattern) => {
    const patterns = [
      MatchPattern.EXACT,
      MatchPattern.PREFIX,
      MatchPattern.SUFFIX,
      MatchPattern.WILDCARD,
    ];
    const currentIndex = patterns.indexOf(currentPattern);
    const nextIndex = (currentIndex + 1) % patterns.length;
    return patterns[nextIndex];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex min-h-[120px] w-full flex-wrap gap-3 rounded-md border border-gray-800/50 bg-gray-950/70 p-4 sm:min-h-[100px] sm:gap-2 sm:p-3">
        {tags.map((tag, index) =>
          editingIndex === index ? (
            <div
              key={`editing-${tag.pattern}-${index}`}
              className="flex w-full flex-wrap items-center gap-1 rounded-md border border-gray-700/50 bg-gray-900 p-2 sm:w-auto"
            >
              <Input
                ref={editInputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleEditKeyDown}
                className="h-8 w-full min-w-0 border-0 bg-transparent p-1 focus-visible:ring-0 sm:h-7 sm:w-32"
              />

              <div className="mt-1 flex w-full items-center justify-between gap-1 sm:mt-0 sm:w-auto">
                <TooltipProvider delayDuration={700}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0 sm:h-6 sm:w-6"
                        onClick={() =>
                          setEditPattern(cyclePattern(editPattern))
                        }
                      >
                        <span className="font-mono text-xs">
                          {editPattern === MatchPattern.EXACT
                            ? 'abc'
                            : editPattern === MatchPattern.PREFIX
                              ? 'abc*'
                              : editPattern === MatchPattern.SUFFIX
                                ? '*abc'
                                : '*abc*'}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" className="z-50">
                      <p>Click to cycle through match patterns</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-green-400 hover:bg-green-950/30 hover:text-green-300 sm:h-6 sm:w-6"
                    onClick={saveEdit}
                  >
                    <Check className="h-4 w-4 sm:h-3 sm:w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-800/50 hover:text-gray-300 sm:h-6 sm:w-6"
                    onClick={cancelEdit}
                  >
                    <X className="h-4 w-4 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Badge
              key={`tag-${tag.pattern}-${index}`}
              variant="outline"
              className={`px-2 py-1.5 sm:py-1 ${getPatternClass(tag)} group flex flex-wrap items-center gap-1 transition-colors hover:bg-opacity-60 sm:flex-nowrap sm:gap-0`}
            >
              <span className="break-all font-mono">{tag.pattern}</span>
              <div className="mt-1 ml-0 flex w-full items-center justify-end gap-1 sm:mt-0 sm:ml-1 sm:w-auto sm:space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 rounded-full p-0 opacity-70 hover:bg-gray-800/50 hover:opacity-100 sm:h-5 sm:w-5"
                  onClick={() => startEditing(index)}
                >
                  <Edit2 className="h-4 w-4 sm:h-3 sm:w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 rounded-full p-0 text-red-400 opacity-70 hover:bg-red-950/30 hover:opacity-100 sm:h-5 sm:w-5"
                  onClick={() => removeTag(index)}
                >
                  <X className="h-4 w-4 sm:h-3 sm:w-3" />
                </Button>
              </div>
            </Badge>
          )
        )}

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-0">
          <div className="flex w-full items-center sm:w-auto">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add words (comma separated)..."
              className="h-9 w-full border-gray-700/50 bg-gray-900/50 focus:border-purple-500/50 sm:h-8 sm:w-40"
            />

            <TooltipProvider delayDuration={700}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-9 w-9 p-0 text-purple-400 hover:bg-purple-950/30 hover:text-purple-300 sm:h-8 sm:w-8"
                    onClick={addTag}
                  >
                    <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="z-50">
                  <p>Add patterns (comma separated)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={700}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-9 w-9 p-0 text-amber-400 hover:bg-amber-950/30 hover:text-amber-300 sm:h-8 sm:w-8"
                  >
                    <HelpCircle className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="start"
                  className="z-50 max-w-xs"
                >
                  <div className="space-y-2">
                    <p className="font-semibold">Pattern Matching:</p>
                    <ul className="space-y-1.5 text-xs">
                      <li>
                        <code className="rounded bg-gray-800 px-1">word</code> -
                        Exact match only
                      </li>
                      <li>
                        <code className="rounded bg-gray-800 px-1">word*</code>{' '}
                        - Matches words that start with this
                      </li>
                      <li>
                        <code className="rounded bg-gray-800 px-1">*word</code>{' '}
                        - Matches words that end with this
                      </li>
                      <li>
                        <code className="rounded bg-gray-800 px-1">*word*</code>{' '}
                        - Matches words containing this
                      </li>
                    </ul>
                    <p className="mt-2 text-xs">
                      You can add multiple words at once by separating them with
                      commas.
                    </p>
                    <p className="text-xs italic">
                      Example:{' '}
                      <code className="rounded bg-gray-800 px-1">
                        bad, worse, *worst*
                      </code>
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="flex items-start text-gray-400 text-xs sm:items-center">
        <HelpCircle className="mt-0.5 mr-1 h-4 w-4 flex-shrink-0 text-amber-400 sm:mt-0 sm:h-3 sm:w-3" />
        <span>
          Tips: Use commas to add multiple words at once. Use * for pattern
          matching. Tap/hover the help icon above for details.
        </span>
      </div>
    </div>
  );
}
