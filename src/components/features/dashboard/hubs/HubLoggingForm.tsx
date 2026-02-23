'use client';

import {
  Alert01Icon,
  ArrowDown01Icon,
  Flag01Icon,
  Loading03Icon,
  LockIcon,
  Message02Icon,
  Notification03Icon,
  Shield01Icon,
  Tick01Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DiscordChannelSelector } from '@/components/discord/DiscordChannelSelector';
import { DiscordRoleSelector } from '@/components/discord/DiscordRoleSelector';
import { PageFooter } from '@/components/layout/DashboardPageFooter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { ResolvedLogConfigs } from '@/types/logging';
import { useTRPC } from '@/utils/trpc';
import { UnsavedChangesPrompt } from '../UnsavedChangesPrompt';

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
    icon: Shield01Icon,
    color: 'indigo',
  },
  {
    key: 'joinLeaves',
    title: 'Join/Leave',
    description: 'Monitor servers joining or leaving your hub',
    icon: UserMultipleIcon,
    color: 'emerald',
  },
  {
    key: 'appeals',
    title: 'Appeals',
    description: 'Receive blacklist appeal requests',
    icon: Message02Icon,
    color: 'blue',
  },
  {
    key: 'reports',
    title: 'Reports',
    description: 'Get notified when content is reported',
    icon: Flag01Icon,
    color: 'red',
  },
  {
    key: 'networkAlerts',
    title: 'Network Alerts',
    description: 'Important system notifications and alerts',
    icon: Notification03Icon,
    color: 'amber',
  },
  {
    key: 'messageModeration',
    title: 'Message',
    description: 'Log message deletions, edits, and moderation',
    icon: Message02Icon,
    color: 'purple',
  },
];

export function HubLoggingForm({
  hubId,
  initialLogConfig,
}: HubLoggingFormProps) {
  const trpc = useTRPC();

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
  const [resolvedConfigs, setResolvedConfigs] = useState<ResolvedLogConfigs>(
    {}
  );

  // Resolve log config details on mount
  const configsToResolve = LOG_TYPES.map(({ key }) => ({
    logType: key,
    channelId: initialLogConfig?.[`${key}ChannelId` as keyof LogConfig] as
      | string
      | null
      | undefined,
    roleId: initialLogConfig?.[`${key}RoleId` as keyof LogConfig] as
      | string
      | null
      | undefined,
  })).filter((c) => c.channelId || c.roleId);

  const {
    data: resolvedData,
    isLoading: isResolvingConfigs,
    error: resolveError,
  } = useQuery(
    trpc.server.resolveLogConfigDetails.queryOptions(
      { configs: configsToResolve },
      {
        enabled: configsToResolve.length > 0 && !!initialLogConfig,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      }
    )
  );

  // Update resolved configs when data is fetched
  useEffect(() => {
    if (resolvedData) {
      setResolvedConfigs(resolvedData);
    }
  }, [resolvedData]);

  // Log resolve errors
  useEffect(() => {
    if (resolveError) {
      console.error('Failed to resolve log configs:', resolveError);
    }
  }, [resolveError]);

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

      toast.success('Success', {
        description: 'Logging configuration saved successfully.',
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Error saving logging configuration:', error);
      toast.error('Error', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to save logging configuration',
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
      },
      emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
      },
      blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
      },
      red: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-400',
      },
      amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
      },
      purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
      },
    };
    return colors[color as keyof typeof colors] || colors.indigo;
  };

  return (
    <div className="mx-auto mt-6 max-w-4xl space-y-8">
      {/* Loading state during resolution */}
      {isResolvingConfigs && (
        <div className="flex items-center justify-center gap-2 py-8">
          <HugeiconsIcon
            strokeWidth={2}
            icon={Loading03Icon}
            className="h-5 w-5 animate-spin text-indigo-400"
          />
          <p className="text-gray-400">Loading configurations...</p>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4">
        {LOG_TYPES.map(({ key, title, description, icon: Icon, color }) => {
          const colorClasses = getColorClasses(color);
          const resolved = resolvedConfigs[key];
          const channelId = logConfig[`${key}ChannelId` as keyof LogConfig];
          const roleId = logConfig[`${key}RoleId` as keyof LogConfig];

          return (
            <Collapsible key={key} defaultOpen={true}>
              <Card className="border-gray-800/50 bg-gray-900/50">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${colorClasses.bg} ${colorClasses.border} border`}
                      >
                        <HugeiconsIcon
                          strokeWidth={2}
                          icon={Icon}
                          className={`h-5 w-5 ${colorClasses.text}`}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-lg text-white">
                          {title} Logs
                        </div>
                        <p className="mt-0.5 text-gray-400 text-sm">
                          {description}
                        </p>
                      </div>
                      {resolved && !resolved.userHasAccess && (
                        <HugeiconsIcon
                          strokeWidth={2}
                          icon={LockIcon}
                          className="h-4 w-4 text-amber-400"
                        />
                      )}
                      {isConfigured(key) && (
                        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1">
                          <HugeiconsIcon
                            strokeWidth={2}
                            icon={Tick01Icon}
                            className="h-3 w-3 text-emerald-400"
                          />
                          <span className="font-medium text-emerald-400 text-xs">
                            Configured
                          </span>
                        </div>
                      )}
                      <HugeiconsIcon
                        strokeWidth={2}
                        icon={ArrowDown01Icon}
                        className="h-5 w-5 text-gray-400 transition-transform duration-200 data-[state=open]:rotate-180"
                      />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-6 pt-0">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <DiscordChannelSelector
                          hubId={hubId}
                          value={(channelId as string) || ''}
                          onChange={(value: string) =>
                            updateLogConfig(key, 'channelId', value)
                          }
                          onServerChange={(serverId: string) =>
                            handleServerChange(key, serverId)
                          }
                          label="Discord Channel"
                          placeholder="Select channel"
                          description="Where notifications will be sent"
                          initialServerId={resolved?.channel?.serverId}
                          initialChannelId={channelId as string | null}
                          initialChannelName={resolved?.channel?.name}
                          initialServerName={resolved?.channel?.serverName}
                          isAccessible={resolved?.userHasAccess ?? true}
                          onAccessDenied={() => {
                            toast.error('Configuration Cleared', {
                              description:
                                'The log configuration has been removed.',
                            });
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <DiscordRoleSelector
                          hubId={hubId}
                          serverId={
                            serverIds[key] || resolved?.channel?.serverId
                          }
                          value={(roleId as string) || ''}
                          onChange={(value: string) =>
                            updateLogConfig(key, 'roleId', value)
                          }
                          label="Mention Role (Optional)"
                          placeholder="Select role"
                          description="Role to ping for notifications"
                          initialRoleId={roleId as string | null}
                          initialRoleName={resolved?.role?.name}
                          initialRoleColor={resolved?.role?.color}
                          isAccessible={resolved?.userHasAccess ?? true}
                          onAccessDenied={() => {
                            toast.error('Configuration Cleared', {
                              description:
                                'The role configuration has been removed.',
                            });
                          }}
                        />
                      </div>
                    </div>

                    {/* Warning if channel no longer exists */}
                    {resolved?.channel && !resolved.channel.exists && (
                      <Alert className="border-red-500/30 bg-red-950/30">
                        <HugeiconsIcon
                          strokeWidth={2}
                          icon={Alert01Icon}
                          className="h-4 w-4 text-red-400"
                        />
                        <AlertDescription className="text-red-200 text-sm">
                          This channel no longer exists. Please update the
                          configuration.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Warning if role no longer exists */}
                    {resolved?.role && !resolved.role.exists && (
                      <Alert className="border-red-500/30 bg-red-950/30">
                        <HugeiconsIcon
                          strokeWidth={2}
                          icon={Alert01Icon}
                          className="h-4 w-4 text-red-400"
                        />
                        <AlertDescription className="text-red-200 text-sm">
                          This role no longer exists. Please update the
                          configuration.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Alert className="border-amber-500/30 bg-amber-950/30">
                      <HugeiconsIcon
                        strokeWidth={2}
                        icon={Alert01Icon}
                        className="h-4 w-4 text-amber-400"
                      />
                      <AlertDescription className="text-amber-200 text-sm">
                        Make sure the InterChat bot has permission to send
                        messages and mention roles in the selected channel.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
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
