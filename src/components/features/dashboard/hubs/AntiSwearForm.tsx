'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Edit, Plus, Save, Trash, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { WordTagInput } from '@/components/forms/WordTagInput';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { BlockWordAction } from '@/lib/generated/prisma/client';
import {
  type AntiSwearRule,
  BlockWordActionLabels,
} from '@/lib/types/anti-swear';
import { useTRPC } from '@/utils/trpc';

interface AntiSwearFormProps {
  hubId: string;
  canEdit: boolean;
}

export function AntiSwearForm({ hubId, canEdit }: AntiSwearFormProps) {
  const trpc = useTRPC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const editRuleNameFieldId = useId();
  const newRuleNameFieldId = useId();
  const [antiSwearRules, setAntiSwearRules] = useState<AntiSwearRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newAntiSwearRule, setNewAntiSwearRule] = useState<
    Omit<AntiSwearRule, 'id'> & { id?: string }
  >({
    name: '',
    patterns: [],
    actions: [BlockWordAction.BLOCK_MESSAGE],
  });
  const [editingAntiSwearRule, setEditingAntiSwearRule] =
    useState<AntiSwearRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // tRPC hooks
  const {
    data,
    isLoading: queryLoading,
    error: queryError,
  } = useQuery(
    trpc.hub.getAntiSwearRules.queryOptions(
      { hubId },
      { refetchOnWindowFocus: false }
    )
  );
  const createRule = useMutation(
    trpc.hub.createAntiSwearRule.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.hub.getAntiSwearRules.queryFilter({ hubId })
        );
      },
    })
  );
  const updateRule = useMutation(
    trpc.hub.updateAntiSwearRule.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.hub.getAntiSwearRules.queryFilter({ hubId })
        );
      },
    })
  );
  const deleteRule = useMutation(
    trpc.hub.deleteAntiSwearRule.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.hub.getAntiSwearRules.queryFilter({ hubId })
        );
      },
    })
  );

  // Fetch anti-swear rules
  useEffect(() => {
    if (data) {
      setAntiSwearRules(data as AntiSwearRule[]);
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (queryError) {
      toast({
        title: 'Error',
        description: 'Failed to load anti-swear rules',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }, [queryError, toast]);

  const handleCreateAntiSwearRule = async () => {
    if (!canEdit) return;

    if (
      !newAntiSwearRule.name.trim() ||
      newAntiSwearRule.name.trim().length < 3
    ) {
      toast({
        title: 'Error',
        description: 'Please enter a name for the rule (at least 3 characters)',
        variant: 'destructive',
      });
      return;
    }

    if (newAntiSwearRule.patterns.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one word or pattern',
        variant: 'destructive',
      });
      return;
    }

    if (newAntiSwearRule.actions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one action',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await createRule.mutateAsync({
        hubId,
        name: newAntiSwearRule.name,
        actions: newAntiSwearRule.actions,
        patterns: newAntiSwearRule.patterns.map((p) => ({
          pattern: p.pattern,
        })),
      });

      setNewAntiSwearRule({
        name: '',
        patterns: [],
        actions: [BlockWordAction.BLOCK_MESSAGE],
      });
      setIsCreating(false);

      toast({
        title: 'Success',
        description: 'Anti-swear rule created successfully',
      });
    } catch (error) {
      console.error('Error creating anti-swear rule:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create anti-swear rule',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAntiSwearRule = async (id: string) => {
    if (!canEdit) return;

    try {
      await deleteRule.mutateAsync({ id });
      toast({
        title: 'Success',
        description: 'Anti-swear rule deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting anti-swear rule:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to delete anti-swear rule',
        variant: 'destructive',
      });
    }
  };

  const toggleAction = (action: BlockWordAction, isEditing = false) => {
    if (isEditing && editingAntiSwearRule) {
      if (editingAntiSwearRule.actions.includes(action)) {
        setEditingAntiSwearRule({
          ...editingAntiSwearRule,
          actions: editingAntiSwearRule.actions.filter((a) => a !== action),
        });
      } else {
        setEditingAntiSwearRule({
          ...editingAntiSwearRule,
          actions: [...editingAntiSwearRule.actions, action],
        });
      }
    } else {
      if (newAntiSwearRule.actions.includes(action)) {
        setNewAntiSwearRule({
          ...newAntiSwearRule,
          actions: newAntiSwearRule.actions.filter((a) => a !== action),
        });
      } else {
        setNewAntiSwearRule({
          ...newAntiSwearRule,
          actions: [...newAntiSwearRule.actions, action],
        });
      }
    }
  };

  const handleEditAntiSwearRule = (rule: AntiSwearRule) => {
    setEditingAntiSwearRule({ ...rule });
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingAntiSwearRule(null);
  };

  const handleUpdateAntiSwearRule = async () => {
    if (!canEdit || !editingAntiSwearRule) return;

    if (
      !editingAntiSwearRule.name.trim() ||
      editingAntiSwearRule.name.trim().length < 3
    ) {
      toast({
        title: 'Error',
        description: 'Please enter a name for the rule (at least 3 characters)',
        variant: 'destructive',
      });
      return;
    }

    if (editingAntiSwearRule.patterns.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one word or pattern',
        variant: 'destructive',
      });
      return;
    }

    if (editingAntiSwearRule.actions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one action',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateRule.mutateAsync({
        id: editingAntiSwearRule.id,
        name: editingAntiSwearRule.name,
        patterns: editingAntiSwearRule.patterns.map((p) => ({
          id: p.id,
          pattern: p.pattern,
        })),
        actions: editingAntiSwearRule.actions,
      });

      setEditingAntiSwearRule(null);

      toast({
        title: 'Success',
        description: 'Anti-swear rule updated successfully',
      });
    } catch (error) {
      console.error('Error updating anti-swear rule:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update anti-swear rule',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || queryLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-purple-500 border-b-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Edit form has highest priority */}
      {editingAntiSwearRule ? (
        <Card className="premium-card fade-in-0 slide-in-from-top-5 animate-in border border-purple-500/50 duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Edit className="mr-2 h-5 w-5 text-purple-400" />
                Edit Rule
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Update your anti-swear rule settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={editRuleNameFieldId}>Rule Name</Label>
              <Input
                id={editRuleNameFieldId}
                placeholder="e.g., Profanity Filter (min 3 chars)"
                value={editingAntiSwearRule.name}
                onChange={(e) =>
                  setEditingAntiSwearRule({
                    ...editingAntiSwearRule,
                    name: e.target.value,
                  })
                }
                className="border-gray-700/50 bg-gray-900/50 focus:border-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-words">Words or Phrases</Label>
              <WordTagInput
                patterns={editingAntiSwearRule.patterns}
                onChange={(patterns) =>
                  setEditingAntiSwearRule({ ...editingAntiSwearRule, patterns })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="space-y-2 rounded-md bg-gray-950/50 p-3">
                {Object.entries(BlockWordAction).map(([key, action]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-action-${action}`}
                      checked={editingAntiSwearRule.actions.includes(action)}
                      onCheckedChange={() => toggleAction(action, true)}
                      className="data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                    />
                    <Label
                      htmlFor={`edit-action-${action}`}
                      className="font-normal text-sm"
                    >
                      {BlockWordActionLabels[action]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={cancelEdit}
              disabled={isSaving}
              className="border-gray-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAntiSwearRule}
              disabled={isSaving}
              className="border-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-600/80 hover:to-indigo-600/80"
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Rule
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        canEdit && (
          <Card
            className={`border ${isCreating ? 'border-purple-500/50 shadow-lg shadow-purple-500/10' : 'border-gray-800/50 hover:border-gray-700/50'} premium-card transition-all duration-200`}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5 text-purple-400" />
                {isCreating ? 'Create New Anti-Swear Rule' : 'Add New Rule'}
              </CardTitle>
              {isCreating && (
                <CardDescription>
                  Configure a new word filter for your hub
                </CardDescription>
              )}
            </CardHeader>
            {!isCreating ? (
              <CardFooter>
                <Button
                  onClick={() => setIsCreating(true)}
                  className="w-full border-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-600/80 hover:to-indigo-600/80"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Rule
                </Button>
              </CardFooter>
            ) : (
              <>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={newRuleNameFieldId}>Rule Name</Label>
                    <Input
                      id={newRuleNameFieldId}
                      placeholder="e.g., Profanity Filter (min 3 chars)"
                      value={newAntiSwearRule.name}
                      onChange={(e) =>
                        setNewAntiSwearRule({
                          ...newAntiSwearRule,
                          name: e.target.value,
                        })
                      }
                      className="border-gray-700/50 bg-gray-900/50 focus:border-purple-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="words">Words or Phrases</Label>
                    <WordTagInput
                      patterns={newAntiSwearRule.patterns}
                      onChange={(patterns) =>
                        setNewAntiSwearRule({ ...newAntiSwearRule, patterns })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Actions</Label>
                    <div className="space-y-2 rounded-md bg-gray-950/50 p-3">
                      {Object.entries(BlockWordAction).map(([key, action]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`action-${action}`}
                            checked={newAntiSwearRule.actions.includes(action)}
                            onCheckedChange={() => toggleAction(action)}
                            className="data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                          />
                          <Label
                            htmlFor={`action-${action}`}
                            className="font-normal text-sm"
                          >
                            {BlockWordActionLabels[action]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    disabled={isSaving}
                    className="border-gray-700/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAntiSwearRule}
                    disabled={isSaving}
                    className="border-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-600/80 hover:to-indigo-600/80"
                  >
                    {isSaving ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Rule
                      </>
                    )}
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        )
      )}

      {!editingAntiSwearRule && antiSwearRules.length > 0 ? (
        <div className="space-y-4">
          {antiSwearRules.map((rule) => (
            <Card
              key={rule.id}
              className="premium-card transition-all duration-200 hover:border-gray-700/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-gradient text-lg text-transparent">
                    {rule.name}
                  </CardTitle>
                  {canEdit && (
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAntiSwearRule(rule)}
                        className="border-purple-700/30 text-purple-400 hover:border-purple-500/50 hover:bg-purple-950/30 hover:text-purple-300"
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-700/30 text-red-400 hover:border-red-500/50 hover:bg-red-950/30 hover:text-red-300"
                          >
                            <Trash className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Anti-Swear Rule
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the &quot;
                              {rule.name}&quot; rule? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAntiSwearRule(rule.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-1 font-medium text-purple-300 text-sm">
                    Patterns:
                  </h4>
                  <div className="rounded-md border border-gray-800/50 bg-gray-950/50 p-3 text-gray-300 text-sm">
                    <div className="flex flex-wrap gap-2">
                      {rule.patterns.map((pattern, i) => {
                        let badgeClass =
                          'bg-blue-900/40 border-blue-700/50 text-blue-200';
                        if (
                          pattern.pattern.startsWith('*') &&
                          pattern.pattern.endsWith('*')
                        ) {
                          badgeClass =
                            'bg-amber-900/40 border-amber-700/50 text-amber-200';
                        } else if (pattern.pattern.startsWith('*')) {
                          badgeClass =
                            'bg-purple-900/40 border-purple-700/50 text-purple-200';
                        } else if (pattern.pattern.endsWith('*')) {
                          badgeClass =
                            'bg-green-900/40 border-green-700/50 text-green-200';
                        }

                        return (
                          <span
                            key={`${rule.id}-pattern-${i}-${pattern.pattern}`}
                            className={`inline-flex items-center rounded-full border px-2 py-1 font-medium text-xs ${badgeClass}`}
                          >
                            <span className="font-mono">{pattern.pattern}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="mb-1 font-medium text-purple-300 text-sm">
                    Actions:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {rule.actions.map((action) => (
                      <span
                        key={action}
                        className="inline-flex items-center rounded-full border border-purple-700/30 bg-purple-900/50 px-2.5 py-0.5 font-medium text-purple-200 text-xs"
                      >
                        {BlockWordActionLabels[action]}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !editingAntiSwearRule ? (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
              No Anti-Swear Rules
            </CardTitle>
            <CardDescription>
              You haven&apos;t created any anti-swear rules yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center rounded-md border border-gray-800/50 bg-gray-950/50 p-4">
              <p className="text-gray-300">
                Create your first rule to start filtering unwanted content in
                your hub. Anti-swear rules help you maintain a clean and
                appropriate environment for your community.
              </p>
            </div>
            {canEdit && (
              <Button
                onClick={() => {
                  setIsCreating(true);
                  setNewAntiSwearRule({
                    name: '',
                    patterns: [],
                    actions: [BlockWordAction.BLOCK_MESSAGE],
                  });
                }}
                className="mt-4 w-full border-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-600/80 hover:to-indigo-600/80"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Rule
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
