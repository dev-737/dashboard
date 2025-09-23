import {
  AlertTriangle,
  ExternalLink,
  MessageCircle,
  Shield,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'NSFW Compliance | Admin Dashboard',
  description: 'Manage NSFW compliance and connection violations',
};

interface ConnectionViolation {
  id: string;
  channelId: string;
  serverId: string;
  hub: {
    id: string;
    name: string;
    nsfw: boolean;
  };
  violationType: 'NSFW_CHANNEL_SFW_HUB' | 'SFW_CHANNEL_NSFW_HUB';
}

export default async function NSFWCompliancePage() {
const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/admin/nsfw-compliance');
  }

  // Check if user is admin (you'll need to implement admin role checking)
  // For now, we'll assume any authenticated user can access this
  // In production, add proper admin role validation

  // Get NSFW compliance statistics
  const stats = await getNSFWStats();
  const violations = await getConnectionViolations();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 text-orange-400" />
        <h1 className="font-bold text-2xl tracking-tight">
          NSFW Compliance Management
        </h1>
      </div>
      <p className="-mt-4 text-gray-400">
        Monitor and manage NSFW content compliance across the platform
      </p>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-950/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Hubs</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalHubs}</div>
            <p className="text-gray-400 text-xs">
              {stats.nsfwHubs} NSFW (
              {Math.round((stats.nsfwHubs / stats.totalHubs) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-950/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Active Connections
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalConnections}</div>
            <p className="text-gray-400 text-xs">Across all hubs</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-950/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Compliance Violations
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-red-400">
              {violations.length}
            </div>
            <p className="text-gray-400 text-xs">Require attention</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-950/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Users with NSFW Enabled
            </CardTitle>
            <Shield className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.usersWithNsfw}</div>
            <p className="text-gray-400 text-xs">
              {Math.round((stats.usersWithNsfw / stats.totalUsers) * 100)}% of
              users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Violations List */}
      {violations.length > 0 && (
        <Card className="border border-red-800/50 bg-gradient-to-b from-red-900/20 to-gray-950/80">
          <CardHeader>
            <CardTitle className="font-semibold text-red-400 text-xl">
              NSFW Compliance Violations
            </CardTitle>
            <CardDescription className="text-gray-400">
              Connections that violate NSFW safety rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {violations.map((violation) => (
                <div
                  key={violation.id}
                  className="flex items-center justify-between rounded-lg border border-gray-700/50 bg-gray-800/30 p-4"
                >
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-medium text-white">
                        {violation.hub.name}
                      </h3>
                      <Badge
                        variant={
                          violation.hub.nsfw ? 'destructive' : 'secondary'
                        }
                      >
                        {violation.hub.nsfw ? 'NSFW Hub' : 'SFW Hub'}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Channel:{' '}
                      <code className="rounded bg-gray-700 px-1">
                        {violation.channelId}
                      </code>{' '}
                      in Server:{' '}
                      <code className="rounded bg-gray-700 px-1">
                        {violation.serverId}
                      </code>
                    </p>
                    <p className="mt-1 text-red-400 text-xs">
                      {violation.violationType === 'NSFW_CHANNEL_SFW_HUB'
                        ? 'NSFW channel connected to SFW hub'
                        : 'SFW channel connected to NSFW hub'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/hubs/${violation.hub.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-1 h-4 w-4" />
                        View Hub
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm">
                      Disconnect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {violations.length === 0 && (
        <Card className="border border-green-800/50 bg-gradient-to-b from-green-900/20 to-gray-950/80">
          <CardHeader>
            <CardTitle className="font-semibold text-green-400 text-xl">
              ✅ All Connections Compliant
            </CardTitle>
            <CardDescription className="text-gray-400">
              No NSFW compliance violations detected
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Actions */}
      <Card className="border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-950/80">
        <CardHeader>
          <CardTitle className="font-semibold text-xl">
            Administrative Actions
          </CardTitle>
          <CardDescription className="text-gray-400">
            Tools for managing NSFW compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" variant="outline">
            Run Compliance Scan
          </Button>
          <Button className="w-full" variant="outline">
            Export Violation Report
          </Button>
          <Button className="w-full" variant="destructive">
            Disconnect All Violations
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

async function getNSFWStats() {
  const [totalHubs, nsfwHubs, totalConnections, totalUsers, usersWithNsfw] =
    await Promise.all([
      db.hub.count(),
      db.hub.count({ where: { nsfw: true } }),
      db.connection.count({ where: { connected: true } }),
      db.user.count(),
      db.user.count({ where: { showNsfwHubs: true } }),
    ]);

  return {
    totalHubs,
    nsfwHubs,
    totalConnections,
    totalUsers,
    usersWithNsfw,
  };
}

async function getConnectionViolations(): Promise<ConnectionViolation[]> {
  // This is a simplified version - in production, you'd need to check Discord channel NSFW status
  // For now, we'll return an empty array as a placeholder
  return [];
}
