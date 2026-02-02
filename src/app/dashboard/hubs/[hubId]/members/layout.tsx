import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';

interface MembersLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    hubId: string;
  }>;
}

export default async function MembersLayout({
  children,
  params,
}: MembersLayoutProps) {
  const { hubId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/hubs/${hubId}/members`);
  }

  // Check if user has at least moderator permissions
  const permissionLevel = await getUserHubPermission(session.user.id, hubId);

  if (permissionLevel < PermissionLevel.MODERATOR) {
    // User doesn't have sufficient permissions
    notFound();
  }

  return <>{children}</>;
}
