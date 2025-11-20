'use client';

import { ArrowRight, Sparkles, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import type { HubCardDTO } from '@/lib/discover/query';
import { formatNumber } from '@/lib/utils';

interface TrendingHubsProps {
  hubs: HubCardDTO[];
}

export function TrendingHubsClient({ hubs }: TrendingHubsProps) {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-gray-950 via-gray-900 to-gray-950 py-20 md:py-32">
      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gray-700/60 bg-gray-800/40 px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3 w-3" />
              <span className="font-medium">Live Activity</span>
            </div>
            <h2 className="font-bold text-3xl text-white md:text-4xl">Trending Hubs</h2>
          </div>

          <Link
            href="/discover"
            className="group flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
          >
            View all hubs
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {hubs.map((hub, index) => (
            <motion.div
              key={hub.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/hubs/${hub.id}`} className="group block">
                <div className="relative h-full overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40 transition-all duration-300 hover:-translate-y-1 hover:border-gray-700 hover:shadow-2xl hover:shadow-primary/10">
                  {/* Banner/Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    {hub.bannerUrl ? (
                      <Image
                        src={hub.bannerUrl}
                        alt={hub.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary-alt/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

                    {/* NSFW Badge */}
                    {hub.nsfw && (
                      <div className="absolute top-3 right-3 rounded-full border border-red-500/50 bg-red-950/90 px-3 py-1 text-xs font-medium text-red-300 backdrop-blur-sm">
                        🔞 NSFW
                      </div>
                    )}

                    {/* Hub Icon */}
                    <div className="absolute bottom-4 left-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-gray-800 bg-gray-900 shadow-lg">
                        {hub.iconUrl ? (
                          <Image
                            src={hub.iconUrl}
                            alt={hub.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-primary-alt/30 text-2xl font-bold text-white">
                            {hub.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="truncate font-bold text-xl text-white">{hub.name}</h3>
                      {hub.verified && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm text-gray-400">
                      {hub.shortDescription || hub.description || 'A community space for discussions and connections.'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{formatNumber(hub._count.connections)}</span>
                      </div>
                      {hub.averageRating && (
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{hub.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
