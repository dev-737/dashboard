'use client';

import { HelpCircle, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  formatWordWithPattern,
  MatchPattern,
  MatchPatternDescriptions,
  MatchPatternExamples,
  MatchPatternLabels,
} from '@/lib/types/automod';

interface PatternBuilderProps {
  patterns: { pattern: string }[];
  onChange: (patterns: { pattern: string }[]) => void;
}

export function PatternBuilder({ patterns, onChange }: PatternBuilderProps) {
  const [newWord, setNewWord] = useState('');
  const [newMatchType, setNewMatchType] = useState<MatchPattern>(
    MatchPattern.EXACT
  );

  const addPattern = () => {
    if (!newWord.trim()) return;

    const formattedPattern = formatWordWithPattern(
      newWord.trim(),
      newMatchType
    );
    const newPatterns = [...patterns, { pattern: formattedPattern }];
    onChange(newPatterns);
    setNewWord('');
    setNewMatchType(MatchPattern.EXACT);
  };

  const removePattern = (index: number) => {
    const newPatterns = patterns.filter((_, i) => i !== index);
    onChange(newPatterns);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPattern();
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Pattern */}
      <Card className="border-gray-700 bg-gray-800/50 p-4">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="min-w-0 flex-1">
              <Input
                placeholder="Enter word or phrase"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-gray-600 bg-gray-700"
              />
            </div>
            <div className="w-full min-w-0 sm:w-48">
              <Select
                value={newMatchType}
                onValueChange={(value) =>
                  setNewMatchType(value as MatchPattern)
                }
              >
                <SelectTrigger className="border-gray-600 bg-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-800">
                  {Object.entries(MatchPatternLabels).map(([key, label]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="focus:bg-gray-700"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={addPattern}
              disabled={!newWord.trim()}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Match Type Information */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-gray-400">
                      <HelpCircle className="h-4 w-4" />
                      <span className="font-medium">
                        {MatchPatternLabels[newMatchType]}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs border-gray-700 bg-gray-800 text-white">
                    <p className="mb-1 font-medium">
                      {MatchPatternLabels[newMatchType]}
                    </p>
                    <p className="mb-2 text-gray-300 text-sm">
                      {MatchPatternDescriptions[newMatchType]}
                    </p>
                    <p className="text-purple-300 text-sm">
                      {MatchPatternExamples[newMatchType]}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {newWord.trim() && (
              <div className="rounded-md border border-gray-600 bg-gray-700/50 p-2">
                <span className="text-gray-400 text-xs">Preview: </span>
                <code className="break-all font-mono text-purple-300 text-xs">
                  {formatWordWithPattern(newWord.trim(), newMatchType)}
                </code>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Current Patterns */}
      {patterns.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-300 text-sm">
            Patterns ({patterns.length})
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.map((pattern, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: nah idc
                key={index}
                className="flex items-center justify-between rounded-md border border-gray-700 bg-gray-800/50 p-2"
              >
                <code className="mr-2 flex-1 break-all font-mono text-purple-300 text-sm">
                  {pattern.pattern}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePattern(index)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {patterns.length === 0 && (
        <div className="py-4 text-center text-gray-500">
          No patterns added yet. Add your first pattern above.
        </div>
      )}
    </div>
  );
}
