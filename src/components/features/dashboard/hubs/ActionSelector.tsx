'use client';

import { Check, HelpCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BlockWordAction } from '@/lib/generated/prisma/client';
import {
  BlockWordActionLabels,
  BlockWordActionDescriptions,
  BlockWordActionColors,
} from '@/lib/types/anti-swear';

interface ActionSelectorProps {
  selectedActions: BlockWordAction[];
  onChange: (actions: BlockWordAction[]) => void;
  showMuteDuration?: boolean;
  muteDurationMinutes?: number | null;
  onMuteDurationChange?: (minutes: number | null) => void;
}

export function ActionSelector({
  selectedActions,
  onChange,
  showMuteDuration = true,
  muteDurationMinutes,
  onMuteDurationChange,
}: ActionSelectorProps) {
  const [customMuteDuration, setCustomMuteDuration] = useState(
    muteDurationMinutes?.toString() || '60'
  );

  const toggleAction = (action: BlockWordAction) => {
    if (selectedActions.includes(action)) {
      onChange(selectedActions.filter((a) => a !== action));
    } else {
      onChange([...selectedActions, action]);
    }
  };

  const handleMuteDurationChange = (value: string) => {
    setCustomMuteDuration(value);
    const minutes = parseInt(value);
    if (!isNaN(minutes) && minutes > 0 && onMuteDurationChange) {
      onMuteDurationChange(minutes);
    }
  };

  const actionOrder = [
    BlockWordAction.SEND_ALERT,
    BlockWordAction.BLOCK_MESSAGE,
    BlockWordAction.WARN,
    BlockWordAction.MUTE,
    BlockWordAction.BAN,
    BlockWordAction.BLACKLIST,
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actionOrder.map((action) => {
          const isSelected = selectedActions.includes(action);
          const isDeprecated = action === BlockWordAction.BLACKLIST;

          return (
            <Card
              key={action}
              className={`cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? 'border-purple-500/50 bg-purple-900/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              } ${isDeprecated ? 'opacity-60' : ''}`}
              onClick={() => !isDeprecated && toggleAction(action)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600'
                            : 'border-gray-500'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium text-white text-sm">
                        {BlockWordActionLabels[action]}
                      </span>
                      {isDeprecated && (
                        <Badge
                          variant="outline"
                          className="text-xs text-orange-400 border-orange-500/30"
                        >
                          Deprecated
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {BlockWordActionDescriptions[action]}
                    </p>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="ml-2">
                          <HelpCircle className="h-4 w-4 text-gray-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 border-gray-700 text-white max-w-xs">
                        <p className="font-medium mb-1">
                          {BlockWordActionLabels[action]}
                        </p>
                        <p className="text-sm text-gray-300">
                          {BlockWordActionDescriptions[action]}
                        </p>
                        {action === BlockWordAction.MUTE && (
                          <p className="text-sm text-purple-300 mt-2">
                            Requires mute duration configuration
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Mute Duration Configuration */}
      {showMuteDuration && selectedActions.includes(BlockWordAction.MUTE) && (
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <Label className="text-sm font-medium text-gray-300">
                Mute Duration
              </Label>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0 max-w-xs">
                <Input
                  type="number"
                  min="1"
                  max="43200"
                  placeholder="60"
                  value={customMuteDuration}
                  onChange={(e) => handleMuteDurationChange(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <span className="text-sm text-gray-400 whitespace-nowrap">
                minutes
              </span>
            </div>
            <p className="text-xs text-gray-500">
              How long users should be muted (1-43200 minutes, max 30 days)
            </p>
          </div>
        </Card>
      )}

      {/* Action Summary */}
      {selectedActions.length > 0 && (
        <Card className="p-4 bg-gray-900/50 border-gray-700">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">
              Selected Actions ({selectedActions.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {selectedActions.map((action) => (
                <Badge
                  key={action}
                  className={`${BlockWordActionColors[action]} text-xs`}
                >
                  {BlockWordActionLabels[action]}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      {selectedActions.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          Select at least one action to take when patterns are matched.
        </div>
      )}
    </div>
  );
}
