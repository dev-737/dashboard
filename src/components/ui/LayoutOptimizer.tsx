'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

interface LayoutOptimizerProps {
  children: React.ReactNode;
  className?: string;
}

// Hook to prevent hydration mismatches
export function useIsomorphicLayoutEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const useEffect_ =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  useEffect_(effect, deps);
}

// Hook to handle client-side only state
export function useClientOnly<T>(clientValue: T, serverValue: T): T {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? clientValue : serverValue;
}

// Component to prevent layout shifts during loading
export function LayoutStabilizer({
  children,
  minHeight = '400px',
  className = '',
}: {
  children: React.ReactNode;
  minHeight?: string;
  className?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div
      className={`transition-opacity duration-200 ${className}`}
      style={{
        minHeight: isLoaded ? 'auto' : minHeight,
        opacity: isLoaded ? 1 : 0.8,
      }}
    >
      {children}
    </div>
  );
}

// Grid container that maintains aspect ratios
export function StableGrid({
  children,
  className = '',
  itemMinHeight = '380px',
}: {
  children: React.ReactNode;
  className?: string;
  itemMinHeight?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 ${className}`}
      style={
        {
          // Ensure consistent item heights to prevent layout shifts
          '--item-min-height': itemMinHeight,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

// Skeleton placeholder that maintains exact dimensions
export function DimensionPreserver({
  width,
  height,
  aspectRatio,
  className = '',
  children,
}: {
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const style: React.CSSProperties = {};

  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height)
    style.height = typeof height === 'number' ? `${height}px` : height;
  if (aspectRatio) style.aspectRatio = aspectRatio;

  return (
    <div className={`relative ${className}`} style={style}>
      {children}
    </div>
  );
}

// Main Layout Optimizer component
export function LayoutOptimizer({
  children,
  className = '',
}: LayoutOptimizerProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);

    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload default images
      const defaultImages = [
        '/assets/images/logos/InterChatLogo.svg',
        '/assets/images/defaults/default-server.svg',
        '/assets/images/defaults/default-avatar.svg',
      ];

      defaultImages.forEach((src) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    preloadCriticalResources();

    // Optimize font loading to prevent layout shifts
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
      });
    }

    // Add performance observer for CLS monitoring in development
    if (
      process.env.NODE_ENV === 'development' &&
      'PerformanceObserver' in window
    ) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (
            entry.entryType === 'layout-shift' &&
            !(entry as any).hadRecentInput
          ) {
            console.log('Layout shift detected:', entry);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Ignore if not supported
      }

      return () => observer.disconnect();
    }
  }, []);

  return (
    <div
      className={`layout-optimizer ${isHydrated ? 'hydrated' : 'hydrating'} ${className}`}
      style={{
        // Prevent layout shifts during hydration
        minHeight: isHydrated ? 'auto' : '100vh',
      }}
    >
      {children}
    </div>
  );
}

// Hook for stable measurements
export function useStableDimensions(ref: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;

    const updateDimensions = () => {
      if (ref.current) {
        const { width, height } = ref.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(ref.current);

    return () => resizeObserver.disconnect();
  }, [ref]);

  return dimensions;
}

// Critical CSS injection for above-the-fold content
export function CriticalCSS() {
  useEffect(() => {
    // Inject critical CSS for above-the-fold content
    const criticalCSS = `
      .layout-optimizer.hydrating {
        opacity: 0.9;
      }
      .layout-optimizer.hydrated {
        opacity: 1;
        transition: opacity 0.2s ease-in-out;
      }
      .fonts-loaded {
        font-display: swap;
      }
      /* Prevent layout shifts for images */
      img[data-loading="lazy"] {
        opacity: 0;
        transition: opacity 0.3s;
      }
      img[data-loaded="true"] {
        opacity: 1;
      }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}
