'use client';

import { useMutation } from '@tanstack/react-query';
import {
  CheckCircle,
  Copy,
  ExternalLink,
  Hash,
  Link,
  Loader2,
  Plus,
  Save,
  Settings,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import type {
  Connection,
  Hub,
  ServerData,
} from '@/lib/generated/prisma/client/client';
import { useTRPC } from '@/utils/trpc';

interface ConnectionEditFormClientProps {
  connection: Connection & { hub: Hub; server: ServerData };
}

export function ConnectionEditFormClient({
  connection,
}: ConnectionEditFormClientProps) {
  const trpc = useTRPC();
  const connectedSwitchId = useId();
  const inviteFieldId = useId();
  const [isConnected, setIsConnected] = useState(
    connection?.connected || false
  );
  const [inviteUrl, setInviteUrl] = useState(connection?.invite || '');

  const { toast } = useToast();
  const router = useRouter();

  // tRPC mutations
  const updateConnectionMutation = useMutation(
    trpc.connection.update.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Connection Updated',
          description: 'The connection has been updated successfully.',
        });
        // Redirect back to connection overview
        router.push(`/dashboard/connections/${connection.id}`);
      },
      onError: (error) => {
        console.error('Error updating connection:', error);
        toast({
          title: 'Update Failed',
          description: error.message || 'Failed to update connection',
          variant: 'destructive',
        });
      },
    })
  );

  const generateInviteMutation = useMutation(
    trpc.connection.generateInvite.mutationOptions({
      onSuccess: (data) => {
        setInviteUrl(data.invite);
        toast({
          title: 'Invite Generated',
          description: 'A new server invite has been generated.',
        });
      },
      onError: (error) => {
        console.error('Error generating invite:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to generate invite',
          variant: 'destructive',
        });
      },
    })
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          description: `${label} copied to clipboard`,
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          variant: 'destructive',
          description: 'Failed to copy to clipboard',
        });
      }
    );
  };

  const generateInvite = () => {
    generateInviteMutation.mutate({ connectionId: connection.id });
  };

  const handleSave = () => {
    updateConnectionMutation.mutate({
      connectionId: connection.id,
      connected: isConnected,
      invite: inviteUrl || null,
    });
  };

  return (
    <Card className="border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
      <CardHeader className="px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
            <Settings className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <CardTitle>Connection Settings</CardTitle>
            <CardDescription>
              Configure how this connection works
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label
              htmlFor="connected"
              className="flex items-center gap-2 font-medium text-base"
            >
              <Zap className="h-4 w-4" />
              Connection Status
            </Label>
            <p className="text-gray-400 text-sm">
              Enable or disable message sharing for this connection
            </p>
          </div>
          <Switch
            id={connectedSwitchId}
            checked={isConnected}
            onCheckedChange={setIsConnected}
          />
        </div>

        <Separator className="bg-gray-800/50" />

        {/* Server Invite */}
        <div className="space-y-3">
          <Label
            htmlFor="invite"
            className="flex items-center gap-2 font-medium text-base"
          >
            <Link className="h-4 w-4" />
            Server Invite Link
          </Label>
          <p className="mb-3 text-gray-400 text-sm">
            Optional invite link to your Discord server
          </p>
          <div className="flex items-center gap-2">
            <Input
              id={inviteFieldId}
              type="url"
              value={inviteUrl}
              onChange={(e) => setInviteUrl(e.target.value)}
              placeholder="https://discord.gg/..."
              className="flex-1 border-gray-700 bg-gray-800 text-white"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(inviteUrl, 'Invite URL')}
              disabled={!inviteUrl}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateInvite}
              disabled={generateInviteMutation.isPending}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              {generateInviteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
          {inviteUrl && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-green-400">Invite link configured</span>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-6 px-2 text-blue-400 text-xs hover:text-blue-300"
              >
                <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Test
                </a>
              </Button>
            </div>
          )}
        </div>

        <Separator className="bg-gray-800/50" />

        {/* Channel Information */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-medium text-base">
            <Hash className="h-4 w-4" />
            Connected Channel
          </Label>
          <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-400" />
                <span className="font-mono text-sm text-white">
                  {connection.channelId}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(connection.channelId, 'Channel ID')
                }
                className="h-6 px-2 text-gray-400 text-xs hover:text-white"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-gray-500 text-xs">
            Channel changes must be made through Discord bot `/manage
            connections` commands
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={updateConnectionMutation.isPending}
            className="border-none bg-gradient-to-r from-blue-600 to-purple-600 px-6 font-medium text-white hover:from-blue-700 hover:to-purple-700"
          >
            {updateConnectionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
