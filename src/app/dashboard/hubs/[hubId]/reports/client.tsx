'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MessageSquare,
  Search,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { UnderlinedTabs } from '@/components/features/dashboard/UnderlinedTabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { ReportStatus } from '@/lib/generated/prisma/client/client';
import { useTRPC } from '@/utils/trpc';

interface Report {
  id: string;
  hubId: string;
  reporterId: string;
  reportedUserId: string;
  reportedServerId: string;
  messageId?: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'IGNORED';
  handledBy?: string;
  handledAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  hub: {
    id: string;
    name: string;
    iconUrl?: string;
  };
  reporter: {
    id: string;
    name: string;
    image?: string;
  };
  reportedUser: {
    id: string;
    name: string;
    image?: string;
  };
  handler?: {
    id: string;
    name: string;
    image?: string;
  };
  messageData?: {
    id: string;
    content?: string;
    imageUrl?: string;
    channelId: string;
    guildId: string;
    authorId: string;
    createdAt: string | Date;
    referredMessageId?: string;
  };
  serverData?: {
    id: string;
    name?: string;
    iconUrl?: string;
  };
}

interface ReportsData {
  reports: Report[];
  total: number;
}

interface ReportsClientProps {
  hubId: string;
}

export function ReportsClient({ hubId }: ReportsClientProps) {
  const trpc = useTRPC();
  const [reportsData, setReportsData] = useState<ReportsData>({
    reports: [],
    total: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [resolution, setResolution] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  type InfractionTypeLiteral = 'WARNING' | 'BLACKLIST' | 'BAN' | 'MUTE';
  type TargetTypeLiteral = 'user' | 'server';
  const [createType, setCreateType] =
    useState<InfractionTypeLiteral>('WARNING');
  const [createTargetType, setCreateTargetType] =
    useState<TargetTypeLiteral>('user');
  const [createDuration, setCreateDuration] = useState<string>('');
  const [createReason, setCreateReason] = useState<string>('');
  const queryClient = useQueryClient();
  const updateReport = useMutation(
    trpc.moderation.updateReportStatus.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.moderation.getReports.pathFilter()
        );
      },
    })
  );
  const createInfraction = useMutation(
    trpc.moderation.createInfractionFromReport.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries(
            trpc.moderation.getReports.pathFilter()
          ),
          queryClient.invalidateQueries(
            trpc.moderation.getInfractions.pathFilter()
          ),
        ]);
      },
    })
  );
  const { toast } = useToast();

  // Get pending state from mutations
  const isPending = updateReport.isPending || createInfraction.isPending;

  const limit = 10;
  type ReportStatusLiteral = 'PENDING' | 'RESOLVED' | 'IGNORED';
  const statusValue: ReportStatusLiteral | undefined =
    statusFilter === 'all' ? undefined : (statusFilter as ReportStatusLiteral);
  const { data, isLoading } = useQuery(
    trpc.moderation.getReports.queryOptions({
      hubId,
      status: statusValue,
      page: currentPage,
      limit,
    })
  );
  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  useEffect(() => {
    if (data) {
      setReportsData({
        reports: (data.reports as Report[]) || [],
        total: data.total || 0,
      });
    }
  }, [data]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleReportAction = (report: Report, action: string) => {
    setSelectedReport(report);
    setSelectedAction(action);
    setIsActionDialogOpen(true);
  };

  const handleCreateInfraction = (report: Report) => {
    setSelectedReport(report);
    setCreateReason(report.reason || '');
    setCreateTargetType(report.reportedUserId ? 'user' : 'server');
    setCreateType('WARNING');
    setCreateDuration('');
    setIsCreateDialogOpen(true);
  };

  const executeAction = async () => {
    if (!selectedReport) return;

    try {
      let status: ReportStatus;
      switch (selectedAction) {
        case 'resolve':
          status = 'RESOLVED';
          break;
        case 'ignore':
          status = 'IGNORED';
          break;
        default:
          return;
      }

      await updateReport.mutateAsync({
        reportId: selectedReport.id,
        status,
        resolution,
      });

      toast({
        title: 'Report Updated',
        description: `Report has been ${String(status).toLowerCase()} successfully.`,
        variant: 'default',
      });

      setIsActionDialogOpen(false);
      setResolution('');
      setSelectedAction('');
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to execute action:', error);
      toast({
        title: 'Error',
        description: 'Failed to update report status.',
        variant: 'destructive',
      });
    }
  };

  const executeCreateInfraction = async () => {
    if (!selectedReport) return;
    try {
      const durationSeconds = createDuration
        ? Number(createDuration)
        : undefined;
      if (createDuration && Number.isNaN(durationSeconds)) {
        toast({
          title: 'Invalid duration',
          description: 'Duration must be a number of seconds.',
          variant: 'destructive',
        });
        return;
      }

      await createInfraction.mutateAsync({
        reportId: selectedReport.id,
        type: createType,
        reason: createReason || 'Action taken based on report',
        duration: durationSeconds,
        targetType: createTargetType,
      });

      toast({
        title: 'Infraction created',
        description: `A ${createType.toLowerCase()} has been issued to the ${createTargetType}.`,
        variant: 'default',
      });

      setIsCreateDialogOpen(false);
      setSelectedReport(null);
      setCreateReason('');
      setCreateDuration('');
    } catch (error) {
      console.error('Failed to create infraction:', error);
      toast({
        title: 'Error',
        description: 'Failed to create infraction from report.',
        variant: 'destructive',
      });
    }
  };

  const filteredReports = reportsData.reports.filter((report) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.reason.toLowerCase().includes(searchLower) ||
        report.reportedUser?.name.toLowerCase().includes(searchLower) ||
        report.reporter?.name.toLowerCase().includes(searchLower) ||
        report.serverData?.name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Group reports by status
  const pendingReports = filteredReports.filter(
    (report) => report.status === 'PENDING'
  );
  const resolvedReports = filteredReports.filter(
    (report) => report.status === 'RESOLVED'
  );
  const ignoredReports = filteredReports.filter(
    (report) => report.status === 'IGNORED'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">User Reports</h1>
          <p className="text-gray-400">
            Review and manage user-submitted reports for this hub
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-medium text-sm">Search</Label>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-gray-700 bg-gray-800/50 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium text-sm">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-700 bg-gray-800/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="IGNORED">Ignored</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <UnderlinedTabs
        defaultValue="pending"
        className="space-y-6"
        tabs={[
          {
            value: 'pending',
            label: (
              <div className="flex items-center gap-2">
                <span>Pending</span>
                {pendingReports.length > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                    {pendingReports.length}
                  </Badge>
                )}
              </div>
            ),
            color: 'red',
            icon: <Clock className="h-4 w-4" />,
          },
          {
            value: 'resolved',
            label: `Resolved (${resolvedReports.length})`,
            color: 'green',
            icon: <CheckCircle className="h-4 w-4" />,
          },
          {
            value: 'ignored',
            label: `Ignored (${ignoredReports.length})`,
            color: 'blue',
            icon: <XCircle className="h-4 w-4" />,
          },
        ]}
      >
        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-indigo-500 border-b-2"></div>
            </div>
          ) : pendingReports.length > 0 ? (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onAction={handleReportAction}
                  isUpdating={updateReport.isPending}
                  onCreate={handleCreateInfraction}
                  isCreating={createInfraction.isPending}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Pending Reports"
              description="There are no pending reports that require your attention."
              message="All reports have been resolved. Great job keeping your hub safe!"
            />
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-indigo-500 border-b-2"></div>
            </div>
          ) : resolvedReports.length > 0 ? (
            <div className="space-y-4">
              {resolvedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onAction={handleReportAction}
                  isUpdating={updateReport.isPending}
                  onCreate={handleCreateInfraction}
                  isCreating={createInfraction.isPending}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Resolved Reports"
              description="There are no resolved reports to display."
              message="When you resolve reports, they will appear here for reference."
            />
          )}
        </TabsContent>

        <TabsContent value="ignored" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-indigo-500 border-b-2"></div>
            </div>
          ) : ignoredReports.length > 0 ? (
            <div className="space-y-4">
              {ignoredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onAction={handleReportAction}
                  isUpdating={updateReport.isPending}
                  onCreate={handleCreateInfraction}
                  isCreating={createInfraction.isPending}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Ignored Reports"
              description="There are no ignored reports to display."
              message="Reports you choose to ignore will appear here."
            />
          )}
        </TabsContent>
      </UnderlinedTabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="premium-card">
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-gray-400 text-sm">
              Page {currentPage} of {totalPages} ({reportsData.total} total
              reports)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="border-gray-800 bg-gray-900">
          <DialogHeader>
            <DialogTitle>
              {selectedAction === 'resolve'
                ? 'Resolve Report'
                : 'Ignore Report'}
            </DialogTitle>
            <DialogDescription>
              {selectedAction === 'resolve'
                ? 'Provide details about how this report was resolved.'
                : 'This report will be marked as ignored and moved to the ignored tab.'}
            </DialogDescription>
          </DialogHeader>

          {selectedAction === 'resolve' && (
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block font-medium text-gray-300 text-sm">
                  Resolution Details (Optional)
                </Label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe the action taken or resolution details..."
                  className="border-gray-700 bg-gray-800 text-gray-100"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActionDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={executeAction}
              disabled={isPending}
              className={
                selectedAction === 'resolve'
                  ? 'border-none bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-600/80 hover:to-emerald-600/80'
                  : 'border-none bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-600/80 hover:to-gray-700/80'
              }
            >
              {isPending
                ? 'Processing...'
                : selectedAction === 'resolve'
                  ? 'Resolve'
                  : 'Ignore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Infraction Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="border-gray-800 bg-gray-900">
          <DialogHeader>
            <DialogTitle>Create Infraction</DialogTitle>
            <DialogDescription>
              Issue an infraction based on this report. This will also mark the
              report as resolved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-medium text-sm">Infraction Type</Label>
                <Select
                  value={createType}
                  onValueChange={(v: string) =>
                    setCreateType(v as 'WARNING' | 'BLACKLIST' | 'BAN' | 'MUTE')
                  }
                >
                  <SelectTrigger className="border-gray-700 bg-gray-800/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="BLACKLIST">Blacklist</SelectItem>
                    <SelectItem value="BAN">Ban</SelectItem>
                    <SelectItem value="MUTE">Mute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-sm">Target</Label>
                <Select
                  value={createTargetType}
                  onValueChange={(v: string) =>
                    setCreateTargetType(v as 'user' | 'server')
                  }
                >
                  <SelectTrigger className="border-gray-700 bg-gray-800/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-medium text-sm">Reason</Label>
              <Textarea
                value={createReason}
                onChange={(e) => setCreateReason(e.target.value)}
                placeholder="Reason for the infraction"
                className="border-gray-700 bg-gray-800 text-gray-100"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium text-sm">
                Duration (seconds, optional)
              </Label>
              <Input
                type="number"
                min="0"
                value={createDuration}
                onChange={(e) => setCreateDuration(e.target.value)}
                placeholder="e.g., 86400 for 1 day; leave blank for permanent"
                className="border-gray-700 bg-gray-800/50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={createInfraction.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={executeCreateInfraction}
              disabled={createInfraction.isPending}
              className="bg-linear-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              {createInfraction.isPending ? 'Creating...' : 'Create Infraction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  message: string;
}

function EmptyState({ title, description, message }: EmptyStateProps) {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">{message}</p>
      </CardContent>
    </Card>
  );
}

interface ReportCardProps {
  report: Report;
  onAction: (report: Report, action: string) => void;
  isUpdating: boolean;
  onCreate: (report: Report) => void;
  isCreating: boolean;
}

function ReportCard({
  report,
  onAction,
  isUpdating,
  onCreate,
  isCreating,
}: ReportCardProps) {
  const timeAgo = formatDistanceToNow(new Date(report.createdAt), {
    addSuffix: true,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge
            variant="outline"
            className="border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'RESOLVED':
        return (
          <Badge
            variant="outline"
            className="border-green-500/50 bg-green-500/10 text-green-400"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Resolved
          </Badge>
        );
      case 'IGNORED':
        return (
          <Badge
            variant="outline"
            className="border-gray-500/50 bg-gray-500/10 text-gray-400"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Ignored
          </Badge>
        );
    }
  };

  return (
    <Card className="premium-card transition-colors hover:border-gray-700/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={
                report.hub?.iconUrl ||
                'https://api.dicebear.com/7.x/shapes/svg?seed=hub'
              }
              alt={report.hub?.name || 'Hub'}
              width={32}
              height={32}
              className="rounded-full border border-gray-700"
              unoptimized
            />
            <div>
              <CardTitle className="text-lg">
                {report.hub?.name || 'Unknown Hub'}
              </CardTitle>
              <CardDescription>Reported {timeAgo}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(report.status)}
          </div>
        </div>

        {/* Server Origin Information */}
        <div className="mt-3 rounded-md border border-blue-800/50 bg-blue-900/20 p-3">
          <div className="mb-2 font-medium text-blue-300 text-sm">
            Report Origin
          </div>
          <div className="flex items-center gap-3">
            <Image
              src={
                report.serverData?.iconUrl ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                  report.reportedServerId
                )}`
              }
              alt="Server Icon"
              width={24}
              height={24}
              className="rounded-full"
              unoptimized
            />
            <div className="flex-1">
              <div className="font-medium text-blue-200 text-sm">
                {report.serverData?.name || 'Unknown Server'}
              </div>
              <div className="text-blue-400 text-xs">
                Server ID: {report.reportedServerId}
              </div>
            </div>
            {report.messageId && (
              <div className="text-blue-400 text-xs">
                Message ID: {report.messageId}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reporter and Reported User */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={
                report.reportedUser?.image ||
                'https://api.dicebear.com/7.x/shapes/svg?seed=user'
              }
              alt={report.reportedUser?.name || 'Unknown User'}
              width={40}
              height={40}
              className="rounded-full border border-red-500/20"
              unoptimized
            />
            <div>
              <div className="font-medium text-red-400">
                {report.reportedUser?.name || 'Unknown User'}
              </div>
              <div className="text-gray-400 text-xs">Reported User</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-medium text-blue-400">
                {report.reporter?.name || 'Anonymous'}
              </div>
              <div className="text-gray-400 text-xs">Reporter</div>
            </div>
            <Image
              src={
                report.reporter?.image ||
                'https://api.dicebear.com/7.x/shapes/svg?seed=reporter'
              }
              alt={report.reporter?.name || 'Anonymous'}
              width={40}
              height={40}
              className="rounded-full border border-blue-500/20"
              unoptimized
            />
          </div>
        </div>

        {/* Report Reason */}
        <div className="rounded-md border border-gray-800 bg-gray-900/50 p-3">
          <div className="mb-2 flex items-center gap-2 text-gray-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Reason for Report:
          </div>
          <div className="text-sm">{report.reason}</div>
        </div>

        {/* Message Information */}
        {report.messageId && (
          <div className="rounded-md border border-gray-700 bg-gray-800/50 p-4">
            <div className="mb-4 flex items-center gap-2 font-medium text-gray-300 text-sm">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              Reported Message Details
            </div>

            {/* Message Metadata */}
            <div className="mb-4 grid grid-cols-1 gap-3 rounded border border-gray-700/50 bg-gray-900/50 p-3 md:grid-cols-2">
              <div className="text-xs">
                <span className="text-gray-400">Message ID:</span>
                <div className="mt-1 break-all font-mono text-gray-300">
                  {report.messageId}
                </div>
              </div>
              {report.messageData && (
                <>
                  <div className="text-xs">
                    <span className="text-gray-400">Channel ID:</span>
                    <div className="mt-1 break-all font-mono text-gray-300">
                      {report.messageData.channelId}
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-400">Guild ID:</span>
                    <div className="mt-1 break-all font-mono text-gray-300">
                      {report.messageData.guildId}
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-400">Sent:</span>
                    <div className="mt-1 text-gray-300">
                      {new Date(report.messageData.createdAt).toLocaleString()}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Message Content */}
            {report.messageData ? (
              <div className="space-y-4">
                {report.messageData.content && (
                  <div className="rounded-lg border border-gray-700 bg-gray-900/70 p-4">
                    <div className="mb-3 flex items-center gap-2 text-gray-400 text-sm">
                      <span className="font-medium">Message Content:</span>
                      <span className="rounded bg-gray-800 px-2 py-1 text-xs">
                        {report.messageData.content.length} characters
                      </span>
                    </div>
                    <div className="max-h-96 overflow-y-auto whitespace-pre-wrap break-words rounded border border-gray-600/50 bg-gray-800/50 p-3 text-gray-100 leading-relaxed">
                      {report.messageData.content}
                    </div>
                  </div>
                )}

                {report.messageData.imageUrl && (
                  <div className="rounded-lg border border-gray-700 bg-gray-900/70 p-4">
                    <div className="mb-3 font-medium text-gray-400 text-sm">
                      Image Attachment:
                    </div>
                    <div className="rounded border border-gray-600/50 bg-gray-800/50 p-3">
                      <Image
                        src={report.messageData.imageUrl}
                        alt="Message attachment"
                        width={400}
                        height={300}
                        className="h-auto max-w-full rounded border border-gray-600"
                        unoptimized
                      />
                      <div className="mt-2 text-gray-400 text-xs">
                        <a
                          href={report.messageData.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-blue-400"
                        >
                          View full size →
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {report.messageData.referredMessageId && (
                  <div className="rounded border border-gray-700/50 bg-gray-900/50 p-3">
                    <div className="mb-1 text-gray-400 text-xs">
                      Reply to message:
                    </div>
                    <span className="font-mono text-gray-300 text-sm">
                      {report.messageData.referredMessageId}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 py-6 text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-500" />
                <div className="text-gray-400 text-sm italic">
                  Message content not available (may have been deleted)
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resolution (for resolved/ignored reports) */}
        {(report.status === 'RESOLVED' || report.status === 'IGNORED') &&
          report.handler && (
            <div className="rounded-md border border-green-800/50 bg-green-900/20 p-3">
              <div className="mb-2 text-gray-400 text-sm">
                {report.status === 'RESOLVED' ? 'Resolution:' : 'Ignored by:'}
              </div>
              <div className="text-sm">
                Handled by{' '}
                <span className="font-medium text-green-400">
                  {report.handler.name}
                </span>
                {report.handledAt && (
                  <span className="ml-2 text-gray-400">
                    {formatDistanceToNow(new Date(report.handledAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            </div>
          )}

        {/* Action Buttons */}
        {report.status === 'PENDING' && (
          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={() => onCreate(report)}
              disabled={isCreating}
              className="border-none bg-linear-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              Create Infraction
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 hover:border-gray-600"
              onClick={() => onAction(report, 'ignore')}
              disabled={isUpdating}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Ignore
            </Button>
            <Button
              onClick={() => onAction(report, 'resolve')}
              disabled={isUpdating}
              className="border-none bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-600/80 hover:to-emerald-600/80"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Resolve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
