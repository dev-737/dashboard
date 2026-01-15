import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import './dashboard.css';
import { DashboardContentWrapper } from '@/app/dashboard/components/layout/DashboardContentWrapper';
import { DashboardLayoutProvider } from '@/components/features/dashboard/LayoutProvider';
import { GuidedTourProvider } from '@/components/features/dashboard/onboarding/GuidedTourProvider';
import { DashboardTopBar } from '@/components/layout/DashboardTopbar';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Redirect to login if not authenticated
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <DashboardLayoutProvider>
      <GuidedTourProvider>
        <div className="min-h-screen bg-dash-main">
          <div className="flex h-screen flex-col overflow-hidden">
            {/* Top bar */}
            <DashboardTopBar user={session.user} />

            {/* Main content area */}
            <main className="dashboard-scrollbar relative flex-1 overflow-y-auto">
              {/* background layers */}
              <div className="pointer-events-none fixed inset-0 z-0">
              </div>

              {/* Content with */}
              <DashboardContentWrapper>{children}</DashboardContentWrapper>
            </main>
          </div>
        </div>
      </GuidedTourProvider>
    </DashboardLayoutProvider>
  );
}
