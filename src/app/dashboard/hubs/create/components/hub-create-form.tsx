'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  MessageSquare,
  Plus,
  Shield,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useTRPC } from '@/utils/trpc';

export function HubCreateForm() {
  const trpc = useTRPC();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [rules, setRules] = useState<string[]>(['']);
  const [nameError, setNameError] = useState('');
  const [isValidatingName, setIsValidatingName] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Generate unique IDs for form fields
  const nameFieldId = useId();
  const descriptionFieldId = useId();
  const privateFieldId = useId();
  const welcomeMessageFieldId = useId();

  // tRPC utils for imperative calls
  const queryClient = useQueryClient();

  // tRPC mutation for creating hub
  const createHubMutation = useMutation(
    trpc.hub.createHub.mutationOptions({
      onSuccess: (data) => {
        toast({
          title: '🎉 Hub Created Successfully!',
          description: `${name} is ready to connect communities worldwide.`,
        });

        // Redirect to the hub management page
        router.push(`/dashboard/hubs/${data.id}`);
      },
      onError: (error) => {
        console.error('Error creating hub:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to create hub',
          variant: 'destructive',
        });
      },
    })
  );

  // Focus on name input when component mounts
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  // Check if hub name is unique using tRPC
  const checkHubName = useCallback(
    async (name: string) => {
      if (name.length < 3) {
        setIsNameValid(false);
        return;
      }

      setIsValidatingName(true);
      setNameError('');

      try {
        const result = await queryClient.fetchQuery(
          trpc.hub.validateName.queryOptions({ name })
        );

        if (!result.available) {
          setNameError('This hub name is already taken');
          setIsNameValid(false);
        } else {
          setIsNameValid(true);
        }
      } catch (error) {
        console.error('Error checking hub name:', error);
        setNameError('Failed to check hub name availability');
        setIsNameValid(false);
      } finally {
        setIsValidatingName(false);
      }
    },
    [queryClient, trpc.hub.validateName]
  ); // Debounce name checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (name.length >= 3) {
        checkHubName(name);
      } else {
        setIsNameValid(false);
        setNameError('');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [name, checkHubName]);

  const addRule = () => {
    if (rules.length < 10) {
      setRules([...rules, '']);
    }
  };

  const updateRule = (index: number, value: string) => {
    const updatedRules = [...rules];
    updatedRules[index] = value;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (name.length < 3) {
      toast({
        title: 'Error',
        description: 'Hub name must be at least 3 characters',
        variant: 'destructive',
      });
      return;
    }

    if (description.length < 10) {
      toast({
        title: 'Error',
        description: 'Description must be at least 10 characters',
        variant: 'destructive',
      });
      return;
    }

    if (nameError || !isNameValid || isValidatingName) {
      toast({
        title: 'Error',
        description:
          nameError || 'Please ensure the hub name is valid and unique',
        variant: 'destructive',
      });
      return;
    }

    // Filter out empty rules
    const filteredRules = rules.filter((rule) => rule.trim() !== '');

    // Use tRPC mutation to create hub
    createHubMutation.mutate({
      name,
      description,
      private: isPrivate,
      rules: filteredRules,
    });
  };

  const nextStep = () => {
    if (
      step === 1 &&
      name.length >= 3 &&
      !nameError &&
      isNameValid &&
      !isValidatingName
    ) {
      setStep(2);
    } else if (step === 2 && description.length >= 10) {
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return name.length >= 3 && !nameError && isNameValid && !isValidatingName;
    } else if (step === 2) {
      return description.length >= 10;
    }
    return true;
  };

  const stepIcons = [
    { icon: Sparkles, label: 'Name', color: 'text-purple-400' },
    { icon: MessageSquare, label: 'Details', color: 'text-blue-400' },
    { icon: Shield, label: 'Rules', color: 'text-green-400' },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          {stepIcons.map((stepIcon, index) => {
            const StepIcon = stepIcon.icon;
            const isActive = step === index + 1;
            const isCompleted = step > index + 1;

            return (
              <div key={stepIcon.label} className="flex items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'border-green-500 bg-green-500 text-white'
                      : isActive
                        ? `border-indigo-500 bg-indigo-500/10 ${stepIcon.color}`
                        : 'border-gray-600 bg-gray-800/50 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <StepIcon className="h-6 w-6" />
                  )}
                </div>
                {index < stepIcons.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 w-16 transition-all duration-300 ${
                      step > index + 1 ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center">
          <h3 className="mb-1 font-semibold text-lg text-white">
            Step {step} of 3: {stepIcons[step - 1].label}
          </h3>
          <p className="text-gray-400 text-sm">
            {step === 1 &&
              'Choose a unique name that represents your community'}
            {step === 2 && 'Describe your hub and configure basic settings'}
            {step === 3 && 'Set up welcome message and community rules'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-950/80 shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Hub Name */}
          {step === 1 && (
            <>
              <CardHeader className="pb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">
                  What&apos;s your hub called?
                </CardTitle>
                <CardDescription className="text-base">
                  Choose a unique name that represents your community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor={nameFieldId}
                    className="font-medium text-base"
                  >
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
                      {nameError && (
                        <span className="text-red-400">{nameError}</span>
                      )}
                      {isNameValid && name.length >= 3 && !isValidatingName && (
                        <span className="flex items-center text-green-400">
                          <Check className="mr-1 h-3 w-3" />
                          Name is available
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs">
                      {name.length}/32
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="border-none bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 hover:from-indigo-600/80 hover:to-purple-600/80"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Description & Settings */}
          {step === 2 && (
            <>
              <CardHeader className="pb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Describe your hub</CardTitle>
                <CardDescription className="text-base">
                  Help people understand what your community is about
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor={descriptionFieldId}
                    className="font-medium text-base"
                  >
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

                <div className="rounded-lg border border-gray-800/50 bg-gray-800/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label
                        htmlFor={privateFieldId}
                        className="font-medium text-base"
                      >
                        Private Hub
                      </Label>
                      <p className="text-gray-400 text-sm">
                        Private hubs require an invitation to join and
                        won&apos;t appear in public listings
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
                    onClick={prevStep}
                    className="border-gray-700/50 bg-gray-800/50 px-6 hover:bg-gray-700/50 hover:text-white"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="border-none bg-gradient-to-r from-indigo-600 to-purple-600 px-8 hover:from-indigo-600/80 hover:to-purple-600/80"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Rules & Welcome Message */}
          {step === 3 && (
            <>
              <CardHeader className="pb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
                  <Shield className="h-8 w-8 text-white" />
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
                      <Plus className="mr-1 h-4 w-4" />
                      Add Rule
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {rules.map((rule, index) => (
                      <div
                        key={`rule-${index}-${rule.slice(0, 10)}`}
                        className="flex gap-3"
                      >
                        <div className="flex-1">
                          <Input
                            placeholder={`Rule ${index + 1}: e.g., Be respectful to all members`}
                            value={rule}
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
                            <X className="h-4 w-4" />
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
                    onClick={prevStep}
                    className="border-gray-700/50 bg-gray-800/50 px-6 hover:bg-gray-700/50 hover:text-white"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={createHubMutation.isPending}
                    className="border-none bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 hover:from-green-600/80 hover:to-emerald-600/80"
                  >
                    {createHubMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Hub...
                      </>
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        Create Hub
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </form>
      </Card>
    </div>
  );
}
