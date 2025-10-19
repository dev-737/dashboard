'use client';

import {
  AlertTriangle,
  Bell,
  ChevronDown,
  FileText,
  Gavel,
  Globe,
  Home,
  Menu,
  MessageCircle,
  MessageSquare,
  Package,
  Shield,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';

interface HubMobileDropdownProps {
  hubId: string;
  canModerate?: boolean;
  canEdit?: boolean;
}

interface DropdownNavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}

function DropdownNavItem({
  href,
  icon: Icon,
  label,
  active,
}: DropdownNavItemProps) {
  return (
    <DropdownMenuItem asChild>
      <Link
        href={href}
        className={cn(
          'group relative flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-300',
          'hover:bg-gray-800/60 focus:bg-gray-800/60',
          active
            ? 'border-purple-400/40 bg-gradient-to-r from-purple-500/15 to-indigo-500/15 font-medium text-purple-300 shadow-lg shadow-purple-500/5'
            : 'border-transparent text-gray-300 hover:border-gray-700/50 hover:text-white'
        )}
      >
        <div
          className={cn(
            'shrink-0 rounded-xl p-1.5 transition-all duration-300',
            active
              ? 'bg-purple-400/20 text-purple-300 shadow-purple-500/20 shadow-sm'
              : 'text-gray-400 group-hover:bg-purple-400/15 group-hover:text-white'
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="truncate text-sm">{label}</span>
      </Link>
    </DropdownMenuItem>
  );
}

export function HubMobileDropdown({
  hubId,
  canModerate = false,
  canEdit = false,
}: HubMobileDropdownProps) {
  const pathname = usePathname();

  // Define navigation structure exactly matching hub sidebar
  const navigationSections = [
    {
      key: 'main',
      title: null,
      items: [
        {
          value: 'overview',
          label: 'Overview',
          color: 'default' as const,
          icon: MessageSquare,
          href: `/dashboard/hubs/${hubId}`,
          show: true,
        },
        {
          value: 'discovery',
          label: 'Discovery',
          color: 'yellow' as const,
          icon: Globe,
          href: `/dashboard/hubs/${hubId}/discoverability`,
          show: canEdit,
        },
      ],
    },
    {
      key: 'management',
      title: 'Management',
      items: [
        {
          value: 'members',
          label: 'Team',
          color: 'blue' as const,
          icon: Users,
          href: `/dashboard/hubs/${hubId}/members`,
          show: canModerate,
        },
        {
          value: 'connections',
          label: 'Connections',
          color: 'green' as const,
          icon: Home,
          href: `/dashboard/hubs/${hubId}/connections`,
          show: canModerate,
        },
        {
          value: 'messages',
          label: 'Messages',
          color: 'purple' as const,
          icon: MessageCircle,
          href: `/dashboard/hubs/${hubId}/messages`,
          show: canModerate,
        },
        {
          value: 'logging',
          label: 'Logging',
          color: 'amber' as const,
          icon: FileText,
          href: `/dashboard/hubs/${hubId}/logging`,
          show: canEdit,
        },
        {
          value: 'modules',
          label: 'Modules',
          color: 'default' as const,
          icon: Package,
          href: `/dashboard/hubs/${hubId}/modules`,
          show: true,
        },
      ],
    },
    {
      key: 'moderation',
      title: 'Moderation',
      items: [
        {
          value: 'reports',
          label: 'Reports',
          color: 'red' as const,
          icon: Shield,
          href: `/dashboard/hubs/${hubId}/reports`,
          show: canModerate,
        },
        {
          value: 'appeals',
          label: 'Appeals',
          color: 'orange' as const,
          icon: Bell,
          href: `/dashboard/hubs/${hubId}/appeals`,
          show: canModerate,
        },
        {
          value: 'infractions',
          label: 'Infractions',
          color: 'purple' as const,
          icon: Gavel,
          href: `/dashboard/hubs/${hubId}/infractions`,
          show: canModerate,
        },
        {
          value: 'automod',
          label: 'AutoMod',
          color: 'green' as const,
          icon: Shield,
          href: `/dashboard/hubs/${hubId}/automod`,
          show: canModerate,
        },
      ],
    },
  ];

  // Filter sections based on permissions
  const visibleSections = navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.show),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Button className="group relative w-full justify-between gap-3 overflow-hidden rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-indigo-500 hover:to-purple-500 hover:shadow-xl">
            {/* Background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative z-10 flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Menu className="h-5 w-5" />
              </motion.div>
              <span className="text-base">Hub Navigation</span>
            </div>

            <ChevronDown className="h-5 w-5 text-white transition-colors duration-300 group-hover:text-white/70" />
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="max-h-[70vh] w-80 overflow-y-auto rounded-xl border-gray-800/50 bg-gray-900/95 p-2 text-gray-100 shadow-2xl backdrop-blur-md"
        sideOffset={8}
      >
        <DropdownMenuLabel className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text px-3 py-2 font-bold text-lg text-transparent">
          Hub Dashboard
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2 bg-gray-800/50" />

        {visibleSections.map((section, sectionIndex) => (
          <div key={section.key}>
            {sectionIndex > 0 && (
              <DropdownMenuSeparator className="my-2 bg-gray-800/30" />
            )}

            <DropdownMenuGroup>
              {section.title && (
                <DropdownMenuLabel className="flex items-center gap-2 px-3 py-1 font-medium text-gray-400 text-xs uppercase tracking-wider">
                  <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-60" />
                  <span className="bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
                    {section.title}
                  </span>
                </DropdownMenuLabel>
              )}
              {section.items.map((item) => (
                <DropdownNavItem
                  key={item.value}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href}
                />
              ))}
            </DropdownMenuGroup>
          </div>
        ))}

        <DropdownMenuSeparator className="my-2 bg-gray-800/30" />
        <div className="px-3 py-2">
          <p className="mt-1 flex items-center justify-center gap-1 text-center text-gray-500 text-xs">
            <span>💡</span> Quick access to all hub features
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
