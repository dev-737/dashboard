'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gavel,
  Globe,
  Home,
  MessageSquare,
  Package,
  Shield,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/utils/trpc';
import { useHub } from './HubContext';

interface HubSidebarProps {
  hubId: string;
  canModerate?: boolean;
  canEdit?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  pendingCounts?: {
    reports?: number;
    appeals?: number;
    infractions?: number;
  };
}

interface SidebarNavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  isCollapsed: boolean;
  locked?: boolean;
  lockReason?: string;
  badge?: number;
  comingSoon?: boolean;
  color?:
    | 'default'
    | 'blue'
    | 'green'
    | 'purple'
    | 'red'
    | 'orange'
    | 'yellow'
    | 'indigo';
}

interface NavigationItem {
  value: string;
  label: string;
  color:
    | 'default'
    | 'blue'
    | 'green'
    | 'purple'
    | 'red'
    | 'orange'
    | 'yellow'
    | 'indigo';
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  show:
    | boolean
    | ((permissions: { canModerate: boolean; canEdit: boolean }) => boolean);
  locked?: (permissions: { canModerate: boolean; canEdit: boolean }) => boolean;
  lockReason?: string;
  comingSoon?: boolean;
}

interface SidebarSection {
  key: string;
  title?: string;
  defaultOpen?: boolean;
  items: NavigationItem[];
}

function SidebarNavItem({
  href,
  icon: Icon,
  label,
  active,
  isCollapsed,
  locked = false,
  lockReason = 'Requires higher permissions',
  badge,
  comingSoon = false,
}: SidebarNavItemProps) {
  const content = (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-md px-3 py-2 font-medium text-sm transition-all duration-200',
        active
          ? 'bg-linear-to-r from-purple-500/10 to-blue-500/10 text-purple-300 shadow-lg shadow-purple-500/5 active:border-2 active:border-purple-500/10'
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
        locked && 'cursor-not-allowed opacity-50'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center transition-colors duration-200',
          active ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {!isCollapsed && (
        <div className="flex flex-1 items-center justify-between overflow-hidden">
          <span className="truncate">{label}</span>
          <div className="flex items-center gap-2">
            {locked && <Shield className="h-3 w-3 text-gray-600" />}
            {comingSoon && (
              <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 font-medium text-[10px] text-blue-400 leading-none">
                SOON
              </span>
            )}
            {badge && badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-500 px-1.5 font-bold text-[10px] text-white">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
            {label === 'Departments' && (
              <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 font-medium text-[10px] text-green-400 leading-none">
                NEW
              </span>
            )}
            {label === 'Resources' && (
              <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 font-medium text-[10px] text-green-400 leading-none">
                NEW
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={locked ? '#' : href}
              className="block w-full outline-none"
            >
              {content}
            </Link>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="flex items-center gap-2 border-gray-800 bg-gray-900 text-gray-200"
          >
            {label}
            {locked && <Shield className="h-3 w-3 text-gray-500" />}
            {comingSoon && (
              <span className="rounded bg-blue-500/20 px-1 py-0.5 text-[10px] text-blue-400">
                SOON
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (locked) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full cursor-not-allowed">{content}</div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="border-gray-800 bg-gray-900 text-gray-200"
          >
            <p>{lockReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Link href={href} className="block w-full outline-none">
      {content}
    </Link>
  );
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  isCollapsed: boolean;
  defaultOpen?: boolean;
}

function SidebarSection({
  title,
  children,
  isCollapsed,
  defaultOpen = true,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return <div className="space-y-2">{children}</div>;
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center justify-between px-3 py-1.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wider transition-colors duration-200 hover:text-gray-400"
      >
        <span>{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <ChevronLeft className="h-3 w-3" />
        </motion.div>
      </button>

      <motion.div
        className="overflow-hidden"
        initial={{ height: defaultOpen ? 'auto' : 0 }}
        animate={{
          height: isOpen ? 'auto' : 0,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
      >
        <div className="space-y-1">{children}</div>
      </motion.div>
    </div>
  );
}

export function HubSidebar({
  hubId,
  canModerate = false,
  canEdit = false,
  isCollapsed = false,
  onToggleCollapse,
  pendingCounts,
}: HubSidebarProps) {
  const pathname = usePathname();
  const { hub } = useHub();
  const trpc = useTRPC();
  const { data: accessibleHubsData } = useQuery(
    trpc.user.getAccessibleHubs.queryOptions()
  );

  // Simplified configuration
  const sidebarConfig: SidebarSection[] = [
    {
      key: 'main',
      items: [
        {
          value: 'overview',
          label: 'Overview',
          color: 'default',
          icon: MessageSquare,
          href: `/dashboard/hubs/${hubId}`,
          show: true,
        },
        {
          value: 'discovery',
          label: 'Discovery',
          color: 'yellow',
          icon: Globe,
          href: `/dashboard/hubs/${hubId}/discoverability`,
          show: true,
          locked: ({ canEdit }) => !canEdit,
          lockReason: 'Requires Manager role',
        },
      ],
    },
    {
      key: 'management',
      title: 'Management',
      defaultOpen: true,
      items: [
        {
          value: 'members',
          label: 'Team',
          color: 'blue',
          icon: Users,
          href: `/dashboard/hubs/${hubId}/members`,
          show: ({ canEdit }) => canEdit,
        },
        {
          value: 'connections',
          label: 'Connections',
          color: 'green',
          icon: Home,
          href: `/dashboard/hubs/${hubId}/connections`,
          show: ({ canModerate }) => canModerate,
        },
        {
          value: 'logging',
          label: 'Logging',
          color: 'indigo',
          icon: FileText,
          href: `/dashboard/hubs/${hubId}/logging`,
          show: true,
          locked: ({ canEdit }) => !canEdit,
          lockReason: 'Requires Manager role',
        },
        {
          value: 'modules',
          label: 'Modules',
          color: 'default',
          icon: Package,
          href: `/dashboard/hubs/${hubId}/modules`,
          show: true,
        },
      ],
    },
    {
      key: 'moderation',
      title: 'Moderation',
      defaultOpen: true,
      items: [
        {
          value: 'reports',
          label: 'Reports',
          color: 'red',
          icon: Shield,
          href: `/dashboard/hubs/${hubId}/reports`,
          show: ({ canModerate }) => canModerate,
        },
        {
          value: 'appeals',
          label: 'Appeals',
          color: 'orange',
          icon: Bell,
          href: `/dashboard/hubs/${hubId}/appeals`,
          show: ({ canModerate }) => canModerate,
        },
        {
          value: 'infractions',
          label: 'Infractions',
          color: 'purple',
          icon: Gavel,
          href: `/dashboard/hubs/${hubId}/infractions`,
          show: ({ canModerate }) => canModerate,
        },
        {
          value: 'automod',
          label: 'AutoMod',
          color: 'green',
          icon: Shield,
          href: `/dashboard/hubs/${hubId}/automod`,
          show: ({ canModerate }) => canModerate,
        },
      ],
    },
  ];

  const permissions = { canModerate, canEdit };

  // Filter sections based on permissions
  const visibleSections = sidebarConfig
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        typeof item.show === 'function' ? item.show(permissions) : item.show
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden bg-[#0b0f1a] transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Hub Header */}
      {!isCollapsed && (
        <div className="flex h-16 shrink-0 items-center px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex w-full items-center justify-between rounded-lg p-2 outline-none transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Avatar className="h-8 w-8 shrink-0 rounded-md">
                    <AvatarImage src={hub?.iconUrl} alt={hub?.name} />
                    <AvatarFallback className="bg-purple-500/20 text-purple-300 text-xs">
                      {hub?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-left font-bold text-gray-200 group-hover:text-white">
                    {hub?.name || 'Loading...'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition-colors group-hover:text-gray-300" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 border-gray-800 bg-[#0b0f1a] text-gray-200"
              align="start"
            >
              <div className="px-2 py-1.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Switch Hub
              </div>
              {accessibleHubsData?.hubs.map((h) => (
                <DropdownMenuItem
                  key={h.id}
                  asChild
                  className="cursor-pointer focus:bg-white/5 focus:text-white"
                >
                  <Link
                    href={`/dashboard/hubs/${h.id}`}
                    className="flex w-full items-center gap-2"
                  >
                    <Avatar className="h-6 w-6 shrink-0 rounded-md">
                      <AvatarImage src={h.iconUrl} alt={h.name} />
                      <AvatarFallback className="bg-purple-500/20 text-[10px] text-purple-300">
                        {h.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate">{h.name}</span>
                    {h.id === hubId && (
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation */}
      <div className="scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent hover:scrollbar-thumb-gray-700 flex-1 space-y-6 overflow-y-auto px-3 py-4 transition-colors">
        {visibleSections.map((section) => {
          const sectionItems = section.items.map((item) => {
            const isLocked =
              item.locked &&
              (typeof item.locked === 'function'
                ? item.locked(permissions)
                : item.locked);

            // Get badge count for this item
            let badgeCount: number | undefined;
            if (pendingCounts) {
              if (item.value === 'reports') badgeCount = pendingCounts.reports;
              else if (item.value === 'appeals')
                badgeCount = pendingCounts.appeals;
              else if (item.value === 'infractions')
                badgeCount = pendingCounts.infractions;
            }

            return (
              <SidebarNavItem
                key={item.value}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
                isCollapsed={isCollapsed}
                locked={isLocked}
                lockReason={item.lockReason}
                badge={badgeCount}
                comingSoon={item.comingSoon}
              />
            );
          });

          // Render items directly if no title
          if (!section.title) {
            return (
              <div key={section.key} className="space-y-1">
                {sectionItems}
              </div>
            );
          }

          // Render as collapsible section
          return (
            <div key={section.key}>
              <SidebarSection
                title={section.title}
                isCollapsed={isCollapsed}
                defaultOpen={section.defaultOpen}
              >
                {sectionItems}
              </SidebarSection>
            </div>
          );
        })}
      </div>

      {/* Collapse Button */}
      {onToggleCollapse && (
        <div className="p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-9 w-full rounded-lg text-gray-500 transition-colors duration-200 hover:bg-gray-800/50 hover:text-gray-300"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </Button>
        </div>
      )}
    </div>
  );
}
