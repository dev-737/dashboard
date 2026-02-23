'use client';

import {
  Camera01Icon,
  GlobeIcon,
  LockIcon,
  Upload01Icon,
  UserMultipleIcon,
  ViewOffIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { HubVisibility } from '@/lib/generated/prisma/client/client';

import { HubBannerUploadModal } from './HubBannerUploadModal';
import { HubIconUploadModal } from './HubIconUploadModal';

interface UnifiedHubHeaderProps {
  hub: {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    bannerUrl: string | null;
    visibility: HubVisibility;
    nsfw: boolean;
    connectionCount: number;
  };
  actions?: React.ReactNode;
  canEdit?: boolean;
  onHubUpdate?: (updates: { iconUrl?: string; bannerUrl?: string }) => void;
}

export function UnifiedHubHeader({
  hub,
  actions,
  canEdit = false,
  onHubUpdate,
}: UnifiedHubHeaderProps) {
  const [iconUploadOpen, setIconUploadOpen] = useState(false);
  const [bannerUploadOpen, setBannerUploadOpen] = useState(false);
  const isPrivate = hub.visibility === HubVisibility.PRIVATE;

  const handleIconUpdate = (iconUrl: string | null) => {
    if (iconUrl && onHubUpdate) {
      onHubUpdate({ iconUrl });
    }
  };

  const handleBannerUpdate = (bannerUrl: string | null) => {
    if (bannerUrl && onHubUpdate) {
      onHubUpdate({ bannerUrl });
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Hub Header Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-800/50 bg-dash-main shadow-lg backdrop-blur-sm">
          {/* Banner Section */}
          <div className="relative h-32 bg-linear-to-r from-gray-800 to-gray-700 sm:h-40">
            {hub.bannerUrl ? (
              <Image
                src={hub.bannerUrl}
                alt={`${hub.name} banner`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-dash-hub-banner" />
            )}

            {/* Banner Upload01Icon Overlay */}
            {canEdit && (
              <button
                type="button"
                onClick={() => setBannerUploadOpen(true)}
                className="group absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition-colors duration-200 hover:bg-black/40"
              >
                <div className="flex items-center gap-2 rounded-lg bg-gray-900/80 px-3 py-2 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={Camera01Icon}
                    className="h-4 w-4 text-white"
                  />
                  <span className="font-medium text-sm text-white">
                    Update Banner
                  </span>
                </div>
              </button>
            )}
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              {/* Hub Icon and Basic Information */}
              <div className="flex items-center gap-4">
                <div className="relative -mt-16 sm:-mt-20">
                  <div className="group relative">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-gray-900 bg-gray-800 shadow-lg sm:h-24 sm:w-24">
                      <Image
                        src={hub.iconUrl}
                        alt={hub.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Icon Upload Overlay */}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => setIconUploadOpen(true)}
                        className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black/0 opacity-0 transition-colors duration-200 hover:bg-black/60 group-hover:opacity-100"
                      >
                        <HugeiconsIcon
                          strokeWidth={2}
                          icon={Upload01Icon}
                          className="h-5 w-5 text-white"
                        />
                      </button>
                    )}
                  </div>

                  {/* Privacy indicator */}
                  <div className="absolute -right-1 -bottom-1 rounded-full border border-gray-700/50 bg-gray-950 p-1.5 shadow-md">
                    {isPrivate ? (
                      <HugeiconsIcon
                        strokeWidth={2}
                        icon={LockIcon}
                        className="h-3 w-3 text-amber-400"
                      />
                    ) : (
                      <HugeiconsIcon
                        strokeWidth={2}
                        icon={GlobeIcon}
                        className="h-3 w-3 text-green-400"
                      />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h1 className="truncate font-bold text-2xl text-white lg:text-3xl">
                      {hub.name}
                    </h1>
                    <div className="flex items-center gap-2">
                      {isPrivate && (
                        <Badge
                          variant="secondary"
                          className="border-amber-500/30 bg-amber-500/20 text-amber-400"
                        >
                          <HugeiconsIcon
                            strokeWidth={2}
                            icon={LockIcon}
                            className="mr-1 h-3 w-3"
                          />
                          Private
                        </Badge>
                      )}
                      {hub.nsfw && (
                        <Badge
                          variant="secondary"
                          className="border-red-500/30 bg-red-500/20 text-red-400"
                        >
                          <HugeiconsIcon
                            strokeWidth={2}
                            icon={ViewOffIcon}
                            className="mr-1 h-3 w-3"
                          />
                          NSFW
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="mb-3 text-gray-300 text-sm leading-relaxed lg:text-base">
                    {hub.description}
                  </p>

                  {/* Connection Count */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-1.5">
                      <HugeiconsIcon
                        strokeWidth={2}
                        icon={UserMultipleIcon}
                        className="h-4 w-4 text-blue-400"
                      />
                      <span className="font-medium text-gray-300 text-sm">
                        {hub.connectionCount}{' '}
                        {hub.connectionCount === 1 ? 'server' : 'servers'}{' '}
                        connected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Top Navigation Bar */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* Upload01Icon Modals */}
      {canEdit && (
        <>
          <HubIconUploadModal
            isOpen={iconUploadOpen}
            onClose={() => setIconUploadOpen(false)}
            hubId={hub.id}
            currentIconUrl={hub.iconUrl}
            hubName={hub.name}
            onIconUpdate={handleIconUpdate}
          />

          <HubBannerUploadModal
            isOpen={bannerUploadOpen}
            onClose={() => setBannerUploadOpen(false)}
            hubId={hub.id}
            currentBannerUrl={hub.bannerUrl || undefined}
            hubName={hub.name}
            onBannerUpdate={handleBannerUpdate}
          />
        </>
      )}
    </>
  );
}
