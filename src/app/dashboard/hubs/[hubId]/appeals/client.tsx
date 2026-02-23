'use client';

import {
  Alert01Icon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Cancel01Icon,
  Clock01Icon,
  EyeIcon,
  FilterIcon,
  Message01Icon,
  Message02Icon,
  Rotate01Icon,
  Search01Icon,
  Shield01Icon,
  Tick01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';

import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import type { AppealStatus } from '@/lib/generated/prisma/client/client';
import { useTRPC } from '@/utils/trpc';

interface AppealUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface AppealInfraction {
  id: string;
  hubId: string;
  type: string;
  status: string;
  reason: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  hub: {
    id: string;
    name: string;
    iconUrl: string;
  };
  user: AppealUser | null;
  moderator: AppealUser | null;
  serverId?: string | null;
  serverName?: string | null;
}

interface Appeal {
  id: string;
  infractionId: string;
  userId: string;
  reason: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  user: AppealUser;
  infraction: AppealInfraction;
}

interface AppealsClientProps {
  hubId: string;
}

export function AppealsClient({ hubId }: AppealsClientProps) {
  const trpc = useTRPC();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [status, setStatus] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(
    searchParams.get('userId')
  );
  const [infractionId, setInfractionId] = useState<string | null>(
    searchParams.get('infractionId')
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery(
    trpc.appeal.list.queryOptions({
      hubId,
      status: (status as AppealStatus) || undefined,
      userId: userId ?? undefined,
      infractionId: infractionId ?? undefined,
      page,
      limit: itemsPerPage,
    })
  );

  useEffect(() => {
    if (data) {
      setAppeals(data.appeals as unknown as Appeal[]);
      setTotalPages(Math.ceil((data.total ?? 0) / itemsPerPage) || 1);
    }
  }, [data]);

  useEffect(() => {
    if (queryError) {
      const message =
        (queryError as { message?: string })?.message ||
        'Failed to fetch appeals';
      setError(message);
      toast.error('Error', { description: message });
    } else {
      setError(null);
    }
  }, [queryError]);

  useEffect(() => {
    // refetch on param changes
    refetch();
  }, [refetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset pagination when searching
    setPage(1);

    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchQuery.startsWith('user:')) {
      const userId = searchQuery.substring(5).trim();
      setUserId(userId);
      params.set('userId', userId);
      setInfractionId(null);
    } else if (searchQuery.startsWith('infraction:')) {
      const infractionId = searchQuery.substring(11).trim();
      setInfractionId(infractionId);
      params.set('infractionId', infractionId);
      setUserId(null);
    } else {
      // If no prefix, assume it's a user ID
      if (searchQuery) {
        setUserId(searchQuery);
        params.set('userId', searchQuery);
        setInfractionId(null);
      } else {
        setUserId(null);
        setInfractionId(null);
      }
    }

    // Update the URL without refreshing the page
    const url = new URL(window.location.href);
    url.search = params.toString();
    window.history.pushState({}, '', url.toString());

    refetch();
  };

  const resetFilters = () => {
    setStatus(null);
    setUserId(null);
    setInfractionId(null);
    setSearchQuery('');
    setPage(1);

    // Clear URL parameters
    router.push(`/dashboard/hubs/${hubId}/appeals`);
  };

  const handleAppealUpdate = useCallback(
    (appealId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
      setAppeals((prevAppeals) =>
        prevAppeals.map((appeal) =>
          appeal.id === appealId ? { ...appeal, status: newStatus } : appeal
        )
      );
    },
    []
  );

  // Count appeals by status (use real-time state)
  const pendingAppeals = appeals.filter(
    (appeal) => appeal.status === 'PENDING'
  ).length;
  const acceptedAppeals = appeals.filter(
    (appeal) => appeal.status === 'ACCEPTED'
  ).length;
  const rejectedAppeals = appeals.filter(
    (appeal) => appeal.status === 'REJECTED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-2xl text-white tracking-tight">
            Hub Appeals
          </h1>
          <p className="ray-400 text-g text-sm">
            Review and manage appeals for this hub
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="premium-card group transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={Message01Icon}
                  className="h-4 w-4 text-blue-400"
                />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Appeals</p>
                <p className="font-bold text-white text-xl">{appeals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="premium-card group transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/20 p-2">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={Clock01Icon}
                  className="h-4 w-4 text-yellow-400"
                />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="font-bold text-white text-xl">{pendingAppeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="premium-card group transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/20 p-2">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={Tick01Icon}
                  className="h-4 w-4 text-green-400"
                />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Accepted</p>
                <p className="font-bold text-white text-xl">
                  {acceptedAppeals}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="premium-card group transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500/20 p-2">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={Cancel01Icon}
                  className="h-4 w-4 text-red-400"
                />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="font-bold text-white text-xl">
                  {rejectedAppeals}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="premium-card">
        <CardHeader className="border-gray-800/50 border-b pb-3">
          <CardTitle className="flex items-center text-lg">
            <HugeiconsIcon
              strokeWidth={2}
              icon={FilterIcon}
              className="mr-2 h-4 w-4 text-indigo-400"
            />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <Label className="mb-1 block font-medium text-gray-400 text-sm">
                Status
              </Label>
              <Select
                value={status || 'all'}
                onValueChange={(value) =>
                  setStatus(value === 'all' ? null : value)
                }
              >
                <SelectTrigger className="cursor-pointer border-gray-800 bg-gray-900/50 transition-colors hover:bg-gray-900">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="border-gray-800 bg-gray-900">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 block font-medium text-gray-400 text-sm">
                Search01Icon
              </Label>
              <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
                <div className="min-w-50 flex-1">
                  <Input
                    placeholder="user:123456789 or infraction:abc123"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-gray-800 bg-gray-900/50 transition-colors hover:bg-gray-900"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="secondary"
                    size="icon"
                    className="cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <HugeiconsIcon
                      strokeWidth={2}
                      icon={Search01Icon}
                      className="h-4 w-4"
                    />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={resetFilters}
                    className="cursor-pointer border-gray-700 hover:bg-gray-800 hover:text-white"
                  >
                    <HugeiconsIcon
                      strokeWidth={2}
                      icon={Rotate01Icon}
                      className="h-4 w-4"
                    />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appeals List */}
      <Card className="premium-card">
        <CardHeader className="border-gray-800/50 border-b pb-3">
          <CardTitle className="flex items-center text-lg">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Message01Icon}
              className="mr-2 h-4 w-4 text-blue-400"
            />
            Appeals List
          </CardTitle>
          <CardDescription>
            {userId
              ? `Showing appeals from user ID: ${userId}`
              : infractionId
                ? `Showing appeals for infraction ID: ${infractionId}`
                : 'Showing all appeals for this hub'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map(
                (skeletonId) => (
                  <AppealSkeleton key={skeletonId} />
                )
              )}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 py-8 text-center">
              <HugeiconsIcon
                strokeWidth={2}
                icon={Alert01Icon}
                className="mx-auto mb-4 h-12 w-12 text-red-500"
              />
              <h3 className="mb-2 font-medium text-lg">
                Error Loading Appeals
              </h3>
              <p className="mb-4 text-gray-400">{error}</p>
              <Button
                onClick={() => refetch()}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          ) : appeals.length === 0 ? (
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6 py-8 text-center">
              <HugeiconsIcon
                strokeWidth={2}
                icon={Message01Icon}
                className="mx-auto mb-4 h-12 w-12 text-gray-500"
              />
              <h3 className="mb-2 font-medium text-lg">No Appeals Found</h3>
              <p className="mb-4 text-gray-400">
                {userId
                  ? 'This user has not submitted any appeals for this hub.'
                  : infractionId
                    ? 'There are no appeals for this infraction.'
                    : 'There are no appeals for this hub yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appeals.map((appeal) => (
                <AppealCard
                  key={appeal.id}
                  appeal={appeal}
                  hubId={hubId}
                  onUpdate={handleAppealUpdate}
                />
              ))}
            </div>
          )}
        </CardContent>
        {!isLoading && appeals.length > 0 && totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 border-gray-800/50 border-t px-6 pt-4 pb-6 sm:flex-row">
            <div className="order-2 flex items-center gap-2 text-gray-400 text-sm sm:order-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/50">
                <span className="text-xs">{page}</span>
              </div>
              <span>of {totalPages} pages</span>
            </div>
            <div className="order-1 flex w-full gap-2 sm:order-2 sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex-1 border-gray-700 hover:bg-gray-800 hover:text-white sm:flex-initial"
              >
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={ArrowLeftIcon}
                  className="mr-1 h-4 w-4"
                />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex-1 border-gray-700 hover:bg-gray-800 hover:text-white sm:flex-initial"
              >
                Next
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={ArrowRightIcon}
                  className="ml-1 h-4 w-4"
                />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

interface AppealCardProps {
  appeal: Appeal;
  hubId: string;
  onUpdate: (appealId: string, newStatus: 'ACCEPTED' | 'REJECTED') => void;
}

function AppealCard({ appeal, hubId, onUpdate }: AppealCardProps) {
  const trpc = useTRPC();

  const [isUpdating, setIsUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState(appeal.status);
  const updateStatus = useMutation(trpc.appeal.updateStatus.mutationOptions());

  const handleStatusChange = async (newStatus: 'ACCEPTED' | 'REJECTED') => {
    setIsUpdating(true);
    const previousStatus = localStatus;
    setLocalStatus(newStatus);
    updateStatus.mutate(
      { appealId: appeal.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            `Appeal ${newStatus === 'ACCEPTED' ? 'Accepted' : 'Rejected'}`,
            {
              description:
                newStatus === 'ACCEPTED'
                  ? 'The infraction has been appealed.'
                  : 'The appeal has been rejected.',
            }
          );
          onUpdate(appeal.id, newStatus);
        },
        onError: (error) => {
          setLocalStatus(previousStatus);
          toast.error('Error', {
            description:
              error.message || `Failed to ${newStatus.toLowerCase()} appeal`,
          });
        },
        onSettled: () => setIsUpdating(false),
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Clock01Icon}
              className="h-3 w-3"
            />
            Pending
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-green-400 text-xs">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Tick01Icon}
              className="h-3 w-3"
            />
            Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-red-400 text-xs">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Cancel01Icon}
              className="h-3 w-3"
            />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getInfractionTypeBadge = (type: string) => {
    switch (type) {
      case 'BLACKLIST':
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-red-400 text-xs">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Shield01Icon}
              className="h-3 w-3"
            />
            Blacklist
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-1 text-orange-400 text-xs">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Alert01Icon}
              className="h-3 w-3"
            />
            Warning
          </span>
        );
      default:
        return null;
    }
  };

  const submittedAt = formatDistanceToNow(new Date(appeal.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="premium-card overflow-hidden rounded-lg">
      <div className="flex flex-col justify-between gap-2 border-gray-800 border-b bg-gray-900/50 px-4 py-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-gray-700/50">
            <Image
              src={
                appeal.user.image ||
                'https://api.dicebear.com/7.x/shapes/svg?seed=user'
              }
              alt={appeal.user.name || 'Unknown User'}
              width={40}
              height={40}
              className="object-cover"
              style={{ width: '100%', height: '100%' }}
              unoptimized
            />
          </div>
          <div>
            <div className="font-medium text-white">
              {appeal.user.name || 'Unknown User'}
            </div>
            <div className="text-gray-400 text-xs">
              User ID: {appeal.userId}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {getInfractionTypeBadge(appeal.infraction.type)}
          {getStatusBadge(localStatus)}
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Clock01Icon}
              className="h-3 w-3"
            />
            {submittedAt}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Appeal Reason */}
        <div className="mb-4">
          <h4 className="mb-2 font-medium text-gray-300 text-sm">
            Appeal Reason:
          </h4>
          <div className="rounded-md border border-gray-800/50 bg-gray-900/50 p-3">
            <p className="text-gray-300 text-sm">{appeal.reason}</p>
          </div>
        </div>

        {/* Original Infraction Details */}
        <div className="mb-6">
          <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-300 text-sm">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Shield01Icon}
              className="h-4 w-4 text-red-400"
            />
            Original Infraction Details
          </h4>

          <div className="space-y-4">
            {/* Infraction Header */}
            <div className="rounded-lg border border-gray-700 bg-gray-900/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getInfractionTypeBadge(appeal.infraction.type)}
                  <Badge
                    variant="outline"
                    className={
                      appeal.infraction.status === 'ACTIVE'
                        ? 'border-green-500/50 bg-green-500/10 text-green-400'
                        : appeal.infraction.status === 'REVOKED'
                          ? 'border-gray-500/50 bg-gray-500/10 text-gray-400'
                          : 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                    }
                  >
                    {appeal.infraction.status}
                  </Badge>
                </div>
                <div className="text-gray-400 text-xs">
                  ID: {appeal.infraction.id}
                </div>
              </div>

              {/* Infraction Metadata */}
              <div className="mb-4 grid grid-cols-1 gap-3 rounded border border-gray-700/50 bg-gray-800/50 p-3 md:grid-cols-2">
                <div className="text-xs">
                  <span className="text-gray-400">Issued:</span>
                  <div className="mt-1 text-gray-300">
                    {new Date(appeal.infraction.createdAt).toLocaleString()}
                  </div>
                </div>
                {appeal.infraction.expiresAt && (
                  <div className="text-xs">
                    <span className="text-gray-400">Expires:</span>
                    <div className="mt-1 text-gray-300">
                      {new Date(appeal.infraction.expiresAt).toLocaleString()}
                    </div>
                  </div>
                )}
                <div className="text-xs">
                  <span className="text-gray-400">Target01Icon:</span>
                  <div className="mt-1 text-gray-300">
                    {appeal.infraction.user ? (
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          strokeWidth={2}
                          icon={UserIcon}
                          className="h-3 w-3"
                        />
                        {appeal.infraction.user.name || 'Unknown User'}
                      </div>
                    ) : appeal.infraction.serverName ? (
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          strokeWidth={2}
                          icon={Message02Icon}
                          className="h-3 w-3"
                        />
                        {appeal.infraction.serverName}
                      </div>
                    ) : (
                      'Unknown Target01Icon'
                    )}
                  </div>
                </div>
                {appeal.infraction.moderator && (
                  <div className="text-xs">
                    <span className="text-gray-400">Issued by:</span>
                    <div className="mt-1 flex items-center gap-2">
                      {appeal.infraction.moderator.image && (
                        <Image
                          src={appeal.infraction.moderator.image}
                          alt={appeal.infraction.moderator.name || 'Moderator'}
                          width={16}
                          height={16}
                          className="rounded-full"
                          unoptimized
                        />
                      )}
                      <span className="text-gray-300">
                        {appeal.infraction.moderator.name ||
                          'Unknown Moderator'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Infraction Reason */}
              <div className="rounded border border-gray-700/50 bg-gray-800/50 p-3">
                <div className="mb-2 text-gray-400 text-xs">
                  Infraction Reason:
                </div>
                <div className="text-gray-200 text-sm leading-relaxed">
                  {appeal.infraction.reason}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-gray-700/50 bg-gray-800/50 transition-all hover:bg-gray-700/50 hover:text-blue-400 sm:w-auto"
            asChild
          >
            <Link
              href={`/dashboard/hubs/${hubId}/infractions/${appeal.infractionId}/view`}
            >
              <HugeiconsIcon
                strokeWidth={2}
                icon={EyeIcon}
                className="mr-1 h-3 w-3"
              />
              View Infraction
            </Link>
          </Button>

          {localStatus === 'PENDING' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-red-500/30 text-red-500 hover:border-red-700/50 hover:bg-red-900/30 hover:text-red-300 sm:w-auto"
                onClick={() => handleStatusChange('REJECTED')}
                disabled={isUpdating}
              >
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={Cancel01Icon}
                  className="mr-1 h-4 w-4"
                />
                Reject
              </Button>
              <Button
                variant="default"
                size="sm"
                className="w-full border-none bg-linear-to-r from-green-600 to-green-700 hover:from-green-600/80 hover:to-green-700/80 sm:w-auto"
                onClick={() => handleStatusChange('ACCEPTED')}
                disabled={isUpdating}
              >
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={Tick01Icon}
                  className="mr-1 h-4 w-4"
                />
                Accept
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AppealSkeleton() {
  return (
    <div className="premium-card overflow-hidden rounded-lg">
      <div className="flex flex-col justify-between gap-2 border-gray-800 border-b bg-gray-900/50 px-4 py-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="mb-1 h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <Skeleton className="mb-2 h-4 w-24" />
          <div className="rounded-md border border-gray-800/50 bg-gray-900/50 p-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        </div>

        <div className="mb-4">
          <Skeleton className="mb-2 h-4 w-32" />
          <div className="rounded-md border border-gray-800/50 bg-gray-900/50 p-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Skeleton className="h-9 w-full sm:w-32" />
          <Skeleton className="h-9 w-full sm:w-20" />
          <Skeleton className="h-9 w-full sm:w-20" />
        </div>
      </div>
    </div>
  );
}
