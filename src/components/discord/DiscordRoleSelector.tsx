'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { useTRPC } from '@/utils/trpc';

interface DiscordRoleSelectorProps {
  hubId: string;
  serverId?: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  description?: string;
  // New props for initial values and access control
  initialRoleId?: string | null;
  initialRoleName?: string | null;
  initialRoleColor?: number | null;
  isAccessible?: boolean;
  onAccessDenied?: () => void;
}

export function DiscordRoleSelector({
  serverId,
  value,
  onChange,
  label,
  placeholder,
  description,
  initialRoleId = null,
  initialRoleName = null,
  initialRoleColor = null,
  isAccessible = true,
  onAccessDenied,
}: DiscordRoleSelectorProps) {
  const trpc = useTRPC();
  const [selectedRole, setSelectedRole] = useState<string>(value);

  // Use tRPC query instead of raw fetch
  const {
    data: rolesData,
    isLoading,
    error,
  } = useQuery(
    trpc.server.getServerRoles.queryOptions(
      { serverId: serverId! },
      {
        enabled: !!serverId,
        retry: 1,
      }
    )
  );

  const roles = rolesData?.roles || [];

  // Update the selected role when value changes
  useEffect(() => {
    setSelectedRole(value);
  }, [value]);

  // Handle role selection
  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    onChange(roleId);
  };

  // Convert a Discord role color (integer) to a hex color string
  const getRoleColor = (colorInt: number) => {
    if (colorInt === 0) return '#99AAB5'; // Default Discord gray
    return `#${colorInt.toString(16).padStart(6, '0')}`;
  };

  // Handle clearing locked configuration
  const handleClearConfig = () => {
    if (
      confirm(
        'Clear this configuration? It was set by another manager or in a server you no longer have access to.'
      )
    ) {
      onChange('');
      setSelectedRole('');
      onAccessDenied?.();
    }
  };

  return (
    <div className="relative space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-medium text-sm">{label}</Label>
        {description && (
          <span className="text-gray-400 text-xs">{description}</span>
        )}
      </div>

      {/* Role Selection */}
      {serverId ? (
        <Command className="overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800/50">
          <CommandInput
            placeholder="Search roles..."
            className="border-0 border-gray-700/50 border-b bg-transparent focus:ring-0"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-400" />
                <span className="text-gray-400">Loading roles...</span>
              </div>
            ) : error ? (
              <CommandEmpty>Failed to load roles</CommandEmpty>
            ) : roles.length === 0 ? (
              <CommandEmpty>No roles found in this server</CommandEmpty>
            ) : (
              <CommandGroup>
                {roles.map((role) => (
                  <CommandItem
                    key={role.id}
                    value={`${role.name}-${role.id}`}
                    onSelect={() => handleRoleChange(role.id)}
                    className={
                      selectedRole === role.id
                        ? 'bg-indigo-500/20 aria-selected:bg-indigo-500/20'
                        : ''
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: getRoleColor(role.color) }}
                      />
                      <span className="truncate">{role.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      ) : (
        <div className="w-full rounded-md border border-gray-700/50 bg-gray-800/30 p-3 text-center text-gray-400 text-sm">
          Select a channel first to choose roles from that server
        </div>
      )}

      {/* Show initial role info if we have it */}
      {initialRoleId && initialRoleName && !serverId && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-700/50 bg-gray-800/50 p-3">
          <div
            className="h-3 w-3 shrink-0 rounded-full"
            style={{
              backgroundColor: getRoleColor(initialRoleColor ?? 0),
            }}
          />
          <span className="text-sm">{initialRoleName}</span>
        </div>
      )}

      {/* Graceful degradation: show ID if we have role but no name */}
      {initialRoleId && !initialRoleName && !serverId && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-700/50 bg-gray-800/30 p-3">
          <div className="h-3 w-3 shrink-0 rounded-full bg-gray-500" />
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Role: {initialRoleId}</span>
            <span className="text-gray-500 text-xs">
              Unable to load role details
            </span>
          </div>
        </div>
      )}

      {/* Locked state overlay */}
      {!isAccessible && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-gray-900/80 backdrop-blur-sm">
          <Lock className="h-6 w-6 text-amber-400" />
          <p className="px-4 text-center text-gray-300 text-sm">
            You don't have access to this server
          </p>
          <Button size="sm" variant="outline" onClick={handleClearConfig}>
            Clear Configuration
          </Button>
        </div>
      )}
    </div>
  );
}
