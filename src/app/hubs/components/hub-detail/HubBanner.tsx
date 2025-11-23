'use client';

import Image from 'next/image';
import type React from 'react';
import { GridPattern } from '@/components/magicui/GridPattern';

interface HubBannerProps {
  bannerUrl: string | null;
  name: string;
}

const HubBanner: React.FC<HubBannerProps> = ({ bannerUrl, name }) => {
  const bannerContent = bannerUrl ? (
    <div className="relative h-full w-full">
      <Image
        src={bannerUrl}
        alt={`${name} banner`}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent" />
      <GridPattern
        width={40}
        height={40}
        className="absolute inset-0 opacity-[0.1] [mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]"
      />
      <div className="absolute right-0 bottom-0 left-0 h-24 bg-linear-to-t from-gray-950 to-transparent" />

      {/* Optional visual elements - subtle animated orbs */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full bg-primary/10 opacity-30 blur-3xl" />
      <div
        className="absolute top-1/2 right-1/3 h-48 w-48 animate-pulse rounded-full bg-purple-600/10 opacity-20 blur-3xl"
        style={{ animationDelay: '1s' }}
      />
    </div>
  ) : (
    // Fallback banner with enhanced design
    <div className="relative h-full w-full overflow-hidden bg-linear-to-br from-gray-900 via-gray-950 to-black">
      {/* Animated grid pattern */}
      <GridPattern
        width={40}
        height={40}
        className="absolute inset-0 opacity-[0.15]"
      />
      <div className="absolute top-1/4 left-1/5 h-72 w-72 animate-pulse rounded-full bg-primary/15 opacity-50 blur-3xl" />
      <div
        className="absolute right-1/6 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/15 opacity-40 blur-3xl"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 opacity-30 blur-3xl"
        style={{ animationDelay: '3s' }}
      />

      {/* Optional floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map(() => (
          <div
            key={crypto.randomUUID()}
            className="absolute h-1 w-1 animate-float rounded-full bg-white/30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative h-[320px] w-full overflow-hidden md:h-[400px]">
      {bannerContent}
    </div>
  );
};

export default HubBanner;
