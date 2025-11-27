'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export function DashboardContentWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isHubPage = pathname?.startsWith('/dashboard/hubs/');

    return (
        <div className={`relative z-10 ${isHubPage ? '' : 'p-6 mt-16'}`}>
            {children}
        </div>
    );
}
