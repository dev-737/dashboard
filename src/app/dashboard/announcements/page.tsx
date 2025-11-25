import { format, formatDistanceToNow } from 'date-fns';
import { Bell, Calendar, Clock } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { PageFooter } from '@/components/layout/DashboardPageFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Announcements | InterChat Dashboard',
  description: 'View the latest announcements and updates',
};

interface AnnouncementWithReadStatus {
  id: string;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  createdAt: Date;
  isUnread: boolean;
}

// Server-side function to fetch announcements with read status
async function getAnnouncementsData(): Promise<{
  announcements: AnnouncementWithReadStatus[];
  unreadCount: number;
}> {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard/announcements');
  }

  const userId = session.user.id;

  // Get the user's last read date
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { inboxLastReadDate: true },
  });

  // Get all announcements
  const announcements = await db.devAlerts.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Mark which announcements are unread
  const lastReadDate = user?.inboxLastReadDate || new Date(0);

  const announcementsWithReadStatus = announcements.map((announcement) => ({
    ...announcement,
    isUnread: announcement.createdAt > lastReadDate,
  }));

  return {
    announcements: announcementsWithReadStatus,
    unreadCount: announcements.filter((a) => a.createdAt > lastReadDate).length,
  };
}

export default async function AnnouncementsPage() {
  const { announcements } = await getAnnouncementsData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl tracking-tight">Announcements</h1>
        <Button
          asChild
          variant="outline"
          className="border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white"
        >
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      {announcements.length === 0 ? (
        <Card className="border-gray-800 bg-linear-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="mb-4 h-12 w-12 text-gray-500" />
            <h3 className="mb-2 font-medium text-gray-300 text-xl">
              No Announcements
            </h3>
            <p className="max-w-md text-center text-gray-400">
              There are no announcements to display at this time. Check back
              later for updates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`border-gray-800 bg-linear-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm ${announcement.isUnread ? 'border-l-4 border-l-indigo-500' : ''
                }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text font-bold text-transparent text-xl">
                    {announcement.title}
                  </CardTitle>
                  {announcement.isUnread && (
                    <div className="rounded-full border border-indigo-500/30 bg-indigo-900/30 px-2 py-1 text-indigo-300 text-xs">
                      New
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {formatDistanceToNow(new Date(announcement.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-line text-gray-300">
                  {announcement.content}
                </p>
                {announcement.thumbnailUrl && (
                  <div className="mt-4">
                    <Image
                      width={500}
                      height={500}
                      src={announcement.thumbnailUrl}
                      alt=""
                      className="h-auto w-full rounded-md border border-gray-700/50"
                    />
                  </div>
                )}
                {announcement.imageUrl && (
                  <div className="mt-4">
                    <Image
                      width={500}
                      height={500}
                      src={announcement.imageUrl}
                      alt=""
                      className="h-auto w-full rounded-md border border-gray-700/50"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Page Footer - provides scroll space for mobile prompts */}
      <PageFooter height="md" message="Stay updated with the latest news! 📢" />
    </div>
  );
}
