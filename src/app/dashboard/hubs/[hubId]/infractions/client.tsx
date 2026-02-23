'use client';

import {
  Alert01Icon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Clock01Icon,
  EyeIcon,
  FilterIcon,
  Home01Icon,
  LegalHammerIcon,
  Message02Icon,
  PlusSignCircleIcon,
  Rotate01Icon,
  Search01Icon,
  ServerStackIcon,
  Shield01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';

import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { toast } from 'sonner';
import { InfractionRevokeModal } from '@/components/features/moderation/InfractionRevokeModal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import type {
  InfractionStatus,
  InfractionType,
} from '@/lib/generated/prisma/client/client';
import { useTRPC } from '@/utils/trpc';

interface InfractionUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface InfractionHub {
  id: string;
  name: string;
  iconUrl: string;
}

interface Infraction {
  id: string;
  hubId: string;
  type: InfractionType;
  status: InfractionStatus;
  moderatorId: string;
  reason: string;
  expiresAt: string | null;
  appealedAt: string | null;
  appealedBy: string | null;
  notified: boolean;
  userId: string | null;
  serverId: string | null;
  serverName: string | null;
  createdAt: string;
  updatedAt: string;
  hub: InfractionHub;
  moderator: InfractionUser | null;
  user: InfractionUser | null;
}

interface InfractionsClientProps {
  hubId: string;
}

export function InfractionsClient({ hubId }: InfractionsClientProps) {
  const trpc = useTRPC();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Generate unique IDs for form fields
  const typeFilterId = useId();
  const statusFilterId = useId();
  const targetTypeFilterId = useId();
  const searchFieldId = useId();

  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [type, setType] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(
    searchParams.get('userId')
  );
  const [serverId, setServerId] = useState<string | null>(
    searchParams.get('serverId')
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;

  // Modal state
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedInfraction, setSelectedInfraction] =
    useState<Infraction | null>(null);

  const typeFilter =
    type === 'BLACKLIST' || type === 'WARNING'
      ? (type as unknown as InfractionType)
      : undefined;
  const statusFilter =
    status === 'ACTIVE' || status === 'REVOKED' || status === 'APPEALED'
      ? (status as unknown as InfractionStatus)
      : undefined;
  const targetTypeFilter =
    targetType === 'user' || targetType === 'server' ? targetType : undefined;

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery(
    trpc.moderation.getInfractions.queryOptions({
      hubId,
      type: typeFilter,
      status: statusFilter,
      targetType: targetTypeFilter,
      userId: userId || undefined,
      serverId: serverId || undefined,
      page,
      limit: itemsPerPage,
    })
  );

  useEffect(() => {
    setLoading(isLoading);
    if (queryError) {
      const msg =
        queryError instanceof Error
          ? queryError.message
          : 'Failed to fetch infractions';
      setError(msg);
      toast.error('Error', { description: msg });
    } else {
      setError(null);
    }
    if (data) {
      setInfractions(data.infractions as unknown as Infraction[]);
      setTotalPages(
        data.totalPages || Math.ceil((data.total || 0) / itemsPerPage) || 1
      );
    }
  }, [data, isLoading, queryError]);

  useEffect(() => {
    // trigger refetch when filters change via input bindings
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
      setServerId(null);
    } else if (searchQuery.startsWith('server:')) {
      const serverId = searchQuery.substring(7).trim();
      setServerId(serverId);
      params.set('serverId', serverId);
      setUserId(null);
    } else {
      // If no prefix, assume it's a user ID
      if (searchQuery) {
        setUserId(searchQuery);
        params.set('userId', searchQuery);
        setServerId(null);
      } else {
        setUserId(null);
        setServerId(null);
      }
    }

    // Update the URL without refreshing the page
    const url = new URL(window.location.href);
    url.search = params.toString();
    window.history.pushState({}, '', url.toString());

    refetch();
  };

  const resetFilters = () => {
    setType(null);
    setStatus(null);
    setTargetType(null);
    setUserId(null);
    setServerId(null);
    setSearchQuery('');
    setPage(1);

    // Clear URL parameters
    router.push(`/dashboard/hubs/${hubId}/infractions`);
  };

  const handleRevokeClick = (infraction: Infraction) => {
    setSelectedInfraction(infraction);
    setRevokeModalOpen(true);
  };

  const handleRevokeSuccess = () => {
    // Refetch the data to update the UI
    refetch();
    setSelectedInfraction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-2xl text-white tracking-tight">
            Hub Infractions
          </h1>
          <p className="text-gray-400 text-sm">
            Manage and review infractions for this hub
          </p>
        </div>
        <Button
          asChild
          className="btn-primary w-full border-none text-white sm:w-auto"
        >
          <Link href={`/dashboard/hubs/${hubId}/infractions/add`}>
            <HugeiconsIcon icon={PlusSignCircleIcon} className="mr-2 h-4 w-4" />
            Add Infraction
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="premium-card group transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-400 text-sm">
                  Total Infractions
                </p>
                <p className="mt-1 font-bold text-2xl text-white">
                  {infractions.length}
                </p>
              </div>
              <div className="rounded-(--radius-button) bg-linear-to-br from-purple-500/20 to-indigo-500/20 p-3 transition-transform group-hover:scale-110">
                <HugeiconsIcon
                  icon={Shield01Icon}
                  className="h-5 w-5 text-purple-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card group transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-400 text-sm">Active</p>
                <p className="mt-1 font-bold text-2xl text-emerald-400">
                  {infractions.filter((i) => i.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="rounded-(--radius-button) bg-linear-to-br from-emerald-500/20 to-green-500/20 p-3 transition-transform group-hover:scale-110">
                <HugeiconsIcon
                  icon={Alert01Icon}
                  className="h-5 w-5 text-emerald-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card group transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-400 text-sm">Appeals</p>
                <p className="mt-1 font-bold text-2xl text-blue-400">
                  {infractions.filter((i) => i.appealedAt).length}
                </p>
              </div>
              <div className="rounded-(--radius-button) bg-linear-to-br from-blue-500/20 to-cyan-500/20 p-3 transition-transform group-hover:scale-110">
                <HugeiconsIcon
                  icon={Message02Icon}
                  className="h-5 w-5 text-blue-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card group transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-400 text-sm">Revoked</p>
                <p className="mt-1 font-bold text-2xl text-gray-400">
                  {infractions.filter((i) => i.status === 'REVOKED').length}
                </p>
              </div>
              <div className="rounded-(--radius-button) bg-linear-to-br from-gray-500/20 to-slate-500/20 p-3 transition-transform group-hover:scale-110">
                <HugeiconsIcon
                  icon={Rotate01Icon}
                  className="h-5 w-5 text-gray-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="premium-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="rounded-(--radius-button) bg-indigo-500/20 p-2">
              <HugeiconsIcon
                icon={FilterIcon}
                className="h-4 w-4 text-indigo-400"
              />
            </div>
            Advanced Filters
          </CardTitle>
          <CardDescription>
            FilterIcon infractions by type, status, target, or search for
            specific IDs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label
                htmlFor="type-filter"
                className="font-medium text-gray-300 text-sm"
              >
                Infraction Type
              </Label>
              <Select
                value={type || 'all'}
                onValueChange={(value) =>
                  setType(value === 'all' ? null : value)
                }
              >
                <SelectTrigger
                  id={typeFilterId}
                  className="rounded-(--radius-button) border-gray-700/50 bg-gray-900/50 transition-all hover:bg-gray-800/50 focus:border-purple-500/50"
                >
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="rounded-(--radius-button) border-gray-700/50 bg-gray-900">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="BLACKLIST">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      Blacklist
                    </div>
                  </SelectItem>
                  <SelectItem value="WARNING">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      Warning
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="status-filter"
                className="font-medium text-gray-300 text-sm"
              >
                Status
              </Label>
              <Select
                value={status || 'all'}
                onValueChange={(value) =>
                  setStatus(value === 'all' ? null : value)
                }
              >
                <SelectTrigger
                  id={statusFilterId}
                  className="rounded-(--radius-button) border-gray-700/50 bg-gray-900/50 transition-all hover:bg-gray-800/50 focus:border-emerald-500/50"
                >
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-(--radius-button) border-gray-700/50 bg-gray-900">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="REVOKED">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-500" />
                      Revoked
                    </div>
                  </SelectItem>
                  <SelectItem value="APPEALED">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      Appealed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="target-filter"
                className="font-medium text-gray-300 text-sm"
              >
                Target01Icon Type
              </Label>
              <Select
                value={targetType || 'all'}
                onValueChange={(value) =>
                  setTargetType(value === 'all' ? null : value)
                }
              >
                <SelectTrigger
                  id={targetTypeFilterId}
                  className="rounded-(--radius-button) border-gray-700/50 bg-gray-900/50 transition-all hover:bg-gray-800/50 focus:border-blue-500/50"
                >
                  <SelectValue placeholder="All Targets" />
                </SelectTrigger>
                <SelectContent className="rounded-(--radius-button) border-gray-700/50 bg-gray-900">
                  <SelectItem value="all">All Targets</SelectItem>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={UserIcon}
                        className="h-3 w-3 text-blue-400"
                      />
                      UserMultipleIcon Only
                    </div>
                  </SelectItem>
                  <SelectItem value="server">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={ServerStackIcon}
                        className="h-3 w-3 text-orange-400"
                      />
                      Servers Only
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="search-input"
                className="font-medium text-gray-300 text-sm"
              >
                Search01Icon by ID
              </Label>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id={searchFieldId}
                    placeholder="user:123456789 or server:123456789"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-(--radius-button) border-gray-700/50 bg-gray-900/50 transition-all hover:bg-gray-800/50 focus:border-indigo-500/50"
                  />
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-(--radius-button) border-none bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  <HugeiconsIcon icon={Search01Icon} className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={resetFilters}
                  className="rounded-(--radius-button) border-gray-700/50 hover:bg-gray-800/50 hover:text-white"
                >
                  <HugeiconsIcon icon={Rotate01Icon} className="h-4 w-4" />
                </Button>
              </form>
              <p className="mt-1 text-gray-400 text-xs">
                Use prefixes like &quot;user:&quot; or &quot;server:&quot; to
                search for specific IDs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="premium-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="rounded-(--radius-button) bg-purple-500/20 p-2">
              <HugeiconsIcon
                icon={Shield01Icon}
                className="h-5 w-5 text-purple-400"
              />
            </div>
            Infractions List
          </CardTitle>
          <CardDescription className="mt-2 text-gray-300">
            {(() => {
              if (userId) return `Showing infractions for user ID: ${userId}`;
              if (serverId)
                return `Showing infractions for server ID: ${serverId}`;
              return 'Showing all infractions for this hub';
            })()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from(
                { length: 5 },
                (_, i) => `infraction-skeleton-${i}`
              ).map((skeletonId) => (
                <InfractionSkeleton key={skeletonId} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-(--radius) border border-red-500/30 bg-linear-to-br from-red-950/30 to-red-900/20 p-8 py-12 text-center">
              <div className="mx-auto mb-6 w-fit rounded-(--radius-button) bg-red-500/20 p-4">
                <HugeiconsIcon
                  icon={Alert01Icon}
                  className="h-8 w-8 text-red-400"
                />
              </div>
              <h3 className="mb-3 font-semibold text-white text-xl">
                Error Loading Infractions
              </h3>
              <p className="mx-auto mb-6 max-w-md text-gray-300">{error}</p>
              <Button
                onClick={() => refetch()}
                className="rounded-(--radius-button) border-none bg-linear-to-r from-red-500 to-red-600 px-6 text-white hover:from-red-600 hover:to-red-700"
              >
                <HugeiconsIcon icon={Rotate01Icon} className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : infractions.length === 0 ? (
            <div className="rounded-(--radius) border border-gray-700/50 bg-linear-to-br from-gray-900/50 to-gray-800/30 p-8 py-12 text-center">
              <div className="mx-auto mb-6 w-fit rounded-(--radius-button) bg-gray-500/20 p-4">
                <HugeiconsIcon
                  icon={Shield01Icon}
                  className="h-8 w-8 text-gray-400"
                />
              </div>
              <h3 className="mb-3 font-semibold text-white text-xl">
                No Infractions Found
              </h3>
              <p className="mx-auto mb-6 max-w-md text-gray-300">
                {(() => {
                  if (userId)
                    return 'This user has no infractions in this hub.';
                  if (serverId)
                    return 'This server has no infractions in this hub.';
                  return 'There are no infractions in this hub yet.';
                })()}
              </p>
              <Button
                asChild
                className="rounded-(--radius-button) border-none bg-linear-to-r from-purple-500 to-indigo-500 px-6 text-white hover:from-purple-600 hover:to-indigo-600"
              >
                <Link href={`/dashboard/hubs/${hubId}/infractions/add`}>
                  <HugeiconsIcon
                    icon={PlusSignCircleIcon}
                    className="mr-2 h-4 w-4"
                  />
                  Create First Infraction
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {infractions.map((infraction) => (
                <InfractionCard
                  key={infraction.id}
                  infraction={infraction}
                  onRevokeClick={handleRevokeClick}
                />
              ))}
            </div>
          )}
        </CardContent>
        {!loading && infractions.length > 0 && (
          <CardFooter className="flex flex-col items-center justify-between gap-4 border-gray-800/50 border-t pt-4 sm:flex-row">
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
                <HugeiconsIcon icon={ArrowLeftIcon} className="mr-1 h-4 w-4" />
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
                <HugeiconsIcon icon={ArrowRightIcon} className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Revocation Modal */}
      {selectedInfraction && (
        <InfractionRevokeModal
          infraction={selectedInfraction}
          isOpen={revokeModalOpen}
          onClose={() => setRevokeModalOpen(false)}
          onSuccess={handleRevokeSuccess}
        />
      )}
    </div>
  );
}

interface InfractionCardProps {
  infraction: Infraction;
  onRevokeClick: (infraction: Infraction) => void;
}

function InfractionCard({ infraction, onRevokeClick }: InfractionCardProps) {
  const isUserInfraction = !!infraction.userId;
  const targetName = isUserInfraction
    ? infraction.user?.name || 'Unknown User'
    : infraction.serverName || 'Unknown Server';

  const expiresAt = infraction.expiresAt
    ? new Date(infraction.expiresAt)
    : null;

  const expiresIn = expiresAt
    ? new Date() > expiresAt
      ? 'Expired'
      : formatDistanceToNow(expiresAt, { addSuffix: true })
    : 'Never';

  const createdAt = new Date(infraction.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const getInfractionStatusBadge = (status: InfractionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-green-400 text-xs">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
            Active
          </span>
        );
      case 'REVOKED':
        return (
          <span className="flex items-center gap-1 rounded-full bg-gray-500/20 px-2 py-1 text-gray-400 text-xs">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
            Revoked
          </span>
        );
      case 'APPEALED':
        return (
          <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-blue-400 text-xs">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
            Appealed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-dash-main backdrop-blur-sm">
      <div className="flex flex-col justify-between gap-2 border-gray-800 border-b bg-gray-900/50 px-4 py-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            {isUserInfraction ? (
              <Image
                src={infraction.user?.image || '/assets.images/pfp1.png'}
                alt={targetName}
                width={40}
                height={40}
                className="rounded-full border-2 border-gray-800"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-800 bg-linear-to-br from-green-500/20 to-blue-500/20">
                <HugeiconsIcon
                  icon={Home01Icon}
                  className="h-5 w-5 text-gray-300"
                />
              </div>
            )}
            <div className="absolute -right-1 -bottom-1 rounded-full border border-gray-700 bg-gray-950 p-0.5 shadow-md">
              {isUserInfraction ? (
                <HugeiconsIcon
                  icon={UserIcon}
                  className="h-3 w-3 text-blue-400"
                />
              ) : (
                <HugeiconsIcon
                  icon={Home01Icon}
                  className="h-3 w-3 text-green-400"
                />
              )}
            </div>
          </div>
          <div>
            <div className="font-medium text-white">{targetName}</div>
            <div
              className="max-w-37.5 truncate text-gray-400 text-xs sm:max-w-50 md:max-w-62.5 lg:max-w-none"
              title={
                (isUserInfraction ? infraction.userId : infraction.serverId) ||
                undefined
              }
            >
              {isUserInfraction ? infraction.userId : infraction.serverId}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {infraction.type === 'BLACKLIST' ? (
            <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-red-400 text-xs">
              <HugeiconsIcon icon={LegalHammerIcon} className="h-3 w-3" />
              Blacklist
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400">
              <HugeiconsIcon icon={Alert01Icon} className="h-3 w-3" />
              Warning
            </span>
          )}
          {getInfractionStatusBadge(infraction.status)}
          {infraction.appealedAt && (
            <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-blue-400 text-xs">
              <HugeiconsIcon icon={Message02Icon} className="h-3 w-3" />
              Appeal
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 rounded-md border border-gray-800/50 bg-gray-900/30 p-3">
          <p className="text-gray-300 text-sm">{infraction.reason}</p>
        </div>

        <div className="mb-3 grid grid-cols-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/50">
              <HugeiconsIcon
                icon={Clock01Icon}
                className="h-3 w-3 text-gray-400"
              />
            </div>
            <div>
              <span className="text-gray-400">Created:</span> {createdAt}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/50">
              <HugeiconsIcon
                icon={UserIcon}
                className="h-3 w-3 text-gray-400"
              />
            </div>
            <div>
              <span className="text-gray-400">By:</span>{' '}
              {infraction.moderator?.name || 'Unknown'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/50">
              <HugeiconsIcon
                icon={Clock01Icon}
                className="h-3 w-3 text-gray-400"
              />
            </div>
            <div>
              <span className="text-gray-400">Expires:</span> {expiresIn}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/50">
              <HugeiconsIcon
                icon={Shield01Icon}
                className="h-3 w-3 text-gray-400"
              />
            </div>
            <div>
              <span className="text-gray-400">Status:</span>{' '}
              {infraction.status.charAt(0) +
                infraction.status.slice(1).toLowerCase()}
            </div>
          </div>
        </div>
        <div className="mt-3 border-gray-800/50 border-t pt-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {/* View Details button - always visible */}
            <Button
              variant="outline"
              size="sm"
              className="w-full border-gray-700/50 bg-gray-800/50 transition-all hover:bg-gray-700/50 hover:text-indigo-400 sm:w-auto"
              asChild
            >
              <Link
                href={`/dashboard/hubs/${infraction.hubId}/infractions/${infraction.id}/view`}
              >
                <HugeiconsIcon icon={EyeIcon} className="mr-1 h-3 w-3" />
                View Details
                {infraction.appealedAt && (
                  <span className="ml-1 rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-400">
                    Appeal
                  </span>
                )}
              </Link>
            </Button>

            {/* Action buttons - only for ACTIVE infractions */}
            {infraction.status === 'ACTIVE' && (
              <>
                {/* Only show Extend button for BLACKLIST type */}
                {infraction.type === 'BLACKLIST' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-700/50 bg-gray-800/50 transition-all hover:bg-gray-700/50 hover:text-blue-400 sm:w-auto"
                    asChild
                  >
                    <Link
                      href={`/dashboard/moderation/blacklist/extend/${infraction.id}`}
                    >
                      <HugeiconsIcon
                        icon={Clock01Icon}
                        className="mr-1 h-3 w-3"
                      />
                      Extend
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-red-700/30 bg-red-950/20 text-red-400 transition-all hover:border-red-700/50 hover:bg-red-900/30 hover:text-red-300 sm:w-auto"
                  onClick={() => onRevokeClick(infraction)}
                >
                  <HugeiconsIcon icon={Shield01Icon} className="mr-1 h-3 w-3" />
                  Revoke
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfractionSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-dash-main backdrop-blur-sm">
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
        <div className="mb-3 rounded-md border border-gray-800/50 bg-gray-900/30 p-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>

        <div className="mb-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="mt-3 border-gray-800/50 border-t pt-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Skeleton className="h-9 w-full sm:w-28" />
            <Skeleton className="h-9 w-full sm:w-20" />
            <Skeleton className="h-9 w-full sm:w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
