'use client';

import {
  Bell,
  HelpCircle,
  Home,
  LogOut,
  Scale,
  Settings,
  Trophy,
  User as UserIcon,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NotificationDropdown } from '@/components/features/dashboard/notifications/NotificationDropdown';
import { OnboardingHelpMenu } from '@/components/features/dashboard/onboarding/OnboardingHelpMenu';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function MobileSidebar({ isOpen, onClose, user }: MobileSidebarProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Get user initials for avatar fallback
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Only mount the portal on the client side
  useEffect(() => {
    setMounted(true);

    // Prevent body scrolling when sidebar is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) return null;

  // Navigation items matching the topbar
  const navigationItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      color: 'text-indigo-400',
      activeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      active: pathname === '/dashboard',
    },
    {
      href: '/dashboard/my-appeals',
      icon: Scale,
      label: 'My Appeals',
      color: 'text-purple-400',
      activeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      active: pathname.startsWith('/dashboard/my-appeals'),
    },
    {
      href: '/leaderboard',
      icon: Trophy,
      label: 'Leaderboard',
      color: 'text-yellow-400',
      activeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      active: pathname.startsWith('/leaderboard'),
    },
    {
      href: '/dashboard/settings',
      icon: Settings,
      label: 'Settings',
      color: 'text-gray-400',
      activeColor: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      active: pathname.startsWith('/dashboard/settings'),
    },
  ];

  const sidebarVariants: Variants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay - covers the entire viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-9998 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar - positioned relative to the viewport */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed top-0 bottom-0 left-0 z-9999 flex w-[300px] max-w-[85vw] flex-col overflow-hidden border-white/5 border-r bg-[#0a0a0c]/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex h-20 shrink-0 items-center justify-between px-6">
              <Link
                href="/"
                className="group flex items-center gap-3"
                onClick={onClose}
              >
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/10 shadow-lg shadow-purple-500/20 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/assets/images/logos/interchat.png"
                    alt="InterChat"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-tr from-purple-500/20 to-transparent" />
                </div>
                <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text font-bold text-transparent text-xl tracking-tight">
                  InterChat
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full border border-white/5 bg-white/5 text-gray-400 hover:border-white/10 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-6">
                {/* Main Navigation */}
                <div className="space-y-1">
                  <h3 className="px-4 pb-2 font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Menu
                  </h3>
                  {navigationItems.map((item) => (
                    <motion.div key={item.href} variants={itemVariants}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 font-medium text-sm transition-all duration-300',
                          item.active
                            ? item.activeColor
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                        )}
                      >
                        {item.active && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute left-0 h-8 w-1 rounded-r-full bg-current opacity-50"
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                        <item.icon
                          className={cn(
                            'h-5 w-5 transition-transform duration-300 group-hover:scale-110',
                            item.active
                              ? 'text-current'
                              : 'text-gray-500 group-hover:text-gray-300'
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="space-y-1">
                  <h3 className="px-4 pb-2 font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Quick Actions
                  </h3>

                  {/* Notifications */}
                  <div className="group relative flex items-center justify-between rounded-xl border border-transparent px-4 py-2.5 transition-all duration-300 hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300">
                        <Bell className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-gray-300 text-sm group-hover:text-white">
                        Notifications
                      </span>
                    </div>
                    <div className="relative z-20">
                      <NotificationDropdown />
                    </div>
                  </div>

                  {/* Help */}
                  <div className="group relative flex items-center justify-between rounded-xl border border-transparent px-4 py-2.5 transition-all duration-300 hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400 group-hover:bg-green-500/20 group-hover:text-green-300">
                        <HelpCircle className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-gray-300 text-sm group-hover:text-white">
                        Help & Support
                      </span>
                    </div>
                    <div className="relative z-20">
                      <OnboardingHelpMenu />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Footer / User Profile */}
            <motion.div
              variants={itemVariants}
              className="border-white/5 border-t bg-black/20 p-4 backdrop-blur-md"
            >
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 shadow-inner">
                <Avatar className="h-10 w-10 border border-white/10 shadow-lg">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name || 'User'}
                  />
                  <AvatarFallback className="bg-linear-to-br from-purple-500 to-indigo-600 font-bold text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate font-medium text-sm text-white">
                    {user.name}
                  </p>
                  <p className="truncate text-gray-500 text-xs">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                  }}
                  className="w-full border-white/10 bg-transparent text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  <UserIcon className="mr-2 h-3.5 w-3.5" />
                  Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    onClose();
                    await authClient.signOut();
                    window.location.href = '/';
                  }}
                  className="w-full border-red-500/20 bg-red-500/5 text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign out
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
