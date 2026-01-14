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
  pendingCounts?: {
    reports?: number;
    appeals?: number;
    infractions?: number;
  };
  onHubUpdate?: (updates: { iconUrl?: string; bannerUrl?: string }) => void;
  children: React.ReactNode;
}

function HubLayoutContent({
  canModerate = false,
  canEdit = false,
  headerActions,
  pendingCounts,
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
    // Outer Shell: Fixed height, no scroll on body
    <div className="relative h-screen overflow-hidden bg-dash-hub-sidebar">
      {/* Fixed Hub Sidebar */}
      {isHydrated && (
        <div
          className={`fixed top-16 bottom-0 left-0 z-30 hidden transition-all duration-300 lg:block ${
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
            pendingCounts={pendingCounts}
          />
        </div>
      )}

      <div
        className={`fixed top-16 right-0 bottom-0 mr-3 mb-3 overflow-y-auto rounded-r-2xl rounded-l-2xl border-white/10 border-t border-l bg-[rgb(11,11,24)] px-4 pt-6 transition-all duration-300 ${
          isHydrated
            ? hubSidebarCollapsed
              ? 'left-0 lg:left-16'
              : 'left-0 lg:left-64'
            : 'left-0 lg:left-64'
        }`}
      >
        {/* Unified Hub Header */}
        <UnifiedHubHeader
          hub={hub}
          actions={headerActions}
          canEdit={canEdit}
          onHubUpdate={handleHubUpdate}
        />

        <div className="mt-6 lg:hidden">
          <div className="sticky top-0 z-20 mb-4 rounded-2xl border border-indigo-500/30 bg-linear-to-r from-gray-900/98 via-gray-900/95 to-gray-900/98 p-4 shadow-lg backdrop-blur-md">
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

        <div className="mt-6 pb-6">
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
  headerActions,
  pendingCounts,
  children,
}: Omit<HubLayoutProps, 'onHubUpdate'>) {
  return (
    <HubProvider initialHub={hub}>
      <HubLayoutContent
        currentTab={currentTab}
        canModerate={canModerate}
        canEdit={canEdit}
        headerActions={headerActions}
        pendingCounts={pendingCounts}
      >
        {children}
      </HubLayoutContent>
    </HubProvider>
  );
}
