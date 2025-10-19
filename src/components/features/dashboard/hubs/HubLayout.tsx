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
  showBackButton?: boolean;
  backHref?: string;
  headerActions?: React.ReactNode;
  onHubUpdate?: (updates: { iconUrl?: string; bannerUrl?: string }) => void;
  children: React.ReactNode;
}

// Internal component that uses the hub context
function HubLayoutContent({
  canModerate = false,
  canEdit = false,
  showBackButton = true,
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
    <div className="relative">
      {/* Fixed Hub Sidebar - Desktop only, positioned from left edge since no main sidebar */}
      {isHydrated && (
        <div
          className={`fixed top-16 bottom-0 z-30 hidden transition-all duration-300 lg:block ${
            hubSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
          style={{
            left: 0, // Position from left edge since main sidebar is removed
          }}
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

      {/* Main Content Area - Add margin to account for hub sidebar on desktop only */}
      <div
        className={`transition-all duration-300 ${
          isHydrated
            ? hubSidebarCollapsed
              ? 'lg:ml-16'
              : 'lg:ml-64'
            : 'lg:ml-64'
        }`}
      >
        {/* Unified Hub Header */}
        <UnifiedHubHeader
          hub={hub}
          showBackButton={showBackButton}
          backHref={backHref}
          actions={headerActions}
          canEdit={canEdit}
          onHubUpdate={handleHubUpdate}
        />

        <div className="mt-8 lg:hidden">
          <div className="-mx-4 sticky top-0 z-20 mb-4 border-indigo-500/30 border-b bg-gradient-to-r from-gray-900/98 via-gray-900/95 to-gray-900/98 p-4 shadow-lg backdrop-blur-md">
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

        {/* Page Content */}
        <div className="mt-8">
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
  showBackButton = true,
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
        showBackButton={showBackButton}
        backHref={backHref}
        headerActions={headerActions}
      >
        {children}
      </HubLayoutContent>
    </HubProvider>
  );
}
