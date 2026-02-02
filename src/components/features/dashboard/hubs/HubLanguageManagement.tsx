'use client';

import { Check, Globe, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { LANGUAGES } from '@/app/hubs/constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateHub } from '@/hooks/use-hub-settings';

interface HubLanguageManagementProps {
  hubId: string;
  currentLanguage?: string;
}

export function HubLanguageManagement({
  hubId,
  currentLanguage,
}: HubLanguageManagementProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    currentLanguage || 'en'
  );
  const [hasChanges, setHasChanges] = useState(false);

  const updateHubMutation = useUpdateHub(hubId);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    setHasChanges(value !== currentLanguage);
  };

  const handleSaveLanguage = async () => {
    if (!hasChanges) return;

    try {
      await updateHubMutation.mutateAsync({
        hubId,
        language: selectedLanguage,
      });

      setHasChanges(false);
      toast.success('Language Updated', {
        description: 'Hub language has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error('Error', {
        description: 'Failed to update hub language. Please try again.',
      });
    }
  };

  const handleResetLanguage = () => {
    setSelectedLanguage(currentLanguage || 'en');
    setHasChanges(false);
  };

  // Get the current language name for display
  const getCurrentLanguageName = () => {
    const language = LANGUAGES.find(
      (lang) => lang.code === (currentLanguage || 'en')
    );
    return language?.name || 'English';
  };

  const getSelectedLanguageName = () => {
    const language = LANGUAGES.find((lang) => lang.code === selectedLanguage);
    return language?.name || 'English';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
          <Globe className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Hub Language</h3>
          <p className="text-gray-400 text-sm">
            Set the primary language for your hub to help users find it
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language-select" className="font-medium text-sm">
            Primary Language
          </Label>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full border-gray-700/50 bg-gray-800/50 hover:bg-gray-800/70 focus:ring-2 focus:ring-blue-500/50">
              <SelectValue placeholder="Select a language">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span>{getSelectedLanguageName()}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px] border-gray-700 bg-gray-900">
              {LANGUAGES.map((language) => (
                <SelectItem
                  key={language.code}
                  value={language.code}
                  className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 font-mono text-gray-400 text-xs">
                      {language.code.toUpperCase()}
                    </span>
                    <span>{language.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-gray-500 text-xs">
            Current language:{' '}
            <span className="text-gray-400">{getCurrentLanguageName()}</span>
          </p>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="flex-1">
              <p className="font-medium text-blue-400 text-sm">
                Language Change Pending
              </p>
              <p className="text-gray-400 text-xs">
                Save your changes to update the hub language to{' '}
                {getSelectedLanguageName()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetLanguage}
                className="text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSaveLanguage}
                disabled={updateHubMutation.isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {updateHubMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Language
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}

        {!hasChanges && currentLanguage && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
            <Check className="h-4 w-4 text-green-400" />
            <p className="text-green-400 text-sm">
              Hub language is set to {getCurrentLanguageName()}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-1 text-gray-500 text-xs">
        <p>
          <strong>Note:</strong> Setting the correct language helps users
          discover your hub through language filters.
        </p>
        <p>
          This setting affects how your hub appears in search results and
          recommendations.
        </p>
      </div>
    </div>
  );
}
