import {
  Cancel01Icon,
  InformationCircleIcon,
  TimeQuarter02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BlacklistedBannerProps {
  reason: string;
  expiresAt: Date | null;
  type: string;
}

export function BlacklistedBanner({
  reason,
  expiresAt,
  type,
}: BlacklistedBannerProps) {
  const isPermanent = type === 'PERMANENT' || !expiresAt;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-24">
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-red-500/5 p-8 shadow-xl backdrop-blur-xl">
          {/* Top accent bar */}
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 to-red-600" />

          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <HugeiconsIcon
                icon={Cancel01Icon}
                className="h-10 w-10 text-red-400"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center font-bold text-2xl text-white">
            Account Suspended
          </h1>

          {/* Description */}
          <p className="mb-6 text-center text-gray-400">
            Your account has been suspended from accessing InterChat.
          </p>

          {/* Reason card */}
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-gray-300">
              <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
              <span className="font-medium text-sm">Reason</span>
            </div>
            <p className="text-gray-400 text-sm">{reason}</p>
          </div>

          {/* Duration */}
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-gray-300">
              <HugeiconsIcon icon={TimeQuarter02Icon} className="h-4 w-4" />
              <span className="font-medium text-sm">Duration</span>
            </div>
            <p className="text-gray-400 text-sm">
              {isPermanent ? (
                'Permanent'
              ) : (
                <>
                  Until{' '}
                  <time dateTime={expiresAt.toISOString()}>
                    {expiresAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </>
              )}
            </p>
          </div>

          {/* Appeal link */}
          <div className="text-center">
            <p className="mb-4 text-gray-500 text-sm">
              If you believe this was a mistake, you can submit an appeal.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10"
            >
              <Link
                href="https://discord.gg/interchat"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Support Server
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
