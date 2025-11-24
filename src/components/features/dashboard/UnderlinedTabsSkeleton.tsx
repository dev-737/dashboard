'use client';

import type * as React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UnderlinedTabsSkeletonProps {
  tabs: {
    value: string;
    label: string;
    color?: 'indigo' | 'blue' | 'green' | 'purple' | 'red';
  }[];
  children?: React.ReactNode;
  className?: string;
}

export function UnderlinedTabsSkeleton({
  tabs,
  children,
  className,
}: UnderlinedTabsSkeletonProps) {
  // Get the first tab value to use as default
  const defaultValue = tabs.length > 0 ? tabs[0].value : 'default';

  return (
    <Tabs
      defaultValue={defaultValue}
      className={`w-full space-y-6 ${className || ''}`}
    >
      <div className="-mx-6 no-scrollbar relative z-10 overflow-x-auto border-gray-800/50 border-b bg-gray-900/80 px-0 shadow-sm backdrop-blur-md transition-all duration-200">
        <div className="w-full px-2 sm:px-4 md:px-6">
          {/* Scroll indicators for mobile */}
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-6 bg-linear-to-l from-gray-900/90 to-transparent sm:hidden sm:w-8" />
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-6 bg-linear-to-r from-gray-900/90 to-transparent sm:hidden sm:w-8" />

          <TabsList className="mx-auto flex h-auto w-full min-w-max max-w-screen-xl flex-nowrap justify-start gap-1 rounded-none bg-transparent p-0 sm:justify-center sm:gap-2 md:gap-6">
            {tabs.map((tab) => {
              // Define colors for each tab type
              const colorMap: Record<
                string,
                { borderColor: string; color: string }
              > = {
                indigo: { borderColor: '#6366f1', color: '#818cf8' },
                blue: { borderColor: '#3b82f6', color: '#60a5fa' },
                green: { borderColor: '#10b981', color: '#34d399' },
                purple: { borderColor: '#8b5cf6', color: '#a78bfa' },
                red: { borderColor: '#ef4444', color: '#f87171' },
                default: { borderColor: '#6366f1', color: '#818cf8' },
              };

              const color = tab.color || 'indigo';

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="min-w-0 shrink-0 cursor-pointer whitespace-nowrap rounded-none border-transparent border-b-[2px] bg-transparent px-2 py-2.5 font-medium text-gray-400 text-xs shadow-none transition-all duration-200 hover:text-gray-300 focus:shadow-none focus:outline-none focus:ring-0 data-[state=active]:border-(--tab-border-color) data-[state=active]:text-(--tab-text-color) sm:px-4 sm:py-3 sm:text-sm md:px-6 md:py-4"
                  style={
                    {
                      '--tab-border-color': colorMap[color].borderColor,
                      '--tab-text-color': colorMap[color].color,
                    } as React.CSSProperties
                  }
                >
                  <span className="truncate text-xs sm:text-sm">
                    {tab.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </div>
      {children}
    </Tabs>
  );
}
