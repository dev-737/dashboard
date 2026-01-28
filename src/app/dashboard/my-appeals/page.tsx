import { formatDistanceToNow } from 'date-fns';
import { Check, Clock, MessageCircle, Shield, X } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/lib/prisma';
import { MyAppealsPagination } from './components/MyAppealsPagination';

export const metadata: Metadata = {
  title: 'My Appeals | InterChat Dashboard',
  description: "View the status of appeals you've submitted",
};

interface AppealWithInfraction {
  id: string;
  infractionId: string;
  userId: string;
  reason: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  infraction: {
    id: string;
    type: string;
    reason: string;
    hub: {
      id: string;
      name: string;
      iconUrl: string | null;
    };
  };
}

// Server-side function to fetch user's appeals
async function getMyAppealsData(searchParams: { page?: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard/my-appeals');
  }

  const page = parseInt(searchParams.page || '1', 10);
  const limit = 10;
  const skip = (page - 1) * limit;

  // Count total appeals for pagination
  const total = await db.appeal.count({
    where: {
      userId: session.user.id,
    },
  });

  // Fetch appeals with related data
  const appeals = await db.appeal.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      infraction: {
        include: {
          hub: {
            select: {
              id: true,
              name: true,
              iconUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: limit,
  });

  return {
    appeals,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export default async function MyAppealsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { appeals, page, totalPages } = await getMyAppealsData(searchParams);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl tracking-tight">My Appeals</h1>
      </div>

      {/* Appeals List */}
      <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">My Appeal Requests</CardTitle>
          <CardDescription>
            View the status of appeals you&apos;ve submitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appeals.length === 0 ? (
            <div className="py-8 text-center">
              <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-500" />
              <h3 className="mb-2 font-medium text-lg">No Appeals Found</h3>
              <p className="mb-4 text-gray-400">
                You haven&apos;t submitted any appeals yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appeals.map((appeal) => (
                <MyAppealCard key={appeal.id} appeal={appeal} />
              ))}
            </div>
          )}
        </CardContent>
        {appeals.length > 0 && totalPages > 1 && (
          <MyAppealsPagination currentPage={page} totalPages={totalPages} />
        )}
      </Card>
    </div>
  );
}

interface MyAppealCardProps {
  appeal: AppealWithInfraction;
}

function MyAppealCard({ appeal }: MyAppealCardProps) {
  const createdAt = formatDistanceToNow(new Date(appeal.createdAt), {
    addSuffix: true,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge
            variant="outline"
            className="border-yellow-500/20 bg-yellow-500/10 text-yellow-500"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'ACCEPTED':
        return (
          <Badge
            variant="outline"
            className="border-green-500/20 bg-green-500/10 text-green-500"
          >
            <Check className="mr-1 h-3 w-3" />
            Accepted
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge
            variant="outline"
            className="border-red-500/20 bg-red-500/10 text-red-500"
          >
            <X className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col rounded-md border border-gray-800/50 bg-gray-900/50 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md">
            <Image
              src={
                appeal.infraction.hub.iconUrl ||
                '/assets/images/defaults/default-hub.png'
              }
              alt={appeal.infraction.hub.name}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-medium">
              Appeal for {appeal.infraction.hub.name}
            </div>
            <div className="text-gray-400 text-xs">Submitted {createdAt}</div>
          </div>
        </div>
        <div>{getStatusBadge(appeal.status)}</div>
      </div>
      <div className="mb-3">
        <h4 className="mb-1 font-medium text-gray-300 text-sm">
          Your Appeal Reason:
        </h4>
        <p className="text-gray-300 text-sm">{appeal.reason}</p>
      </div>
      <div className="mb-3 rounded-md border border-gray-800/50 bg-gray-800/30 p-3">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-4 w-4 text-gray-400" />
          <h4 className="font-medium text-sm">Infraction Details</h4>
        </div>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-gray-400 text-xs">ID:</span>
          <Link
            href={`/dashboard/hubs/${appeal.infraction.hub.id}/infractions/${appeal.infractionId}/view`}
            className="text-blue-400 text-xs hover:underline"
          >
            {appeal.infractionId}
          </Link>
        </div>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-gray-400 text-xs">Type:</span>
          <span className="text-xs">
            {appeal.infraction.type === 'BLACKLIST' ? 'Blacklist' : 'Warning'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">Reason:</span>
          <span className="truncate text-xs">{appeal.infraction.reason}</span>
        </div>
      </div>
      {appeal.status === 'REJECTED' && (
        <div className="rounded-md border border-red-900/30 bg-red-950/20 p-3">
          <p className="text-red-400 text-sm">
            Your appeal has been rejected. You may contact the hub moderators
            for more information.
          </p>
        </div>
      )}
      {appeal.status === 'ACCEPTED' && (
        <div className="rounded-md border border-green-900/30 bg-green-950/20 p-3">
          <p className="text-green-400 text-sm">
            Your appeal has been accepted. The infraction has been appealed.
          </p>
        </div>
      )}
    </div>
  );
}
