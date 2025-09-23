'use client';

import { Globe } from 'lucide-react';
import { HubLanguageManagement } from '@/components/dashboard/hubs/HubLanguageManagement';
import { HubNSFWToggle } from '@/components/dashboard/hubs/HubNSFWToggle';
import { HubTagManagement } from '@/components/dashboard/hubs/HubTagManagement';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface HubData {
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

interface HubDiscoverabilityFormProps {
  hubData: HubData;
}

export function HubDiscoverabilityForm({
  hubData,
}: HubDiscoverabilityFormProps) {
  if (!hubData.canEdit) {
    return (
      <Card className="premium-card">
        <CardContent className="p-8">
          <div className="text-center text-gray-400">
            <Globe className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>
              You don&apos;t have permission to edit this hub&apos;s
              discoverability settings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <Globe className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl">Discovery Settings</CardTitle>
              <CardDescription className="text-base">
                Manage tags, language, and content settings to help users find
                your hub
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <HubTagManagement hubId={hubData.id} currentTags={hubData.tags} />
          <div className="border-gray-700/50 border-t pt-8">
            <HubLanguageManagement
              hubId={hubData.id}
              currentLanguage={hubData.language || undefined}
            />
          </div>
          <div className="border-gray-700/50 border-t pt-8">
            <HubNSFWToggle hubId={hubData.id} currentNsfw={hubData.nsfw} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
