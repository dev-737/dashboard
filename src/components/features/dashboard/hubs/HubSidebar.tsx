'use client';

import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gavel,
  Globe,
  Home,
  MessageCircle,
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
        'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-400/50 shadow-lg shadow-purple-500/10 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/30 border-transparent backdrop-blur-sm',
      locked:
        'text-gray-500 border-gray-700/30 cursor-not-allowed opacity-60 backdrop-blur-sm',
      icon: active
        ? 'text-purple-300 bg-purple-400/20 shadow-sm shadow-purple-500/20'
        : 'text-purple-400 group-hover:text-white group-hover:bg-purple-400/15',
      iconLocked: 'text-gray-600 bg-gray-700/10',
    },
    blue: {
      active:
        'bg-gradient-to-r from-blue-500/15 to-cyan-500/15 text-blue-300 border-blue-400/40 shadow-lg shadow-blue-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-blue-500/10 hover:border-blue-500/30 border-transparent backdrop-blur-sm',
      locked:
        'text-gray-500 border-gray-700/30 cursor-not-allowed opacity-60 backdrop-blur-sm',
      icon: active
        ? 'text-blue-300 bg-blue-400/15'
        : 'text-blue-400 group-hover:text-white group-hover:bg-blue-400/10',
      iconLocked: 'text-gray-600 bg-gray-700/10',
    },
    green: {
      active:
        'bg-gradient-to-r from-emerald-500/15 to-green-500/15 text-emerald-300 border-emerald-400/40 shadow-lg shadow-emerald-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 border-transparent backdrop-blur-sm',
      locked:
        'text-gray-500 border-gray-700/30 cursor-not-allowed opacity-60 backdrop-blur-sm',
      icon: active
        ? 'text-emerald-300 bg-emerald-400/15'
        : 'text-emerald-400 group-hover:text-white group-hover:bg-emerald-400/10',
      iconLocked: 'text-gray-600 bg-gray-700/10',
    },
    purple: {
      active:
        'bg-gradient-to-r from-purple-500/15 to-indigo-500/15 text-purple-300 border-purple-400/40 shadow-lg shadow-purple-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/30 border-transparent backdrop-blur-sm',
      locked:
        'text-gray-500 border-gray-700/30 cursor-not-allowed opacity-60 backdrop-blur-sm',
      icon: active
        ? 'text-purple-300 bg-purple-400/15'
        : 'text-purple-400 group-hover:text-white group-hover:bg-purple-400/10',
      iconLocked: 'text-gray-600 bg-gray-700/10',
    },
    red: {
      active:
        'bg-gradient-to-r from-red-500/15 to-pink-500/15 text-red-300 border-red-400/40 shadow-lg shadow-red-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 border-transparent backdrop-blur-sm',
      locked:
        'text-gray-500 border-gray-700/30 cursor-not-allowed opacity-60 backdrop-blur-sm',
      icon: active
        ? 'text-red-300 bg-red-400/15'
        : 'text-red-400 group-hover:text-white group-hover:bg-red-400/10',
      iconLocked: 'text-gray-600 bg-gray-700/10',
    },
    orange: {
      active:
        'bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-300 border-orange-400/40 shadow-lg shadow-orange-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-orange-500/10 hover:border-orange-500/30 border-transparent backdrop-blur-sm',
      locked:
        'text-gray-500 border-gray-700/30 cursor-not-allowed opacity-60 backdrop-blur-sm',
      icon: active
        ? 'text-orange-300 bg-orange-400/15'
        : 'text-orange-400 group-hover:text-white group-hover:bg-orange-400/10',
      iconLocked: 'text-gray-600 bg-gray-700/10',
    },
    yellow: {
      active:
        'bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-300 border-amber-400/40 shadow-lg shadow-amber-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-amber-500/10 hover:border-amber-500/30 border-transparent backdrop-blur-sm',
      locked:
        'text-gray-500 border-gray-700/30 cursor-not-allowed opacity-60 backdrop-blur-sm',
      icon: active
        ? 'text-amber-300 bg-amber-400/15'
        : 'text-amber-400 group-hover:text-white group-hover:bg-amber-400/10',
      iconLocked: 'text-gray-600 bg-gray-700/10',
    },
    indigo: {
      active:
        'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border-indigo-400/40 shadow-lg shadow-indigo-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/30 border-transparent backdrop-blur-sm',
      locked:
        'text-gray-500 border-gray-700/30 cursor-not-allowed opacity-60 backdrop-blur-sm',
      icon: active
        ? 'text-indigo-300 bg-indigo-400/15'
        : 'text-indigo-400 group-hover:text-white group-hover:bg-indigo-400/10',
      iconLocked: 'text-gray-600 bg-gray-700/10',
    },
  };

  const colors = colorClasses[color];

  const content = locked ? (
    <div
      className={cn(
        'group relative flex items-center rounded-2xl border font-medium text-sm transition-all duration-300',
        isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        colors.locked
      )}
    >
      <div
        className={cn(
          'shrink-0 rounded-xl p-1.5 transition-all duration-300',
          colors.iconLocked
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {!isCollapsed && (
        <span className="truncate font-medium text-sm">{label}</span>
      )}
    </div>
  ) : (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center rounded-2xl border font-medium text-sm transition-all duration-300',
        isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        active
          ? `${colors.active} scale-[0.98] border`
          : `${colors.inactive} hover:scale-[0.99] hover:shadow-black/5 hover:shadow-md`
      )}
    >
      <div
        className={cn(
          'shrink-0 rounded-xl p-1.5 transition-all duration-300',
          colors.icon
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {!isCollapsed && (
        <>
          <span className="flex-1 truncate font-medium text-sm">{label}</span>
          {comingSoon ? (
            <span className="flex h-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500/80 to-orange-500/80 px-2 font-bold text-[10px] text-white uppercase tracking-wide shadow-amber-500/30 shadow-sm">
              Soon
            </span>
          ) : (
            badge !== undefined &&
            badge > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500/90 px-1.5 font-bold text-white text-xs shadow-red-500/30 shadow-sm">
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
            className="ml-3 rounded-xl border-gray-700/50 bg-gray-900/95 text-gray-200 shadow-xl backdrop-blur-md"
          >
            {locked ? (
              <div className="space-y-1">
                <p className="font-medium text-sm">{label}</p>
                <p className="text-gray-400 text-xs">{lockReason}</p>
              </div>
            ) : (
              <p className="font-medium text-sm">{label}</p>
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
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-2 font-bold text-gray-400 text-xs uppercase tracking-wider backdrop-blur-sm transition-all duration-300 hover:border-gray-700/50 hover:bg-gray-800/30 hover:text-gray-200"
      >
        <span className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent transition-all duration-300 group-hover:from-white group-hover:to-gray-200">
            {title}
          </span>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-gray-400 transition-colors duration-300 group-hover:text-gray-200"
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
          duration: 0.3,
          ease: 'easeInOut',
        }}
      >
        {isOpen && (
          <div className="mx-3 mb-2 h-px bg-gradient-to-r from-transparent via-gray-700/40 to-transparent" />
        )}
        <div className="space-y-1.5 pl-1">{children}</div>
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
          value: 'messages',
          label: 'Messages',
          color: 'purple',
          icon: MessageCircle,
          href: `/dashboard/hubs/${hubId}/messages`,
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
        'flex h-full flex-col overflow-hidden border border-gray-700/40 bg-gradient-to-b from-gray-900/98 to-gray-950/98 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Premium Navigation */}
      <div className="hub-sidebar-scrollbar scrollbar-thin scrollbar-thumb-gray-700/30 scrollbar-track-transparent hover:scrollbar-thumb-gray-600/50 flex-1 space-y-5 overflow-y-auto p-4 transition-colors">
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
              <div key={section.key} className="space-y-1.5">
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
        <div className="border-t border-gray-700/40 p-4 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 shrink-0 rounded-xl border border-transparent text-gray-400 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-gray-600/40 hover:bg-gray-700/50 hover:text-white hover:shadow-lg"
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
