'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, TrendingUp, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { HubCardDTO } from '@/lib/discover/query';
import { formatNumber } from '@/lib/utils';

interface TrendingHubsProps {
  hubs: HubCardDTO[];
}

export function TrendingHubsClient({ hubs }: TrendingHubsProps) {
  return (
    <section className="relative overflow-hidden bg-[#030812] py-24 md:py-32">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 font-medium text-indigo-400 text-sm backdrop-blur-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Trending Now</span>
            </div>
            <h2 className="font-bold text-4xl text-white tracking-tight md:text-5xl">
              Popular Communities
            </h2>
            <p className="mt-4 text-gray-400 text-lg">
              Join the most active and growing hubs on InterChat today.
            </p>
          </div>

          <Link
            href="/discover"
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
          >
            View all hubs
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {hubs.map((hub, index) => (
            <motion.div
              key={hub.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/hubs/${hub.id}`} className="group block h-full">
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-indigo-500/5">
                  {/* Banner/Image */}
                  <div className="relative h-56 w-full overflow-hidden">
                    {hub.bannerUrl ? (
                      <Image
                        src={hub.bannerUrl}
                        alt={hub.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030812] via-transparent to-transparent opacity-90" />

                    {/* NSFW Badge */}
                    {hub.nsfw && (
                      <div className="absolute top-4 right-4 rounded-full border border-red-500/30 bg-red-950/80 px-3 py-1 font-medium text-red-300 text-xs backdrop-blur-sm">
                        NSFW
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="relative flex flex-1 flex-col p-8 pt-0">
                    {/* Icon - Overlapping Banner */}
                    <div className="-mt-12 relative mb-6 h-24 w-24 overflow-hidden rounded-2xl border-4 border-[#030812] bg-[#030812] shadow-lg">
                      {hub.iconUrl ? (
                        <Image
                          src={hub.iconUrl}
                          alt={hub.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 font-bold text-3xl text-white">
                          {hub.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="mb-6">
                      <div className="mb-3 flex items-center gap-2">
                        <h3 className="line-clamp-1 font-bold text-white text-xl transition-colors group-hover:text-indigo-400">
                          {hub.name}
                        </h3>
                        {hub.verified && (
                          <div
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500"
                            title="Verified Hub"
                          >
                            <svg
                              className="h-3 w-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <title>Verified Hub</title>
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="line-clamp-2 text-gray-400 text-sm leading-relaxed">
                        {hub.shortDescription ||
                          hub.description ||
                          'A community space for discussions and connections.'}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-white/5 border-t pt-6">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Users className="h-4 w-4 text-indigo-400" />
                          <span className="font-medium">
                            {formatNumber(hub._count.connections)}
                          </span>
                        </div>
                        {hub.averageRating && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <Star className="h-4 w-4 fill-yellow-500/20 text-yellow-500" />
                            <span className="font-medium">
                              {hub.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="rounded-full bg-white/5 p-2 text-gray-400 transition-all group-hover:bg-indigo-500/20 group-hover:text-indigo-400">
                        <ArrowRight className="h-4 w-4" />
                      </div>
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
