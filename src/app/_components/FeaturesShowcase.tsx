'use client';

import { MessageSquare, Settings, Shield, Sparkles, Users } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

export function FeaturesShowcase() {
  return (
    <section className="relative overflow-hidden bg-[#030812] py-24 md:py-32">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-blue-300 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 animate-pulse text-blue-400" />
            <span className="font-semibold text-sm tracking-wide">
              Not just another bot
            </span>
          </div>

          <h2 className="mb-6 font-bold text-4xl text-white tracking-tight md:text-5xl lg:text-6xl">
            Features that <br className="hidden md:block" />
            <span className="bg-linear-to-r from-[var(--color-brand-blue-500)] to-[var(--color-brand-purple-500)] bg-clip-text text-transparent">
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
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl transition-all hover:border-white/10 hover:bg-white/[0.04] md:col-span-2 md:row-span-2"
          >
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-blue-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400 ring-1 ring-emerald-500/20">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-2xl text-white">Instant Relay</h3>
              </div>
              <p className="mb-8 max-w-md text-gray-400 text-lg leading-relaxed">
                Messages sync in seconds. No lag, no delay, no waiting. It's
                like a portal gun for your messages.
              </p>
              <div className="mt-auto overflow-hidden rounded-2xl border border-white/10 bg-[#030812]/50 shadow-2xl">
                <div className="relative aspect-video w-full">
                  <Image
                    src="/assets/images/features/CrossChat.png"
                    alt="Instant Relay"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
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
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl transition-all hover:border-white/10 hover:bg-white/[0.04] md:col-span-1 md:row-span-1"
          >
            <div className="absolute inset-0 bg-linear-to-br from-red-500/5 to-orange-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl bg-red-500/10 p-3 text-red-400 ring-1 ring-red-500/20">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white text-xl">
                  Stay in Control
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Your server, your rules. Ban troublemakers hub-wide or locally
                with powerful moderation tools.
              </p>
            </div>
          </motion.div>

          {/* Join or Create Hubs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl transition-all hover:border-white/10 hover:bg-white/[0.04] md:col-span-1 md:row-span-1"
          >
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl bg-purple-500/10 p-3 text-purple-400 ring-1 ring-purple-500/20">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white text-xl">
                  Join or Create Hubs
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Public hubs for everyone. Private hubs for your circle. Connect
                however you want.
              </p>
            </div>
          </motion.div>

          {/* Control Center (Large) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl transition-all hover:border-white/10 hover:bg-white/[0.04] md:col-span-2 md:row-span-1"
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10 flex h-full items-center gap-8">
              <div className="flex-1">
                <div className="mb-6 flex items-center gap-4">
                  <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400 ring-1 ring-blue-500/20">
                    <Settings className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-2xl text-white">
                    Control Center
                  </h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Manage everything from one place. It's so pretty you might
                  actually want to use it.
                </p>
              </div>
              <div className="relative hidden h-full w-1/3 overflow-hidden rounded-2xl border border-white/10 bg-[#030812]/50 shadow-lg md:block">
                <Image
                  src="/assets/images/features/dashboard.png"
                  alt="Control Center"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
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
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl transition-all hover:border-white/10 hover:bg-white/[0.04] md:col-span-1 md:row-span-1"
          >
            <div className="absolute inset-0 bg-linear-to-br from-yellow-500/5 to-orange-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-400 ring-1 ring-yellow-500/20">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white text-xl">Rich Content</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Images, embeds, reactions, replies. Everything just works
                seamlessly.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
