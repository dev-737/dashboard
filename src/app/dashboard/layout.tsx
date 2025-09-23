import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { auth } from '@/auth';
import { DashboardLayoutProvider } from '@/components/dashboard/layout-provider';
import { GuidedTourProvider } from '@/components/dashboard/onboarding/guided-tour-provider';
import { DashboardTopBar } from '@/components/dashboard/topbar';
import './dashboard.css';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <DashboardLayoutProvider>
      <GuidedTourProvider>
        <div className="min-h-screen bg-gradient-primary">
          <div className="flex h-screen flex-col overflow-hidden">
            {/* Top bar */}
            <DashboardTopBar user={session.user as any} />

            {/* Main content area */}
            <main className="dashboard-scrollbar relative flex-1 overflow-y-auto">
              {/* background layers */}
              <div className="pointer-events-none fixed inset-0 z-0">
                {/* Primary gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-950" />

                {/* Radial gradient overlays for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
                <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />

                {/* grid pattern */}
                <div
                  className="absolute inset-0 bg-[size:40px_40px] bg-grid-white opacity-[0.02] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_120%)]"
                  style={{ zIndex: -1 }}
                />

                {/* Subtle noise texture */}
                <div className="absolute inset-0 bg-[url('/noise.svg')] bg-repeat opacity-[0.015]" />
              </div>

              {/* Content with */}
              <div className="relative z-10 p-6">{children}</div>
            </main>
          </div>
        </div>
      </GuidedTourProvider>
    </DashboardLayoutProvider>
  );
}
