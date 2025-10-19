'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTRPC } from '@/utils/trpc';

interface DiscordRoleSelectorProps {
  hubId: string;
  serverId?: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  description?: string;
}

export function DiscordRoleSelector({
  serverId,
  value,
  onChange,
  label,
  placeholder,
  description,
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-medium text-sm">{label}</Label>
        {description && (
          <span className="text-gray-400 text-xs">{description}</span>
        )}
      </div>

      {/* Role Selection */}
      {serverId ? (
        <Select value={selectedRole} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-full border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] border border-gray-800/50 bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-md">
            {isLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-400" />
                <span className="text-gray-400">Loading roles...</span>
              </div>
            ) : error ? (
              <div className="p-2 text-center text-red-400">
                Failed to load roles
              </div>
            ) : roles.length === 0 ? (
              <div className="p-2 text-center text-gray-400">
                No roles found in this server
              </div>
            ) : (
              roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: getRoleColor(role.color) }}
                    />
                    <span className="truncate">{role.name}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      ) : (
        <div className="w-full rounded-md border border-gray-700/50 bg-gray-800/30 p-3 text-center text-gray-400 text-sm">
          Select a channel first to choose roles from that server
        </div>
      )}
    </div>
  );
}
