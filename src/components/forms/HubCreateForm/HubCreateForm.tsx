'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Shield, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useTRPC } from '@/utils/trpc';
import { BasicInfoStep } from './BasicInfoStep';
import { DescriptionSettingsStep } from './DescriptionSettingsStep';
import { RulesWelcomeStep } from './RulesWelcomeStep';
import { StepIndicator } from './StepIndicator';

const STEP_ICONS = [
  { icon: Sparkles, label: 'Name', color: 'text-purple-400' },
  { icon: MessageSquare, label: 'Details', color: 'text-blue-400' },
  { icon: Shield, label: 'Rules', color: 'text-green-400' },
];

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
  );

  // Debounce name checking
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

  return (
    <div className="mx-auto max-w-2xl">
      <StepIndicator currentStep={step} steps={STEP_ICONS} />

      <Card className="border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-950/80 shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <BasicInfoStep
              name={name}
              setName={setName}
              nameError={nameError}
              isValidatingName={isValidatingName}
              isNameValid={isNameValid}
              onNext={nextStep}
              canProceed={canProceed()}
              nameInputRef={nameInputRef}
              nameFieldId={nameFieldId}
            />
          )}

          {step === 2 && (
            <DescriptionSettingsStep
              description={description}
              setDescription={setDescription}
              isPrivate={isPrivate}
              setIsPrivate={setIsPrivate}
              onNext={nextStep}
              onPrev={prevStep}
              canProceed={canProceed()}
              descriptionFieldId={descriptionFieldId}
              privateFieldId={privateFieldId}
            />
          )}

          {step === 3 && (
            <RulesWelcomeStep
              welcomeMessage={welcomeMessage}
              setWelcomeMessage={setWelcomeMessage}
              rules={rules}
              setRules={setRules}
              onPrev={prevStep}
              isSubmitting={createHubMutation.isPending}
              welcomeMessageFieldId={welcomeMessageFieldId}
            />
          )}
        </form>
      </Card>
    </div>
  );
}
