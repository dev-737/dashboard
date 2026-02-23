'use client';

import { FloppyDiskIcon, Shield01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PatternBuilder } from '@/components/forms/PatternBuilder';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlockWordAction } from '@/lib/generated/prisma/client/client';
import type { AntiSwearRule } from '@/lib/types/automod';
import { useTRPC } from '@/utils/trpc';
import { ActionSelector } from './ActionSelector';

interface EditRuleDialogProps {
  rule: AntiSwearRule | null;
  hubId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRuleDialog({
  rule,
  hubId,
  open,
  onOpenChange,
}: EditRuleDialogProps) {
  const trpc = useTRPC();

  const queryClient = useQueryClient();

  const [editForm, setEditForm] = useState({
    name: '',
    patterns: [] as { pattern: string }[],
    actions: [] as BlockWordAction[],
    muteDurationMinutes: 60 as number | null,
  });

  useEffect(() => {
    if (rule) {
      setEditForm({
        name: rule.name,
        patterns: rule.patterns.map((p) => ({ pattern: p.pattern })),
        actions: [...rule.actions],
        muteDurationMinutes: rule.muteDurationMinutes || 60,
      });
    }
  }, [rule]);

  const updateMutation = useMutation(
    trpc.hub.updateAntiSwearRule.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.hub.getAntiSwearRules.queryFilter({ hubId })
        );
        onOpenChange(false);
        toast.success('Success', {
          description: 'Rule updated successfully',
        });
      },
      onError: (error) => {
        toast.error('Error', {
          description: error.message || 'Failed to update rule',
        });
      },
    })
  );

  const handleSave = async () => {
    if (!rule) return;

    if (!editForm.name.trim() || editForm.name.length < 3) {
      toast.error('Error', {
        description: 'Rule name must be at least 3 characters long',
      });
      return;
    }

    if (editForm.patterns.length === 0) {
      toast.error('Error', {
        description: 'Please add at least one pattern',
      });
      return;
    }

    if (editForm.actions.length === 0) {
      toast.error('Error', {
        description: 'Please select at least one action',
      });
      return;
    }

    if (editForm.actions.includes(BlockWordAction.MUTE)) {
      if (
        !editForm.muteDurationMinutes ||
        editForm.muteDurationMinutes < 1 ||
        editForm.muteDurationMinutes > 43200
      ) {
        toast.error('Error', {
          description: 'Mute duration must be between 1 and 43200 minutes',
        });
        return;
      }
    }

    await updateMutation.mutateAsync({
      id: rule.id,
      name: editForm.name,
      actions: editForm.actions,
      muteDurationMinutes: editForm.actions.includes(BlockWordAction.MUTE)
        ? editForm.muteDurationMinutes
        : null,
      patterns: editForm.patterns.map((p, index) => ({
        id: rule.patterns[index]?.id,
        pattern: p.pattern,
      })),
    });
  };

  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden border-gray-800 bg-gray-900 sm:max-w-2xl lg:max-w-4xl">
        <div className="flex h-full max-h-[85vh] flex-col">
          <DialogHeader className="shrink-0 pb-4">
            <DialogTitle className="flex items-center text-blue-400">
              <HugeiconsIcon icon={Shield01Icon} className="mr-2 h-5 w-5" />
              Edit FilterIcon Rule
            </DialogTitle>
            <DialogDescription>
              Modify your filter rule patterns and actions.
            </DialogDescription>
          </DialogHeader>

          <div
            className="-mr-2 flex-1 overflow-y-auto pr-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#374151 transparent',
            }}
          >
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-rule-name">Rule Name</Label>
                <Input
                  id="edit-rule-name"
                  placeholder="Enter a descriptive name for your rule"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="border-gray-700 bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label>Patterns to Match</Label>
                <PatternBuilder
                  patterns={editForm.patterns}
                  onChange={(patterns) =>
                    setEditForm((prev) => ({ ...prev, patterns }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Actions to Take</Label>
                <ActionSelector
                  selectedActions={editForm.actions}
                  onChange={(actions) =>
                    setEditForm((prev) => ({ ...prev, actions }))
                  }
                  showMuteDuration={true}
                  muteDurationMinutes={editForm.muteDurationMinutes}
                  onMuteDurationChange={(minutes) =>
                    setEditForm((prev) => ({
                      ...prev,
                      muteDurationMinutes: minutes,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-gray-800 border-t pt-6">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-600 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  updateMutation.isPending ||
                  !editForm.name.trim() ||
                  editForm.patterns.length === 0
                }
                className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <HugeiconsIcon icon={FloppyDiskIcon} className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
