'use client';

import { DiscordChannelSelector } from '@/components/discord/DiscordChannelSelector';
import { DiscordRoleSelector } from '@/components/discord/DiscordRoleSelector';
import { PageFooter } from '@/components/layout/DashboardPageFooter';
import { UnsavedChangesPrompt } from '@/components/features/dashboard/UnsavedChangesPrompt';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useTRPC } from '@/utils/trpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    AlertTriangle,
    Bell,
    Check,
    Flag,
    MessageSquare,
    Shield,
    Users,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface LogConfig {
  id?: string;
  hubId: string;
  modLogsChannelId?: string | null;
  modLogsRoleId?: string | null;
  joinLeavesChannelId?: string | null;
  joinLeavesRoleId?: string | null;
  appealsChannelId?: string | null;
  appealsRoleId?: string | null;
  reportsChannelId?: string | null;
  reportsRoleId?: string | null;
  networkAlertsChannelId?: string | null;
  networkAlertsRoleId?: string | null;
  messageModerationChannelId?: string | null;
  messageModerationRoleId?: string | null;
}

interface HubLoggingFormProps {
  hubId: string;
  initialLogConfig: LogConfig | null;
}

const LOG_TYPES = [
  {
    key: 'modLogs',
    title: 'Moderation',
    description: 'Track bans, warnings, and other moderation actions',
    icon: Shield,
    color: 'indigo',
  },
  {
    key: 'joinLeaves',
    title: 'Join/Leave',
    description: 'Monitor servers joining or leaving your hub',
    icon: Users,
    color: 'emerald',
  },
  {
    key: 'appeals',
    title: 'Appeals',
    description: 'Receive blacklist appeal requests',
    icon: MessageSquare,
    color: 'blue',
  },
  {
    key: 'reports',
    title: 'Reports',
    description: 'Get notified when content is reported',
    icon: Flag,
    color: 'red',
  },
  {
    key: 'networkAlerts',
    title: 'Network Alerts',
    description: 'Important system notifications and alerts',
    icon: Bell,
    color: 'amber',
  },
  {
    key: 'messageModeration',
    title: 'Message Logs',
    description: 'Log message deletions, edits, and moderation',
    icon: MessageSquare,
    color: 'purple',
  },
];

export function HubLoggingForm({
  hubId,
  initialLogConfig,
}: HubLoggingFormProps) {
  const trpc = useTRPC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logConfig, setLogConfig] = useState<LogConfig>(
    initialLogConfig || {
      hubId,
      modLogsChannelId: null,
      modLogsRoleId: null,
      joinLeavesChannelId: null,
      joinLeavesRoleId: null,
      appealsChannelId: null,
      appealsRoleId: null,
      reportsChannelId: null,
      reportsRoleId: null,
      networkAlertsChannelId: null,
      networkAlertsRoleId: null,
      messageModerationChannelId: null,
      messageModerationRoleId: null,
    }
  );
  const [serverIds, setServerIds] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('modLogs');

  const saveMutation = useMutation(
    trpc.hub.updateLogConfig.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.hub.getHub.queryFilter({ id: hubId })
        );
      },
    })
  );

  // Helper to check if the config has changed
  const checkForChanges = useCallback(
    (newConfig: LogConfig) => {
      if (!initialLogConfig) return true;

      const keys = [
        'modLogsChannelId',
        'modLogsRoleId',
        'joinLeavesChannelId',
        'joinLeavesRoleId',
        'appealsChannelId',
        'appealsRoleId',
        'reportsChannelId',
        'reportsRoleId',
        'networkAlertsChannelId',
        'networkAlertsRoleId',
        'messageModerationChannelId',
        'messageModerationRoleId',
      ];

      return keys.some((key) => {
        const initialValue = initialLogConfig[key as keyof LogConfig];
        const newValue = newConfig[key as keyof LogConfig];
        return initialValue !== newValue;
      });
    },
    [initialLogConfig]
  );

  // Update a specific log type configuration
  const updateLogConfig = useCallback(
    (logType: string, field: 'channelId' | 'roleId', value: string) => {
      const fieldName =
        `${logType}${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof LogConfig;
      const newConfig = { ...logConfig, [fieldName]: value || null };
      setLogConfig(newConfig);
      setHasChanges(checkForChanges(newConfig));
    },
    [logConfig, checkForChanges]
  );

  // Handle server changes for a specific log type
  const handleServerChange = useCallback(
    (logType: string, serverId: string) => {
      setServerIds((prev) => ({ ...prev, [logType]: serverId }));

      // Clear the role selection when server changes
      const roleFieldName = `${logType}RoleId` as keyof LogConfig;
      if (logConfig[roleFieldName]) {
        updateLogConfig(logType, 'roleId', '');
      }
    },
    [logConfig, updateLogConfig]
  );

  const handleSaveLogConfig = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hubId: _, ...configWithoutHubId } = logConfig;
      await saveMutation.mutateAsync({
        hubId,
        ...configWithoutHubId,
      });

      toast({
        title: 'Success',
        description: 'Logging configuration saved successfully.',
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Error saving logging configuration:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to save logging configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form to original values
  const resetForm = () => {
    setLogConfig(
      initialLogConfig || {
        hubId,
        modLogsChannelId: null,
        modLogsRoleId: null,
        joinLeavesChannelId: null,
        joinLeavesRoleId: null,
        appealsChannelId: null,
        appealsRoleId: null,
        reportsChannelId: null,
        reportsRoleId: null,
        networkAlertsChannelId: null,
        networkAlertsRoleId: null,
        messageModerationChannelId: null,
        messageModerationRoleId: null,
      }
    );
    setServerIds({});
    setHasChanges(false);
  };

  // Get the status of a log type
  const isConfigured = (logType: string) => {
    const channelId = logConfig[`${logType}ChannelId` as keyof LogConfig];
    return !!channelId;
  };

  // Get color classes for a log type
  const getColorClasses = (color: string) => {
    const colors = {
      indigo: {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        text: 'text-indigo-400',
        active:
          'data-[state=active]:bg-indigo-500/20 data-[state=active]:border-indigo-500/40',
      },
      emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        active:
          'data-[state=active]:bg-emerald-500/20 data-[state=active]:border-emerald-500/40',
      },
      blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        active:
          'data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/40',
      },
      red: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-400',
        active:
          'data-[state=active]:bg-red-500/20 data-[state=active]:border-red-500/40',
      },
      amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        active:
          'data-[state=active]:bg-amber-500/20 data-[state=active]:border-amber-500/40',
      },
      purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
        active:
          'data-[state=active]:bg-purple-500/20 data-[state=active]:border-purple-500/40',
      },
    };
    return colors[color as keyof typeof colors] || colors.indigo;
  };

  return (
    <div className="mx-auto mt-6 max-w-4xl space-y-8">
      {/* Main Content */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Simplified Tab List */}
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 p-1 lg:grid-cols-6">
            {LOG_TYPES.map(({ key, title, icon: Icon, color }) => {
              const colorClasses = getColorClasses(color);
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className={`relative flex flex-col items-center gap-1.5 px-2 py-3 transition-all duration-200 ${colorClasses.active} hover:bg-gray-800/50`}
                >
                  <Icon className={`h-4 w-4 ${colorClasses.text}`} />
                  <span className="truncate font-medium text-xs">{title}</span>
                  {isConfigured(key) && (
                    <div className="-top-1 -right-1 absolute h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content */}
          {LOG_TYPES.map(({ key, title, description, icon: Icon, color }) => {
            const colorClasses = getColorClasses(color);

            return (
              <TabsContent key={key} value={key} className="mt-6">
                <Card className="border-gray-800/50 bg-gray-900/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${colorClasses.bg} ${colorClasses.border} border`}
                      >
                        <Icon className={`h-5 w-5 ${colorClasses.text}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-white">
                          {title} Logs
                        </CardTitle>
                        <p className="mt-0.5 text-gray-400 text-sm">
                          {description}
                        </p>
                      </div>
                      {isConfigured(key) && (
                        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1">
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="font-medium text-emerald-400 text-xs">
                            Configured
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <DiscordChannelSelector
                          hubId={hubId}
                          value={
                            (logConfig[
                              `${key}ChannelId` as keyof LogConfig
                            ] as string) || ''
                          }
                          onChange={(value: string) =>
                            updateLogConfig(key, 'channelId', value)
                          }
                          onServerChange={(serverId: string) =>
                            handleServerChange(key, serverId)
                          }
                          label="Discord Channel"
                          placeholder="Select channel"
                          description="Where notifications will be sent"
                        />
                      </div>

                      <div className="space-y-2">
                        <DiscordRoleSelector
                          hubId={hubId}
                          serverId={serverIds[key]}
                          value={
                            (logConfig[
                              `${key}RoleId` as keyof LogConfig
                            ] as string) || ''
                          }
                          onChange={(value: string) =>
                            updateLogConfig(key, 'roleId', value)
                          }
                          label="Mention Role (Optional)"
                          placeholder="Select role"
                          description="Role to ping for notifications"
                        />
                      </div>
                    </div>

                    <Alert className="border-amber-500/30 bg-amber-950/30">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <AlertDescription className="text-amber-200 text-sm">
                        Make sure the InterChat bot has permission to send
                        messages and mention roles in the selected channel.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Unsaved Changes Prompt */}
      <UnsavedChangesPrompt
        isVisible={hasChanges}
        onSave={handleSaveLogConfig}
        onReset={resetForm}
        isSubmitting={isSaving || saveMutation.isPending}
        saveLabel="Save Configuration"
        resetLabel="Reset Configuration"
        message="You have unsaved logging configuration changes!"
      />

      {/* Page Footer - provides scroll space for mobile prompts */}
      <PageFooter height="md" message="Stay informed with proper logging! 📋" />
    </div>
  );
}
