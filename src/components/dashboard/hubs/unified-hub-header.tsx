'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, EyeOff, Globe, Lock, Upload, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { HubBannerUploadModal } from './hub-banner-upload-modal';
import { HubIconUploadModal } from './hub-icon-upload-modal';

interface UnifiedHubHeaderProps {
  hub: {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    bannerUrl: string | null;
    private: boolean;
    nsfw: boolean;
    connectionCount: number;
  };
  showBackButton?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
  canEdit?: boolean;
  onHubUpdate?: (updates: { iconUrl?: string; bannerUrl?: string }) => void;
}

export function UnifiedHubHeader({
  hub,
  showBackButton = true,
  backHref = '/dashboard',
  actions,
  canEdit = false,
  onHubUpdate,
}: UnifiedHubHeaderProps) {
  const [iconUploadOpen, setIconUploadOpen] = useState(false);
  const [bannerUploadOpen, setBannerUploadOpen] = useState(false);

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
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              className="border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white transition-all duration-200"
              asChild
            >
              <Link href={backHref}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Hub Header Card */}
      <div className="bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden shadow-lg cursor-poin">
        {/* Banner Section */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-r from-gray-800 to-gray-700">
          {hub.bannerUrl ? (
            <Image
              src={hub.bannerUrl}
              alt={`${hub.name} banner`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-700" />
          )}

          {/* Banner Upload Overlay */}
          {canEdit && (
            <button
              onClick={() => setBannerUploadOpen(true)}
              className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-200 group flex items-center justify-center cursor-pointer"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <Camera className="h-4 w-4 text-white" />
                <span className="text-sm text-white font-medium">Update Banner</span>
              </div>
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Hub Icon and Basic Info */}
            <div className="flex items-center gap-4">
              <div className="relative -mt-16 sm:-mt-20">
                <div className="relative group">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-gray-900 overflow-hidden flex-shrink-0 shadow-lg bg-gray-800">
                    <Image
                      src={hub.iconUrl}
                      alt={hub.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Icon Upload Overlay */}
                  {canEdit && (
                    <button
                      onClick={() => setIconUploadOpen(true)}
                      className="absolute inset-0 bg-black/0 hover:bg-black/60 transition-colors duration-200 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Upload className="h-5 w-5 text-white" />
                    </button>
                  )}
                </div>

                {/* Privacy indicator */}
                <div className="absolute -bottom-1 -right-1 bg-gray-950 rounded-full p-1.5 border border-gray-700/50 shadow-md">
                  {hub.private ? (
                    <Lock className="h-3 w-3 text-amber-400" />
                  ) : (
                    <Globe className="h-3 w-3 text-green-400" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white truncate">
                    {hub.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    {hub.private && (
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                    {hub.nsfw && (
                      <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                        <EyeOff className="h-3 w-3 mr-1" />
                        NSFW
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 text-sm lg:text-base leading-relaxed mb-3">
                  {hub.description}
                </p>

                {/* Connection Count */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">
                      {hub.connectionCount} {hub.connectionCount === 1 ? 'server' : 'servers'} connected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Upload Modals */}
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