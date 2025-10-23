'use client';

import { Home, Menu, Scale, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NotificationDropdown } from '@/components/features/dashboard/notifications/NotificationDropdown';
import { OnboardingHelpMenu } from '@/components/features/dashboard/onboarding/OnboardingHelpMenu';
import { UserNav } from '@/components/layout/UserNav';
import { MobileSidebar } from './DashboardMobileSidebar';

export function DashboardTopBar({ user }: { user: User }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 border-white/10 border-b bg-gradient-to-r from-gray-900/95 via-gray-900/90 to-gray-950/95 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 via-transparent to-blue-900/5" />

      <div className="relative z-10 flex flex-1 items-center px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <Image
                alt="InterChat"
                src="/assets/images/logos/interchat.png"
                height={32}
                width={32}
                className="rounded-[var(--radius-avatar)] border border-white/20 transition-all duration-300 group-hover:border-purple-400/50 group-hover:shadow-lg group-hover:shadow-purple-500/20"
              />
              {/* Subtle glow effect */}
              <div className="-z-10 absolute inset-0 rounded-[var(--radius-avatar)] bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <span className="hidden bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text font-bold text-lg text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:via-indigo-300 group-hover:to-blue-300 sm:block">
              InterChat
            </span>
          </Link>
        </div>

        <div className="ml-8 hidden items-center gap-2 lg:flex">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-2 rounded-[var(--radius-button)] px-4 py-2.5 font-medium text-sm transition-all duration-300',
              pathname === '/dashboard'
                ? 'border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 shadow-lg shadow-purple-500/10'
                : 'border border-transparent text-gray-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
            )}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/my-appeals"
            className={cn(
              'flex items-center gap-2 rounded-[var(--radius-button)] px-4 py-2.5 font-medium text-sm transition-all duration-300',
              pathname.startsWith('/dashboard/my-appeals')
                ? 'border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 shadow-lg shadow-purple-500/10'
                : 'border border-transparent text-gray-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
            )}
          >
            <Scale className="h-4 w-4" />
            My Appeals
          </Link>
          <Link
            href="/dashboard/settings"
            className={cn(
              'flex items-center gap-2 rounded-[var(--radius-button)] px-4 py-2.5 font-medium text-sm transition-all duration-300',
              pathname.startsWith('/dashboard/settings')
                ? 'border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 shadow-lg shadow-purple-500/10'
                : 'border border-transparent text-gray-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>

        <div className="ml-auto flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="border border-transparent text-gray-300 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <div data-tour="notifications" className="relative">
            <div className="rounded-[var(--radius-button)] p-1 transition-all duration-300 hover:bg-white/5">
              <NotificationDropdown />
            </div>
          </div>

          <div className="rounded-[var(--radius-button)] p-1 transition-all duration-300 hover:bg-white/5">
            <OnboardingHelpMenu />
          </div>

          <div className="flex items-center" data-tour="user-menu">
            <div className="rounded-[var(--radius-button)] p-1 transition-all duration-300 hover:bg-white/5">
              <UserNav
                user={user}
                firstPage={{ name: 'Home', icon: Home, href: '/' }}
              />
            </div>
          </div>
        </div>

        {/* Mobile sidebar using portal to render outside the DOM hierarchy */}
        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          user={user}
        />
      </div>
    </div>
  );
}
