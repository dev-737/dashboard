import type { MetadataRoute } from 'next';
import { HubVisibility } from '@/lib/generated/prisma/client/client';
import { db } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://interchat.dev';

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guidelines`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // all documentation pages from meta.json
  const docPages = [
    'index',
    'hub',
    'configure-hub',
    'leaderboards',
    'moderation',
  ].map((page) => ({
    url: `${baseUrl}/docs/${page}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // all public hubs
  const hubs = await db.hub.findMany({
    where: {
      visibility: HubVisibility.PUBLIC,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      updatedAt: true,
      connections: {
        where: { connected: true },
        select: { id: true },
      },
    },
  });

  // Map hubs to sitemap entries with dynamic priorities based on activity
  const hubsUrls = hubs.map((hub) => ({
    url: `${baseUrl}/hubs/${hub.id}`,
    lastModified: hub.updatedAt,
    changeFrequency: 'daily' as const,
    // Higher priority for hubs with more connections
    priority: Math.min(0.8, 0.5 + hub.connections.length * 0.01),
  }));

  // Blog posts
  const blogPosts = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/growing-discord-community`,
      lastModified: new Date('2023-05-15'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/discord-moderation-best-practices`,
      lastModified: new Date('2023-06-02'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/discord-bots-comparison`,
      lastModified: new Date('2023-07-10'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/discord-server-growth-metrics`,
      lastModified: new Date('2023-08-05'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // External redirects
  const externalRedirects = [
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/donate`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/invite`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/vote`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  return [
    // in order of priority
    ...staticPages,
    ...docPages,
    ...blogPosts,
    ...hubsUrls,
    ...externalRedirects,
  ];
}
