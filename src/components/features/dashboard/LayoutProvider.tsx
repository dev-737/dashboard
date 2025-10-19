'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useMobile } from '@/hooks/use-mobile';

interface DashboardLayoutContextType {
  hubSidebarCollapsed: boolean;
  setHubSidebarCollapsed: (collapsed: boolean) => void;
  hubSidebarWidth: number;
  isHydrated: boolean;
}

const DashboardLayoutContext = createContext<
  DashboardLayoutContextType | undefined
>(undefined);

export function useDashboardLayout() {
  const context = useContext(DashboardLayoutContext);
  if (context === undefined) {
    throw new Error(
      'useDashboardLayout must be used within a DashboardLayoutProvider'
    );
  }
  return context;
}

interface DashboardLayoutProviderProps {
  children: ReactNode;
}

export function DashboardLayoutProvider({
  children,
}: DashboardLayoutProviderProps) {
  const [hubSidebarCollapsed, setHubSidebarCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const isMobile = useMobile();

  useEffect(() => {
    const savedHubState = localStorage.getItem('hubSidebarCollapsed');
    if (savedHubState !== null) {
      setHubSidebarCollapsed(JSON.parse(savedHubState));
    } else {
      // Default to collapsed on mobile
      setHubSidebarCollapsed(isMobile);
    }
    setIsHydrated(true);
  }, [isMobile]);

  const hubSidebarWidth = hubSidebarCollapsed ? 64 : 256;

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(
        'hubSidebarCollapsed',
        JSON.stringify(hubSidebarCollapsed)
      );
    }
  }, [hubSidebarCollapsed, isHydrated]);

  const value = {
    hubSidebarCollapsed,
    setHubSidebarCollapsed,
    hubSidebarWidth,
    isHydrated,
  };

  return (
    <DashboardLayoutContext.Provider value={value}>
      {children}
    </DashboardLayoutContext.Provider>
  );
}
