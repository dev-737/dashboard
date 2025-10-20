import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/layout/Toaster';
import '@/styles/globals.css';
import { ConditionalFooter } from '@/components/layout/ConditionalFooter';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'https://interchat.dev'
  ),
  title: 'InterChat: Connect Discord Servers & Keep Your Community Active',
  description:
    'Is your Discord server quiet? InterChat connects your community with others by linking channels into shared chatrooms. Grow your server and keep conversations flowing 24/7. Free & easy setup!', // Explains the 'how' simply
  keywords: [
    'connect discord servers',
    'discord shared chat',
    'keep discord active',
    'discord community growth',
    'chat between discord servers',
    'discord bot',
    'interchat',
    'discord chatrooms',
    'discord moderation',
    'global chat discord',
    'chatbot discord',
    'cross-server chat',
    'interchat.dev',
    'interchat discord bot',
    'server-to-server chat',
    'discord inter-server chat',
    'discord server-to-server chat',
  ],
  authors: [{ name: 'dev-737', url: 'https://github.com/dev-737' }],
  creator: 'dev-737',
  icons: {
    icon: '/favicon.ico',
    apple: '/assets/images/logos/interchat.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'InterChat: Connect Discord Servers & Keep Your Community Active',
    description:
      'Is your Discord server quiet? InterChat connects your community with others by linking channels into shared chatrooms. Grow your server and keep conversations flowing 24/7. Free & easy setup!',
    type: 'website',
    siteName: 'InterChat',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://interchat.dev',
    images: [
      {
        url: '/assets/images/logos/InterChatLogo.webp',
        width: 300,
        height: 300,
        alt: 'InterChat Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'InterChat: Connect Discord Servers & Keep Your Community Active',
    description:
      'Is your Discord server quiet? InterChat connects your community with others by linking channels into shared chatrooms. Grow your server and keep conversations flowing 24/7. Free & easy setup!',
    images: ['/assets/images/logos/InterChatLogo.webp'],
    site: '@interchatapp',
    creator: '@737_dev',
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': 'large',
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.className} dark bg-[#0a0a0c]`}
      suppressHydrationWarning
    >
      <head>
        <link rel="dns-prefetch" href="https://cloud.umami.is" />
        <link rel="preconnect" href="https://cloud.umami.is" crossOrigin="" />
        <link
          rel="preload"
          href="/assets/images/logos/InterChatLogo.webp"
          as="image"
          type="image/webp"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Script
          async
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen">
        <Providers>
          <div className="relative">
            <Navbar />
            <Toaster />

            <main className="relative">{children}</main>
          </div>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
