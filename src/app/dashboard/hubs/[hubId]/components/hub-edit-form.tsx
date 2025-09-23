'use client';

import { useMutation } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  MessageSquare,
  Plus,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { PageFooter } from '@/components/dashboard/page-footer';
import { UnsavedChangesPrompt } from '@/components/dashboard/unsaved-changes-prompt';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { useTRPC } from '@/utils/trpc';

interface HubData {
  id: string;
  name: string;
  description: string;
  private: boolean;
  welcomeMessage: string | null;
  rules: string[];
  bannerUrl: string | null;
  iconUrl: string | null;
  language: string | null;
  nsfw: boolean;
  tags: string[];
  connectionCount: number;
  isOwner: boolean;
  canEdit: boolean;
}

interface HubEditFormProps {
  hubData: HubData;
}

export function HubEditForm({ hubData }: HubEditFormProps) {
  const trpc = useTRPC();

  // Generate unique IDs for form fields
  const nameId = useId();
  const privateId = useId();
  const descriptionId = useId();
  const welcomeMessageId = useId();

  // Original values for comparison
  const originalValues = {
    name: hubData.name,
    description: hubData.description,
    private: hubData.private,
    welcomeMessage: hubData.welcomeMessage || '',
    rules: hubData.rules || [],
  };

  // Form state
  const [name, setName] = useState(hubData.name);
  const [description, setDescription] = useState(hubData.description);
  const [isPrivate, setIsPrivate] = useState(hubData.private);
  const [welcomeMessage, setWelcomeMessage] = useState(
    hubData.welcomeMessage || ''
  );
  const [rules, setRules] = useState<string[]>(hubData.rules || []);
  const [newRule, setNewRule] = useState('');

  const { toast } = useToast();
  const router = useRouter();

  // tRPC mutation for updating hub
  const updateHubMutation = useMutation(
    trpc.hub.updateHub.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Hub Updated',
          description: 'Your hub has been successfully updated.',
        });
        router.refresh();
      },
      onError: (error) => {
        console.error('Error updating hub:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to update hub',
          variant: 'destructive',
        });
      },
    })
  );

  // Check if form has unsaved changes
  const hasUnsavedChanges =
    name !== originalValues.name ||
    description !== originalValues.description ||
    isPrivate !== originalValues.private ||
    welcomeMessage !== originalValues.welcomeMessage ||
    JSON.stringify(rules) !== JSON.stringify(originalValues.rules);

  const supportedWelcomeVariables = [
    '{user}',
    '{hubName}',
    '{serverName}',
    '{memberCount}',
    '{totalConnections}',
  ];

  const formattedWelcomeVariablesList = supportedWelcomeVariables.map(
    (variable) => (
      <button
        key={variable}
        type="button"
        className="inline-block cursor-pointer rounded border-0 bg-indigo-500/20 px-2 py-1 font-mono text-indigo-300 text-sm transition-colors hover:bg-indigo-500/30"
        onClick={() => setWelcomeMessage(welcomeMessage + variable)}
        aria-label={`Insert variable ${variable}`}
      >
        {variable}
      </button>
    )
  );

  // Reset form to original values
  const resetForm = () => {
    setName(originalValues.name);
    setDescription(originalValues.description);
    setIsPrivate(originalValues.private);
    setWelcomeMessage(originalValues.welcomeMessage);
    setRules(originalValues.rules);
    setNewRule('');
  };

  // Rule handlers
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use tRPC mutation to update hub
    updateHubMutation.mutate({
      hubId: hubData.id,
      name,
      description,
      private: isPrivate,
      welcomeMessage: welcomeMessage || null,
      rules,
    });
  };

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
              <Edit3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Basic Information</CardTitle>
              <CardDescription className="text-base">
                Update your hub&apos;s core settings and content
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor={nameId} className="font-medium text-base">
                Hub Name
              </Label>
              <Input
                id={nameId}
                placeholder="Enter hub name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                maxLength={32}
                className="border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50"
              />
              <p className="text-gray-400 text-xs">
                Choose a unique name between 3-32 characters.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch
                  id={privateId}
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
                <Label htmlFor={privateId} className="font-medium text-base">
                  Private Hub
                </Label>
              </div>
              <p className="text-gray-400 text-xs">
                Private hubs are only visible to invited members and won&apos;t
                appear in public listings.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor={descriptionId} className="font-medium text-base">
              Description
            </Label>
            <Textarea
              id={descriptionId}
              placeholder="Describe your hub..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              maxLength={500}
              className="min-h-[100px] resize-none border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50"
            />
            <div className="flex justify-between text-gray-400 text-xs">
              <p>Tell users what your hub is about and what they can expect.</p>
              <span>{description.length}/500</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor={welcomeMessageId} className="font-medium text-base">
              Welcome Message
            </Label>
            <Textarea
              id={welcomeMessageId}
              placeholder="Write a welcome message for new servers..."
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              maxLength={1000}
              className="min-h-[100px] resize-none border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50"
            />
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-gray-400 text-xs">
                  This message will be shown to <b>all servers</b> when a new
                  server joins your hub.
                </p>
                <span className="text-gray-400 text-xs">
                  {welcomeMessage.length}/1000
                </span>
              </div>
              <div className="text-gray-400 text-xs">
                <p className="mb-2">You can use these variables:</p>
                <div className="flex flex-wrap gap-2">
                  {formattedWelcomeVariablesList}
                </div>
              </div>
            </div>
          </div>

          {/* Rules Section */}
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
                <Plus className="mr-1 h-4 w-4" />
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
                className="min-h-[80px] flex-1 resize-none border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50"
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
                              <ArrowUp className="h-4 w-4" />
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
                              <ArrowDown className="h-4 w-4" />
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
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p>No rules added yet</p>
                  <p className="text-sm">
                    Add your first rule to help maintain a positive environment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unsaved Changes Notification */}
      <UnsavedChangesPrompt
        isVisible={hasUnsavedChanges}
        onSave={handleSubmit}
        onReset={resetForm}
        isSubmitting={updateHubMutation.isPending}
        saveLabel="Save Changes"
        resetLabel="Discard Changes"
        message="You have unsaved changes that will be lost if you leave this page."
      />

      {/* Page Footer - provides scroll space for mobile prompts */}
      <PageFooter height="lg" message="Keep refining your hub settings! 🎯" />
    </div>
  );
}
