'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { PageFooter } from '@/components/layout/DashboardPageFooter';
import { UnsavedChangesPrompt } from '@/components/features/dashboard/UnsavedChangesPrompt';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { HubModulesBits, HubModulesDescriptions } from '@/lib/constants';
import { useTRPC } from '@/utils/trpc';

interface HubModulesFormProps {
  hubId: string;
  initialModules: number;
}

export function HubModulesForm({ hubId, initialModules }: HubModulesFormProps) {
  const trpc = useTRPC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modules, setModules] = useState<number>(initialModules);
  const [currentInitialModules, setCurrentInitialModules] =
    useState<number>(initialModules);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const saveMutation = useMutation(
    trpc.hub.updateHubSettings.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.hub.getHub.pathFilter());
      },
    })
  );

  // Check if a specific module bit is enabled
  const isModuleEnabled = (bit: number) => (modules & bit) !== 0;

  // Toggle a specific module bit
  const toggleModule = (bit: number) => {
    const newModules = isModuleEnabled(bit)
      ? modules & ~bit // Disable the bit
      : modules | bit; // Enable the bit

    setModules(newModules);
    setHasChanges(newModules !== currentInitialModules);
  };

  const handleSaveModules = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      await saveMutation.mutateAsync({ hubId, settings: modules });

      toast({
        title: 'Modules saved',
        description: 'Hub modules have been updated successfully.',
      });

      // Update initial values to reflect the new state
      setCurrentInitialModules(modules);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving modules:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save modules',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form to original values
  const resetForm = () => {
    setModules(currentInitialModules);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {Object.entries(HubModulesBits).map(([name, bit]) => (
          <div key={name} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={`setting-${name}`}>{name}</Label>
              <p className="text-gray-400 text-sm">
                {HubModulesDescriptions[bit]}
              </p>
            </div>
            <Switch
              id={`setting-${name}`}
              checked={isModuleEnabled(bit)}
              onCheckedChange={() => toggleModule(bit)}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-500"
            />
          </div>
        ))}
      </div>

      {/* Unsaved Changes Prompt */}
      <UnsavedChangesPrompt
        isVisible={hasChanges}
        onSave={handleSaveModules}
        onReset={resetForm}
        isSubmitting={isSaving || saveMutation.isPending}
        saveLabel="Save Modules"
        resetLabel="Reset Modules"
        message="You have unsaved modules changes!"
      />

      {/* Page Footer - provides scroll space for mobile prompts */}
      <PageFooter height="md" message="Customize your hub's features! ⚙️" />
    </div>
  );
}
