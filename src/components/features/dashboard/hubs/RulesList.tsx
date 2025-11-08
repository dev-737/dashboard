'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Ban,
  Bell,
  CheckCircle2,
  Clock,
  Edit2,
  EyeOff,
  MessageSquareX,
  MoreVertical,
  Shield,
  Trash2,
  UserX,
} from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { BlockWordAction } from '@/lib/generated/prisma/client';
import {
  type AntiSwearRule,
  BlockWordActionColors,
  BlockWordActionLabels,
  getMatchPatternFromPattern,
  MatchPatternLabels,
} from '@/lib/types/anti-swear';
import { useTRPC } from '@/utils/trpc';
import { EditRuleDialog } from './EditRuleDialog';

interface RulesListProps {
  hubId: string;
  canEdit: boolean;
  canModerate: boolean;
}

const ActionIcon = ({ action }: { action: BlockWordAction }) => {
  switch (action) {
    case BlockWordAction.BLOCK_MESSAGE:
      return <MessageSquareX className="h-3 w-3" />;
    case BlockWordAction.WARN:
      return <AlertTriangle className="h-3 w-3" />;
    case BlockWordAction.MUTE:
      return <Clock className="h-3 w-3" />;
    case BlockWordAction.BAN:
      return <Ban className="h-3 w-3" />;
    case BlockWordAction.SEND_ALERT:
      return <Bell className="h-3 w-3" />;
    case BlockWordAction.BLACKLIST:
      return <UserX className="h-3 w-3" />;
    default:
      return <Shield className="h-3 w-3" />;
  }
};

export function RulesList({ hubId, canEdit, canModerate }: RulesListProps) {
  const trpc = useTRPC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogRule, setDeleteDialogRule] =
    useState<AntiSwearRule | null>(null);
  const [editingRule, setEditingRule] = useState<AntiSwearRule | null>(null);

  const {
    data: rules = [],
    isLoading,
    error,
  } = useQuery(
    trpc.hub.getAntiSwearRules.queryOptions(
      { hubId },
      { refetchOnWindowFocus: false }
    )
  );

  const deleteMutation = useMutation(
    trpc.hub.deleteAntiSwearRule.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.hub.getAntiSwearRules.queryFilter({ hubId })
        );
        toast({
          title: 'Success',
          description: 'Rule deleted successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete rule',
          variant: 'destructive',
        });
      },
    })
  );

  const toggleMutation = useMutation(
    trpc.hub.updateAntiSwearRule.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.hub.getAntiSwearRules.queryFilter({ hubId })
        );
        toast({
          title: 'Success',
          description: 'Rule updated successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update rule',
          variant: 'destructive',
        });
      },
    })
  );

  const handleDeleteRule = async (rule: AntiSwearRule) => {
    if (!canEdit) return;
    await deleteMutation.mutateAsync({ id: rule.id });
    setDeleteDialogRule(null);
  };

  const handleToggleRule = async (rule: AntiSwearRule) => {
    if (!canEdit) return;
    await toggleMutation.mutateAsync({
      id: rule.id,
      name: rule.name,
      actions: rule.actions,
      patterns: rule.patterns.map((p) => ({ id: p.id, pattern: p.pattern })),
      enabled: !rule.enabled,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-purple-500 border-b-2" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-800/30 bg-red-950/10">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-red-400" />
          <p className="text-red-400">Failed to load rules</p>
          <p className="mt-2 text-gray-400 text-sm">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (rules.length === 0) {
    return (
      <Card className="border border-gray-800/50 bg-gray-950/50">
        <CardContent className="p-8 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-gray-500" />
          <h3 className="mb-2 font-medium text-gray-300 text-lg">
            No Filter Rules
          </h3>
          <p className="mb-6 text-gray-400">
            Create your first content filter rule to start protecting your hub
            from unwanted content.
          </p>
          {canEdit && (
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              Create Your First Rule
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <Card
          key={rule.id}
          className={`transition-all duration-200 hover:border-purple-500/30 ${
            rule.enabled
              ? 'border border-gray-800/50 bg-gray-950/50'
              : 'border border-gray-800/30 bg-gray-950/30 opacity-75'
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Shield
                    className={`h-5 w-5 ${rule.enabled ? 'text-green-400' : 'text-gray-500'}`}
                  />
                  <CardTitle
                    className={rule.enabled ? 'text-white' : 'text-gray-400'}
                  >
                    {rule.name}
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {rule.enabled ? (
                    <Badge
                      variant="outline"
                      className="border-green-500/30 text-green-400"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-gray-500/30 text-gray-400"
                    >
                      <EyeOff className="mr-1 h-3 w-3" />
                      Disabled
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="border-purple-500/30 text-purple-400"
                  >
                    {rule.patterns.length} pattern
                    {rule.patterns.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {canEdit && (
                  <div className="mr-4 flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Enabled</span>
                    <Switch
                      checked={rule.enabled ?? true}
                      onCheckedChange={() => handleToggleRule(rule)}
                      disabled={toggleMutation.isPending}
                    />
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="border-gray-800 bg-gray-900"
                  >
                    <DropdownMenuItem
                      onClick={() => setEditingRule(rule)}
                      disabled={!canEdit}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Rule
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogRule(rule)}
                      disabled={!canEdit}
                      className="text-red-400 focus:text-red-300"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Rule
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-gray-300 text-sm">
                Actions
              </h4>
              <div className="flex flex-wrap gap-2">
                {rule.actions.map((action) => (
                  <Badge
                    key={action}
                    className={`${BlockWordActionColors[action]} border font-medium text-xs`}
                  >
                    <ActionIcon action={action} />
                    <span className="ml-1">
                      {BlockWordActionLabels[action]}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-medium text-gray-300 text-sm">
                Patterns ({rule.patterns.length})
              </h4>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {rule.patterns.slice(0, 6).map((pattern, index) => {
                  const matchType = getMatchPatternFromPattern(pattern);
                  return (
                    <div
                      key={pattern.id || index}
                      className="flex items-center space-x-2 rounded-md border border-gray-700/50 bg-gray-800/50 p-2"
                    >
                      <code className="rounded bg-purple-950/30 px-1 font-mono text-purple-300 text-xs">
                        {pattern.pattern}
                      </code>
                      <Badge
                        variant="outline"
                        className="border-gray-600/50 text-gray-400 text-xs"
                      >
                        {MatchPatternLabels[matchType]}
                      </Badge>
                    </div>
                  );
                })}
                {rule.patterns.length > 6 && (
                  <button
                    onClick={() => setEditingRule(rule)}
                    disabled={!canEdit}
                    className="flex items-center justify-center rounded-md border border-gray-700/30 bg-gray-800/30 p-2 transition-colors hover:border-gray-600/50 hover:bg-gray-800/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="text-gray-400 text-xs">
                      +{rule.patterns.length - 6} more
                    </span>
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog
        open={!!deleteDialogRule}
        onOpenChange={() => setDeleteDialogRule(null)}
      >
        <AlertDialogContent className="border-gray-800 bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">
              Delete Rule
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the rule "{deleteDialogRule?.name}
              "? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteDialogRule && handleDeleteRule(deleteDialogRule)
              }
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditRuleDialog
        rule={editingRule}
        hubId={hubId}
        open={!!editingRule}
        onOpenChange={() => setEditingRule(null)}
      />
    </div>
  );
}
