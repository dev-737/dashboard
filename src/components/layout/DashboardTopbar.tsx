'use client';

import {
  Award01Icon,
  Home01Icon,
  JusticeScale01Icon,
  Menu01Icon,
  Settings01Icon,
} from '@hugeicons/core-free-icons';

import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NotificationDropdown } from '@/components/features/dashboard/notifications/NotificationDropdown';
import { OnboardingHelpMenu } from '@/components/features/dashboard/onboarding/OnboardingHelpMenu';
import { UserNav } from '@/components/layout/UserNav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MobileSidebar } from './DashboardMobileSidebar';

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

export function DashboardTopBar({ user }: { user: User }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex h-16 shrink-0 bg-dash-surface transition-all duration-300">
      <div className="flex flex-1 items-center px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <Image
                alt="InterChat"
                src="/assets/images/logos/interchat.png"
                height={32}
                width={32}
                className="rounded-(--radius-avatar) border border-white/20 transition-all duration-300 group-hover:border-purple-400/50 group-hover:shadow-lg group-hover:shadow-purple-500/20"
              />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 -z-10 rounded-(--radius-avatar) bg-linear-to-r from-purple-400/20 to-blue-400/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <span className="hidden bg-linear-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text font-bold text-lg text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:via-indigo-300 group-hover:to-blue-300 lg:block">
              InterChat
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {[
              { name: 'Dashboard', href: '/dashboard', icon: Home01Icon },
              {
                name: 'My Appeals',
                href: '/dashboard/my-appeals',
                icon: JusticeScale01Icon,
              },
              { name: 'Leaderboard', href: '/leaderboard', icon: Award01Icon },
              {
                name: 'Settings01Icon',
                href: '/dashboard/settings',
                icon: Settings01Icon,
              },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-sm transition-all duration-200',
                  pathname === item.href ||
                    (item.href !== '/dashboard' &&
                      pathname.startsWith(item.href))
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                )}
              >
                {item.icon && (
                  <HugeiconsIcon
                    strokeWidth={3}
                    icon={item.icon}
                    className="h-4 w-4"
                  />
                )}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="ml-auto flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="border border-transparent text-gray-300 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <HugeiconsIcon
              strokeWidth={3}
              icon={Menu01Icon}
              className="h-6 w-6"
            />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>

        <div className="ml-auto hidden items-center gap-4 lg:flex">
          <div data-tour="notifications" className="relative">
            <div className="rounded-(--radius-button) p-1 transition-all duration-300 hover:bg-white/5">
              <NotificationDropdown />
            </div>
          </div>

          <div className="rounded-(--radius-button) p-1 transition-all duration-300 hover:bg-white/5">
            <OnboardingHelpMenu />
          </div>

          <div className="flex items-center" data-tour="user-menu">
            <div className="rounded-(--radius-button) p-1 transition-all duration-300 hover:bg-white/5">
              <UserNav
                user={user}
                firstPage={{ name: 'Home', icon: Home01Icon, href: '/' }}
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
