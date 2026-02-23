'use client';

import { Message02Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { UnderlinedTabs } from '@/components/features/dashboard/UnderlinedTabs';

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
              <span className="inline sm:hidden">InformationCircleIcon</span>
            </>
          ),
          color: 'indigo' as const,
          icon: (
            <HugeiconsIcon
              strokeWidth={3}
              icon={Message02Icon}
              className="h-4 w-4"
            />
          ),
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
          icon: (
            <HugeiconsIcon
              strokeWidth={3}
              icon={PencilEdit01Icon}
              className="h-4 w-4"
            />
          ),
          href: `/dashboard/connections/${connectionId}/edit`,
        },
      ]}
    />
  );
}

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
    <div className="no-scrollbar z-10 -mx-6 overflow-x-auto border-gray-800/50 border-b bg-gray-900/80 px-0 shadow-sm backdrop-blur-md transition-all duration-200">
      <div className="w-full px-4 sm:px-6">
        <div className="mx-auto flex h-auto w-full max-w-7xl flex-nowrap justify-start gap-2 rounded-none bg-transparent p-0 sm:justify-center sm:gap-6">
          {[
            {
              value: 'overview',
              icon: (
                <HugeiconsIcon
                  strokeWidth={3}
                  icon={Message02Icon}
                  className="h-4 w-4"
                />
              ),
              label: (
                <>
                  <span className="hidden sm:inline">Overview</span>
                  <span className="inline sm:hidden">
                    InformationCircleIcon
                  </span>
                </>
              ),
            },
            {
              value: 'edit',
              icon: (
                <HugeiconsIcon
                  strokeWidth={3}
                  icon={PencilEdit01Icon}
                  className="h-4 w-4"
                />
              ),
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
                className={`flex items-center whitespace-nowrap border-b-2 px-3 py-3 font-medium text-sm transition-all duration-200 sm:px-6 sm:py-4 ${isActive ? `border-[${activeColor.borderColor}] text-[${activeColor.textColor}]` : 'border-transparent text-gray-500'}`}
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
