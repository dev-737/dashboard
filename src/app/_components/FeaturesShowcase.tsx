'use client';

import { MessageSquare, Settings, Shield, Sparkles, Users } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function FeaturesShowcase() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-gray-950 via-gray-900 to-gray-950 py-20 md:py-32">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-(--radius-button) border border-gray-700/60 bg-linear-to-r from-gray-800/60 to-gray-800/40 px-4 py-2 text-gray-300 text-sm shadow-lg backdrop-blur-xl">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            <span className="font-semibold tracking-wide">
              Not just another bot
            </span>
          </div>

          <h2 className="mb-6 font-bold text-4xl text-white tracking-tight md:text-6xl">
            Features that <br className="hidden md:block" />
            <span className="bg-linear-to-r from-primary via-primary-alt to-primary bg-clip-text text-transparent">
              actually make sense
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-3">
          {/* Instant Relay (Large) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm transition-all hover:border-gray-700 md:col-span-2 md:row-span-2"
          >
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-blue-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-gray-800/50 p-3 text-emerald-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-2xl text-white">Instant Relay</h3>
              </div>
              <p className="mb-8 max-w-md text-gray-400 text-lg leading-relaxed">
                Messages sync in seconds. No lag, no delay, no waiting. It's
                like a portal gun for your messages.
              </p>
              <div className="mt-auto overflow-hidden rounded-xl border border-gray-800 bg-gray-950/50 shadow-2xl">
                <div className="relative aspect-video w-full">
                  <Image
                    src="/assets/images/features/CrossChat.png"
                    alt="Instant Relay"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stay in Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm transition-all hover:border-gray-700 md:col-span-1 md:row-span-1"
          >
            <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-orange-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-gray-800/50 p-3 text-red-400">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white text-xl">
                  Stay in Control
                </h3>
              </div>
              <p className="text-gray-400">
                Your server, your rules. Ban troublemakers hub-wide or locally.
              </p>
            </div>
          </motion.div>

          {/* Join or Create Hubs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm transition-all hover:border-gray-700 md:col-span-1 md:row-span-1"
          >
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-gray-800/50 p-3 text-purple-400">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white text-xl">
                  Join or Create Hubs
                </h3>
              </div>
              <p className="text-gray-400">
                Public hubs for everyone. Private hubs for your circle.
              </p>
            </div>
          </motion.div>

          {/* Control Center (Large) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm transition-all hover:border-gray-700 md:col-span-2 md:row-span-1"
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-cyan-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10 flex h-full items-center gap-8">
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-gray-800/50 p-3 text-blue-400">
                    <Settings className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-2xl text-white">
                    Control Center
                  </h3>
                </div>
                <p className="text-gray-400 text-lg">
                  Manage everything from one place. It's so pretty you might
                  actually want to use it.
                </p>
              </div>
              <div className="relative hidden h-full w-1/3 overflow-hidden rounded-xl border border-gray-800 bg-gray-950/50 shadow-lg md:block">
                <Image
                  src="/assets/images/features/dashboard.png"
                  alt="Control Center"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Rich Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="group relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm transition-all hover:border-gray-700 md:col-span-1 md:row-span-1"
          >
            <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-orange-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-gray-800/50 p-3 text-yellow-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white text-xl">Rich Content</h3>
              </div>
              <p className="text-gray-400">
                Images, embeds, reactions, replies. Everything just works.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
