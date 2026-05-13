'use client';

import {
  Settings01Icon,
  Shield01Icon,
  SparklesIcon,
  Upload01Icon,
} from '@hugeicons/core-free-icons';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { useTRPC } from '@/utils/trpc';
import { EssentialsStep } from './EssentialsStep';
import { MediaUploadStep } from './MediaUploadStep';
import { ModulesSettingsStep } from './ModulesSettingsStep';
import { RulesWelcomeStep } from './RulesWelcomeStep';
import { StepIndicator } from './StepIndicator';

const STEP_ICONS = [
  { icon: SparklesIcon, label: 'Essentials', color: 'text-purple-400' },
  { icon: Upload01Icon, label: 'Media', color: 'text-pink-400' },
  { icon: Settings01Icon, label: 'Modules', color: 'text-orange-400' },
  { icon: Shield01Icon, label: 'Rules', color: 'text-green-400' },
];

export function HubCreateForm() {
  const trpc = useTRPC();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [modules, setModules] = useState<number>(0);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [rules, setRules] = useState<{ id: string; value: string }[]>([
    { id: crypto.randomUUID(), value: '' },
  ]);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const [isValidatingName, setIsValidatingName] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);

  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Generate unique IDs for form fields
  const nameFieldId = useId();
  const descriptionFieldId = useId();
  const shortDescriptionFieldId = useId();
  const privateFieldId = useId();
  const welcomeMessageFieldId = useId();

  // tRPC utils for imperative calls
  const queryClient = useQueryClient();

  // tRPC mutation for creating hub
  const createHubMutation = useMutation(
    trpc.hub.createHub.mutationOptions({
      onSuccess: (data) => {
        toast.success('🎉 Hub Created Successfully!', {
          description: `${name} is ready to connect communities worldwide.`,
        });

        // Redirect to the hub management page
        router.push(`/dashboard/hubs/${data.id}`);
      },
      onError: (error) => {
        console.error('Error creating hub:', error);
        toast.error('Error', {
          description: error.message || 'Failed to create hub',
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

  const submitHub = () => {
    // Validate inputs
    if (name.length < 3) {
      toast.error('Error', {
        description: 'Hub name must be at least 3 characters',
      });
      return;
    }

    if (description.length < 10) {
      toast.error('Error', {
        description: 'Description must be at least 10 characters',
      });
      return;
    }

    if (nameError || !isNameValid || isValidatingName) {
      toast.error('Error', {
        description:
          nameError || 'Please ensure the hub name is valid and unique',
      });
      return;
    }

    // Filter out empty rules
    const filteredRules = rules
      .map((r) => r.value)
      .filter((r) => r.trim().length > 0);

    // Use tRPC mutation to create hub
    createHubMutation.mutate({
      name,
      description,
      shortDescription: shortDescription || undefined,
      visibility: isPrivate ? 'PRIVATE' : 'PUBLIC',
      rules: filteredRules,
      settings: modules,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitHub();
  };

  const nextStep = () => {
    if (step === 1) {
      if (
        name.length >= 3 &&
        !nameError &&
        isNameValid &&
        !isValidatingName &&
        description.length >= 10
      ) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const skipModulesAndContinue = () => {
    setStep(4);
  };

  const prevStep = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 4) {
      setStep(3);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return (
        name.length >= 3 &&
        !nameError &&
        isNameValid &&
        !isValidatingName &&
        description.length >= 10
      );
    }
    return true;
  };

  return (
    <div className="mx-auto max-w-2xl">
      <StepIndicator currentStep={step} steps={STEP_ICONS} />

      <Card className="border border-gray-800/50 bg-main shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <EssentialsStep
              name={name}
              setName={setName}
              nameError={nameError}
              isValidatingName={isValidatingName}
              isNameValid={isNameValid}
              description={description}
              setDescription={setDescription}
              shortDescription={shortDescription}
              setShortDescription={setShortDescription}
              isPrivate={isPrivate}
              setIsPrivate={setIsPrivate}
              onNext={nextStep}
              onFinish={submitHub}
              canProceed={canProceed()}
              nameInputRef={nameInputRef}
              nameFieldId={nameFieldId}
              descriptionFieldId={descriptionFieldId}
              shortDescriptionFieldId={shortDescriptionFieldId}
              privateFieldId={privateFieldId}
              isSubmitting={createHubMutation.isPending}
            />
          )}

          {step === 2 && (
            <MediaUploadStep
              iconUrl={iconUrl}
              setIconUrl={setIconUrl}
              bannerUrl={bannerUrl}
              setBannerUrl={setBannerUrl}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {step === 3 && (
            <ModulesSettingsStep
              modules={modules}
              setModules={setModules}
              onNext={nextStep}
              onPrev={prevStep}
              onSkip={skipModulesAndContinue}
            />
          )}

          {step === 4 && (
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
