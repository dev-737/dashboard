import {
  ArrowRightIcon,
  Loading03Icon,
  SparklesIcon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface EssentialsStepProps {
  name: string;
  setName: (name: string) => void;
  nameError: string;
  isValidatingName: boolean;
  isNameValid: boolean;
  description: string;
  setDescription: (description: string) => void;
  shortDescription: string;
  setShortDescription: (description: string) => void;
  isPrivate: boolean;
  setIsPrivate: (isPrivate: boolean) => void;
  onNext: () => void;
  onFinish: () => void;
  canProceed: boolean;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
  nameFieldId: string;
  descriptionFieldId: string;
  shortDescriptionFieldId: string;
  privateFieldId: string;
  isSubmitting: boolean;
}

export function EssentialsStep({
  name,
  setName,
  nameError,
  isValidatingName,
  isNameValid,
  description,
  setDescription,
  shortDescription,
  setShortDescription,
  isPrivate,
  setIsPrivate,
  onNext,
  onFinish,
  canProceed,
  nameInputRef,
  nameFieldId,
  descriptionFieldId,
  shortDescriptionFieldId,
  privateFieldId,
  isSubmitting,
}: EssentialsStepProps) {
  return (
    <>
      <CardHeader className="pb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-indigo-600">
          <HugeiconsIcon
            strokeWidth={3}
            icon={SparklesIcon}
            className="h-8 w-8 text-white"
          />
        </div>
        <CardTitle className="text-2xl">Hub Essentials</CardTitle>
        <CardDescription className="text-base">
          Let's get your hub started with the basics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name Section */}
        <div className="space-y-3">
          <Label htmlFor={nameFieldId} className="font-medium text-base">
            Hub Name
          </Label>
          <Input
            ref={nameInputRef}
            id={nameFieldId}
            placeholder="e.g., Gaming Central, Art Community"
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
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="mr-1 h-3 w-3 animate-spin"
                  />
                  Checking availability...
                </span>
              )}
              {nameError && <span className="text-red-400">{nameError}</span>}
              {isNameValid && name.length >= 3 && !isValidatingName && (
                <span className="flex items-center text-green-400">
                  <HugeiconsIcon
                    strokeWidth={3}
                    icon={Tick01Icon}
                    className="mr-1 h-3 w-3"
                  />
                  Name is available
                </span>
              )}
            </div>
            <span className="text-gray-400 text-xs">{name.length}/32</span>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-3">
          <Label htmlFor={descriptionFieldId} className="font-medium text-base">
            Description
          </Label>
          <Textarea
            id={descriptionFieldId}
            placeholder="Describe what your hub is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] resize-none border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {description.length < 10 && description.length > 0 && (
                <span className="text-yellow-400">
                  Must be at least 10 characters
                </span>
              )}
            </div>
            <span className="text-gray-400 text-xs">
              {description.length}/500
            </span>
          </div>
        </div>

        {/* Short Description Section */}
        <div className="space-y-3">
          <Label
            htmlFor={shortDescriptionFieldId}
            className="font-medium text-base"
          >
            Short Description{' '}
            <span className="font-normal text-gray-400 text-sm">
              (Optional)
            </span>
          </Label>
          <Input
            id={shortDescriptionFieldId}
            placeholder="A catchy one-liner"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50"
            maxLength={100}
          />
        </div>

        {/* Private Toggle */}
        <div className="rounded-lg border border-gray-800/50 bg-gray-800/30 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor={privateFieldId} className="font-medium text-base">
                Private Hub
              </Label>
              <p className="text-gray-400 text-sm">
                Requires invitation to join
              </p>
            </div>
            <Switch
              id={privateFieldId}
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onFinish}
            disabled={!canProceed || isSubmitting}
            className="text-gray-400 hover:bg-gray-800/50 hover:text-white"
          >
            {isSubmitting ? (
              <HugeiconsIcon
                icon={Loading03Icon}
                className="mr-2 h-4 w-4 animate-spin"
              />
            ) : (
              <HugeiconsIcon
                strokeWidth={3}
                icon={Tick01Icon}
                className="mr-2 h-4 w-4"
              />
            )}
            Create & Finish
          </Button>
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="btn-primary border-none px-8"
          >
            Customize More
            <HugeiconsIcon
              strokeWidth={3}
              icon={ArrowRightIcon}
              className="ml-2 h-4 w-4"
            />
          </Button>
        </div>
      </CardContent>
    </>
  );
}
