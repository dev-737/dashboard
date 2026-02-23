'use client';

import {
  Cancel01Icon,
  CrownIcon,
  Delete02Icon,
  Loading03Icon,
  MoreHorizontalIcon,
  Search01Icon,
  Shield01Icon,
  Tick01Icon,
  UserAdd01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import {
  type User,
  useAddHubMember,
  useHubMembers,
  useRemoveMember,
  useUpdateMemberRole,
} from '@/hooks/use-hub-members';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/utils/trpc';

export function MembersClient({ hubId }: { hubId: string }) {
  // State for the dialog
  const [userIdInput, setUserIdInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'MODERATOR' | 'MANAGER'>(
    'MODERATOR'
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  // Focus ref for input
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch hub members using Tanstack Query
  const { data: members, isLoading: isLoadingMembers } = useHubMembers(hubId);

  // tRPC utils for manual fetching
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Handle validating user ID
  const handleValidateId = async () => {
    if (!userIdInput.trim()) return;

    setIsValidating(true);
    try {
      // Manually fetch user by ID
      const result = await queryClient.fetchQuery(
        trpc.user.getById.queryOptions({
          id: userIdInput.trim(),
        })
      );

      // Check if user is already a member
      const isOwner = members?.owner.id === result.user.id;
      const isAlreadyMember = members?.moderators.some(
        (mod) => mod.userId === result.user.id
      );

      if (isOwner) {
        toast.error('Cannot Add User', {
          description: 'This user is the owner of the hub.',
        });
        return;
      }

      if (isAlreadyMember) {
        toast.error('Cannot Add User', {
          description: 'This user is already a member of the hub.',
        });
        return;
      }

      setSelectedUser(result.user);
      setUserIdInput(''); // Clear input on success
    } catch {
      toast.error('User Not Found', {
        description: 'Could not find a user with that ID.',
      });
    } finally {
      setIsValidating(false);
    }
  };

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
          setUserIdInput('');
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
    setUpdatingMemberId(memberId);
    updateRoleMutation.mutate(
      { hubId, memberId, role: newRole },
      {
        onSettled: () => {
          setUpdatingMemberId(null);
        },
      }
    );
  };

  // Handle removing a member
  const handleRemoveMember = (memberId: string) => {
    removeMemberMutation.mutate({ hubId, memberId });
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      const timer = setTimeout(() => {
        setUserIdInput('');
        setSelectedUser(null);
        setSelectedRole('MODERATOR');
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // Focus input when dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isDialogOpen]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-2xl text-white tracking-tight">
            Team Members
          </h2>
          <p className="text-gray-400">
            Manage who has access to your hub and their permissions.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full border-none bg-indigo-600 font-medium text-white shadow-indigo-900/20 shadow-lg hover:bg-indigo-500 sm:w-auto">
              <HugeiconsIcon
                strokeWidth={3}
                icon={UserAdd01Icon}
                className="mr-2 h-4 w-4"
              />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md overflow-hidden border border-gray-800 bg-dash-surface p-0 text-gray-100 shadow-2xl sm:rounded-xl">
            <div className="bg-gray-900/50 p-6 pb-2">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Promote Team Member
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter a User ID to add them to your staff team.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-6 p-6 pt-2">
              {/* ID Input Section */}
              <div className="space-y-3">
                <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  User ID
                </Label>
                <div className="group relative flex gap-2">
                  <div className="relative flex-1">
                    <HugeiconsIcon
                      icon={Search01Icon}
                      className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-indigo-400"
                    />
                    <Input
                      ref={inputRef}
                      placeholder="e.g. 123456789..."
                      className="h-11 border-gray-800 bg-gray-900/50 pl-10 text-gray-100 placeholder:text-gray-600 focus-visible:border-indigo-500/50 focus-visible:bg-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={userIdInput}
                      onChange={(e) => setUserIdInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleValidateId();
                      }}
                      disabled={!!selectedUser}
                    />
                  </div>
                  {!selectedUser && (
                    <Button
                      onClick={handleValidateId}
                      disabled={!userIdInput.trim() || isValidating}
                      className="h-11 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      {isValidating ? (
                        <HugeiconsIcon
                          icon={Loading03Icon}
                          className="h-4 w-4 animate-spin"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={Search01Icon}
                          className="h-4 w-4"
                        />
                      )}
                    </Button>
                  )}
                </div>

                {/* Selected User Display */}
                {selectedUser && (
                  <div className="relative min-h-[60px] rounded-lg border border-gray-800 bg-gray-900/30 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-indigo-500/50">
                          <Image
                            src={
                              selectedUser.image ||
                              'https://api.dicebear.com/7.x/shapes/svg?seed=user'
                            }
                            alt={selectedUser.name || 'User'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {selectedUser.name}
                          </div>
                          <div className="text-indigo-400 text-xs">
                            Verified User
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(null);
                          setUserIdInput('');
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                        className="h-8 w-8 rounded-full p-0 text-gray-400 hover:bg-gray-800 hover:text-white"
                      >
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          className="h-4 w-4"
                        />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div
                className={cn(
                  'space-y-3 transition-opacity duration-200',
                  !selectedUser && 'pointer-events-none opacity-50'
                )}
              >
                <Label className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Select Role
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('MODERATOR')}
                    className={cn(
                      'w-full cursor-pointer rounded-lg border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                      selectedRole === 'MODERATOR'
                        ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/20'
                        : 'border-gray-800 bg-gray-900/30 hover:border-gray-700 hover:bg-gray-900/50'
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <HugeiconsIcon
                        icon={Shield01Icon}
                        className={cn(
                          'h-4 w-4',
                          selectedRole === 'MODERATOR'
                            ? 'text-purple-400'
                            : 'text-gray-500'
                        )}
                      />
                      {selectedRole === 'MODERATOR' && (
                        <HugeiconsIcon
                          icon={Tick01Icon}
                          className="h-3 w-3 text-purple-400"
                        />
                      )}
                    </div>
                    <div className="font-medium text-gray-200 text-sm">
                      Moderator
                    </div>
                    <div className="mt-1 text-gray-500 text-xs">
                      Can moderate content
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('MANAGER')}
                    className={cn(
                      'w-full cursor-pointer rounded-lg border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                      selectedRole === 'MANAGER'
                        ? 'border-blue-500/50 bg-blue-500/10 ring-1 ring-blue-500/20'
                        : 'border-gray-800 bg-gray-900/30 hover:border-gray-700 hover:bg-gray-900/50'
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <HugeiconsIcon
                        icon={Shield01Icon}
                        className={cn(
                          'h-4 w-4',
                          selectedRole === 'MANAGER'
                            ? 'text-blue-400'
                            : 'text-gray-500'
                        )}
                      />
                      {selectedRole === 'MANAGER' && (
                        <HugeiconsIcon
                          icon={Tick01Icon}
                          className="h-3 w-3 text-blue-400"
                        />
                      )}
                    </div>
                    <div className="font-medium text-gray-200 text-sm">
                      Manager
                    </div>
                    <div className="mt-1 text-gray-500 text-xs">
                      Full access to settings
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter className="border-gray-800 border-t bg-gray-900/50 p-4">
              <Button
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUser || addMemberMutation.isPending}
                className={cn(
                  'border-none bg-indigo-600 text-white transition-all hover:bg-indigo-500',
                  addMemberMutation.isPending && 'opacity-80'
                )}
              >
                {addMemberMutation.isPending ? (
                  <>
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      className="mr-2 h-4 w-4 animate-spin"
                    />
                    Adding...
                  </>
                ) : (
                  <>Add Member</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border border-gray-800 bg-none p-6 shadow-sm">
          {/* Owner Section */}
          <div className="mb-8">
            <h3 className="mb-4 flex items-center font-semibold text-gray-500 text-sm uppercase tracking-wider">
              <HugeiconsIcon
                icon={CrownIcon}
                className="mr-2 h-4 w-4 text-yellow-500"
              />
              Hub Owner
            </h3>

            {members?.owner ? (
              <div className="flex items-center gap-4 rounded-lg border border-gray-800/50 bg-gray-900/20 p-4 transition-all hover:bg-gray-900/40">
                <div className="relative h-12 w-12 shrink-0">
                  <Image
                    src={
                      members.owner.image ||
                      'https://api.dicebear.com/7.x/shapes/svg?seed=owner'
                    }
                    alt={members.owner.name || 'Owner'}
                    fill
                    className="rounded-full object-cover ring-2 ring-yellow-500/20"
                    unoptimized
                  />
                  <div className="absolute -right-1 -bottom-1 rounded-full bg-gray-900 p-0.5">
                    <HugeiconsIcon
                      icon={CrownIcon}
                      className="h-4 w-4 fill-yellow-500/20 text-yellow-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="font-medium text-lg text-white">
                    {members.owner.name}
                  </div>
                  <div className="text-gray-400 text-sm">Full Access</div>
                </div>
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center text-gray-500">
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="h-5 w-5 animate-spin"
                />
              </div>
            )}
          </div>

          <div className="mb-8 h-px w-full bg-gray-800/50" />

          {/* Staff Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center font-semibold text-gray-500 text-sm uppercase tracking-wider">
                <HugeiconsIcon
                  icon={Shield01Icon}
                  className="mr-2 h-4 w-4 text-indigo-400"
                />
                Staff Team
              </h3>
              <span className="flex h-6 items-center justify-center rounded-full bg-indigo-500/10 px-2.5 font-medium text-indigo-400 text-xs">
                {members?.moderators?.length || 0} Members
              </span>
            </div>

            {isLoadingMembers ? (
              <div className="flex h-32 items-center justify-center">
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="h-8 w-8 animate-spin text-gray-600"
                />
              </div>
            ) : members?.moderators && members.moderators.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {members.moderators.map((mod) => (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className="group relative flex items-center justify-between rounded-xl border border-gray-800/50 bg-gray-900/20 p-4 transition-all hover:border-gray-700 hover:bg-gray-900/40 hover:shadow-indigo-900/5 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative h-10 w-10 shrink-0">
                          <Image
                            src={
                              mod.user.image ||
                              'https://api.dicebear.com/7.x/shapes/svg?seed=user'
                            }
                            alt={mod.user.name || 'User'}
                            fill
                            className="rounded-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-gray-200 transition-colors group-hover:text-white">
                            {mod.user.name}
                          </div>
                          <div
                            className={cn(
                              'flex items-center truncate text-xs',
                              mod.role === 'MANAGER'
                                ? 'text-blue-400'
                                : 'text-purple-400'
                            )}
                          >
                            {mod.role === 'MANAGER' ? 'Manager' : 'Moderator'}
                            {updatingMemberId === mod.id && (
                              <HugeiconsIcon
                                icon={Loading03Icon}
                                className="ml-2 h-3 w-3 animate-spin text-gray-400"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 opacity-0 transition-opacity hover:bg-gray-800 hover:text-white group-hover:opacity-100 data-[state=open]:opacity-100"
                          >
                            <HugeiconsIcon
                              icon={MoreHorizontalIcon}
                              className="h-4 w-4"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border-gray-800 bg-gray-900 text-gray-200"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateRole(
                                mod.id,
                                mod.role === 'MANAGER' ? 'MODERATOR' : 'MANAGER'
                              )
                            }
                            className="cursor-pointer text-gray-300 focus:bg-gray-800 focus:text-white"
                          >
                            <HugeiconsIcon
                              icon={Shield01Icon}
                              className="mr-2 h-4 w-4"
                            />
                            {mod.role === 'MANAGER'
                              ? 'Demote to Moderator'
                              : 'Promote to Manager'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(mod.id)}
                            className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                          >
                            <HugeiconsIcon
                              icon={Delete02Icon}
                              className="mr-2 h-4 w-4"
                            />
                            Remove from Hub
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-800 border-dashed bg-gray-900/10 p-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800">
                  <HugeiconsIcon
                    icon={UserAdd01Icon}
                    className="h-6 w-6 text-gray-500"
                  />
                </div>
                <h3 className="mb-1 font-medium text-lg text-white">
                  No Team Members
                </h3>
                <p className="mx-auto mb-6 max-w-sm text-gray-400 text-sm">
                  Add moderators and managers to help you keep your hub safe and
                  organized.
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  variant="outline"
                  className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Add First Member
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
