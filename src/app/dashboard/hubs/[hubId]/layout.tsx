import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/hubs/${hubId}`);
  }

  const permissionLevel = await getUserHubPermission(session.user.id, hubId);
  if (permissionLevel < PermissionLevel.MODERATOR) {
    notFound();
  }

  return <>{children}</>;
}
