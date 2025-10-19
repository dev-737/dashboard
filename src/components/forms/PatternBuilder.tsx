'use client';

import { Plus, X, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  MatchPattern, 
  MatchPatternLabels, 
  MatchPatternDescriptions, 
  MatchPatternExamples,
  formatWordWithPattern
} from '@/lib/types/anti-swear';

interface PatternBuilderProps {
  patterns: { pattern: string }[];
  onChange: (patterns: { pattern: string }[]) => void;
}

export function PatternBuilder({ patterns, onChange }: PatternBuilderProps) {
  const [newWord, setNewWord] = useState('');
  const [newMatchType, setNewMatchType] = useState<MatchPattern>(MatchPattern.EXACT);

  const addPattern = () => {
    if (!newWord.trim()) return;
    
    const formattedPattern = formatWordWithPattern(newWord.trim(), newMatchType);
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
      <Card className="p-4 bg-gray-800/50 border-gray-700">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0">
              <Input
                placeholder="Enter word or phrase"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="w-full sm:w-48 min-w-0">
              <Select value={newMatchType} onValueChange={(value) => setNewMatchType(value as MatchPattern)}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {Object.entries(MatchPatternLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="focus:bg-gray-700">
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
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-gray-400">
                      <HelpCircle className="h-4 w-4" />
                      <span className="font-medium">{MatchPatternLabels[newMatchType]}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border-gray-700 text-white max-w-xs">
                    <p className="font-medium mb-1">{MatchPatternLabels[newMatchType]}</p>
                    <p className="text-sm text-gray-300 mb-2">{MatchPatternDescriptions[newMatchType]}</p>
                    <p className="text-sm text-purple-300">{MatchPatternExamples[newMatchType]}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {newWord.trim() && (
              <div className="p-2 bg-gray-700/50 rounded-md border border-gray-600">
                <span className="text-xs text-gray-400">Preview: </span>
                <code className="text-xs text-purple-300 font-mono break-all">
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
          <h4 className="text-sm font-medium text-gray-300">
            Patterns ({patterns.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {patterns.map((pattern, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded-md border border-gray-700"
              >
                <code className="text-sm text-purple-300 font-mono flex-1 mr-2 break-all">
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
        <div className="text-center py-4 text-gray-500">
          No patterns added yet. Add your first pattern above.
        </div>
      )}
    </div>
  );
}