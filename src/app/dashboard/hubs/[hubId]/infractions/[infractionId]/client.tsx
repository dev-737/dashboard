'use client';

import { useMutation } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Save,
  Server,
  Shield,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTRPC } from '@/utils/trpc';

interface AddInfractionClientProps {
  hubId: string;
  initialType?: 'user' | 'server';
  initialUserId?: string;
  initialServerId?: string;
}

export function AddInfractionClient({
  hubId,
  initialType = 'user',
  initialUserId,
  initialServerId,
}: AddInfractionClientProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const { toast } = useToast();

  // Generate unique IDs for form fields
  const userIdFieldId = useId();
  const serverIdFieldId = useId();
  const serverNameFieldId = useId();
  const reasonFieldId = useId();
  const expiresAtFieldId = useId();

  const [targetType, setTargetType] = useState<'user' | 'server'>(initialType);
  const [infractionType, setInfractionType] = useState<'BLACKLIST' | 'WARNING'>(
    'BLACKLIST'
  );
  const [userId, setUserId] = useState(initialUserId || '');
  const [serverId, setServerId] = useState(initialServerId || '');
  const [serverName, setServerName] = useState('');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState<'permanent' | 'temporary'>(
    'permanent'
  );
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createInfraction = useMutation(
    trpc.moderation.createInfraction.mutationOptions()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createInfraction.mutateAsync({
        hubId,
        type: infractionType,
        reason,
        expiresAt: duration === 'temporary' ? expiresAt : null,
        ...(targetType === 'user' ? { userId } : { serverId, serverName }),
      });
      toast({
        title: 'Success',
        description: `${infractionType.toLowerCase()} created successfully`,
      });
      router.push(`/dashboard/hubs/${hubId}/infractions`);
    } catch (error) {
      console.error('Error creating infraction:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create infraction',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (!reason.trim() || reason.length < 3) return false;
    if (targetType === 'user' && !userId.trim()) return false;
    if (targetType === 'server' && (!serverId.trim() || !serverName.trim()))
      return false;
    if (duration === 'temporary' && !expiresAt) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-gray-400 hover:text-white"
        >
          <Link href={`/dashboard/hubs/${hubId}/infractions`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Infractions
          </Link>
        </Button>
        <div className="h-6 w-px bg-gray-700" />
        <div>
          <h1 className="font-bold text-2xl text-white tracking-tight">
            Create Infraction
          </h1>
          <p className="text-gray-400 text-sm">
            Add a new infraction to this hub
          </p>
        </div>
      </div>
      <Alert
        variant="default"
        className="border-blue-500/30 bg-linear-to-r from-blue-950/40 to-indigo-950/40 backdrop-blur-sm"
      >
        <Shield className="h-5 w-5 text-blue-400" />
        <AlertTitle className="font-semibold text-blue-300">
          Infraction Guidelines
        </AlertTitle>
        <AlertDescription className="mt-2 text-gray-300">
          Infractions are permanent records of moderation actions. Blacklists
          prevent users/servers from participating in the hub, while warnings
          serve as formal notices. Choose the appropriate type and provide clear
          reasoning.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Target Type Selection */}
            <Card className="premium-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-(--radius-button) bg-purple-500/20 p-2">
                    <Shield className="h-4 w-4 text-purple-400" />
                  </div>
                  Target Selection
                </CardTitle>
                <CardDescription>
                  Choose what type of entity to create an infraction for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={targetType}
                  onValueChange={(value) =>
                    setTargetType(value as 'user' | 'server')
                  }
                >
                  <TabsList className="grid w-full grid-cols-2 rounded-(--radius-button) bg-gray-800/50">
                    <TabsTrigger
                      value="user"
                      className="rounded-(--radius) data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                    >
                      <User className="mr-2 h-4 w-4" />
                      User
                    </TabsTrigger>
                    <TabsTrigger
                      value="server"
                      className="rounded-(--radius) data-[state=active]:bg-linear-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white"
                    >
                      <Server className="mr-2 h-4 w-4" />
                      Server
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="user" className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={userIdFieldId}>User ID</Label>
                      <Input
                        id={userIdFieldId}
                        placeholder="Enter Discord User ID (e.g., 123456789012345678)"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="border-gray-700/50 bg-gray-900/50 focus:border-blue-500/50"
                      />
                      <p className="text-gray-400 text-xs">
                        Right-click on a user in Discord and select &quot;Copy
                        User ID&quot; (Developer Mode must be enabled)
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="server" className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={serverIdFieldId}>Server ID</Label>
                        <Input
                          id={serverIdFieldId}
                          placeholder="Enter Discord Server ID"
                          value={serverId}
                          onChange={(e) => setServerId(e.target.value)}
                          className="border-gray-700/50 bg-gray-900/50 focus:border-red-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={serverNameFieldId}>Server Name</Label>
                        <Input
                          id={serverNameFieldId}
                          placeholder="Enter server name"
                          value={serverName}
                          onChange={(e) => setServerName(e.target.value)}
                          className="border-gray-700/50 bg-gray-900/50 focus:border-red-500/50"
                        />
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs">
                      Right-click on a server in Discord and select &quot;Copy
                      Server ID&quot; (Developer Mode must be enabled)
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Infraction Type and Details */}
            <Card className="premium-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-(--radius-button) bg-red-500/20 p-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </div>
                  Infraction Details
                </CardTitle>
                <CardDescription>
                  Configure the type and details of the infraction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Infraction Type */}
                <div className="space-y-2">
                  <Label htmlFor="infractionType">Infraction Type</Label>
                  <Select
                    value={infractionType}
                    onValueChange={(value) =>
                      setInfractionType(value as 'BLACKLIST' | 'WARNING')
                    }
                  >
                    <SelectTrigger className="border-gray-700/50 bg-gray-900/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BLACKLIST">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          Blacklist - Prevents participation in hub
                        </div>
                      </SelectItem>
                      <SelectItem value="WARNING">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                          Warning - Formal notice without restrictions
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label htmlFor={reasonFieldId}>Reason</Label>
                  <Textarea
                    id={reasonFieldId}
                    placeholder="Provide a clear and detailed reason for this infraction..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[100px] border-gray-700/50 bg-gray-900/50 focus:border-red-500/50"
                    maxLength={500}
                  />
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Minimum 3 characters required</span>
                    <span>{reason.length}/500</span>
                  </div>
                </div>

                {/* Duration (only for BLACKLIST) */}
                {infractionType === 'BLACKLIST' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Select
                        value={duration}
                        onValueChange={(value) =>
                          setDuration(value as 'permanent' | 'temporary')
                        }
                      >
                        <SelectTrigger className="border-gray-700/50 bg-gray-900/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permanent">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-500" />
                              Permanent - No expiration
                            </div>
                          </SelectItem>
                          <SelectItem value="temporary">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-amber-500" />
                              Temporary - Set expiration date
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {duration === 'temporary' && (
                      <div className="space-y-2">
                        <Label htmlFor={expiresAtFieldId}>Expires At</Label>
                        <Input
                          id={expiresAtFieldId}
                          type="datetime-local"
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                          className="border-gray-700/50 bg-gray-900/50 focus:border-amber-500/50"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                        <p className="text-gray-400 text-xs">
                          The blacklist will automatically expire at this date
                          and time
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex items-center justify-between border-gray-800/50 border-t pt-6">
              <div className="text-gray-400 text-sm">
                {isFormValid()
                  ? 'Ready to create infraction'
                  : 'Please fill in all required fields'}
              </div>
              <Button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className={`px-8 py-2.5 font-semibold transition-all duration-300 ${
                  isFormValid() && !isSubmitting
                    ? 'bg-linear-to-r from-red-500 to-purple-500 shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-purple-600'
                    : 'cursor-not-allowed bg-gray-600/50 text-gray-400'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create{' '}
                    {infractionType === 'BLACKLIST' ? 'Blacklist' : 'Warning'}
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            <Card className="premium-card sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="rounded-(--radius-button) bg-amber-500/20 p-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  </div>
                  Moderation Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-(--radius) bg-red-500/20 p-1.5">
                      <Shield className="h-3.5 w-3.5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-200 text-sm">
                        Blacklists
                      </h3>
                      <p className="mt-1 text-gray-400 text-xs">
                        Completely prevent users/servers from participating in
                        the hub. Use for serious violations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-(--radius) bg-amber-500/20 p-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-200 text-sm">
                        Warnings
                      </h3>
                      <p className="mt-1 text-gray-400 text-xs">
                        Formal notices that don&apos;t restrict participation.
                        Good for first-time or minor violations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-(--radius) bg-blue-500/20 p-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-200 text-sm">
                        Temporary Blacklists
                      </h3>
                      <p className="mt-1 text-gray-400 text-xs">
                        Set expiration dates for blacklists to automatically
                        lift restrictions after a period.
                      </p>
                    </div>
                  </div>
                </div>

                <Alert
                  variant="default"
                  className="border-red-500/30 bg-linear-to-r from-red-950/40 to-orange-950/40"
                >
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertTitle className="text-red-300 text-sm">
                    Important
                  </AlertTitle>
                  <AlertDescription className="mt-1 text-gray-300 text-xs">
                    All infractions are permanent records. Be thorough with your
                    reasoning as this will be visible to other moderators.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
