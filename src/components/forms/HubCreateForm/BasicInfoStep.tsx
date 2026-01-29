import { ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BasicInfoStepProps {
  name: string;
  setName: (name: string) => void;
  nameError: string;
  isValidatingName: boolean;
  isNameValid: boolean;
  onNext: () => void;
  canProceed: boolean;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
  nameFieldId: string;
}

export function BasicInfoStep({
  name,
  setName,
  nameError,
  isValidatingName,
  isNameValid,
  onNext,
  canProceed,
  nameInputRef,
  nameFieldId,
}: BasicInfoStepProps) {
  return (
    <>
      <CardHeader className="pb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-indigo-600">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">What&apos;s your hub called?</CardTitle>
        <CardDescription className="text-base">
          Choose a unique name that represents your community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor={nameFieldId} className="font-medium text-base">
            Hub Name
          </Label>
          <Input
            ref={nameInputRef}
            id={nameFieldId}
            placeholder="e.g., Gaming Central, Art Community, Tech Hub"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`border-gray-700/50 bg-gray-800/50 py-6 text-lg focus-visible:ring-indigo-500/50 ${
              nameError ? 'border-red-500/50' : ''
            } ${isNameValid && name.length >= 3 ? 'border-green-500/50' : ''}`}
            maxLength={32}
          />
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {isValidatingName && (
                <span className="flex items-center text-indigo-400">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Checking availability...
                </span>
              )}
              {nameError && <span className="text-red-400">{nameError}</span>}
              {isNameValid && name.length >= 3 && !isValidatingName && (
                <span className="flex items-center text-green-400">
                  <Check className="mr-1 h-3 w-3" />
                  Name is available
                </span>
              )}
            </div>
            <span className="text-gray-400 text-xs">{name.length}/32</span>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="border-none btn-primary px-8 py-3 "
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </>
  );
}
