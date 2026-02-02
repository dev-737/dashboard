'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HydrationSafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  fallbackSrc?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  onError?: () => void;
  onLoad?: () => void;
}

// Default fallback images
const DEFAULT_FALLBACKS = {
  avatar: '/assets/images/defaults/default-avatar.svg',
  banner: '/assets/images/defaults/default-banner.svg',
  server: '/assets/images/defaults/default-server.svg',
  hub: '/assets/images/logos/InterChatLogo.svg',
} as const;

// Domains that should skip Next.js Image Optimization to save Vercel CPU usage
const SKIPPED_OPTIMIZATION_DOMAINS = [
  'discord.com',
  'discordapp.com',
  'cdn.discordapp.com',
  'media.discordapp.net',
  'imgur.com',
  'i.imgur.com',
  'media.tenor.com',
  'media.giphy.com',
];

function HydrationSafeImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  sizes,
  quality = 75,
  fallbackSrc,
  fetchPriority = 'auto',
  onError,
  onLoad,
  ...props
}: HydrationSafeImageProps) {
  const [error, setError] = useState(false);

  // Determine if we should skip optimization based on the domain
  const shouldSkipOptimization = (() => {
    if (!src || typeof src !== 'string') return false;
    try {
      // Handle relative URLs
      if (src.startsWith('/')) return false;

      const url = new URL(src);
      return SKIPPED_OPTIMIZATION_DOMAINS.some(
        (domain) =>
          url.hostname === domain || url.hostname.endsWith('.' + domain)
      );
    } catch {
      // If URL parsing fails, stick to default behavior
      return false;
    }
  })();

  // Determine fallback image based on alt text or use provided fallback
  const determinedFallback =
    fallbackSrc ||
    (() => {
      const altLower = alt.toLowerCase();
      if (altLower.includes('avatar') || altLower.includes('profile')) {
        return DEFAULT_FALLBACKS.avatar;
      }
      if (altLower.includes('banner')) {
        return DEFAULT_FALLBACKS.banner;
      }
      if (altLower.includes('server')) {
        return DEFAULT_FALLBACKS.server;
      }
      if (altLower.includes('hub') || altLower.includes('community')) {
        return DEFAULT_FALLBACKS.hub;
      }
      return DEFAULT_FALLBACKS.hub;
    })();

  const handleError = () => {
    setError(true);
    onError?.();
  };

  const handleLoad = () => {
    onLoad?.();
  };

  // Use fallback if there's an error
  const imageSrc = error ? determinedFallback : src;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={cn(className, error && 'opacity-60')}
      priority={priority}
      sizes={sizes}
      quality={quality}
      onError={handleError}
      onLoad={handleLoad}
      fetchPriority={fetchPriority}
      unoptimized={shouldSkipOptimization}
      {...props}
    />
  );
}

// Specialized avatar component with proper circular styling
export function SafeHubAvatar({
  src,
  name,
  size = 56,
  className,
  fetchPriority,
  ...props
}: {
  src: string;
  name: string;
  size?: number;
  className?: string;
} & Omit<HydrationSafeImageProps, 'src' | 'alt' | 'width' | 'height'>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full bg-gray-800',
        className
      )}
      style={{ width: size, height: size }}
    >
      <HydrationSafeImage
        src={src}
        alt={`${name} avatar`}
        width={size}
        height={size}
        className="object-cover"
        fallbackSrc={DEFAULT_FALLBACKS.avatar}
        {...props}
      />
    </div>
  );
}

// Specialized banner component
export function SafeHubBanner({
  src,
  name,
  className,
  ...props
}: {
  src: string;
  name: string;
  className?: string;
} & Omit<HydrationSafeImageProps, 'src' | 'alt'>) {
  return (
    <HydrationSafeImage
      src={src}
      alt={`${name} banner`}
      fill
      className={cn('object-cover', className)}
      fallbackSrc={DEFAULT_FALLBACKS.banner}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      {...props}
    />
  );
}
