'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
  MessageSquareX,
  UserX,
  Bell
} from 'lucide-react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { BlockWordAction } from '@/lib/generated/prisma/client';
import { 
  type AntiSwearRule,
  BlockWordActionLabels,
  BlockWordActionColors,
  getMatchPatternFromPattern,
  MatchPatternLabels
} from '@/lib/types/anti-swear';
import { useTRPC } from '@/utils/trpc';
import { EditRuleDialog } from './edit-rule-dialog';

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
  const [deleteDialogRule, setDeleteDialogRule] = useState<AntiSwearRule | null>(null);
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
      patterns: rule.patterns.map(p => ({ id: p.id, pattern: p.pattern })),
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
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-4" />
          <p className="text-red-400">Failed to load rules</p>
          <p className="text-gray-400 text-sm mt-2">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (rules.length === 0) {
    return (
      <Card className="border border-gray-800/50 bg-gray-950/50">
        <CardContent className="p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Filter Rules</h3>
          <p className="text-gray-400 mb-6">
            Create your first content filter rule to start protecting your hub from unwanted content.
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
                  <Shield className={`h-5 w-5 ${rule.enabled ? 'text-green-400' : 'text-gray-500'}`} />
                  <CardTitle className={rule.enabled ? 'text-white' : 'text-gray-400'}>
                    {rule.name}
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {rule.enabled ? (
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-500/30 text-gray-400">
                      <EyeOff className="mr-1 h-3 w-3" />
                      Disabled
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                    {rule.patterns.length} pattern{rule.patterns.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {canEdit && (
                  <div className="flex items-center space-x-2 mr-4">
                    <span className="text-sm text-gray-400">Enabled</span>
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
                  <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                    <DropdownMenuItem onClick={() => setEditingRule(rule)} disabled={!canEdit}>
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
              <h4 className="text-sm font-medium text-gray-300 mb-2">Actions</h4>
              <div className="flex flex-wrap gap-2">
                {rule.actions.map((action) => (
                  <Badge 
                    key={action} 
                    className={`${BlockWordActionColors[action]} border text-xs font-medium`}
                  >
                    <ActionIcon action={action} />
                    <span className="ml-1">{BlockWordActionLabels[action]}</span>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Patterns ({rule.patterns.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {rule.patterns.slice(0, 6).map((pattern, index) => {
                  const matchType = getMatchPatternFromPattern(pattern);
                  return (
                    <div 
                      key={pattern.id || index}
                      className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded-md border border-gray-700/50"
                    >
                      <code className="text-xs text-purple-300 font-mono bg-purple-950/30 px-1 rounded">
                        {pattern.pattern}
                      </code>
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-600/50">
                        {MatchPatternLabels[matchType]}
                      </Badge>
                    </div>
                  );
                })}
                {rule.patterns.length > 6 && (
                  <button
                    onClick={() => setEditingRule(rule)}
                    disabled={!canEdit}
                    className="flex items-center justify-center p-2 bg-gray-800/30 rounded-md border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-xs text-gray-400">
                      +{rule.patterns.length - 6} more
                    </span>
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!deleteDialogRule} onOpenChange={() => setDeleteDialogRule(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the rule "{deleteDialogRule?.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogRule && handleDeleteRule(deleteDialogRule)}
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