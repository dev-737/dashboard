import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';

interface EditLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    hubId: string;
  }>;
}

export default async function EditLayout({
  children,
  params,
}: EditLayoutProps) {
  const { hubId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/hubs/${hubId}`);
  }

  // Check if user has manager or owner permissions
  const permissionLevel = await getUserHubPermission(session.user.id, hubId);

  if (permissionLevel < PermissionLevel.MANAGER) {
    // User doesn't have sufficient permissions
    notFound();
  }

  return <>{children}</>;
}
