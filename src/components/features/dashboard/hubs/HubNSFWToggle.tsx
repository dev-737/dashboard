'use client';

import { AlertTriangle, Save, Shield } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUpdateHub } from '@/hooks/use-hub-settings';

interface HubNSFWToggleProps {
  hubId: string;
  currentNsfw: boolean;
}

export function HubNSFWToggle({ hubId, currentNsfw }: HubNSFWToggleProps) {
  const nsfwToggleId = useId();
  const [isNsfw, setIsNsfw] = useState<boolean>(currentNsfw);
  const [hasChanges, setHasChanges] = useState(false);

  const updateHubMutation = useUpdateHub(hubId);

  const handleNsfwChange = (checked: boolean) => {
    setIsNsfw(checked);
    setHasChanges(checked !== currentNsfw);
  };

  const handleSaveNsfw = async () => {
    if (!hasChanges) return;

    try {
      await updateHubMutation.mutateAsync({
        hubId,
        nsfw: isNsfw,
      });

      setHasChanges(false);
      toast.success('NSFW Setting Updated', {
        description: `Hub has been marked as ${isNsfw ? 'NSFW' : 'SFW'}.`,
      });
    } catch (error) {
      console.error('Error updating NSFW setting:', error);
      toast.error('Error', {
        description: 'Failed to update NSFW setting. Please try again.',
      });
    }
  };

  const handleResetNsfw = () => {
    setIsNsfw(currentNsfw);
    setHasChanges(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-orange-400" />
        <div>
          <Label
            htmlFor="nsfw-toggle"
            className="font-medium text-base text-gray-200"
          >
            NSFW Content
          </Label>
          <p className="mt-1 text-gray-400 text-sm">
            Mark this hub as containing Not Safe For Work content
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-700/50 bg-gray-800/30 p-4">
        <div className="flex items-center gap-3">
          <Switch
            id={nsfwToggleId}
            checked={isNsfw}
            onCheckedChange={handleNsfwChange}
            className="data-[state=checked]:bg-orange-500"
          />
          <div>
            <span className="font-medium text-gray-200 text-sm">NSFW Hub</span>
            <p className="text-gray-400 text-xs">
              This hub contains adult content and will be filtered from search
              results for users who haven&apos;t opted in
            </p>
          </div>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetNsfw}
              className="text-gray-400 hover:bg-gray-700/50 hover:text-white"
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSaveNsfw}
              disabled={updateHubMutation.isPending}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {updateHubMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Warning message for NSFW content */}
      {isNsfw && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
          <div className="space-y-2 text-orange-200 text-sm">
            <p>
              <strong>Important NSFW Guidelines:</strong>
            </p>
            <ul className="ml-2 list-inside list-disc space-y-1 text-orange-300/80">
              <li>Only NSFW Discord channels can connect to NSFW hubs</li>
              <li>
                NSFW hubs are hidden from users who haven&apos;t opted in to see
                adult content
              </li>
              <li>
                Ensure all content shared in this hub complies with
                Discord&apos;s Terms of Service
              </li>
              <li>
                Moderators should actively enforce appropriate content
                guidelines
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
