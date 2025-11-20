import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Hero } from '@/app/_components/Hero';
import { HomePageSchemas } from '@/app/_components/HomePageSchemas';
import { ActionGrid } from '@/app/_components/ActionGrid';

const TrendingHubs = dynamic(
  () => import('@/app/_components/TrendingHubsServer').then((mod) => ({ default: mod.TrendingHubs })),
  {
    loading: () => (
      <div className="h-96 w-full animate-pulse bg-gray-900/50" />
    ),
  }
);

const FeaturesShowcase = dynamic(
  () =>
    import('@/app/_components/FeaturesShowcase').then((mod) => ({
      default: mod.FeaturesShowcase,
    })),
  {
    loading: () => (
      <div className="h-96 animate-pulse rounded-lg bg-gray-800/50" />
    ),
  }
);

const FaqSection = dynamic(
  () =>
    import('@/app/_components/FaqSection').then((mod) => ({
      default: mod.FaqSection,
    })),
  {
    loading: () => (
      <div className="h-64 animate-pulse rounded-lg bg-gray-800/50" />
    ),
  }
);

const CTA = dynamic(
  () => import('@/app/_components/CTA').then((mod) => ({ default: mod.CTA })),
  {
    loading: () => (
      <div className="h-32 animate-pulse rounded-lg bg-gray-800/50" />
    ),
  }
);

export const metadata: Metadata = {
  title: 'InterChat - Servers on Discord United',
  description:
    'Introducing InterChat: a complete rewrite with improved performance, modern command UIs, and a redesigned dashboard for cross-server communication.',
  keywords: [
    'Discord bot',
    'cross-server chat',
    'InterChat v5',
    'InterChat',
    'Discord hubs',
    'server bridge',
    'Discord moderation',
  ],
  openGraph: {
    title: 'InterChat v5 – Faster, modern, and redesigned',
    description:
      'A complete rewrite with improved performance, enhanced command UIs, and a modern dashboard.',
    url: 'https://interchat.dev',
    siteName: 'InterChat',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InterChat v5 – Faster, modern, and redesigned',
    description:
      'A complete rewrite with improved performance, enhanced command UIs, and a modern dashboard.',
  },
};

export default async function HomePage() {
  return (
    <>
      <HomePageSchemas />

      <main
        className="flex flex-1 flex-col justify-center"
        itemScope
        itemType="https://schema.org/WebPage"
      >
        <Hero />
        <FeaturesShowcase />
        <ActionGrid />
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-gray-900/50" />}>
          <TrendingHubs />
        </Suspense>
        <FaqSection />
        <CTA />
      </main>
    </>
  );
}
