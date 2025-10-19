'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
  sizes?: string;
  quality?: number;
}

// Configured quality values from next.config.mjs
const CONFIGURED_QUALITIES = [16, 32, 48, 60, 64, 75, 80, 90, 100];

// Validate and get nearest configured quality value
const getValidQuality = (quality: number = 75): number => {
  if (CONFIGURED_QUALITIES.includes(quality)) {
    return quality;
  }

  // Find the nearest configured quality
  return CONFIGURED_QUALITIES.reduce((closest, current) => {
    return Math.abs(current - quality) < Math.abs(closest - quality)
      ? current
      : closest;
  });
};

// External domains that may have timeout issues
const EXTERNAL_TIMEOUT_DOMAINS = [
  'imgur.com',
  'i.imgur.com',
  'ufs.sh',
  'media.tenor.com',
  'media.giphy.com',
];

// Check if image source is from a potentially slow external domain
const isSlowExternalDomain = (src: string): boolean => {
  try {
    const url = new URL(src, 'https://example.com');
    return EXTERNAL_TIMEOUT_DOMAINS.some(
      (domain) =>
        url.hostname === domain ||
        url.hostname.endsWith('.' + domain) ||
        url.hostname.endsWith('.ufs.sh')
    );
  } catch {
    return false;
  }
};

// Generate a simple placeholder data URL - SSR safe
const generatePlaceholder = (width: number = 400, height: number = 300) => {
  // Always use SVG placeholder to avoid SSR/client mismatch
  const svgPlaceholder = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#374151"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9CA3AF" font-family="system-ui" font-size="14">Loading...</text>
  </svg>`;

  // Use btoa only on client side, fallback for SSR
  if (typeof window !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(svgPlaceholder)}`;
  }

  // SSR fallback - URL encode the SVG
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgPlaceholder)}`;
};

// Default fallback images for different types
const DEFAULT_FALLBACKS = {
  avatar: '/assets/images/defaults/default-avatar.svg',
  banner: '/assets/images/defaults/default-banner.svg',
  server: '/assets/images/defaults/default-server.svg',
  hub: '/assets/images/logos/InterChatLogo.svg',
} as const;

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  fallbackSrc,
  onError,
  onLoad,
  sizes,
  quality = 75,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate quality against configured values
  const validQuality = getValidQuality(quality);

  // Determine if this is a potentially slow external domain
  const isSlowExternal = isSlowExternalDomain(src);

  // Determine fallback image based on alt text or use provided fallback
  const determinedFallback = useMemo(() => {
    if (fallbackSrc) return fallbackSrc;

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
    return DEFAULT_FALLBACKS.hub; // Default fallback
  }, [fallbackSrc, alt]);

  // Generate blur placeholder if not provided
  const placeholderDataURL = useMemo(() => {
    if (blurDataURL) return blurDataURL;
    if (placeholder === 'empty') return undefined;
    return generatePlaceholder(width, height);
  }, [blurDataURL, placeholder, width, height]);

  const handleError = useCallback(() => {
    setError(true);
    setIsLoading(false);
    onError?.();
  }, [onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  // Add timeout handling for slow external domains
  useEffect(() => {
    if (isSlowExternal && isLoading) {
      const timeout = setTimeout(() => {
        if (isLoading) {
          console.warn(`Image load timeout for external domain: ${src}`);
          // Don't auto-fallback on timeout, let the user decide
          // setError(true);
        }
      }, 15000); // 15 second timeout warning

      return () => clearTimeout(timeout);
    }
  }, [isSlowExternal, isLoading, src]);

  // If there's an error, show fallback image
  if (error) {
    return (
      <Image
        src={determinedFallback}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={cn(className, 'opacity-60')}
        priority={priority}
        sizes={sizes}
        quality={validQuality}
        onLoad={handleLoad}
        {...props}
      />
    );
  }

  // Simplified rendering to avoid hydration mismatches
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={cn('transition-opacity duration-300', className, {
        'opacity-0': isLoading && !priority,
        'opacity-100': !isLoading || priority,
      })}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={placeholderDataURL}
      sizes={sizes}
      quality={validQuality}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}

// Specialized components for common use cases
export function HubAvatar({
  src,
  name,
  size = 56,
  className,
  ...props
}: {
  src: string;
  name: string;
  size?: number;
  className?: string;
} & Omit<OptimizedImageProps, 'src' | 'alt' | 'width' | 'height'>) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-full', className)}
      style={{ width: size, height: size }}
    >
      <OptimizedImage
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

export function HubBanner({
  src,
  name,
  className,
  ...props
}: {
  src: string;
  name: string;
  className?: string;
} & Omit<OptimizedImageProps, 'src' | 'alt'>) {
  return (
    <OptimizedImage
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

export function ServerIcon({
  src,
  name,
  size = 48,
  className,
  ...props
}: {
  src: string;
  name: string;
  size?: number;
  className?: string;
} & Omit<OptimizedImageProps, 'src' | 'alt' | 'width' | 'height'>) {
  return (
    <OptimizedImage
      src={src}
      alt={`${name} server icon`}
      width={size}
      height={size}
      className={cn('rounded-lg', className)}
      fallbackSrc={DEFAULT_FALLBACKS.server}
      {...props}
    />
  );
}
