'use client';

import { Bell, HelpCircle, Home, Scale, Settings, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NotificationDropdown } from '@/components/features/dashboard/notifications/NotificationDropdown';
import { OnboardingHelpMenu } from '@/components/features/dashboard/onboarding/OnboardingHelpMenu';
import { cn } from '@/lib/utils';
import { UrlObject } from 'url';

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
      color: 'indigo',
      active: pathname === '/dashboard',
    },
    {
      href: '/dashboard/my-appeals',
      icon: Scale,
      label: 'My Appeals',
      color: 'purple',
      active: pathname.startsWith('/dashboard/my-appeals'),
    },
    {
      href: '/dashboard/settings',
      icon: Settings,
      label: 'Settings',
      color: 'gray',
      active: pathname.startsWith('/dashboard/settings'),
    },
  ];

  // Use createPortal to render the sidebar at the document body level
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - covers the entire viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/85 backdrop-blur-md"
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Sidebar - positioned relative to the viewport */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-0 bottom-0 left-0 z-[9999] flex w-[300px] max-w-[85vw] flex-col overflow-hidden border-gray-700/40 border-r bg-gradient-to-b from-gray-900/98 to-gray-950/98 shadow-2xl shadow-black/30 backdrop-blur-xl"
            style={{ position: 'fixed', top: 0, left: 0, bottom: 0 }}
          >
            {/* Mobile sidebar header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex h-16 items-center justify-between border-gray-700/40 border-b bg-gradient-to-r from-gray-900/50 to-gray-800/50 px-4 backdrop-blur-sm"
            >
              <Link
                href="/"
                className="group flex items-center gap-3"
                onClick={onClose}
              >
                <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text font-bold text-lg text-transparent transition-all duration-300 group-hover:scale-105 group-hover:from-purple-300 group-hover:via-indigo-300 group-hover:to-blue-300">
                  InterChat
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="group h-8 w-8 shrink-0 rounded-xl border border-transparent text-gray-400 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-gray-600/40 hover:bg-gray-700/50 hover:text-white hover:shadow-lg hover:shadow-purple-500/10"
              >
                <X className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </motion.div>

            {/* Mobile menu items */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-3">
                {/* Main Navigation */}
                <div className="space-y-2">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-2xl border px-4 py-3 font-medium text-sm transition-all duration-300 hover:scale-[1.02]',
                          item.active
                            ? 'border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 shadow-lg shadow-purple-500/10'
                            : 'border border-transparent text-gray-300 hover:border-white/10 hover:bg-white/5 hover:text-white hover:shadow-black/5 hover:shadow-md'
                        )}
                      >
                        <motion.div
                          className={cn(
                            'shrink-0 rounded-xl p-2 transition-all duration-300',
                            item.active
                              ? 'bg-purple-400/20 text-purple-300 shadow-purple-500/20 shadow-sm'
                              : 'text-gray-400 group-hover:bg-purple-400/15 group-hover:text-white'
                          )}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <item.icon className="h-5 w-5" />
                        </motion.div>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Separator */}
                <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-700/40 to-transparent" />

                {/* Additional Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 px-3 font-bold text-gray-400 text-xs uppercase tracking-wider">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-60"
                    />
                    <span className="bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
                      Quick Actions
                    </span>
                  </div>

                  {/* Notifications */}
                  <div className="group relative flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 font-medium text-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/10 hover:bg-white/5 hover:shadow-blue-500/5 hover:shadow-md">
                    <motion.div
                      className="shrink-0 rounded-xl p-2 text-gray-400 transition-all duration-300 group-hover:bg-blue-400/15 group-hover:text-white"
                      whileHover={{ rotate: [0, -15, 15, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <Bell className="h-5 w-5" />
                    </motion.div>
                    <span className="truncate text-gray-300 group-hover:text-white">
                      Notifications
                    </span>
                    <div className="ml-auto">
                      <NotificationDropdown />
                    </div>
                  </div>

                  {/* Help */}
                  <div className="group relative flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 font-medium text-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/10 hover:bg-white/5 hover:shadow-green-500/5 hover:shadow-md">
                    <motion.div
                      className="shrink-0 rounded-xl p-2 text-gray-400 transition-all duration-300 group-hover:bg-green-400/15 group-hover:text-white"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <HelpCircle className="h-5 w-5" />
                    </motion.div>
                    <span className="truncate text-gray-300 group-hover:text-white">
                      Help & Support
                    </span>
                    <div className="ml-auto">
                      <OnboardingHelpMenu />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Mobile user section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mt-auto border-gray-700/40 border-t bg-gradient-to-t from-gray-950/80 to-transparent p-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/20 blur-md" />
                  <Avatar className="relative h-12 w-12 border-2 border-purple-500/30 shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-110 hover:border-purple-500/50">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name || 'User'}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500/80 to-indigo-500/80 font-bold text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm text-white">
                    {user.name}
                  </p>
                  <p className="truncate text-gray-400 text-xs">{user.email}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    // Handle profile navigation if needed
                  }}
                  className="flex-1 border-gray-700/50 bg-gray-800/30 text-gray-300 transition-all duration-300 hover:scale-[1.02] hover:border-gray-600/50 hover:bg-gray-700/50 hover:text-white"
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    onClose();
                    await signOut();
                    window.location.href = '/';
                  }}
                  className="flex-1 border-red-700/50 bg-red-900/20 text-red-400 transition-all duration-300 hover:scale-[1.02] hover:border-red-600/50 hover:bg-red-800/30 hover:text-red-300"
                >
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
