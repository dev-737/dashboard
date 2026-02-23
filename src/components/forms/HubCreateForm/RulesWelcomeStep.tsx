import {
  ArrowLeftIcon,
  Cancel01Icon,
  Loading03Icon,
  PlusSignIcon,
  Shield01Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RulesWelcomeStepProps {
  welcomeMessage: string;
  setWelcomeMessage: (message: string) => void;
  rules: { id: string; value: string }[];
  setRules: React.Dispatch<
    React.SetStateAction<{ id: string; value: string }[]>
  >;
  onPrev: () => void;
  isSubmitting: boolean;
  welcomeMessageFieldId: string;
}

export function RulesWelcomeStep({
  welcomeMessage,
  setWelcomeMessage,
  rules,
  setRules,
  onPrev,
  isSubmitting,
  welcomeMessageFieldId,
}: RulesWelcomeStepProps) {
  const addRule = () => {
    if (rules.length < 10) {
      setRules([...rules, { id: crypto.randomUUID(), value: '' }]);
    }
  };

  const updateRule = (index: number, value: string) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], value };
    setRules(updatedRules);
  };

  const removeRule = (index: number) => {
    if (rules.length > 1) {
      const updatedRules = rules.filter((_, i) => i !== index);
      setRules(updatedRules);
    } else {
      // If it's the last rule, just clear it
      updateRule(0, '');
    }
  };

  return (
    <>
      <CardHeader className="pb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-emerald-600">
          <HugeiconsIcon
            strokeWidth={3}
            icon={Shield01Icon}
            className="h-8 w-8 text-white"
          />
        </div>
        <CardTitle className="text-2xl">Welcome & Rules</CardTitle>
        <CardDescription className="text-base">
          Set up a welcome message and community guidelines (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label
            htmlFor={welcomeMessageFieldId}
            className="font-medium text-base"
          >
            Welcome Message (Optional)
          </Label>
          <Textarea
            id={welcomeMessageFieldId}
            placeholder="Welcome to our hub! This message will be shown to new members when they join..."
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            className="min-h-[100px] resize-none border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50"
            maxLength={1000}
          />
          <div className="flex justify-between">
            <p className="text-gray-400 text-xs">
              A warm welcome message helps new members feel at home
            </p>
            <span className="text-gray-400 text-xs">
              {welcomeMessage.length}/1000
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium text-base">
              Community Rules (Optional)
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRule}
              disabled={rules.length >= 10}
              className="border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white"
            >
              <HugeiconsIcon
                strokeWidth={3}
                icon={PlusSignIcon}
                className="mr-1 h-4 w-4"
              />
              Add Rule
            </Button>
          </div>

          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={rule.id} className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder={`Rule ${index + 1}: e.g., Be respectful to all members`}
                    value={rule.value}
                    onChange={(e) => updateRule(index, e.target.value)}
                    className="border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50"
                    maxLength={200}
                  />
                </div>
                {rules.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeRule(index)}
                    className="border-red-500/30 text-red-400 hover:border-red-700/50 hover:bg-red-900/30 hover:text-red-300"
                  >
                    <HugeiconsIcon
                      strokeWidth={3}
                      icon={Cancel01Icon}
                      className="h-4 w-4"
                    />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {rules.length >= 10 && (
            <p className="text-sm text-yellow-400">
              Maximum of 10 rules allowed
            </p>
          )}

          <p className="text-gray-400 text-xs">
            Clear rules help maintain a positive community environment
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="border-gray-700/50 bg-gray-800/50 px-6 hover:bg-gray-700/50 hover:text-white"
          >
            <HugeiconsIcon
              strokeWidth={3}
              icon={ArrowLeftIcon}
              className="mr-2 h-4 w-4"
            />
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="border-none bg-linear-to-r from-green-600 to-emerald-600 px-8 py-3 hover:from-green-600/80 hover:to-emerald-600/80"
          >
            {isSubmitting ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Creating Hub...
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={UserMultipleIcon}
                  className="mr-2 h-4 w-4"
                />
                Create Hub
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </>
  );
}
