'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Clock,
  Edit3,
  Globe,
  Home,
  Lock,
  MessageSquare,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PermissionLevel } from '@/lib/constants';

interface HubWithPermission {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  connections: { id: string }[];
  upvotes: { id: string }[];
  lastActive: Date | null;
  private: boolean;
  permissionLevel: PermissionLevel;
}

interface AnimatedHubCardProps {
  hub: HubWithPermission;
  index: number;
}

export function AnimatedHubCard({ hub, index }: AnimatedHubCardProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [isHovering, setIsHovering] = useState(false);

  const lastActive = hub.lastActive
    ? formatDistanceToNow(new Date(hub.lastActive), { addSuffix: true })
    : 'Never';

  // Determine card color based on permission level
  const getCardColor = () => {
    switch (hub.permissionLevel) {
      case PermissionLevel.OWNER:
        return 'from-purple-500/10 to-purple-900/5 border-purple-500/20 hover:border-purple-500/40';
      case PermissionLevel.MANAGER:
        return 'from-blue-500/10 to-blue-900/5 border-blue-500/20 hover:border-blue-500/40';
      case PermissionLevel.MODERATOR:
        return 'from-indigo-500/10 to-indigo-900/5 border-indigo-500/20 hover:border-indigo-500/40';
      default:
        return 'from-gray-500/10 to-gray-900/5 border-gray-500/20 hover:border-gray-500/40';
    }
  };

  // Determine role badge based on permission level
  const getRoleBadge = () => {
    switch (hub.permissionLevel) {
      case PermissionLevel.OWNER:
        return (
          <span className="rounded-(--radius-badge) border border-purple-500/30 bg-linear-to-r from-purple-500/20 to-purple-600/20 px-3 py-1 font-medium text-purple-300 text-xs shadow-lg">
            Owner
          </span>
        );
      case PermissionLevel.MANAGER:
        return (
          <span className="rounded-(--radius-badge) border border-blue-500/30 bg-linear-to-r from-blue-500/20 to-blue-600/20 px-3 py-1 font-medium text-blue-300 text-xs shadow-lg">
            Manager
          </span>
        );
      case PermissionLevel.MODERATOR:
        return (
          <span className="rounded-(--radius-badge) border border-indigo-500/30 bg-linear-to-r from-indigo-500/20 to-indigo-600/20 px-3 py-1 font-medium text-indigo-300 text-xs shadow-lg">
            Moderator
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2, type: 'spring' },
      }}
      className="h-full"
    >
      <Card
        className={`border bg-linear-to-br ${getCardColor()} group flex h-full min-h-[320px] flex-col overflow-hidden transition-all duration-200 hover:shadow-purple-500/10 hover:shadow-xl`}
      >
        <CardHeader className="relative pb-3">
          <div className="absolute top-4 right-4 z-10">{getRoleBadge()}</div>
          <div className="relative z-10 flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2, type: 'spring' }}
              className="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Avatar className="h-16 w-16 shrink-0 border-2 border-gray-700/50 ring-2 ring-transparent transition-all duration-200 group-hover:border-purple-500/50 group-hover:ring-purple-500/20">
                <AvatarImage
                  src={
                    hub.iconUrl?.includes('.gif')
                      ? hub.iconUrl
                      : hub.iconUrl || '/assets/images/defaults/default-hub.png'
                  }
                  alt={hub.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-linear-to-br from-purple-500/20 to-blue-500/20 font-bold text-lg text-purple-300">
                  {hub.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>

              {/* Privacy indicator */}
              <div className="-bottom-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-(--radius-avatar) border-2 border-gray-700 bg-gray-900">
                {hub.private ? (
                  <Lock className="h-3 w-3 text-orange-400" />
                ) : (
                  <Globe className="h-3 w-3 text-green-400" />
                )}
              </div>

              {/* Edit Overlay */}
              {isHovering && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black/60"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/dashboard/hubs/${hub.id}`;
                  }}
                >
                  <Edit3 className="h-4 w-4 text-white" />
                </motion.div>
              )}
            </motion.div>
            <div className="min-w-0 flex-1 pt-1">
              <CardTitle className="truncate font-bold text-lg text-white transition-colors group-hover:text-purple-100">
                {hub.name}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-2 text-gray-400 text-sm transition-colors group-hover:text-purple-200">
                {hub.description || 'No description available'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow py-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-purple-500/20 to-blue-500/20">
                  {hub.private ? (
                    <Lock className="h-3 w-3 text-purple-400" />
                  ) : (
                    <Globe className="h-3 w-3 text-green-400" />
                  )}
                </div>
                <span>Privacy</span>
              </span>
              <span className="flex items-center font-medium text-gray-200">
                {hub.private ? 'Private' : 'Public'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-purple-500/20 to-blue-500/20">
                  <Home className="h-3 w-3 text-blue-400" />
                </div>
                <span>Servers</span>
              </span>
              <span className="font-medium text-gray-200">
                {hub.connections.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-purple-500/20 to-blue-500/20">
                  <Users className="h-3 w-3 text-purple-400" />
                </div>
                <span>Upvotes</span>
              </span>
              <span className="font-medium text-gray-200">
                {hub.upvotes.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-purple-500/20 to-blue-500/20">
                  <Clock className="h-3 w-3 text-indigo-400" />
                </div>
                <span>Last Active</span>
              </span>
              <span className="max-w-[120px] truncate text-right font-medium text-gray-200">
                {lastActive}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-gray-800/50 border-t pt-0 pb-4">
          <Button
            asChild
            className="mt-3 w-full rounded-xl border-none bg-linear-to-r from-purple-600 to-blue-600 font-medium text-white shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-blue-700 hover:shadow-purple-500/25"
          >
            <Link href={`/dashboard/hubs/${hub.id}`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Manage Hub
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
