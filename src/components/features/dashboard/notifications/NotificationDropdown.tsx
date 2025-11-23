'use client';

import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Bell, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationBadge } from './NotificationBadge';

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    toggleNotifications,
    markAllAsRead,
  } = useNotifications();

  // Sort notifications to show unread first
  const sortedNotifications = [...notifications].sort((a, b) => {
    // First sort by read status (unread first)
    if (a.isUnread && !b.isUnread) return -1;
    if (!a.isUnread && b.isUnread) return 1;
    // Then sort by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Limit to 5 most recent notifications for the dropdown
  const displayNotifications = sortedNotifications.slice(0, 5);

  // Check if there are any notifications at all
  const hasNotifications = notifications.length > 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={toggleNotifications}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full text-gray-400 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          <NotificationBadge count={unreadCount} />
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[70vh] w-80 overflow-y-auto border-gray-800 bg-gray-900 text-gray-100"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text font-bold text-lg text-transparent">
            Notifications
          </span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-gray-400 text-xs hover:text-white"
              onClick={() => markAllAsRead()}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuGroup>
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <DropdownMenuItem
                key={`notification-skeleton-${i + 1}`}
                className="flex cursor-default flex-col items-start gap-1 px-4 py-3 focus:bg-gray-800/50"
              >
                <Skeleton className="h-5 w-3/4 bg-gray-800" />
                <Skeleton className="h-4 w-full bg-gray-800" />
                <Skeleton className="h-4 w-1/2 bg-gray-800" />
              </DropdownMenuItem>
            ))
          ) : !hasNotifications ? (
            <div className="py-8 text-center text-gray-400">
              <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            displayNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`relative flex cursor-default flex-col items-start gap-1 px-4 py-3 focus:bg-gray-800/50 ${notification.isUnread
                    ? 'before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-linear-to-b before:from-indigo-500 before:to-purple-500'
                    : ''
                  }`}
              >
                <div className="flex w-full items-center justify-between">
                  <h4 className="font-medium text-white">
                    {notification.title}
                  </h4>
                  <span className="text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="line-clamp-2 text-gray-300 text-sm">
                  {notification.content}
                </p>
                {notification.thumbnailUrl && (
                  <div className="mt-1 w-full">
                    <Image
                      src={notification.thumbnailUrl}
                      alt=""
                      width={320}
                      height={160}
                      className="h-20 w-full rounded-md object-cover"
                    />
                  </div>
                )}
                {notification.isUnread && (
                  <div className="absolute top-3 right-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuFooter className="p-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-between bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
          >
            <Link href="/dashboard/announcements">
              View all notifications
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
