import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { auth } from '@/auth';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';

interface InfractionsLayoutProps {
  children: ReactNode;
  params: Promise<{
    hubId: string;
  }>;
}

export default async function InfractionsLayout({
  children,
  params,
}: InfractionsLayoutProps) {
  const { hubId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/hubs/${hubId}/infractions`);
  }

  // Check if user has manager or owner permissions
  const permissionLevel = await getUserHubPermission(session.user.id, hubId);

  if (permissionLevel < PermissionLevel.MODERATOR) {
    notFound();
  }

  return <>{children}</>;
}
