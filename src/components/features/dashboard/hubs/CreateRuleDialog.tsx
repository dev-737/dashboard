'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Shield, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { PatternBuilder } from '@/components/forms/PatternBuilder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { BlockWordAction } from '@/lib/generated/prisma/client/client';
import {
  BlockWordActionColors,
  BlockWordActionLabels,
  RULE_TEMPLATES,
} from '@/lib/types/anti-swear';
import { useTRPC } from '@/utils/trpc';
import { ActionSelector } from './ActionSelector';

interface CreateRuleDialogProps {
  hubId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRuleDialog({
  hubId,
  open,
  onOpenChange,
}: CreateRuleDialogProps) {
  const trpc = useTRPC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState<
    keyof typeof RULE_TEMPLATES | null
  >(null);
  const [customRule, setCustomRule] = useState({
    name: '',
    patterns: [] as { pattern: string }[],
    actions: [BlockWordAction.BLOCK_MESSAGE] as BlockWordAction[],
  });

  const createMutation = useMutation(
    trpc.hub.createAntiSwearRule.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.hub.getAntiSwearRules.queryFilter({ hubId })
        );
        onOpenChange(false);
        resetForm();
        toast({
          title: 'Success',
          description: 'Rule created successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create rule',
          variant: 'destructive',
        });
      },
    })
  );

  const resetForm = () => {
    setActiveTab('template');
    setSelectedTemplate(null);
    setCustomRule({
      name: '',
      patterns: [],
      actions: [BlockWordAction.BLOCK_MESSAGE],
    });
  };

  const handleCreateFromTemplate = async (
    templateKey: keyof typeof RULE_TEMPLATES
  ) => {
    const template = RULE_TEMPLATES[templateKey];
    await createMutation.mutateAsync({
      hubId,
      name: template.name,
      actions: template.actions,
      patterns: [], // User will add patterns after creation
    });
  };

  const handleCreateCustomRule = async () => {
    if (!customRule.name.trim() || customRule.name.length < 3) {
      toast({
        title: 'Error',
        description: 'Rule name must be at least 3 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (customRule.patterns.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one pattern',
        variant: 'destructive',
      });
      return;
    }

    if (customRule.actions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one action',
        variant: 'destructive',
      });
      return;
    }

    await createMutation.mutateAsync({
      hubId,
      name: customRule.name,
      actions: customRule.actions,
      patterns: customRule.patterns,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden border-gray-800 bg-gray-900 sm:max-w-2xl lg:max-w-4xl">
        <div className="flex h-full max-h-[85vh] flex-col">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="flex items-center text-purple-400">
              <Shield className="mr-2 h-5 w-5" />
              Create New Filter Rule
            </DialogTitle>
            <DialogDescription>
              Choose from a template or create a custom rule to protect your hub
              from unwanted content.
            </DialogDescription>
          </DialogHeader>

          <div
            className="-mr-2 flex-1 overflow-y-auto pr-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#374151 transparent',
            }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger
                  value="custom"
                  className="data-[state=active]:bg-purple-600/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Custom Rule
                </TabsTrigger>
                <TabsTrigger
                  value="template"
                  className="data-[state=active]:bg-purple-600/20"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Templates (Coming Soon)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="mt-6">
                <div className="space-y-4">
                  <div className="mb-4 text-gray-400 text-sm">
                    Start with a pre-configured rule template. You can customize
                    it after creation.
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {Object.entries(RULE_TEMPLATES).map(([key, template]) => (
                      <Card
                        key={key}
                        className={`cursor-pointer transition-all duration-200 hover:border-purple-500/50 ${
                          selectedTemplate === key
                            ? 'border-purple-500/50 bg-purple-950/20'
                            : 'border-gray-800 bg-gray-950/50'
                        }`}
                        onClick={() =>
                          setSelectedTemplate(
                            key as keyof typeof RULE_TEMPLATES
                          )
                        }
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-white">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="break-words text-sm">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <Label className="font-medium text-gray-400 text-xs">
                                ACTIONS
                              </Label>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {template.actions.map((action) => (
                                  <Badge
                                    key={action}
                                    className={`${BlockWordActionColors[action]} text-xs`}
                                  >
                                    {BlockWordActionLabels[action]}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedTemplate && (
                    <div className="flex justify-end border-gray-800 border-t pt-4">
                      <Button
                        onClick={() =>
                          handleCreateFromTemplate(selectedTemplate)
                        }
                        disabled={createMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      >
                        {createMutation.isPending
                          ? 'Creating...'
                          : 'Create Rule'}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="mt-6">
                <div className="space-y-6">
                  {/* Rule Name */}
                  <div className="space-y-2">
                    <Label htmlFor="rule-name">Rule Name</Label>
                    <Input
                      id="rule-name"
                      placeholder="Enter a descriptive name for your rule"
                      value={customRule.name}
                      onChange={(e) =>
                        setCustomRule((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="border-gray-700 bg-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Patterns to Match</Label>
                    <PatternBuilder
                      patterns={customRule.patterns}
                      onChange={(patterns: { pattern: string }[]) =>
                        setCustomRule((prev) => ({ ...prev, patterns }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Actions to Take</Label>
                    <ActionSelector
                      selectedActions={customRule.actions}
                      onChange={(actions: BlockWordAction[]) =>
                        setCustomRule((prev) => ({ ...prev, actions }))
                      }
                    />
                  </div>

                  <div className="flex justify-end border-gray-800 border-t pt-4">
                    <Button
                      onClick={handleCreateCustomRule}
                      disabled={
                        createMutation.isPending ||
                        !customRule.name.trim() ||
                        customRule.patterns.length === 0
                      }
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      {createMutation.isPending ? 'Creating...' : 'Create Rule'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
