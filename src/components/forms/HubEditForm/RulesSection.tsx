import {
  ArrowDownIcon,
  ArrowUpIcon,
  Cancel01Icon,
  Message02Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RulesSectionProps {
  rules: string[];
  setRules: React.Dispatch<React.SetStateAction<string[]>>;
}

export function RulesSection({ rules, setRules }: RulesSectionProps) {
  const [newRule, setNewRule] = useState('');

  const handleAddRule = () => {
    if (newRule.trim() && !rules.includes(newRule.trim())) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleMoveRuleUp = (index: number) => {
    if (index === 0) return;
    const newRules = [...rules];
    [newRules[index - 1], newRules[index]] = [
      newRules[index],
      newRules[index - 1],
    ];
    setRules(newRules);
  };

  const handleMoveRuleDown = (index: number) => {
    if (index === rules.length - 1) return;
    const newRules = [...rules];
    [newRules[index], newRules[index + 1]] = [
      newRules[index + 1],
      newRules[index],
    ];
    setRules(newRules);
  };

  return (
    <div className="space-y-4 border-gray-700/50 border-t pt-6">
      <div className="flex items-center justify-between">
        <Label className="font-medium text-base">Hub Rules</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRule}
          disabled={!newRule.trim()}
          className="border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white"
        >
          <HugeiconsIcon
            strokeWidth={2}
            icon={PlusSignIcon}
            className="mr-1 h-4 w-4"
          />
          Add Rule
        </Button>
      </div>

      <div className="flex gap-3">
        <Textarea
          placeholder="Add a new rule (e.g., Be respectful to all members)"
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleAddRule();
            }
          }}
          className="min-h-20 flex-1 resize-none border-gray-700/50 bg-transparent focus-visible:ring-indigo-500/50"
          maxLength={200}
        />
      </div>

      <div className="space-y-3">
        {rules.length > 0 ? (
          rules.map((rule, index) => (
            <div
              key={`rule-${rule.slice(0, 20)}-${index}`}
              className="flex items-start gap-3 rounded-lg border border-gray-700/50 bg-gray-800/30 p-4"
            >
              <div className="flex flex-col gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveRuleUp(index)}
                        disabled={index === 0}
                        className="h-8 w-8 p-0 hover:bg-gray-700/50"
                      >
                        <HugeiconsIcon
                          strokeWidth={2}
                          icon={ArrowUpIcon}
                          className="h-4 w-4"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Move up</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveRuleDown(index)}
                        disabled={index === rules.length - 1}
                        className="h-8 w-8 p-0 hover:bg-gray-700/50"
                      >
                        <HugeiconsIcon
                          strokeWidth={2}
                          icon={ArrowDownIcon}
                          className="h-4 w-4"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Move down</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex-1 text-gray-200 text-sm">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-medium text-indigo-400">
                    Rule {index + 1}
                  </span>
                </div>
                <p className="leading-relaxed">{rule}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveRule(index)}
                className="h-8 w-8 p-0 hover:bg-red-600/20 hover:text-red-400"
              >
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={Cancel01Icon}
                  className="h-4 w-4"
                />
              </Button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Message02Icon}
              className="mx-auto mb-3 h-12 w-12 opacity-50"
            />
            <p>No rules added yet</p>
            <p className="text-sm">
              Add your first rule to help maintain a positive environment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
