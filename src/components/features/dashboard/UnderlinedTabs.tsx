'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UnderlinedTabsProps {
  defaultValue: string;
  tabs: {
    value: string;
    label: React.ReactNode;
    color?: 'indigo' | 'blue' | 'green' | 'purple' | 'red' | 'pink' | 'orange';
    icon?: React.ReactNode;
    href?: string;
    badge?: string | number; // New: for notification badges
  }[];
  children?: React.ReactNode;
  className?: string;
  navigational?: boolean;
  compact?: boolean; // New: for smaller tabs
}

export function UnderlinedTabs({
  defaultValue,
  tabs,
  children,
  className = '',
  navigational = false,
  compact = false,
}: UnderlinedTabsProps) {
  const scrollContainer = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // Simplified scroll detection
  const updateScrollIndicators = React.useCallback(() => {
    if (!scrollContainer.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  // Setup scroll listener with cleanup
  React.useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;

    updateScrollIndicators();
    container.addEventListener('scroll', updateScrollIndicators, {
      passive: true,
    });
    window.addEventListener('resize', updateScrollIndicators, {
      passive: true,
    });

    return () => {
      container.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', updateScrollIndicators);
    };
  }, [updateScrollIndicators]);

  // Smooth scroll functions
  const scrollLeft = () => {
    scrollContainer.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainer.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // Simplified color system
  const getColorClasses = (color: string = 'indigo') => {
    const colorMap = {
      indigo:
        'data-[state=active]:border-indigo-400 data-[state=active]:text-indigo-300',
      blue: 'data-[state=active]:border-blue-400 data-[state=active]:text-blue-300',
      green:
        'data-[state=active]:border-emerald-400 data-[state=active]:text-emerald-300',
      purple:
        'data-[state=active]:border-purple-400 data-[state=active]:text-purple-300',
      red: 'data-[state=active]:border-red-400 data-[state=active]:text-red-300',
      pink: 'data-[state=active]:border-pink-400 data-[state=active]:text-pink-300',
      orange:
        'data-[state=active]:border-amber-400 data-[state=active]:text-amber-300',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.indigo;
  };

  return (
    <div className={`w-full ${className}`}>
      <Tabs defaultValue={defaultValue} className="w-full">
        {/* Tab Navigation */}
        <div className="relative border-gray-700/50 border-b backdrop-blur-sm">
          {/* Scroll Buttons - Desktop Only */}
          {canScrollLeft && (
            <Button
              onClick={scrollLeft}
              className="-translate-y-1/2 absolute top-1/2 left-2 z-20 hidden h-8 w-8 items-center justify-center rounded-lg border border-gray-600/50 bg-gray-800/80 transition-all duration-200 hover:bg-gray-700/80 sm:flex"
              aria-label="Scroll tabs left"
            >
              <ChevronLeft className="h-4 w-4 text-gray-300" />
            </Button>
          )}

          {canScrollRight && (
            <Button
              onClick={scrollRight}
              className="-translate-y-1/2 absolute top-1/2 right-2 z-20 hidden h-8 w-8 items-center justify-center rounded-lg border border-gray-600/50 bg-gray-800/80 transition-all duration-200 hover:bg-gray-700/80 sm:flex"
              aria-label="Scroll tabs right"
            >
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </Button>
          )}

          {/* Mobile Scroll Indicators */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-8 bg-linear-to-r from-gray-900/90 to-transparent sm:hidden" />
          )}
          {canScrollRight && (
            <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-8 bg-linear-to-l from-gray-900/90 to-transparent sm:hidden" />
          )}

          {/* Scrollable Tabs Container */}
          <div
            ref={scrollContainer}
            className="scrollbar-hide overflow-x-auto px-4 sm:px-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <TabsList className="flex h-auto w-max min-w-full items-center gap-1 bg-transparent p-0 sm:mx-auto sm:min-w-0 sm:justify-center">
              {tabs.map((tab) => {
                const colorClasses = getColorClasses(tab.color);
                const isCompact = compact;

                const TabContent = (
                  <div
                    key={`tab-content-${tab.value}`}
                    className={`flex items-center gap-2 ${isCompact ? 'gap-1.5' : 'gap-2'}`}
                  >
                    {tab.icon && (
                      <span
                        className={`shrink-0 ${isCompact ? 'text-sm' : ''}`}
                      >
                        {tab.icon}
                      </span>
                    )}
                    <span
                      className={`whitespace-nowrap font-medium ${isCompact ? 'text-sm' : ''}`}
                    >
                      {tab.label}
                    </span>
                    {tab.badge && (
                      <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-white text-xs">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                );

                const triggerClasses = `
                relative px-4 py-3 text-gray-400 hover:text-gray-200
                border-b-2 border-transparent transition-all duration-200
                bg-transparent shadow-none focus:outline-none focus:ring-0
                data-[state=active]:bg-transparent rounded-none
                before:absolute before:inset-0 before:-z-10 before:rounded-lg
                before:bg-gray-800/0 before:transition-colors before:duration-200
                hover:before:bg-gray-800/30 cursor-pointer
                ${colorClasses}
                ${isCompact ? 'px-3 py-2' : 'px-4 py-3'}
              `.trim();

                const TabTrigger = (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={triggerClasses}
                  >
                    {TabContent}
                  </TabsTrigger>
                );

                // Wrap with Link if navigational
                return navigational && tab.href ? (
                  <Link key={tab.value} href={tab.href} className="flex">
                    {TabTrigger}
                  </Link>
                ) : (
                  TabTrigger
                );
              })}
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        {!navigational && children}
      </Tabs>
    </div>
  );
}
