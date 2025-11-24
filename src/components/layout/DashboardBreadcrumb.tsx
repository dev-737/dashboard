'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  homeHref?: string;
}

export function Breadcrumb({
  items,
  homeHref = '/dashboard',
}: BreadcrumbProps) {
  return (
    <nav
      className="mb-6 flex items-center rounded-(--radius) border border-gray-800/50 bg-gray-900/40 px-4 py-2.5 text-gray-400 text-sm backdrop-blur-sm transition-all duration-200"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href={homeHref}
            className="flex items-center transition-colors hover:text-indigo-400"
          >
            <div className="mr-2 rounded-md bg-gray-800/80 p-1.5">
              <Home className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </li>
        {items.map((item) => (
          <Fragment key={item.href}>
            <li className="flex items-center">
              <ChevronRight className="mx-1 h-4 w-4 text-gray-500" />
              {item.active ? (
                <span
                  className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-medium text-white"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-indigo-400"
                >
                  {item.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

export function useBreadcrumb() {
  const pathname = usePathname();

  // Define breadcrumb mappings
  const breadcrumbMap: Record<string, { label: string; parent?: string }> = {
    '/dashboard': { label: 'Dashboard' },
    '/dashboard/hubs/create': {
      label: 'Create Hub',
      parent: '/dashboard',
    },
    '/dashboard/settings': { label: 'Profile', parent: '/dashboard' },
    '/dashboard/moderation': { label: 'Moderation', parent: '/dashboard' },
    '/dashboard/moderation/reports': {
      label: 'Reports',
      parent: '/dashboard/moderation',
    },
    '/dashboard/moderation/blacklist': {
      label: 'Blacklists',
      parent: '/dashboard/moderation',
    },
    '/dashboard/appeals': { label: 'Appeals', parent: '/dashboard' },
    '/dashboard/my-appeals': { label: 'My Appeals', parent: '/dashboard' },
  };

  // Function to generate breadcrumb items based on current path
  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // We'll skip the dashboard segment in our logic below

    // Return empty array if we're at the dashboard root
    if (pathSegments.length <= 1 && pathSegments[0] === 'dashboard') {
      return [];
    }

    // Special case for dynamic routes like /dashboard/hubs/[hubId]
    if (
      pathSegments.length > 2 &&
      pathSegments[0] === 'dashboard' &&
      pathSegments[1] === 'hubs' &&
      pathSegments.length === 3
    ) {
      // This is a hub detail page
      items.push({
        label: 'My Hubs',
        href: '/dashboard?tab=hubs',
      });

      items.push({
        label: 'Hub Details',
        href: pathname,
        active: true,
      });

      return items;
    }

    // Special case for all hub management pages
    if (
      pathSegments.length > 3 &&
      pathSegments[0] === 'dashboard' &&
      pathSegments[1] === 'hubs'
    ) {
      // This is a hub management page
      items.push({
        label: 'My Hubs',
        href: '/dashboard?tab=hubs',
      });

      items.push({
        label: 'Hub Details',
        href: `/dashboard/hubs/${pathSegments[2]}`,
      });

      // Map tab names for different hub management pages
      const tabNameMap: Record<string, string> = {
        edit: 'Edit Hub',
        connections: 'Connections',
        members: 'Members',
        moderation: 'Moderation',
        'anti-swear': 'Anti-Swear',
        logging: 'Logging',
        settings: 'Settings',
        infractions: 'Infractions',
        customize: 'Customize',
      };

      const tabName = pathSegments[3];
      const displayName =
        tabNameMap[tabName] ||
        tabName.charAt(0).toUpperCase() + tabName.slice(1);

      items.push({
        label: displayName,
        href: pathname,
        active: true,
      });

      return items;
    }

    // Handle other routes
    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;

      // Skip the dashboard root item
      if (currentPath === '/dashboard') continue;

      if (breadcrumbMap[currentPath]) {
        items.push({
          label: breadcrumbMap[currentPath].label,
          href: currentPath,
          active: i === pathSegments.length - 1,
        });
      }
    }

    return items;
  };

  return generateBreadcrumbItems();
}

export function AutoBreadcrumb() {
  const items = useBreadcrumb();
  return <Breadcrumb items={items} />;
}
