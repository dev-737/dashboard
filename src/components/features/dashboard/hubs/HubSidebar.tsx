'use client';

import {
  Bell,
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
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
  color = 'default',
}: SidebarNavItemProps) {
  const colorClasses = {
    default: {
      active:
        'bg-purple-500/10 text-white border-purple-500/30',
      inactive:
        'text-gray-400 hover:text-white hover:bg-gray-800/40 hover:border-gray-700/50 border-transparent',
      locked:
        'text-gray-500 border-gray-800/50 cursor-not-allowed opacity-50',
      icon: active
        ? 'text-purple-400'
        : 'text-gray-500 group-hover:text-purple-400',
      iconLocked: 'text-gray-600',
    },
    blue: {
      active:
        'bg-blue-500/10 text-white border-blue-500/30',
      inactive:
        'text-gray-400 hover:text-white hover:bg-gray-800/40 hover:border-gray-700/50 border-transparent',
      locked:
        'text-gray-500 border-gray-800/50 cursor-not-allowed opacity-50',
      icon: active
        ? 'text-blue-400'
        : 'text-gray-500 group-hover:text-blue-400',
      iconLocked: 'text-gray-600',
    },
    green: {
      active:
        'bg-emerald-500/10 text-white border-emerald-500/30',
      inactive:
        'text-gray-400 hover:text-white hover:bg-gray-800/40 hover:border-gray-700/50 border-transparent',
      locked:
        'text-gray-500 border-gray-800/50 cursor-not-allowed opacity-50',
      icon: active
        ? 'text-emerald-400'
        : 'text-gray-500 group-hover:text-emerald-400',
      iconLocked: 'text-gray-600',
    },
    purple: {
      active:
        'bg-purple-500/10 text-white border-purple-500/30',
      inactive:
        'text-gray-400 hover:text-white hover:bg-gray-800/40 hover:border-gray-700/50 border-transparent',
      locked:
        'text-gray-500 border-gray-800/50 cursor-not-allowed opacity-50',
      icon: active
        ? 'text-purple-400'
        : 'text-gray-500 group-hover:text-purple-400',
      iconLocked: 'text-gray-600',
    },
    red: {
      active:
        'bg-red-500/10 text-white border-red-500/30',
      inactive:
        'text-gray-400 hover:text-white hover:bg-gray-800/40 hover:border-gray-700/50 border-transparent',
      locked:
        'text-gray-500 border-gray-800/50 cursor-not-allowed opacity-50',
      icon: active
        ? 'text-red-400'
        : 'text-gray-500 group-hover:text-red-400',
      iconLocked: 'text-gray-600',
    },
    orange: {
      active:
        'bg-orange-500/10 text-white border-orange-500/30',
      inactive:
        'text-gray-400 hover:text-white hover:bg-gray-800/40 hover:border-gray-700/50 border-transparent',
      locked:
        'text-gray-500 border-gray-800/50 cursor-not-allowed opacity-50',
      icon: active
        ? 'text-orange-400'
        : 'text-gray-500 group-hover:text-orange-400',
      iconLocked: 'text-gray-600',
    },
    yellow: {
      active:
        'bg-amber-500/10 text-white border-amber-500/30',
      inactive:
        'text-gray-400 hover:text-white hover:bg-gray-800/40 hover:border-gray-700/50 border-transparent',
      locked:
        'text-gray-500 border-gray-800/50 cursor-not-allowed opacity-50',
      icon: active
        ? 'text-amber-400'
        : 'text-gray-500 group-hover:text-amber-400',
      iconLocked: 'text-gray-600',
    },
    indigo: {
      active:
        'bg-indigo-500/10 text-white border-indigo-500/30',
      inactive:
        'text-gray-400 hover:text-white hover:bg-gray-800/40 hover:border-gray-700/50 border-transparent',
      locked:
        'text-gray-500 border-gray-800/50 cursor-not-allowed opacity-50',
      icon: active
        ? 'text-indigo-400'
        : 'text-gray-500 group-hover:text-indigo-400',
      iconLocked: 'text-gray-600',
    },
  };

  const colors = colorClasses[color];

  const content = locked ? (
    <div
      className={cn(
        'group relative flex items-center rounded-lg border transition-all duration-200',
        isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2',
        colors.locked
      )}
    >
      <div className="shrink-0">
        <Icon className={cn('h-4 w-4 transition-colors duration-200', colors.iconLocked)} />
      </div>

      {!isCollapsed && (
        <span className="truncate text-sm">{label}</span>
      )}
    </div>
  ) : (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center rounded-lg border transition-all duration-200',
        isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2',
        active
          ? colors.active
          : colors.inactive
      )}
    >
      <div className="shrink-0">
        <Icon className={cn('h-4 w-4 transition-colors duration-200', colors.icon)} />
      </div>

      {!isCollapsed && (
        <>
          <span className="flex-1 truncate text-sm">{label}</span>
          {comingSoon ? (
            <span className="flex h-5 items-center justify-center rounded-md bg-amber-500/90 px-2 text-[10px] font-semibold text-white uppercase tracking-wide">
              Soon
            </span>
          ) : (
            badge !== undefined &&
            badge > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-red-500 px-1.5 text-xs font-semibold text-white">
                {badge > 99 ? '99+' : badge}
              </span>
            )
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed || locked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="ml-2 rounded-lg border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200"
          >
            {locked ? (
              <div className="space-y-0.5">
                <p className="font-medium">{label}</p>
                <p className="text-xs text-gray-400">{lockReason}</p>
              </div>
            ) : (
              <p>{label}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
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
        className="group flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider transition-colors duration-200 hover:text-gray-400"
      >
        <span>{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <ChevronRight className="h-3 w-3" />
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
        'flex h-full flex-col overflow-hidden border-r border-gray-800/60 bg-[#0b0f1a] transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Navigation */}
      <div className="scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent hover:scrollbar-thumb-gray-700 flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-20 transition-colors">
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
                color={item.color}
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
        <div className="border-t border-gray-800/80 p-3">
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
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </Button>
        </div>
      )}
    </div>
  );
}
