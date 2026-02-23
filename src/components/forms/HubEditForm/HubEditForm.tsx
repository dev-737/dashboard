'use client';

import { PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HubVisibility } from '@/lib/generated/prisma/client/client';
import { useTRPC } from '@/utils/trpc';
import { BasicInfoSection } from './BasicInfoSection';
import { RulesSection } from './RulesSection';
import { WelcomeMessageSection } from './WelcomeMessageSection';

interface HubData {
  id: string;
  name: string;
  description: string;
  visibility: HubVisibility;
  welcomeMessage: string | null;
  rules: string[];
  bannerUrl: string | null;
  iconUrl: string | null;
  language: string | null;
  nsfw: boolean;
  tags: string[];
  connectionCount: number;
  isOwner: boolean;
  canEdit: boolean;
}

interface HubEditFormProps {
  hubData: HubData;
}

export function HubEditForm({ hubData }: HubEditFormProps) {
  const trpc = useTRPC();
  const initialIsPrivate = hubData.visibility === HubVisibility.PRIVATE;

  // Generate unique IDs for form fields
  const nameId = useId();
  const privateId = useId();
  const descriptionId = useId();
  const welcomeMessageId = useId();

  // Original values for comparison
  const originalValues = {
    name: hubData.name,
    description: hubData.description,
    isPrivate: initialIsPrivate,
    welcomeMessage: hubData.welcomeMessage || '',
    rules: hubData.rules || [],
  };

  // Form state
  const [name, setName] = useState(hubData.name);
  const [description, setDescription] = useState(hubData.description);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [welcomeMessage, setWelcomeMessage] = useState(
    hubData.welcomeMessage || ''
  );
  const [rules, setRules] = useState<string[]>(hubData.rules || []);

  const router = useRouter();

  // tRPC mutation for updating hub
  const updateHubMutation = useMutation(
    trpc.hub.updateHub.mutationOptions({
      onSuccess: () => {
        toast.success('Hub Updated', {
          description: 'Your hub has been successfully updated.',
        });
        router.refresh();
      },
      onError: (error) => {
        console.error('Error updating hub:', error);
        toast.error('Error', {
          description: error.message || 'Failed to update hub',
        });
      },
    })
  );

  // Check if form has unsaved changes
  const hasUnsavedChanges =
    name !== originalValues.name ||
    description !== originalValues.description ||
    isPrivate !== originalValues.isPrivate ||
    welcomeMessage !== originalValues.welcomeMessage ||
    JSON.stringify(rules) !== JSON.stringify(originalValues.rules);

  // Reset form to original values
  const resetForm = () => {
    setName(originalValues.name);
    setDescription(originalValues.description);
    setIsPrivate(originalValues.isPrivate);
    setWelcomeMessage(originalValues.welcomeMessage);
    setRules(originalValues.rules);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use tRPC mutation to update hub
    updateHubMutation.mutate({
      hubId: hubData.id,
      name,
      description,
      visibility: isPrivate ? HubVisibility.PRIVATE : HubVisibility.PUBLIC,
      welcomeMessage: welcomeMessage || null,
      rules,
    });
  };

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <Card className="border-none bg-dash-main shadow-none hover:shadow-none">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-linear-to-br from-blue-500 to-cyan-600">
              <HugeiconsIcon
                icon={PencilEdit02Icon}
                className="h-5 w-5 text-white"
              />
            </div>
            <div>
              <CardTitle className="text-xl">Basic Information</CardTitle>
              <CardDescription className="text-base">
                Update your hub&apos;s core settings and content
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <BasicInfoSection
            name={name}
            setName={setName}
            isPrivate={isPrivate}
            setIsPrivate={setIsPrivate}
            description={description}
            setDescription={setDescription}
            nameId={nameId}
            privateId={privateId}
            descriptionId={descriptionId}
          />

          <WelcomeMessageSection
            welcomeMessage={welcomeMessage}
            setWelcomeMessage={setWelcomeMessage}
            welcomeMessageId={welcomeMessageId}
          />

          <RulesSection rules={rules} setRules={setRules} />
        </CardContent>
      </Card>

      {/* Unsaved Changes Notification */}
      {hasUnsavedChanges && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-yellow-500/20 border-t bg-yellow-900/20 p-4 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between">
            <p className="text-sm text-yellow-200">
              You have unsaved changes that will be lost if you leave this page.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm transition-colors hover:bg-gray-700"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={updateHubMutation.isPending}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {updateHubMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
