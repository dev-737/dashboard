'use client';

import {
  Clock01Icon,
  HelpCircleIcon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BlockWordAction } from '@/lib/generated/prisma/client/client';
import {
  BlockWordActionColors,
  BlockWordActionDescriptions,
  BlockWordActionLabels,
} from '@/lib/types/automod';

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
    const minutes = parseInt(value, 10);
    if (!Number.isNaN(minutes) && minutes > 0 && onMuteDurationChange) {
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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {actionOrder.map((action) => {
          const isSelected = selectedActions.includes(action);
          const isDeprecated = action === BlockWordAction.BLACKLIST;

          return (
            <Card
              key={action}
              className={`cursor-pointer border transition-all duration-200 ${
                isSelected
                  ? 'border-purple-500/50 bg-purple-900/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              } ${isDeprecated ? 'opacity-60' : ''}`}
              onClick={() => !isDeprecated && toggleAction(action)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border-2 ${
                          isSelected
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-500'
                        }`}
                      >
                        {isSelected && (
                          <HugeiconsIcon
                            strokeWidth={2}
                            icon={Tick01Icon}
                            className="h-3 w-3 text-white"
                          />
                        )}
                      </div>
                      <span className="font-medium text-sm text-white">
                        {BlockWordActionLabels[action]}
                      </span>
                      {isDeprecated && (
                        <Badge
                          variant="outline"
                          className="border-orange-500/30 text-orange-400 text-xs"
                        >
                          Deprecated
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">
                      {BlockWordActionDescriptions[action]}
                    </p>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="ml-2">
                          <HugeiconsIcon
                            strokeWidth={2}
                            icon={HelpCircleIcon}
                            className="h-4 w-4 text-gray-500"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs border-gray-700 bg-gray-800 text-white">
                        <p className="mb-1 font-medium">
                          {BlockWordActionLabels[action]}
                        </p>
                        <p className="text-gray-300 text-sm">
                          {BlockWordActionDescriptions[action]}
                        </p>
                        {action === BlockWordAction.MUTE && (
                          <p className="mt-2 text-purple-300 text-sm">
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
        <Card className="border-gray-700 bg-gray-800/50 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                strokeWidth={2}
                icon={Clock01Icon}
                className="h-4 w-4 text-purple-400"
              />
              <Label className="font-medium text-gray-300 text-sm">
                Mute Duration
              </Label>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 max-w-xs flex-1">
                <Input
                  type="number"
                  min="1"
                  max="43200"
                  placeholder="60"
                  value={customMuteDuration}
                  onChange={(e) => handleMuteDurationChange(e.target.value)}
                  className="border-gray-600 bg-gray-700"
                />
              </div>
              <span className="whitespace-nowrap text-gray-400 text-sm">
                minutes
              </span>
            </div>
            <p className="text-gray-500 text-xs">
              How long users should be muted (1-43200 minutes, max 30 days)
            </p>
          </div>
        </Card>
      )}

      {/* Action Summary */}
      {selectedActions.length > 0 && (
        <Card className="border-gray-700 bg-gray-900/50 p-4">
          <div className="space-y-2">
            <Label className="font-medium text-gray-300 text-sm">
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
        <div className="py-4 text-center text-gray-500">
          Select at least one action to take when patterns are matched.
        </div>
      )}
    </div>
  );
}
