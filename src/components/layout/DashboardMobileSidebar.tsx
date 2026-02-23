'use client';

import {
  Award01Icon,
  Cancel01Icon,
  HelpCircleIcon,
  Home01Icon,
  JusticeScale01Icon,
  Logout01Icon,
  Notification03Icon,
  Settings01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';

import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NotificationDropdown } from '@/components/features/dashboard/notifications/NotificationDropdown';
import { OnboardingHelpMenu } from '@/components/features/dashboard/onboarding/OnboardingHelpMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

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

  const navigationItems = [
    {
      href: '/dashboard',
      icon: Home01Icon,
      label: 'Dashboard',
      gradient: 'from-blue-500/20 to-indigo-500/20',
      activeBorder: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      href: '/dashboard/my-appeals',
      icon: JusticeScale01Icon,
      label: 'My Appeals',
      gradient: 'from-purple-500/20 to-pink-500/20',
      activeBorder: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      href: '/leaderboard',
      icon: Award01Icon,
      label: 'Leaderboard',
      gradient: 'from-yellow-500/20 to-orange-500/20',
      activeBorder: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
    },
    {
      href: '/dashboard/settings',
      icon: Settings01Icon,
      label: 'Settings01Icon',
      gradient: 'from-gray-500/20 to-slate-500/20',
      activeBorder: 'border-gray-500/30',
      iconColor: 'text-gray-400',
    },
  ];

  const sidebarVariants: Variants = {
    closed: {
      x: '-100%',
      opacity: 0.5,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] bg-[#030812]/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed top-0 bottom-0 left-0 z-[9999] flex w-[320px] max-w-[85vw] flex-col overflow-hidden border-white/5 border-r bg-[#030812] shadow-2xl"
          >
            {/* Header */}
            <div className="relative flex h-24 shrink-0 items-center justify-between px-6 pt-4">
              <div className="absolute inset-0 bg-linear-to-b from-purple-500/5 to-transparent opacity-50" />
              <Link
                href="/"
                className="group relative flex items-center gap-3"
                onClick={onClose}
              >
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-500/10 to-blue-500/10 ring-1 ring-white/10 transition-transform duration-500 group-hover:rotate-12">
                  <Image
                    src="/assets/images/logos/interchat.png"
                    alt="InterChat"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="bg-linear-to-r from-white via-white to-gray-400 bg-clip-text font-bold text-lg text-transparent tracking-tight">
                    InterChat
                  </h1>
                  <p className="font-medium text-[10px] text-gray-500 uppercase tracking-widest">
                    Dashboard
                  </p>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="relative z-10 h-8 w-8 rounded-full text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <HugeiconsIcon
                  strokeWidth={3}
                  icon={Cancel01Icon}
                  className="h-5 w-5"
                />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <div className="space-y-8">
                {/* Navigation */}
                <div className="space-y-2">
                  <h2 className="px-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Navigation
                  </h2>
                  <div className="space-y-1">
                    {navigationItems.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' &&
                          pathname.startsWith(item.href));

                      return (
                        <motion.div key={item.href} variants={itemVariants}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                              'group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3.5 transition-all duration-300',
                              isActive
                                ? 'bg-white/[0.03] shadow-inner'
                                : 'hover:bg-white/[0.02]'
                            )}
                          >
                            {/* Active/Hover Background Gradient */}
                            <div
                              className={cn(
                                'absolute inset-0 bg-linear-to-r opacity-0 transition-opacity duration-300',
                                item.gradient,
                                isActive
                                  ? 'opacity-100'
                                  : 'group-hover:opacity-50'
                              )}
                            />

                            {/* Active Left Border Indicator */}
                            {isActive && (
                              <motion.div
                                layoutId="active-indicator"
                                className={cn(
                                  'absolute top-1.5 bottom-1.5 left-0 w-1 rounded-full bg-linear-to-b from-blue-400 to-purple-400',
                                  item.activeBorder
                                )}
                              />
                            )}

                            {/* Icon */}
                            <div
                              className={cn(
                                'relative z-10 transition-colors duration-300',
                                isActive ? 'text-white' : 'text-gray-500',
                                !isActive &&
                                  'group-hover:' +
                                    item.iconColor.replace('text-', 'text-')
                              )}
                            >
                              <HugeiconsIcon
                                icon={item.icon}
                                className="h-5 w-5 transform transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>

                            {/* Label */}
                            <span
                              className={cn(
                                'relative z-10 font-medium text-sm transition-colors duration-300',
                                isActive
                                  ? 'text-white'
                                  : 'text-gray-400 group-hover:text-gray-200'
                              )}
                            >
                              {item.label}
                            </span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <h2 className="px-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Quick Actions
                  </h2>

                  <div className="grid gap-2">
                    {/* Notifications Card */}
                    <div className="group relative flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:bg-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                          <HugeiconsIcon
                            icon={Notification03Icon}
                            className="h-4 w-4"
                          />
                        </div>
                        <span className="font-medium text-gray-300 text-sm">
                          Inbox
                        </span>
                      </div>
                      <div className="relative z-20">
                        <NotificationDropdown />
                      </div>
                    </div>

                    {/* Help Card */}
                    <div className="group relative flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:bg-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                          <HugeiconsIcon
                            icon={HelpCircleIcon}
                            className="h-4 w-4"
                          />
                        </div>
                        <span className="font-medium text-gray-300 text-sm">
                          Support
                        </span>
                      </div>
                      <div className="relative z-20">
                        <OnboardingHelpMenu />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* User Profile Footer */}
            <motion.div
              variants={itemVariants}
              className="mt-auto border-white/5 border-t bg-[#030812]/50 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-white/10 transition-all duration-300 hover:ring-purple-500/50">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name || 'User'}
                  />
                  <AvatarFallback className="btn-primary font-bold text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm text-white">
                    {user.name}
                  </p>
                  <p className="truncate text-gray-500 text-xs">{user.email}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="w-full border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <HugeiconsIcon
                    strokeWidth={3}
                    icon={UserIcon}
                    className="mr-2 h-3.5 w-3.5"
                  />
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
                  className="w-full border-red-500/10 bg-red-500/5 text-red-400 hover:border-red-500/20 hover:bg-red-500/10"
                >
                  <HugeiconsIcon
                    icon={Logout01Icon}
                    className="mr-2 h-3.5 w-3.5"
                  />
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
