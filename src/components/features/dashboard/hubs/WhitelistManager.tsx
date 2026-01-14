'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import type { AntiSwearWhitelistItem } from '@/lib/types/anti-swear';
import { useTRPC } from '@/utils/trpc';

interface WhitelistManagerProps {
  hubId: string;
  canEdit: boolean;
  canModerate: boolean;
}

export function WhitelistManager({
  hubId,
  canEdit,
  canModerate,
}: WhitelistManagerProps) {
  const trpc = useTRPC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteDialogItem, setDeleteDialogItem] =
    useState<AntiSwearWhitelistItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newWhitelistItem, setNewWhitelistItem] = useState({
    word: '',
    reason: '',
  });

  const { data: rules = [], isLoading: rulesLoading } = useQuery(
    trpc.hub.getAntiSwearRules.queryOptions(
      { hubId },
      { refetchOnWindowFocus: false }
    )
  );

  const { data: whitelistItems = [], isLoading: whitelistLoading } = useQuery(
    trpc.hub.getAntiSwearWhitelist.queryOptions(
      { ruleId: selectedRuleId },
      {
        enabled: !!selectedRuleId,
        refetchOnWindowFocus: false,
      }
    )
  );

  const addMutation = useMutation(
    trpc.hub.addAntiSwearWhitelist.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.hub.getAntiSwearWhitelist.queryFilter({ ruleId: selectedRuleId })
        );
        setShowAddDialog(false);
        setNewWhitelistItem({ word: '', reason: '' });
        toast({
          title: 'Success',
          description: 'Word added to whitelist successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add word to whitelist',
          variant: 'destructive',
        });
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.hub.deleteAntiSwearWhitelist.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.hub.getAntiSwearWhitelist.queryFilter({ ruleId: selectedRuleId })
        );
        toast({
          title: 'Success',
          description: 'Word removed from whitelist successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to remove word from whitelist',
          variant: 'destructive',
        });
      },
    })
  );

  const handleAddWhitelistItem = async () => {
    if (!selectedRuleId || !newWhitelistItem.word.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a word to whitelist',
        variant: 'destructive',
      });
      return;
    }

    await addMutation.mutateAsync({
      ruleId: selectedRuleId,
      word: newWhitelistItem.word.trim(),
      reason: newWhitelistItem.reason.trim() || undefined,
    });
  };

  const handleDeleteWhitelistItem = async (item: AntiSwearWhitelistItem) => {
    await deleteMutation.mutateAsync({ id: item.id });
    setDeleteDialogItem(null);
  };

  const filteredWhitelistItems = whitelistItems.filter(
    (item) =>
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (rulesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-purple-500 border-b-2" />
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <Card className="border border-gray-800/50 bg-gray-950/50">
        <CardContent className="p-8 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-gray-500" />
          <h3 className="mb-2 font-medium text-gray-300 text-lg">
            No Rules Found
          </h3>
          <p className="mb-6 text-gray-400">
            Create filter rules first before managing whitelists.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-green-800/30 bg-dash-hub-main">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-green-500/30 bg-linear-to-br from-green-500/20 to-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-green-400">
                  Whitelist Management
                </CardTitle>
                <CardDescription>
                  Allow specific words to bypass filter rules for each rule
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border border-gray-800/50 bg-gray-950/50">
        <CardHeader>
          <CardTitle className="text-lg text-white">Select Rule</CardTitle>
          <CardDescription>
            Choose which filter rule you want to manage whitelist for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRuleId} onValueChange={setSelectedRuleId}>
            <SelectTrigger className="border-gray-700 bg-gray-800">
              <SelectValue placeholder="Select a filter rule" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-800">
              {rules.map((rule) => (
                <SelectItem
                  key={rule.id}
                  value={rule.id}
                  className="focus:bg-gray-700"
                >
                  <div className="flex w-full items-center justify-between">
                    <span>{rule.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {rule.patterns.length} patterns
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedRuleId && (
        <Card className="border border-gray-800/50 bg-gray-950/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">
                  Whitelist Items
                </CardTitle>
                <CardDescription>
                  Words that will bypass the selected filter rule
                </CardDescription>
              </div>
              {canEdit && (
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Word
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-gray-800 bg-gray-900">
                    <DialogHeader>
                      <DialogTitle className="text-green-400">
                        Add to Whitelist
                      </DialogTitle>
                      <DialogDescription>
                        Add a word that should be allowed even if it matches
                        this rule's patterns.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="whitelist-word">Word or Phrase</Label>
                        <Input
                          id="whitelist-word"
                          placeholder="Enter word to whitelist"
                          value={newWhitelistItem.word}
                          onChange={(e) =>
                            setNewWhitelistItem((prev) => ({
                              ...prev,
                              word: e.target.value,
                            }))
                          }
                          className="border-gray-700 bg-gray-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whitelist-reason">
                          Reason (Optional)
                        </Label>
                        <Textarea
                          id="whitelist-reason"
                          placeholder="Why should this word be allowed?"
                          value={newWhitelistItem.reason}
                          onChange={(e) =>
                            setNewWhitelistItem((prev) => ({
                              ...prev,
                              reason: e.target.value,
                            }))
                          }
                          className="border-gray-700 bg-gray-800"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddDialog(false)}
                          className="border-gray-600 hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddWhitelistItem}
                          disabled={
                            addMutation.isPending ||
                            !newWhitelistItem.word.trim()
                          }
                          className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          {addMutation.isPending
                            ? 'Adding...'
                            : 'Add to Whitelist'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            {whitelistItems.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search whitelist items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-gray-700 bg-gray-800 pl-10"
                  />
                </div>
              </div>
            )}

            {whitelistLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-green-500 border-b-2" />
              </div>
            ) : filteredWhitelistItems.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                {whitelistItems.length === 0
                  ? 'No whitelist items for this rule yet.'
                  : 'No items match your search.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWhitelistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <code className="rounded bg-green-950/30 px-2 py-1 font-mono text-green-300 text-sm">
                          {item.word}
                        </code>
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Users className="h-3 w-3" />
                          <span>
                            Added by {item.createdBy.name || 'Unknown'}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {item.reason && (
                        <p className="mt-2 text-gray-400 text-sm">
                          <span className="font-medium">Reason:</span>{' '}
                          {item.reason}
                        </p>
                      )}
                    </div>

                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialogItem(item)}
                        className="text-red-400 hover:bg-red-950/20 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={!!deleteDialogItem}
        onOpenChange={() => setDeleteDialogItem(null)}
      >
        <AlertDialogContent className="border-gray-800 bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">
              Remove from Whitelist
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{deleteDialogItem?.word}" from
              the whitelist? This word will be subject to filtering again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteDialogItem && handleDeleteWhitelistItem(deleteDialogItem)
              }
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
