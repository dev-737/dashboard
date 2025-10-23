'use client';

import { motion } from 'motion/react';
import { useDashboardLayout } from '../LayoutProvider';
import { HubProvider, useHub } from './HubContext';
import { HubMobileDropdown } from './HubMobileDropdown';
import { HubSidebar } from './HubSidebar';
import { UnifiedHubHeader } from './UnifiedHubHeader';

interface HubLayoutProps {
  hub: {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    bannerUrl: string | null;
    private: boolean;
    nsfw: boolean;
    connectionCount: number;
  };
  currentTab: string;
  canModerate?: boolean;
  canEdit?: boolean;
  backHref?: string;
  headerActions?: React.ReactNode;
  onHubUpdate?: (updates: { iconUrl?: string; bannerUrl?: string }) => void;
  children: React.ReactNode;
}

// Internal component that uses the hub context
function HubLayoutContent({
  canModerate = false,
  canEdit = false,
  backHref = '/dashboard',
  headerActions,
  children,
}: Omit<HubLayoutProps, 'hub' | 'onHubUpdate'>) {
  // Get dashboard layout context for hub sidebar state
  const { isHydrated, hubSidebarCollapsed, setHubSidebarCollapsed } =
    useDashboardLayout();

  // Get hub data from context
  const { hub, updateIcon, updateBanner } = useHub();

  // Handle hub updates
  const handleHubUpdate = (updates: {
    iconUrl?: string;
    bannerUrl?: string;
  }) => {
    if (updates.iconUrl) {
      updateIcon(updates.iconUrl);
    }
    if (updates.bannerUrl !== undefined) {
      updateBanner(updates.bannerUrl);
    }
  };

  return (
    <div className="relative min-h-screen pb-6">
      {/* Fixed Hub Sidebar - Desktop only with proper spacing and rounded corners */}
      {isHydrated && (
        <div
          className={`fixed top-20 bottom-6 left-4 z-30 hidden transition-all duration-300 lg:block ${
            hubSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <HubSidebar
            hubId={hub.id}
            canModerate={canModerate}
            canEdit={canEdit}
            isCollapsed={hubSidebarCollapsed}
            onToggleCollapse={() =>
              setHubSidebarCollapsed(!hubSidebarCollapsed)
            }
          />
        </div>
      )}

      {/* Main Content Area with proper margin and spacing */}
      <div
        className={`px-4 transition-all duration-300 lg:pr-4 ${
          isHydrated
            ? hubSidebarCollapsed
              ? 'lg:ml-24'
              : 'lg:ml-72'
            : 'lg:ml-72'
        }`}
      >
        {/* Unified Hub Header */}
        <UnifiedHubHeader
          hub={hub}
          backHref={backHref}
          actions={headerActions}
          canEdit={canEdit}
          onHubUpdate={handleHubUpdate}
        />

        <div className="mt-6 lg:hidden">
          <div className="sticky top-0 z-20 mb-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-gray-900/98 via-gray-900/95 to-gray-900/98 p-4 shadow-lg backdrop-blur-md">
            <HubMobileDropdown
              hubId={hub.id}
              canModerate={canModerate}
              canEdit={canEdit}
            />

            {/* Helper text */}
            <motion.p
              className="mt-2 flex items-center justify-center gap-1 text-center text-gray-400 text-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <span>👆</span> Tap to access hub features
            </motion.p>
          </div>
        </div>

        {/* Page Content with rounded container */}
        <div className="mt-6">
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Main export component that provides the hub context
export function HubLayout({
  hub,
  currentTab,
  canModerate = false,
  canEdit = false,
  backHref = '/dashboard',
  headerActions,
  children,
}: Omit<HubLayoutProps, 'onHubUpdate'>) {
  return (
    <HubProvider initialHub={hub}>
      <HubLayoutContent
        currentTab={currentTab}
        canModerate={canModerate}
        canEdit={canEdit}
        backHref={backHref}
        headerActions={headerActions}
      >
        {children}
      </HubLayoutContent>
    </HubProvider>
  );
}
