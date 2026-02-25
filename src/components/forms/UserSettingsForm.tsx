'use client';

import { Alert01Icon, Diamond01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';
import { toast } from 'sonner';
import { cancelSubscription } from '@/app/premium/actions';
import { UnsavedChangesPrompt } from '@/components/features/dashboard/UnsavedChangesPrompt';
import { PageFooter } from '@/components/layout/DashboardPageFooter';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { useTRPC } from '@/utils/trpc';

export function UserSettingsForm() {
    const trpc = useTRPC();

    const queryClient = useQueryClient();

    const mentionOnReplyId = useId();
    const showNsfwHubsId = useId();
    const languageSelectId = useId();

    const { data: settings } = useQuery(trpc.user.getSettings.queryOptions());

    const updateSettingsMutation = useMutation(
        trpc.user.updateSettings.mutationOptions({
            onSuccess: () => {
                toast.success('Settings saved', {
                    description: 'Your settings have been updated successfully.',
                });
                setHasChanges(false);
                queryClient.invalidateQueries(trpc.user.getSettings.pathFilter());
            },
            onError: (error) => {
                toast.error('Error', {
                    description: error.message,
                });
            },
        })
    );

    const cancelSubscriptionMutation = useMutation({
        mutationFn: cancelSubscription,
        onSuccess: (result) => {
            if (result.error) {
                toast.error('Failed to cancel subscription', {
                    description: result.error,
                });
                return;
            }
            toast.success('Subscription cancelled', {
                description: 'Your subscription will not auto-renew at the end of the billing period.',
            });
            queryClient.invalidateQueries(trpc.user.getSettings.pathFilter());
        },
        onError: (error) => {
            toast.error('Error', {
                description: error.message,
            });
        },
    });

    const [mentionOnReply, setMentionOnReply] = useState(false);
    const [locale, setLocale] = useState<string>('en');
    const [showNsfwHubs, setShowNsfwHubs] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Update local state when settings are loaded
    useEffect(() => {
        if (settings?.user) {
            setMentionOnReply(settings.user.mentionOnReply);
            setLocale(settings.user.locale || 'en');
            setShowNsfwHubs(settings.user.showNsfwHubs);
        }
    }, [settings]);

    // Track changes
    useEffect(() => {
        if (settings?.user) {
            const changed =
                mentionOnReply !== settings.user.mentionOnReply ||
                locale !== settings.user.locale ||
                showNsfwHubs !== settings.user.showNsfwHubs;
            setHasChanges(changed);
        }
    }, [mentionOnReply, locale, showNsfwHubs, settings]);

    const handleSaveSettings = async () => {
        if (!hasChanges) return;

        try {
            await updateSettingsMutation.mutateAsync({
                mentionOnReply,
                locale: locale as 'en' | 'es' | 'pt' | 'zh' | 'ru' | 'et' | 'hi',
                showNsfwHubs,
            });
        } catch {
            // Error handling is done in the mutation's onError callback
        }
    };

    // Reset form to original values
    const resetForm = () => {
        if (settings?.user) {
            setMentionOnReply(settings.user.mentionOnReply);
            setLocale(settings.user.locale || 'en');
            setShowNsfwHubs(settings.user.showNsfwHubs);
            setHasChanges(false);
        }
    };

    return (
        <div className="space-y-4">
            {settings?.activeKeys && settings.activeKeys.length > 0 && (
                <div className="mb-8 overflow-hidden rounded-xl border border-indigo-500/30 bg-indigo-950/20">
                    <div className="border-indigo-500/30 border-b bg-indigo-900/40 p-4">
                        <div className="flex items-center gap-2">
                            <HugeiconsIcon
                                strokeWidth={2}
                                icon={Diamond01Icon}
                                className="h-5 w-5 text-indigo-400"
                            />
                            <h3 className="font-semibold text-indigo-100">Premium Subscription</h3>
                        </div>
                    </div>
                    <div className="p-4 space-y-4">
                        {settings.activeKeys.map((key: any) => {
                            const sub = key.StripeSubscription;
                            if (!sub) return null;

                            const periodEnd = new Date(sub.currentPeriodEnd).toLocaleDateString();

                            return (
                                <div key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-white">Tier: {key.tier || 'Legacy'}</span>
                                            {sub.cancelAtPeriodEnd ? (
                                                <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30">Cancels at Period End</span>
                                            ) : (
                                                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">Active</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            Current billing period ends {periodEnd}
                                        </p>
                                    </div>

                                    {!sub.cancelAtPeriodEnd && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to cancel your premium subscription? You will retain access until the end of the current billing period.')) {
                                                    cancelSubscriptionMutation.mutate();
                                                }
                                            }}
                                            disabled={cancelSubscriptionMutation.isPending}
                                            className="whitespace-nowrap"
                                        >
                                            {cancelSubscriptionMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label htmlFor="mention-on-reply">Mention on Reply</Label>
                    <p className="text-gray-400 text-sm">
                        Get @ mentioned when someone replies to your messages
                    </p>
                </div>
                <Switch
                    id={mentionOnReplyId}
                    checked={mentionOnReply}
                    onCheckedChange={setMentionOnReply}
                    className="data-[state=checked]:bg-indigo-600"
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="show-nsfw-hubs">Show NSFW Hubs</Label>
                        <HugeiconsIcon
                            strokeWidth={2}
                            icon={Alert01Icon}
                            className="h-4 w-4 text-orange-400"
                        />
                    </div>
                    <p className="text-gray-400 text-sm">
                        Allow NSFW (adult content) hubs to appear in search results and
                        recommendations
                    </p>
                    <p className="text-orange-300 text-xs">
                        ⚠️ Only enable this if you are 18+ and want to see adult content
                    </p>
                </div>
                <Switch
                    id={showNsfwHubsId}
                    checked={showNsfwHubs}
                    onCheckedChange={setShowNsfwHubs}
                    className="data-[state=checked]:bg-orange-600"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="language-select">Language</Label>
                <p className="mb-2 text-gray-400 text-sm">
                    Select your preferred language (currently only affects the bot
                    responses, not the website)
                </p>
                <Select value={locale} onValueChange={(value) => setLocale(value)}>
                    <SelectTrigger
                        id={languageSelectId}
                        className="w-full border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50 md:w-[240px]"
                    >
                        <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="border border-gray-800 bg-gray-900">
                        {SUPPORTED_LANGUAGES.map((language) => (
                            <SelectItem key={language.code} value={language.code}>
                                {language.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Unsaved Changes Prompt */}
            <UnsavedChangesPrompt
                isVisible={hasChanges}
                onSave={handleSaveSettings}
                onReset={resetForm}
                isSubmitting={updateSettingsMutation.isPending}
                saveLabel="Save Settings01Icon"
                resetLabel="Reset Settings01Icon"
                message="Careful! You have unsaved user setting changes."
            />

            {/* Page Footer - provides scroll space for mobile prompts */}
            <PageFooter
                height="md"
                message="Perfect your experience with custom settings! 🎨"
            />
        </div>
    );
}
