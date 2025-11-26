'use client';

import {
  Crown,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import { useDebounce } from '@/hooks/use-debounce';
import {
  type HubMembers,
  type User,
  useAddHubMember,
  useHubMembers,
  useRemoveMember,
  useUpdateMemberRole,
} from '@/hooks/use-hub-members';
import { useFilteredUserSearch } from '@/hooks/use-user-search';

export function MembersClient({
  hubId,
  initialMembers,
}: {
  hubId: string;
  initialMembers: HubMembers;
}) {
  // State for the dialog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'MODERATOR' | 'MANAGER'>(
    'MODERATOR'
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch hub members using Tanstack Query
  const { data: members, isFetching } = useHubMembers(hubId, {
    initialData: initialMembers,
  });

  // Search for users using Tanstack Query
  const { data: searchResults = [], isLoading: isSearching } =
    useFilteredUserSearch(debouncedSearchQuery, members, {
      enabled: debouncedSearchQuery.length > 0,
    });

  // Mutations for member management
  const addMemberMutation = useAddHubMember(hubId);
  const updateRoleMutation = useUpdateMemberRole(hubId);
  const removeMemberMutation = useRemoveMember(hubId);

  // Handle adding a member
  const handleAddMember = () => {
    if (!selectedUser) return;

    addMemberMutation.mutate(
      {
        hubId,
        userId: selectedUser.id,
        role: selectedRole,
      },
      {
        onSuccess: () => {
          // Reset the form
          setSelectedUser(null);
          setSelectedRole('MODERATOR');
          setSearchQuery('');
          setIsDialogOpen(false);
        },
      }
    );
  };

  // Handle updating a member's role
  const handleUpdateRole = (
    memberId: string,
    newRole: 'MODERATOR' | 'MANAGER'
  ) => {
    updateRoleMutation.mutate({ hubId, memberId, role: newRole });
  };

  // Handle removing a member
  const handleRemoveMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      removeMemberMutation.mutate({ hubId, memberId });
    }
  };

  const isPending =
    addMemberMutation.isPending ||
    updateRoleMutation.isPending ||
    removeMemberMutation.isPending ||
    isFetching;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">Hub Members</h2>
          <p className="text-muted-foreground">
            Manage your hub's staff and permissions.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Search for a user to add as a moderator or manager.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="relative">
                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-2">
                {isSearching ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left transition-colors ${selectedUser?.id === user.id
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'hover:bg-muted'
                        }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <Image
                        src={
                          user.image ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
                        }
                        alt={user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                        unoptimized
                      />
                      <div className="flex-1 truncate font-medium">
                        {user.name}
                      </div>
                      {selectedUser?.id === user.id && (
                        <Plus className="h-4 w-4 text-indigo-400" />
                      )}
                    </button>
                  ))
                ) : searchQuery ? (
                  <p className="py-4 text-center text-muted-foreground text-sm">
                    No users found.
                  </p>
                ) : (
                  <p className="py-4 text-center text-muted-foreground text-sm">
                    Start typing to search...
                  </p>
                )}
              </div>

              {selectedUser && (
                <div className="space-y-3 rounded-lg border bg-muted/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Selected User:</span>
                    <span className="text-sm">{selectedUser.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Role:</span>
                    <Select
                      value={selectedRole}
                      onValueChange={(value) =>
                        setSelectedRole(value as 'MODERATOR' | 'MANAGER')
                      }
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MODERATOR">Moderator</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedUser(null);
                  setSearchQuery('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUser || addMemberMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {addMemberMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Owner Card */}
      <Card className="border-yellow-500/20 bg-linear-to-br from-yellow-500/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-yellow-500">
            <Crown className="mr-2 h-5 w-5" />
            Owner
          </CardTitle>
          <CardDescription>
            The owner has full control over the hub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-lg border border-yellow-500/10 bg-yellow-500/5 p-4">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-yellow-500/20">
              <Image
                src={
                  members?.owner.image ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${members?.owner.name}`
                }
                alt={members?.owner.name || 'Owner'}
                width={48}
                height={48}
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <div className="font-bold text-lg">
                {members?.owner.name || 'Unknown'}
              </div>
              <div className="flex items-center text-sm text-yellow-500/80">
                <Crown className="mr-1 h-3 w-3" />
                Hub Owner
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-indigo-400" />
            Staff Members
          </CardTitle>
          <CardDescription>
            Moderators and Managers who help run the hub.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {members?.moderators && members.moderators.length > 0 ? (
            <div className="rounded-md border border-white/10 bg-black/20">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.moderators.map((mod) => (
                    <TableRow key={mod.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={
                              mod.user?.image ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${mod.user.name}`
                            }
                            alt={mod.user.name || 'User'}
                            width={32}
                            height={32}
                            className="rounded-full"
                            unoptimized
                          />
                          <span className="font-medium">{mod.user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            mod.role === 'MANAGER' ? 'default' : 'secondary'
                          }
                          className={
                            mod.role === 'MANAGER'
                              ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                              : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                          }
                        >
                          {mod.role === 'MANAGER' ? (
                            <ShieldAlert className="mr-1 h-3 w-3" />
                          ) : (
                            <Shield className="mr-1 h-3 w-3" />
                          )}
                          {mod.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={isPending}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-white/10 text-white backdrop-blur-xl">
                            <DropdownMenuItem
                              className="focus:bg-white/10 focus:text-white"
                              onClick={() =>
                                handleUpdateRole(
                                  mod.id,
                                  mod.role === 'MANAGER'
                                    ? 'MODERATOR'
                                    : 'MANAGER'
                                )
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {mod.role === 'MANAGER'
                                ? 'Demote to Moderator'
                                : 'Promote to Manager'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                              onClick={() => handleRemoveMember(mod.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 font-medium text-lg">No Staff Members</h3>
              <p className="text-muted-foreground text-sm">
                Add moderators or managers to help you manage this hub.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                Add Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
