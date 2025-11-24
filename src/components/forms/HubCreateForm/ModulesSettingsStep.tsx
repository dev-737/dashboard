'use client';

import { ArrowLeft, ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HubModulesBits, HubModulesDescriptions } from '@/lib/constants';

interface ModulesSettingsStepProps {
  modules: number;
  setModules: (modules: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function ModulesSettingsStep({
  modules,
  setModules,
  onNext,
  onPrev,
  onSkip,
}: ModulesSettingsStepProps) {
  // Check if a specific module bit is enabled
  const isModuleEnabled = (bit: number) => (modules & bit) !== 0;

  // Toggle a specific module bit
  const toggleModule = (bit: number) => {
    const newModules = isModuleEnabled(bit)
      ? modules & ~bit // Disable the bit
      : modules | bit; // Enable the bit

    setModules(newModules);
  };

  return (
    <>
      <CardHeader className="pb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-amber-600">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Configure Hub Modules</CardTitle>
        <CardDescription className="text-base">
          Customize which features your hub will have (you can change this
          later)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Modules List */}
        <div className="space-y-4">
          {Object.entries(HubModulesBits).map(([name, bit]) => (
            <div
              key={name}
              className="flex items-start justify-between rounded-lg border border-gray-700/40 bg-gray-800/30 p-4 transition-all hover:border-gray-600/60 hover:bg-gray-800/50"
            >
              <div className="flex-1 space-y-1 pr-4">
                <Label
                  htmlFor={`module-${name}`}
                  className="cursor-pointer font-medium text-base"
                >
                  {name}
                </Label>
                <p className="text-gray-400 text-sm">
                  {HubModulesDescriptions[bit]}
                </p>
              </div>
              <Switch
                id={`module-${name}`}
                checked={isModuleEnabled(bit)}
                onCheckedChange={() => toggleModule(bit)}
                className="shrink-0 data-[state=checked]:bg-indigo-600"
              />
            </div>
          ))}
        </div>

        {/* Helper Text */}
        <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4">
          <p className="text-indigo-200 text-sm">
            💡 Tip: Don&apos;t worry! You can adjust these settings anytime in
            the modules dashboard after creating your hub.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="border-gray-700/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            className="border-gray-700/50"
          >
            Skip
          </Button>
          <Button
            type="button"
            onClick={onNext}
            className="border-none bg-linear-to-r from-indigo-600 to-purple-600 px-8 py-3 hover:from-indigo-600/80 hover:to-purple-600/80"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </>
  );
}
