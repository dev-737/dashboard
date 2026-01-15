'use client';

import { useMutation } from '@tanstack/react-query';
import { Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useTRPC } from '@/utils/trpc';
import { BasicInfoSection } from './BasicInfoSection';
import { RulesSection } from './RulesSection';
import { WelcomeMessageSection } from './WelcomeMessageSection';

export interface HubData {
  id: string;
  name: string;
  description: string;
  private: boolean;
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

  // Generate unique IDs for form fields
  const nameId = useId();
  const privateId = useId();
  const descriptionId = useId();
  const welcomeMessageId = useId();

  // Original values for comparison
  const originalValues = {
    name: hubData.name,
    description: hubData.description,
    private: hubData.private,
    welcomeMessage: hubData.welcomeMessage || '',
    rules: hubData.rules || [],
  };

  // Form state
  const [name, setName] = useState(hubData.name);
  const [description, setDescription] = useState(hubData.description);
  const [isPrivate, setIsPrivate] = useState(hubData.private);
  const [welcomeMessage, setWelcomeMessage] = useState(
    hubData.welcomeMessage || ''
  );
  const [rules, setRules] = useState<string[]>(hubData.rules || []);

  const { toast } = useToast();
  const router = useRouter();

  // tRPC mutation for updating hub
  const updateHubMutation = useMutation(
    trpc.hub.updateHub.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Hub Updated',
          description: 'Your hub has been successfully updated.',
        });
        router.refresh();
      },
      onError: (error) => {
        console.error('Error updating hub:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to update hub',
          variant: 'destructive',
        });
      },
    })
  );

  // Check if form has unsaved changes
  const hasUnsavedChanges =
    name !== originalValues.name ||
    description !== originalValues.description ||
    isPrivate !== originalValues.private ||
    welcomeMessage !== originalValues.welcomeMessage ||
    JSON.stringify(rules) !== JSON.stringify(originalValues.rules);

  // Reset form to original values
  const resetForm = () => {
    setName(originalValues.name);
    setDescription(originalValues.description);
    setIsPrivate(originalValues.private);
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
      private: isPrivate,
      welcomeMessage: welcomeMessage || null,
      rules,
    });
  };

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <Card className="bg-dash-main border-none shadow-none hover:shadow-none">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-linear-to-br from-blue-500 to-cyan-600">
              <Edit3 className="h-5 w-5 text-white" />
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
