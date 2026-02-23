import { formatDistanceToNow } from 'date-fns';
import {
    ArrowLeft,
    BarChart3,
    Calendar,
    Clock,
    Home,
    Shield,
} from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerDetails } from '@/actions/server-actions';
import { ServerConnectionsTable } from '@/components/features/dashboard/servers/ServerConnectionsTable';
import { ServerSettingsForm } from '@/components/features/dashboard/servers/ServerSettingsForm';
import { UnderlinedTabs } from '@/components/features/dashboard/UnderlinedTabs';
import { LogoutButton } from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
    title: 'Server Details | InterChat Dashboard',
    description: "View and manage your Discord server's InterChat connections",
};

export default async function ServerDetailPage(props: {
    params: Promise<{ serverId: string }>;
}) {
    const { serverId } = await props.params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        redirect(`/login?callbackUrl=/dashboard/servers/${serverId}`);
    }

    // Fetch the server details using server action
    const result = await getServerDetails(serverId);

    if ('error' in result) {
        console.error(`Error fetching server details: ${result.status}`);
        console.error(result.error);

        if (result.status === 404) {
            notFound();
        }

        // Handle specific error cases
        if (result.status === 403) {
            // User doesn't have permission to manage this server
            return (
                <div className="space-y-6">
                    <Card className="border-gray-800 bg-[#0f1117]">
                        <CardHeader>
                            <CardTitle>Access Denied</CardTitle>
                            <CardDescription>
                                You don&apos;t have permission to manage this server
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-gray-400">
                                You need to be a server owner or have the &quot;Manage
                                Server&quot; permission to access this page.
                            </p>
                            <Button asChild>
                                <Link href="/dashboard">Back to Servers</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        if (result.status === 401) {
            // Authentication issues
            return (
                <div className="space-y-6">
                    <Card className="border-gray-800 bg-[#0f1117]">
                        <CardHeader>
                            <CardTitle>Authentication Error</CardTitle>
                            <CardDescription>
                                There was an issue with your Discord authentication
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-gray-400">
                                Please try logging out and logging back in to refresh your
                                Discord token.
                            </p>
                            <div className="flex gap-4">
                                <Button asChild>
                                    <Link href="/dashboard">Back to Servers</Link>
                                </Button>
                                <LogoutButton>Log Out</LogoutButton>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        // For other errors, show a generic error message
        return (
            <div className="space-y-6">
                <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Error Loading Server</CardTitle>
                        <CardDescription>
                            There was an error loading the server details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-red-400">{result.error}</p>
                        <Button asChild className="btn-primary border-none">
                            <Link href="/dashboard">Back to Servers</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const serverData = result.data;

    // Extract the data we need
    const discordServer = serverData;
    const botAdded = serverData.botAdded;
    const connections = serverData.connections;

    // Get server icon
    const iconUrl = discordServer.icon
        ? `https://cdn.discordapp.com/icons/${serverId}/${discordServer.icon}.png?size=256`
        : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(serverId)}`;

    // Format dates - convert Discord snowflake to timestamp
    const createdTimestamp = Number(
        (BigInt(serverId) >> BigInt(22)) + BigInt(1420070400000)
    );
    const createdAt = new Date(createdTimestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const lastActive = serverData.lastMessageAt
        ? formatDistanceToNow(new Date(serverData.lastMessageAt), {
            addSuffix: true,
        })
        : 'Never';

    return (
        <div className="space-y-6">
            {/* Server Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2 border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white"
                        asChild
                    >
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-gray-700/50">
                            <Image
                                src={iconUrl}
                                alt={discordServer.name}
                                width={48}
                                height={48}
                                className="object-cover"
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                        <h1 className="font-bold text-2xl tracking-tight">
                            {discordServer.name}
                        </h1>
                    </div>
                </div>
            </div>
            {/* Server Tabs */}
            <UnderlinedTabs
                defaultValue="overview"
                className="w-full space-y-6"
                tabs={[
                    {
                        value: 'overview',
                        label: 'Overview',
                        color: 'indigo',
                    },
                    {
                        value: 'connections',
                        label: 'Connections',
                        color: 'blue',
                    },
                    {
                        value: 'settings',
                        label: 'Settings',
                        color: 'green',
                    },
                ]}
            >
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Server Stats */}
                        <Card className="col-span-2 border border-gray-800/50 bg-dash-main backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Server Stats
                                </CardTitle>
                                <CardDescription>
                                    Statistics about your Discord server
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1 text-gray-400">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/80">
                                                <Calendar className="h-3 w-3 text-blue-400" />
                                            </div>
                                            Created
                                        </span>
                                        <span className="text-gray-200">{createdAt}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1 text-gray-400">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/80">
                                                <Shield className="h-3 w-3 text-purple-400" />
                                            </div>
                                            Verification Level
                                        </span>
                                        <span className="text-gray-200">
                                            {
                                                ['None', 'Low', 'Medium', 'High', 'Very High'][
                                                discordServer.verification_level || 0
                                                ]
                                            }
                                        </span>
                                    </div>
                                    {botAdded && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/80">
                                                        <Home className="h-3 w-3 text-green-400" />
                                                    </div>
                                                    Bot Status
                                                </span>
                                                <span className="flex items-center gap-1 text-green-400">
                                                    <div className="mr-1 h-2 w-2 rounded-full bg-green-400"></div>
                                                    Connected
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/80">
                                                        <Clock className="h-3 w-3 text-indigo-400" />
                                                    </div>
                                                    Last Active
                                                </span>
                                                <span className="text-gray-200">{lastActive}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/80">
                                                        <BarChart3 className="h-3 w-3 text-yellow-400" />
                                                    </div>
                                                    Messages
                                                </span>
                                                <span className="text-gray-200">
                                                    {serverData.messageCount?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Connection Status */}
                        <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Home className="h-5 w-5" />
                                    Connection Status
                                </CardTitle>
                                <CardDescription>
                                    InterChat bot connection status
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {botAdded ? (
                                    <>
                                        <div className="flex items-center gap-2 text-green-400">
                                            <div className="h-3 w-3 rounded-full bg-green-400"></div>
                                            <span>Bot Added</span>
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            InterChat is added to this server.
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="flex items-center gap-1 text-gray-400">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/80">
                                                    <Home className="h-3 w-3 text-blue-400" />
                                                </div>
                                                Connected Hubs
                                            </span>
                                            <span className="text-gray-200">
                                                {connections.length}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 text-red-400">
                                            <div className="h-3 w-3 rounded-full bg-red-400"></div>
                                            <span>Bot Not Added</span>
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            InterChat is not added to this server.
                                        </div>
                                        <div className="mt-4">
                                            <Button
                                                asChild
                                                className="btn-primary w-full border-none"
                                            >
                                                <Link
                                                    href={`https://discord.com/oauth2/authorize?client_id=769921109209907241&guild_id=${serverId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Add Bot to Server
                                                </Link>
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Connections Tab */}
                <TabsContent value="connections" className="space-y-6">
                    <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Hub Connections</CardTitle>
                                <CardDescription>
                                    Manage your server&apos;s connections to InterChat hubs
                                </CardDescription>
                            </div>
                            {!botAdded ? (
                                <Button
                                    disabled
                                    className="cursor-not-allowed border-none bg-linear-to-r from-gray-600 to-gray-700 opacity-70 hover:from-gray-600 hover:to-gray-700"
                                >
                                    Bot Not Added
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white"
                                >
                                    <Link href="/hubs">Explore Hubs</Link>
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {!botAdded ? (
                                <div className="py-10 text-center">
                                    <h3 className="mb-2 font-semibold text-xl">Bot Not Added</h3>
                                    <p className="mb-6 text-muted-foreground">
                                        You need to add InterChat to this server before you can
                                        connect to hubs.
                                    </p>
                                    <Button asChild className="btn-primary border-none">
                                        <Link
                                            href={`https://discord.com/oauth2/authorize?client_id=769921109209907241&guild_id=${serverId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Add Bot to Server
                                        </Link>
                                    </Button>
                                </div>
                            ) : connections.length === 0 ? (
                                <div className="py-10 text-center">
                                    <h3 className="mb-2 font-semibold text-xl">No Connections</h3>
                                    <p className="mb-6 text-muted-foreground">
                                        This server is not connected to any hubs yet.
                                    </p>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white"
                                    >
                                        <Link href="/hubs">Explore Hubs</Link>
                                    </Button>
                                </div>
                            ) : (
                                <ServerConnectionsTable connections={connections} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Server Settings</CardTitle>
                            <CardDescription>
                                Configure your server&apos;s InterChat settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!botAdded ? (
                                <div className="py-10 text-center">
                                    <h3 className="mb-2 font-semibold text-xl">Bot Not Added</h3>
                                    <p className="mb-6 text-muted-foreground">
                                        You need to add InterChat to this server before you can
                                        configure settings.
                                    </p>
                                    <Button
                                        asChild
                                        className="border-none bg-linear-to-r from-green-600 to-teal-600 hover:from-green-600/80 hover:to-teal-600/80"
                                    >
                                        <Link
                                            href={`https://discord.com/oauth2/authorize?client_id=769921109209907241&guild_id=${serverId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Add Bot to Server
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <ServerSettingsForm
                                    serverId={serverId}
                                    initialInviteCode={discordServer.inviteCode}
                                    initialBlocklist={serverData.serverBlocklists || []}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </UnderlinedTabs>
        </div>
    );
}
