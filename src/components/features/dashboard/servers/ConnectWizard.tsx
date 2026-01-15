'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Hash,
  Loader2,
  MessageSquare,
  Search,
  Server,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
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
import { ChannelIcon } from '@/components/discord/ChannelIcon';

interface HubData {
  id: string;
  name: string;
  iconUrl: string;
  description: string;
}

interface ChannelData {
  id: string;
  name: string;
  type: number;
  parentId: string | null;
  parentName: string | null;
}

interface ConnectWizardProps {
  serverName: string;
  serverIcon: string | null;
  serverId: string;
  hubs: HubData[];
  channels: ChannelData[];
  onConnect: (hubId: string, channelId: string) => Promise<void>;
  onValidateInvite: (code: string) => Promise<HubData | null>;
  isSubmitting: boolean;
  preselectedHub?: HubData | null;
  hubLoadError?: string | null;
}

export function ConnectWizard({
  serverName,
  serverIcon,
  serverId,
  hubs,
  channels,
  onConnect,
  onValidateInvite,
  isSubmitting,
  preselectedHub,
  hubLoadError,
}: ConnectWizardProps) {
  const [step, setStep] = useState(preselectedHub ? 2 : 1);
  const [selectedHub, setSelectedHub] = useState<HubData | null>(
    preselectedHub || null
  );
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [inviteCode, setInviteCode] = useState('');
  const [isValidatingInvite, setIsValidatingInvite] = useState(false);
  const [hubSearchQuery, setHubSearchQuery] = useState('');
  const [channelSearchQuery, setChannelSearchQuery] = useState('');

  // Filter hubs
  const filteredHubs = hubs.filter((hub) =>
    hub.name.toLowerCase().includes(hubSearchQuery.toLowerCase())
  );

  // Filter channels
  const filteredChannels = channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(channelSearchQuery.toLowerCase()) ||
      channel.parentName
        ?.toLowerCase()
        .includes(channelSearchQuery.toLowerCase())
  );

  const handleInviteValidation = async () => {
    if (!inviteCode.trim()) return;
    setIsValidatingInvite(true);
    try {
      const hub = await onValidateInvite(inviteCode);
      if (hub) {
        setSelectedHub(hub);
        setStep(2);
      }
    } finally {
      setIsValidatingInvite(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedHub) setStep(2);
    else if (step === 2 && selectedChannel) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8 flex justify-center">
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  step >= s
                    ? 'border-indigo-500 bg-indigo-500 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-400'
                }`}
              >
                {step > s ? <Check className="h-5 w-5" /> : <span>{s}</span>}
              </div>
              {s < 3 && (
                <div
                  className={`mx-4 h-1 w-16 rounded-full transition-colors ${
                    step > s ? 'bg-indigo-500' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">
                Choose a Destination
              </h2>
              <p className="text-gray-400">
                Select a hub or join via invite code
              </p>
            </div>

            {hubLoadError && (
              <Card className="border-red-500/50 bg-linear-to-r from-red-900/20 to-red-800/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                    <div>
                      <h3 className="font-medium text-red-300">
                        Hub Loading Failed
                      </h3>
                      <p className="mt-1 text-red-200 text-sm">
                        {hubLoadError}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Invite Code Card */}
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-400" />
                    Have an Invite?
                  </CardTitle>
                  <CardDescription>
                    Enter a code to join a private hub
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter invite code..."
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="bg-gray-950/50"
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleInviteValidation()
                      }
                    />
                    <Button
                      onClick={handleInviteValidation}
                      disabled={isValidatingInvite || !inviteCode.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isValidatingInvite ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Hub Search Card */}
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    Your Hubs
                  </CardTitle>
                  <CardDescription>Connect to a hub you manage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search hubs..."
                      value={hubSearchQuery}
                      onChange={(e) => setHubSearchQuery(e.target.value)}
                      className="pl-9 bg-gray-950/50"
                    />
                  </div>
                  <div className="h-[200px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                    {filteredHubs.map((hub) => (
                      <button
                        type="button"
                        key={hub.id}
                        onClick={() => {
                          setSelectedHub(hub);
                          setStep(2);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-gray-800 transition-colors text-left group"
                      >
                        <Image
                          src={
                            hub.iconUrl ||
                            `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(hub.id)}`
                          }
                          alt={hub.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate group-hover:text-indigo-400 transition-colors">
                            {hub.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {hub.description}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                    {filteredHubs.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No hubs found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">
                Select a Channel
              </h2>
              <p className="text-gray-400">
                Which channel in <strong>{serverName}</strong> should link to{' '}
                <strong>{selectedHub?.name}</strong>?
              </p>
            </div>

            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm max-w-2xl mx-auto">
              <CardContent className="p-6">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search channels..."
                    value={channelSearchQuery}
                    onChange={(e) => setChannelSearchQuery(e.target.value)}
                    className="pl-9 bg-gray-950/50"
                  />
                </div>

                <div className="h-[300px] overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                  {filteredChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 transition-colors text-left ${
                        selectedChannel === channel.id
                          ? 'bg-indigo-500/20 border border-indigo-500/50'
                          : 'hover:bg-gray-800 border border-transparent'
                      }`}
                    >
                      <ChannelIcon
                        type={channel.type}
                        className={`h-5 w-5 ${
                          selectedChannel === channel.id
                            ? 'text-indigo-400'
                            : 'text-gray-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium truncate ${
                            selectedChannel === channel.id
                              ? 'text-indigo-300'
                              : 'text-gray-300'
                          }`}
                        >
                          {channel.name}
                        </div>
                        {channel.parentName && (
                          <div className="text-xs text-gray-500 truncate">
                            in {channel.parentName}
                          </div>
                        )}
                      </div>
                      {selectedChannel === channel.id && (
                        <Check className="h-4 w-4 text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t border-gray-800">
                  <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!selectedChannel}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 text-center"
          >
            <div>
              <h2 className="text-2xl font-bold text-white">
                Ready to Connect?
              </h2>
              <p className="text-gray-400">Review your connection details</p>
            </div>

            <div className="flex items-center justify-center gap-8">
              {/* Server */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-20 w-20">
                  <Image
                    src={
                      serverIcon
                        ? `https://cdn.discordapp.com/icons/${serverId}/${serverIcon}.png?size=128`
                        : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(serverId)}`
                    }
                    alt={serverName}
                    fill
                    className="rounded-full object-cover ring-4 ring-gray-800"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gray-800 rounded-full p-1.5">
                    <Server className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-white">{serverName}</div>
                  <div className="text-sm text-gray-500">
                    #{channels.find((c) => c.id === selectedChannel)?.name}
                  </div>
                </div>
              </div>

              {/* Connection Line */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-0.5 w-16 bg-linear-to-r from-gray-700 via-indigo-500 to-gray-700" />
                <div className="rounded-full bg-indigo-500/20 p-2">
                  <ArrowRight className="h-4 w-4 text-indigo-400" />
                </div>
              </div>

              {/* Hub */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-20 w-20">
                  <Image
                    src={
                      selectedHub?.iconUrl ||
                      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(selectedHub?.id || '')}`
                    }
                    alt={selectedHub?.name || ''}
                    fill
                    className="rounded-full object-cover ring-4 ring-gray-800"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gray-800 rounded-full p-1.5">
                    <Shield className="h-4 w-4 text-indigo-400" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-white">
                    {selectedHub?.name}
                  </div>
                  <div className="text-sm text-gray-500">Target Hub</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-8">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                size="lg"
                onClick={() =>
                  selectedHub && onConnect(selectedHub.id, selectedChannel)
                }
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Confirm Connection
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
