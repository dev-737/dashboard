'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

interface HubData {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  bannerUrl: string | null;
  private: boolean;
  nsfw: boolean;
  connectionCount: number;
}

interface HubContextType {
  hub: HubData;
  updateHub: (updates: Partial<HubData>) => void;
  updateIcon: (iconUrl: string) => void;
  updateBanner: (bannerUrl: string | null) => void;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

export function useHub() {
  const context = useContext(HubContext);
  if (context === undefined) {
    throw new Error('useHub must be used within a HubProvider');
  }
  return context;
}

interface HubProviderProps {
  children: ReactNode;
  initialHub: HubData;
}

export function HubProvider({ children, initialHub }: HubProviderProps) {
  const [hub, setHub] = useState<HubData>(initialHub);

  const updateHub = useCallback((updates: Partial<HubData>) => {
    setHub((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateIcon = useCallback((iconUrl: string) => {
    setHub((prev) => ({ ...prev, iconUrl }));
  }, []);

  const updateBanner = useCallback((bannerUrl: string | null) => {
    setHub((prev) => ({ ...prev, bannerUrl }));
  }, []);

  const value = {
    hub,
    updateHub,
    updateIcon,
    updateBanner,
  };

  return <HubContext.Provider value={value}>{children}</HubContext.Provider>;
}
