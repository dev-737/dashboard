import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Redirect to login if not authenticated
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard/admin');
  }

  // Check if the user has the specific admin ID
  const ADMIN_USER_ID = '701727675311587358';

  if (session.user.id !== ADMIN_USER_ID) {
    // Redirect non-admin users to the dashboard
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text font-bold text-3xl text-transparent tracking-tight">
          Admin Dashboard
        </h1>
      </div>
      {children}
    </div>
  );
}
