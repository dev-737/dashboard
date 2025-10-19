'use client';

import {
  Crown,
  Loader2,
  MoreHorizontal,
  PlusCircle,
  Search,
  Shield,
  Trash,
  UserPlus,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import {
  type User,
  useAddHubMember,
  useHubMembers,
  useRemoveMember,
  useUpdateMemberRole,
} from '@/hooks/use-hub-members';
import { useFilteredUserSearch } from '@/hooks/use-user-search';

export function MembersClient({ hubId }: { hubId: string }) {
  // State for the dialog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'MODERATOR' | 'MANAGER'>(
    'MODERATOR'
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch hub members using Tanstack Query
  const { data: members } = useHubMembers(hubId);

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
    removeMemberMutation.mutate({ hubId, memberId });
  };

  return (
    <>
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center" />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full border-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-600/80 hover:to-purple-600/80 sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="border border-gray-800/50 bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Search for a user to add as a moderator or manager.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="relative">
                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users by name..."
                  className="border-gray-800 bg-gray-900/50 pl-8 transition-colors hover:bg-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="max-h-60 space-y-2 overflow-y-auto">
                {isSearching ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left ${
                        selectedUser?.id === user.id
                          ? 'border border-indigo-700/30 bg-indigo-900/30'
                          : 'hover:bg-gray-800/50'
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <Image
                        src={
                          user.image ||
                          'https://api.dicebear.com/7.x/shapes/svg?seed=user'
                        }
                        alt={user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                        unoptimized
                      />
                      <div className="flex-1">
                        <div className="font-medium">{user.name}</div>
                      </div>
                    </button>
                  ))
                ) : searchQuery ? (
                  <p className="py-4 text-center text-gray-400">
                    No users found
                  </p>
                ) : (
                  <p className="py-4 text-center text-gray-400">
                    Start typing to search for users
                  </p>
                )}
              </div>

              {selectedUser && (
                <div className="space-y-2">
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
                      <SelectTrigger className="w-32 border-gray-800 bg-gray-900/50 transition-colors hover:bg-gray-900">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="border-gray-800 bg-gray-900">
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
                className="border-gray-700 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUser || addMemberMutation.isPending}
                className="border-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-600/80 hover:to-purple-600/80"
              >
                {addMemberMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Member
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
        <CardHeader className="border-gray-800/50 border-b">
          <CardTitle className="flex items-center">
            <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-900/30">
              <Crown className="h-3.5 w-3.5 text-yellow-400" />
            </div>
            Owner
          </CardTitle>
          <CardDescription>
            The owner has full control over the hub
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-yellow-500/20">
                <Image
                  src={
                    members?.owner.image ||
                    'https://api.dicebear.com/7.x/shapes/svg?seed=owner'
                  }
                  alt={members?.owner.name || 'Owner'}
                  width={48}
                  height={48}
                  className="object-cover"
                  style={{ width: '100%', height: '100%' }}
                  unoptimized
                />
              </div>
              <div>
                <div className="font-medium text-lg">
                  {members?.owner.name || 'Unknown'}
                </div>
                <div className="flex items-center text-sm text-yellow-400">
                  <Crown className="mr-1.5 h-3.5 w-3.5" />
                  Owner
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
        <CardHeader className="border-gray-800/50 border-b">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center">
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-900/30">
                  <Shield className="h-3.5 w-3.5 text-purple-400" />
                </div>
                Moderators & Managers
              </CardTitle>
              <CardDescription>
                Managers can edit hub modules and manage members. Moderators can
                only moderate content.
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="w-full border-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-600/80 hover:to-purple-600/80 sm:w-auto"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {members?.moderators && members.moderators.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {members.moderators.map((mod) => (
                <div
                  key={mod.id}
                  className="flex items-center justify-between rounded-lg border border-gray-800/50 bg-gray-900/30 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-purple-500/20">
                      <Image
                        src={
                          mod.user?.image ||
                          'https://api.dicebear.com/7.x/shapes/svg?seed=mod'
                        }
                        alt={mod.user.name || 'Moderator'}
                        width={40}
                        height={40}
                        className="object-cover"
                        style={{ width: '100%', height: '100%' }}
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="font-medium">{mod.user.name}</div>
                      <div className="flex items-center text-xs">
                        {mod.role === 'MANAGER' ? (
                          <span className="flex items-center text-blue-400">
                            <Shield className="mr-1 h-3 w-3" />
                            Manager
                          </span>
                        ) : (
                          <span className="flex items-center text-purple-400">
                            <Shield className="mr-1 h-3 w-3" />
                            Moderator
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-gray-800 bg-gray-900"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateRole(
                            mod.id,
                            mod.role === 'MANAGER' ? 'MODERATOR' : 'MANAGER'
                          )
                        }
                        className="cursor-pointer hover:bg-gray-800"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        {mod.role === 'MANAGER'
                          ? 'Change to Moderator'
                          : 'Change to Manager'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(mod.id)}
                        className="cursor-pointer text-red-500 hover:bg-red-950/30 focus:text-red-500"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6 py-8 text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-gray-500" />
              <h3 className="mb-2 font-medium text-lg">No Members Yet</h3>
              <p className="mb-4 text-gray-400">
                No moderators or managers have been added yet.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="border-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-600/80 hover:to-purple-600/80"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
