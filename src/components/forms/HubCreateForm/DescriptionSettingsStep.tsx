import { ArrowLeft, ArrowRight, Check, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface DescriptionSettingsStepProps {
  description: string;
  setDescription: (description: string) => void;
  shortDescription: string;
  setShortDescription: (description: string) => void;
  isPrivate: boolean;
  setIsPrivate: (isPrivate: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  descriptionFieldId: string;
  shortDescriptionFieldId: string;
  privateFieldId: string;
}

export function DescriptionSettingsStep({
  description,
  setDescription,
  shortDescription,
  setShortDescription,
  isPrivate,
  setIsPrivate,
  onNext,
  onPrev,
  canProceed,
  descriptionFieldId,
  shortDescriptionFieldId,
  privateFieldId,
}: DescriptionSettingsStepProps) {
  return (
    <>
      <CardHeader className="pb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-cyan-600">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Describe your hub</CardTitle>
        <CardDescription className="text-base">
          Help people understand what your community is about
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor={descriptionFieldId} className="font-medium text-base">
            Description
          </Label>
          <Textarea
            id={descriptionFieldId}
            placeholder="Describe what your hub is about, its purpose, and what kind of community you want to build..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] resize-none border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {description.length < 10 && description.length > 0 && (
                <span className="text-yellow-400">
                  Description must be at least 10 characters
                </span>
              )}
              {description.length >= 10 && (
                <span className="flex items-center text-green-400">
                  <Check className="mr-1 h-3 w-3" />
                  Good description
                </span>
              )}
            </div>
            <span className="text-gray-400 text-xs">
              {description.length}/500
            </span>
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-3">
          <Label
            htmlFor={shortDescriptionFieldId}
            className="font-medium text-base"
          >
            Short Description
          </Label>
          <input
            id={shortDescriptionFieldId}
            type="text"
            placeholder="A catchy one-liner about your hub"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value.slice(0, 100))}
            className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            maxLength={100}
          />
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">Optional but recommended</p>
            <span className="text-gray-400 text-xs">
              {shortDescription.length}/100
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-gray-800/50 bg-gray-800/30 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor={privateFieldId} className="font-medium text-base">
                Private Hub
              </Label>
              <p className="text-gray-400 text-sm">
                Private hubs require an invitation to join and won&apos;t appear
                in public listings
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

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="border-gray-700/50 bg-gray-800/50 px-6 hover:bg-gray-700/50 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="border-none bg-linear-to-r from-indigo-600 to-purple-600 px-8 hover:from-indigo-600/80 hover:to-purple-600/80"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </>
  );
}
