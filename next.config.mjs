// @ts-check

import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  turbopack: {},
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-avatar',
      '@radix-ui/react-button',
      '@radix-ui/react-card',
      '@radix-ui/react-popover',
      '@tanstack/react-query',
      'react-hook-form',
      'motion',
      'lodash-es',
      'date-fns',
    ],
    viewTransition: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
    routerBFCache: true,
    webpackBuildWorker: true,
    optimizeCss: true,
    scrollRestoration: true,
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB'],
    esmExternals: true,
    typedEnv: true,
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    qualities: [16, 32, 48, 60, 64, 75, 80, 85, 90, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'media.discordapp.net' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: '*.ufs.sh' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'sun1-99.userapi.com' },
      { protocol: 'https', hostname: 'imgur.com' },
      { protocol: 'https', hostname: 'media.tenor.com' },
      { protocol: 'https', hostname: 'media.giphy.com' },
      { protocol: 'https', hostname: 'images7.alphacoders.com' },
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      {protocol: 'https', hostname: 'img.freepik.com' },
    ],
  },

  async headers() {
    const securityHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
    ];

    const cspHeader = {
      key: 'Content-Security-Policy',
      value:
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cloud.umami.is/script.js",
    };

    return [
      {
        source: '/((?!_next/image|_next/static|static|sw.js).*)',
        headers: [
          ...securityHeaders,
          cspHeader,
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },

  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'all',
        },
        motion: {
          test: /[\\/]node_modules[\\/](motion|framer-motion)[\\/]/,
          name: 'motion',
          priority: 20,
          chunks: 'all',
        },
        ui: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'ui',
          priority: 20,
          chunks: 'all',
        },
      };
    }

    return config;
  },

  async redirects() {
    return [
      {
        source: '/support',
        destination: 'https://discord.gg/cgYgC6YZyX',
        permanent: true,
      },
      { source: '/hubs', destination: '/discover', permanent: true },
      {
        source: '/invite',
        destination:
          'https://discord.com/oauth2/authorize?client_id=769921109209907241',
        permanent: true,
      },
      {
        source: '/vote',
        destination: 'https://top.gg/bot/769921109209907241/vote',
        permanent: true,
      },
      {
        source: '/docs',
        destination: 'https://docs.interchat.dev',
        permanent: true,
      },
    ];
  },
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withSentryConfig(
  bundleAnalyzer(config),
  {
    org: 'interchat',
    project: 'interchat-website',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    disableLogger: true,
    automaticVercelMonitors: true,
  },
);
