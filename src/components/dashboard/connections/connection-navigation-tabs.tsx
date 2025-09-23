'use client';

import { Edit, MessageSquare } from 'lucide-react';
import { UnderlinedTabs } from '@/components/dashboard/underlined-tabs';

interface ConnectionNavigationTabsProps {
  connectionId: string;
  currentTab: string;
}

export function ConnectionNavigationTabs({
  connectionId,
  currentTab,
}: ConnectionNavigationTabsProps) {
  return (
    <UnderlinedTabs
      defaultValue={currentTab}
      className="w-full space-y-8"
      navigational={true}
      tabs={[
        {
          value: 'overview',
          label: (
            <>
              <span className="sm:inline">Overview</span>
              <span className="inline sm:hidden">Info</span>
            </>
          ),
          color: 'indigo' as const,
          icon: <MessageSquare className="h-4 w-4" />,
          href: `/dashboard/connections/${connectionId}`,
        },
        {
          value: 'edit',
          label: (
            <>
              <span className="sm:inline">Edit Connection</span>
              <span className="inline sm:hidden">Edit</span>
            </>
          ),
          color: 'blue' as const,
          icon: <Edit className="h-4 w-4" />,
          href: `/dashboard/connections/${connectionId}/edit`,
        },
      ]}
    />
  );
}

// Loading skeleton version of the tabs
export function ConnectionNavigationTabsSkeleton({
  currentTab = 'overview',
}: {
  currentTab?: string;
}) {
  // Define tab colors for the active state
  const tabColors: Record<string, { borderColor: string; textColor: string }> =
    {
      overview: { borderColor: '#6366f1', textColor: '#818cf8' }, // indigo
      edit: { borderColor: '#3b82f6', textColor: '#60a5fa' }, // blue
    };

  return (
    <div className="-mx-6 no-scrollbar z-10 overflow-x-auto border-gray-800/50 border-b bg-gray-900/80 px-0 shadow-sm backdrop-blur-md transition-all duration-200">
      <div className="w-full px-4 sm:px-6">
        <div className="mx-auto flex h-auto w-full max-w-screen-xl flex-nowrap justify-start gap-2 rounded-none bg-transparent p-0 sm:justify-center sm:gap-6">
          {[
            {
              value: 'overview',
              icon: <MessageSquare className="h-4 w-4" />,
              label: (
                <>
                  <span className="hidden sm:inline">Overview</span>
                  <span className="inline sm:hidden">Info</span>
                </>
              ),
            },
            {
              value: 'edit',
              icon: <Edit className="h-4 w-4" />,
              label: (
                <>
                  <span className="hidden sm:inline">Edit Connection</span>
                  <span className="inline sm:hidden">Edit</span>
                </>
              ),
            },
          ].map((tab) => {
            const isActive = tab.value === currentTab;
            const activeColor = tabColors[tab.value] || tabColors.overview;

            return (
              <div
                key={tab.value}
                className={`flex items-center whitespace-nowrap border-b-[2px] px-3 py-3 font-medium text-sm transition-all duration-200 sm:px-6 sm:py-4 ${isActive ? `border-[${activeColor.borderColor}] text-[${activeColor.textColor}]` : 'border-transparent text-gray-500'}`}
                style={
                  isActive
                    ? {
                        borderColor: activeColor.borderColor,
                        color: activeColor.textColor,
                      }
                    : {}
                }
              >
                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
