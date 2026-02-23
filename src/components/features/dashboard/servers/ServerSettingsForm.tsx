'use client';

import {
  Alert02Icon,
  CheckmarkSquare01Icon,
  Delete02Icon,
  FloppyDiskIcon,
  Link01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  addServerBlocklistEntry,
  type EnrichedBlocklistEntry,
  removeServerBlocklistEntry,
  updateServerInviteCode,
} from '@/actions/server-actions';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ServerSettingsFormProps {
  serverId: string;
  initialInviteCode: string | null;
  initialBlocklist: EnrichedBlocklistEntry[];
}

export function ServerSettingsForm({
  serverId,
  initialInviteCode,
  initialBlocklist,
}: ServerSettingsFormProps) {
  const [inviteCode, setInviteCode] = useState(initialInviteCode || '');
  const [isSavingInvite, setIsSavingInvite] = useState(false);

  const [blocklist, setBlocklist] =
    useState<EnrichedBlocklistEntry[]>(initialBlocklist);
  const [newBlockId, setNewBlockId] = useState('');
  const [newBlockType, setNewBlockType] = useState<'user' | 'server'>('user');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [removingBlockId, setRemovingBlockId] = useState<string | null>(null);

  const handleSaveInvite = async () => {
    setIsSavingInvite(true);
    try {
      const result = await updateServerInviteCode(
        serverId,
        inviteCode.trim() || null
      );
      if ('error' in result && result.error) {
        toast.error('Failed to save invite code', {
          description: result.error,
        });
      } else {
        toast.success('Invite code updated', {
          description: 'Your server invite code has been saved.',
        });
      }
    } catch {
      toast.error('Something went wrong', {
        description: 'Could not save invite code. Please try again.',
      });
    } finally {
      setIsSavingInvite(false);
    }
  };

  const handleAddBlocklist = async () => {
    const trimmedId = newBlockId.trim();

    if (!trimmedId) {
      toast.error('Discord ID required', {
        description: 'Please enter a valid Discord user or server ID.',
      });
      return;
    }

    // Basic snowflake validation (17-19 digits)
    if (!/^\d{17,19}$/.test(trimmedId)) {
      toast.error('Invalid Discord ID', {
        description:
          'Discord IDs are 17–19 digit numbers. Right-click a user/server in Discord → Copy01Icon ID.',
      });
      return;
    }

    setIsAddingBlock(true);
    try {
      const blockedUserId = newBlockType === 'user' ? trimmedId : null;
      const blockedServerId = newBlockType === 'server' ? trimmedId : null;

      const result = await addServerBlocklistEntry(
        serverId,
        blockedServerId,
        blockedUserId,
        newBlockReason.trim() || null
      );

      if ('error' in result && result.error) {
        toast.error('Could not add to blocklist', {
          description: result.error,
        });
      } else if ('success' in result && result.data) {
        toast.success(
          `${newBlockType === 'user' ? 'User' : 'Server'} blocked`,
          { description: `ID ${trimmedId} added to the blocklist.` }
        );
        // New entries won't have DB-joined relations yet; the name will show once the page
        // is refreshed. Add a minimal placeholder so the row appears right away.
        const placeholder: EnrichedBlocklistEntry = {
          ...(result.data as unknown as EnrichedBlocklistEntry),
          User: null,
          blockedServer: null,
        };
        setBlocklist((prev) => [...prev, placeholder]);
        setNewBlockId('');
        setNewBlockReason('');
      }
    } catch {
      toast.error('Something went wrong', {
        description: 'Could not add to blocklist. Please try again.',
      });
    } finally {
      setIsAddingBlock(false);
    }
  };

  const handleRemoveBlocklist = async (id: string) => {
    setRemovingBlockId(id);
    try {
      const result = await removeServerBlocklistEntry(serverId, id);
      if ('error' in result && result.error) {
        toast.error('Could not remove entry', { description: result.error });
      } else {
        toast.success('Entry removed', {
          description: 'The user or server has been unblocked.',
        });
        setBlocklist((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      toast.error('Something went wrong', {
        description: 'Could not remove from blocklist. Please try again.',
      });
    } finally {
      setRemovingBlockId(null);
    }
  };

  /** Renders name + avatar/icon for a blocklist entry, falls back to raw ID. */
  const EntityLabel = ({ item }: { item: EnrichedBlocklistEntry }) => {
    const isUser = !!item.blockedUserId;
    const rawId = item.blockedUserId ?? item.blockedServerId ?? '';

    const name = isUser ? item.User?.name : item.blockedServer?.name;
    const avatarSrc = isUser ? item.User?.image : item.blockedServer?.iconUrl;

    return (
      <span className="flex items-center gap-2">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={name ?? rawId}
            width={28}
            height={28}
            className={`h-7 w-7 flex-shrink-0 object-cover ${isUser ? 'rounded-full' : 'rounded-md'}`}
          />
        ) : (
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-gray-400 text-xs">
            {isUser ? 'U' : 'S'}
          </span>
        )}
        <span className="flex min-w-0 flex-col">
          {name ? (
            <>
              <span className="truncate font-medium text-gray-100 leading-tight">
                {name}
              </span>
              <span className="select-all font-mono text-gray-500 text-xs leading-tight">
                {rawId}
              </span>
            </>
          ) : (
            <span className="select-all font-mono text-gray-300 text-sm">
              {rawId}
            </span>
          )}
        </span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* General Settings Card */}
      <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Link01Icon}
              className="h-5 w-5"
            />
            General Settings
          </CardTitle>
          <CardDescription>
            Configure basic aspects of your server&apos;s InterChat presence.
          </CardDescription>
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
                className="border-gray-700/50 bg-gray-800/50"
              />
            </div>
            <p className="text-gray-400 text-sm">
              Provide an invite code to let users join your server directly from
              InterChat. Example: `interchat` instead of `discord.gg/interchat`.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-gray-800/50 border-t pt-4">
          <Button
            onClick={handleSaveInvite}
            disabled={isSavingInvite}
            className="gap-2"
          >
            <HugeiconsIcon
              strokeWidth={2}
              icon={FloppyDiskIcon}
              className="h-4 w-4"
            />
            {isSavingInvite ? 'Saving...' : 'Save Settings01Icon'}
          </Button>
        </CardFooter>
      </Card>

      {/* Blocklist Card */}
      <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Alert02Icon}
              className="h-5 w-5 text-red-400"
            />
            Server Blocklist
          </CardTitle>
          <CardDescription>
            Prevent specific users or entire servers from interacting with hubs
            originating from your server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add to Blocklist Form */}
          <div className="grid items-end gap-4 rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 md:grid-cols-[1fr_1fr_2fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="blockType">Type</Label>
              <Select
                value={newBlockType}
                onValueChange={(v) => setNewBlockType(v as 'user' | 'server')}
              >
                <SelectTrigger
                  id="blockType"
                  className="border-gray-700/50 bg-gray-800/50"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blockId">
                Discord {newBlockType === 'user' ? 'User' : 'Server'} ID
              </Label>
              <Input
                id="blockId"
                placeholder="17–19 digit Discord ID"
                value={newBlockId}
                onChange={(e) => setNewBlockId(e.target.value)}
                className="border-gray-700/50 bg-gray-800/50 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blockReason">Reason (Optional)</Label>
              <Input
                id="blockReason"
                placeholder="Why are they blocked?"
                value={newBlockReason}
                onChange={(e) => setNewBlockReason(e.target.value)}
                className="border-gray-700/50 bg-gray-800/50"
              />
            </div>
            <Button
              onClick={handleAddBlocklist}
              disabled={isAddingBlock || !newBlockId.trim()}
              variant="destructive"
              className="w-full gap-2 md:w-auto"
            >
              <HugeiconsIcon
                strokeWidth={2}
                icon={Shield01Icon}
                className="h-4 w-4"
              />
              {isAddingBlock ? 'Adding...' : 'Block'}
            </Button>
          </div>

          {/* Blocklist Table */}
          {blocklist.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-gray-800/50">
              <Table>
                <TableHeader className="bg-gray-900/50">
                  <TableRow className="border-gray-800/50 hover:bg-transparent">
                    <TableHead>Type</TableHead>
                    <TableHead>Target01Icon</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocklist.map((item) => (
                    <TableRow key={item.id} className="border-gray-800/50">
                      <TableCell className="whitespace-nowrap font-medium">
                        {item.blockedUserId ? (
                          <span className="flex items-center gap-2 text-indigo-400">
                            <HugeiconsIcon
                              strokeWidth={2}
                              icon={CheckmarkSquare01Icon}
                              className="h-4 w-4"
                            />{' '}
                            User
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-rose-400">
                            <HugeiconsIcon
                              strokeWidth={2}
                              icon={Alert02Icon}
                              className="h-4 w-4"
                            />{' '}
                            Server
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[200px]">
                        <EntityLabel item={item} />
                      </TableCell>
                      <TableCell
                        className="max-w-[200px] truncate text-gray-400"
                        title={item.reason || ''}
                      >
                        {item.reason || (
                          <span className="text-gray-600">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBlocklist(item.id)}
                          disabled={removingBlockId === item.id}
                          className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
                        >
                          <HugeiconsIcon
                            strokeWidth={2}
                            icon={Delete02Icon}
                            className="h-4 w-4 md:mr-2"
                          />
                          <span className="hidden md:inline">
                            {removingBlockId === item.id
                              ? 'Removing...'
                              : 'Remove'}
                          </span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/80">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={CheckmarkSquare01Icon}
                  className="h-6 w-6 text-green-400"
                />
              </div>
              <h3 className="mb-2 font-semibold text-xl">Blocklist is empty</h3>
              <p className="mx-auto max-w-sm text-muted-foreground">
                You haven&apos;t blocked any users or servers yet. Add them
                above if needed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
