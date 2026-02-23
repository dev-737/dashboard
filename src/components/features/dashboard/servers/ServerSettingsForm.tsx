'use client';

import { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Link as LinkIcon, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
    addServerBlocklistEntry,
    removeServerBlocklistEntry,
    updateServerInviteCode
} from '@/actions/server-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define blocklist type for better type support based on schema
interface ServerBlocklistEntry {
    id: string;
    serverId: string;
    blockedUserId: string | null;
    blockedServerId: string | null;
    reason: string | null;
    createdAt: Date;
}

interface ServerSettingsFormProps {
    serverId: string;
    initialInviteCode: string | null;
    initialBlocklist: ServerBlocklistEntry[];
}

export function ServerSettingsForm({
    serverId,
    initialInviteCode,
    initialBlocklist,
}: ServerSettingsFormProps) {
    const [inviteCode, setInviteCode] = useState(initialInviteCode || '');
    const [isSavingInvite, setIsSavingInvite] = useState(false);

    const [blocklist, setBlocklist] = useState<ServerBlocklistEntry[]>(initialBlocklist);
    const [newBlockId, setNewBlockId] = useState('');
    const [newBlockType, setNewBlockType] = useState<'user' | 'server'>('user');
    const [newBlockReason, setNewBlockReason] = useState('');
    const [isAddingBlock, setIsAddingBlock] = useState(false);
    const [removingBlockId, setRemovingBlockId] = useState<string | null>(null);

    const handleSaveInvite = async () => {
        setIsSavingInvite(true);
        try {
            const result = await updateServerInviteCode(serverId, inviteCode.trim() || null);
            if ('error' in result && result.error) {
                toast.error(result.error);
            } else {
                toast.success('Server invite code updated successfully.');
            }
        } catch (error) {
            toast.error('Failed to update invite code.');
        } finally {
            setIsSavingInvite(false);
        }
    };

    const handleAddBlocklist = async () => {
        if (!newBlockId.trim()) {
            toast.error('Please enter a Discord ID to block.');
            return;
        }

        setIsAddingBlock(true);
        try {
            const blockedUserId = newBlockType === 'user' ? newBlockId.trim() : null;
            const blockedServerId = newBlockType === 'server' ? newBlockId.trim() : null;

            const result = await addServerBlocklistEntry(
                serverId,
                blockedServerId,
                blockedUserId,
                newBlockReason.trim() || null
            );

            if ('error' in result && result.error) {
                toast.error(result.error);
            } else if ('success' in result && result.data) {
                toast.success('Added to blocklist successfully.');
                // Update local state with the new entry
                setBlocklist((prev) => [...prev, result.data as unknown as ServerBlocklistEntry]);
                // Reset form
                setNewBlockId('');
                setNewBlockReason('');
            }
        } catch (error) {
            toast.error('Failed to add to blocklist.');
        } finally {
            setIsAddingBlock(false);
        }
    };

    const handleRemoveBlocklist = async (id: string) => {
        setRemovingBlockId(id);
        try {
            const result = await removeServerBlocklistEntry(serverId, id);
            if ('error' in result && result.error) {
                toast.error(result.error);
            } else {
                toast.success('Removed from blocklist.');
                setBlocklist((prev) => prev.filter((item) => item.id !== id));
            }
        } catch (error) {
            toast.error('Failed to remove from blocklist.');
        } finally {
            setRemovingBlockId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* General Settings Card */}
            <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        General Settings
                    </CardTitle>
                    <CardDescription>Configure basic aspects of your server&apos;s InterChat presence.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="inviteCode">Server Invite Code</Label>
                        <div className="flex gap-2">
                            <Input
                                id="inviteCode"
                                placeholder="e.g. discord.gg/yourcode or just yourcode"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                className="bg-gray-800/50 border-gray-700/50"
                            />
                        </div>
                        <p className="text-sm text-gray-400">
                            Provide an invite code to let users join your server directly from InterChat. Example: `interchat` instead of `discord.gg/interchat`.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t border-gray-800/50 pt-4">
                    <Button onClick={handleSaveInvite} disabled={isSavingInvite} className="gap-2">
                        <Save className="h-4 w-4" />
                        {isSavingInvite ? 'Saving...' : 'Save Settings'}
                    </Button>
                </CardFooter>
            </Card>

            {/* Blocklist Card */}
            <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-400" />
                        Server Blocklist
                    </CardTitle>
                    <CardDescription>
                        Prevent specific users or entire servers from interacting with hubs originating from your server.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Add to Blocklist Form */}
                    <div className="grid gap-4 rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 md:grid-cols-[1fr_1fr_2fr_auto] items-end">
                        <div className="space-y-2">
                            <Label htmlFor="blockType">Type</Label>
                            <Select value={newBlockType} onValueChange={(v) => setNewBlockType(v as 'user' | 'server')}>
                                <SelectTrigger id="blockType" className="bg-gray-800/50 border-gray-700/50">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="server">Server</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="blockId">Discord ID</Label>
                            <Input
                                id="blockId"
                                placeholder="Enter Discord ID"
                                value={newBlockId}
                                onChange={(e) => setNewBlockId(e.target.value)}
                                className="bg-gray-800/50 border-gray-700/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="blockReason">Reason (Optional)</Label>
                            <Input
                                id="blockReason"
                                placeholder="Why are they blocked?"
                                value={newBlockReason}
                                onChange={(e) => setNewBlockReason(e.target.value)}
                                className="bg-gray-800/50 border-gray-700/50"
                            />
                        </div>
                        <Button
                            onClick={handleAddBlocklist}
                            disabled={isAddingBlock || !newBlockId.trim()}
                            variant="destructive"
                            className="gap-2 w-full md:w-auto"
                        >
                            <Shield className="h-4 w-4" />
                            {isAddingBlock ? 'Adding...' : 'Block'}
                        </Button>
                    </div>

                    {/* Blocklist Table */}
                    {blocklist.length > 0 ? (
                        <div className="rounded-md border border-gray-800/50 overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-900/50">
                                    <TableRow className="border-gray-800/50 hover:bg-transparent">
                                        <TableHead>Type</TableHead>
                                        <TableHead>Target ID</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Date Added</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {blocklist.map((item) => (
                                        <TableRow key={item.id} className="border-gray-800/50">
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {item.blockedUserId ? (
                                                    <span className="flex items-center gap-2 text-indigo-400">
                                                        <ShieldCheck className="h-4 w-4" /> User
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-rose-400">
                                                        <ShieldAlert className="h-4 w-4" /> Server
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm whitespace-nowrap">
                                                {item.blockedUserId || item.blockedServerId}
                                            </TableCell>
                                            <TableCell className="text-gray-400 max-w-[200px] truncate" title={item.reason || ''}>
                                                {item.reason || '-'}
                                            </TableCell>
                                            <TableCell className="text-gray-400 whitespace-nowrap">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveBlocklist(item.id)}
                                                    disabled={removingBlockId === item.id}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                >
                                                    <Trash2 className="h-4 w-4 md:mr-2" />
                                                    <span className="hidden md:inline">
                                                        {removingBlockId === item.id ? 'Removing...' : 'Remove'}
                                                    </span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/80 mb-4">
                                <ShieldCheck className="h-6 w-6 text-green-400" />
                            </div>
                            <h3 className="mb-2 font-semibold text-xl">Blocklist is empty</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                You haven&apos;t blocked any users or servers yet. Add them above if needed.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
