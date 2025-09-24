'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gavel,
  Globe,
  Home,
  MessageSquare,
  MessageCircle,
  Package,
  Shield,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface HubSidebarProps {
  hubId: string;
  canModerate?: boolean;
  canEdit?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface SidebarNavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  isCollapsed: boolean;
  color?: 'default' | 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'yellow' | 'indigo';
}

interface NavigationItem {
  value: string;
  label: string;
  color: 'default' | 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'yellow' | 'indigo';
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  show: boolean | ((permissions: { canModerate: boolean; canEdit: boolean }) => boolean);
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
  color = 'default',
}: SidebarNavItemProps) {
  const colorClasses = {
    default: {
      active:
        'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-400/50 shadow-lg shadow-purple-500/10 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/30 border-transparent backdrop-blur-sm',
      icon: active
        ? 'text-purple-300 bg-purple-400/20 shadow-sm shadow-purple-500/20'
        : 'text-purple-400 group-hover:text-white group-hover:bg-purple-400/15',
    },
    blue: {
      active:
        'bg-gradient-to-r from-blue-500/15 to-cyan-500/15 text-blue-300 border-blue-400/40 shadow-lg shadow-blue-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-blue-500/10 hover:border-blue-500/30 border-transparent backdrop-blur-sm',
      icon: active
        ? 'text-blue-300 bg-blue-400/15'
        : 'text-blue-400 group-hover:text-white group-hover:bg-blue-400/10',
    },
    green: {
      active:
        'bg-gradient-to-r from-emerald-500/15 to-green-500/15 text-emerald-300 border-emerald-400/40 shadow-lg shadow-emerald-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 border-transparent backdrop-blur-sm',
      icon: active
        ? 'text-emerald-300 bg-emerald-400/15'
        : 'text-emerald-400 group-hover:text-white group-hover:bg-emerald-400/10',
    },
    purple: {
      active:
        'bg-gradient-to-r from-purple-500/15 to-indigo-500/15 text-purple-300 border-purple-400/40 shadow-lg shadow-purple-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/30 border-transparent backdrop-blur-sm',
      icon: active
        ? 'text-purple-300 bg-purple-400/15'
        : 'text-purple-400 group-hover:text-white group-hover:bg-purple-400/10',
    },
    red: {
      active:
        'bg-gradient-to-r from-red-500/15 to-pink-500/15 text-red-300 border-red-400/40 shadow-lg shadow-red-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 border-transparent backdrop-blur-sm',
      icon: active
        ? 'text-red-300 bg-red-400/15'
        : 'text-red-400 group-hover:text-white group-hover:bg-red-400/10',
    },
    orange: {
      active:
        'bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-300 border-orange-400/40 shadow-lg shadow-orange-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-orange-500/10 hover:border-orange-500/30 border-transparent backdrop-blur-sm',
      icon: active
        ? 'text-orange-300 bg-orange-400/15'
        : 'text-orange-400 group-hover:text-white group-hover:bg-orange-400/10',
    },
    yellow: {
      active:
        'bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-300 border-amber-400/40 shadow-lg shadow-amber-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-amber-500/10 hover:border-amber-500/30 border-transparent backdrop-blur-sm',
      icon: active
        ? 'text-amber-300 bg-amber-400/15'
        : 'text-amber-400 group-hover:text-white group-hover:bg-amber-400/10',
    },
    indigo: {
      active:
        'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border-indigo-400/40 shadow-lg shadow-indigo-500/5 backdrop-blur-sm',
      inactive:
        'text-gray-300 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/30 border-transparent backdrop-blur-sm',
      icon: active
        ? 'text-indigo-300 bg-indigo-400/15'
        : 'text-indigo-400 group-hover:text-white group-hover:bg-indigo-400/10',
    },
  };

  const colors = colorClasses[color];

  const content = (
    <Link
      href={href}
      className={cn(
        'flex items-center text-sm font-medium rounded-2xl transition-all duration-300 group relative border',
        isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        active
          ? `${colors.active} border scale-[0.98]`
          : `${colors.inactive} hover:shadow-md hover:shadow-black/5 hover:scale-[0.99]`,
      )}
    >
      <div className={cn('p-1.5 rounded-xl transition-all duration-300 shrink-0', colors.icon)}>
        <Icon className="h-4 w-4" />
      </div>

      {!isCollapsed && <span className="truncate font-medium text-sm">{label}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="ml-3 bg-gray-900/95 border-gray-700/50 text-gray-200 rounded-xl shadow-xl backdrop-blur-md"
          >
            <p className="font-medium text-sm">{label}</p>
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

function SidebarSection({ title, children, isCollapsed, defaultOpen = true }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return <div className="space-y-2">{children}</div>;
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-all duration-300 group rounded-xl hover:bg-gray-800/30 backdrop-blur-sm border border-transparent hover:border-gray-700/50"
      >
        <span className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent group-hover:from-white group-hover:to-gray-200 transition-all duration-300">
            {title}
          </span>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-gray-400 group-hover:text-gray-200 transition-colors duration-300"
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
          show: ({ canEdit }) => canEdit,
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
          show: ({ canModerate }) => canModerate,
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
          show: ({ canEdit }) => canEdit,
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
        typeof item.show === 'function' ? item.show(permissions) : item.show,
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-gradient-to-b from-gray-900/98 to-gray-950/98 backdrop-blur-xl border-r border-gray-700/40 transition-all duration-300 shadow-2xl shadow-black/20',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700/40 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold text-white tracking-wide">Hub Dashboard</div>
          </div>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50 shrink-0 rounded-xl transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-gray-600/40 shadow-sm hover:shadow-lg"
          >
            <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </motion.div>
          </Button>
        )}
      </div>

      {/* Premium Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 hub-sidebar-scrollbar scrollbar-thin scrollbar-thumb-gray-700/30 scrollbar-track-transparent hover:scrollbar-thumb-gray-600/50 transition-colors">
        {visibleSections.map((section) => {
          const sectionItems = section.items.map((item) => (
            <SidebarNavItem
              key={item.value}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
              isCollapsed={isCollapsed}
              color={item.color}
            />
          ));

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

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-gray-700/40 bg-gradient-to-t from-gray-950/80 to-transparent backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="text-gray-400">v5.0.5</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse mx-auto" />
        )}
      </div>
    </div>
  );
}