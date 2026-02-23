'use client';

import {
  ArrowRightIcon,
  Home01Icon,
  SparklesIcon,
  UserMultipleIcon,
  ZapIcon,
} from '@hugeicons/core-free-icons';

import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#030812] py-24 md:py-32">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/3 h-80 w-80 rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-emerald-400 text-sm backdrop-blur-sm">
            <HugeiconsIcon
              strokeWidth={3}
              icon={ZapIcon}
              className="h-4 w-4 animate-pulse"
            />
            <span className="font-semibold tracking-wide">
              Fast, clean, and easy to use
            </span>
          </div>

          <h3 className="mb-6 font-bold text-5xl text-white tracking-tight md:text-7xl">
            Stop shouting into <br className="hidden md:block" />
            <span className="bg-linear-to-r from-(--color-brand-blue-500) to-(--color-brand-purple-500) bg-clip-text text-transparent">
              the void.
            </span>
          </h3>

          <p className="mx-auto mb-12 max-w-3xl text-gray-400 text-lg leading-relaxed md:text-xl">
            Join the conversation. 12,000+ servers are already chatting.
            <span className="mt-2 block font-medium text-gray-300">
              Why aren't you?
            </span>
          </p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16 flex flex-wrap justify-center gap-8"
          >
            {[
              {
                icon: UserMultipleIcon,
                label: '12,000+',
                sublabel: 'Connected Servers',
              },
              { icon: Home01Icon, label: '30+', sublabel: 'Hubs Chatting Now' },
              { icon: ZapIcon, label: '99.9%', sublabel: 'Uptime' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/2 p-4 backdrop-blur-sm transition-all hover:bg-white/4"
              >
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400 ring-1 ring-blue-500/20">
                  <HugeiconsIcon
                    strokeWidth={3}
                    icon={stat.icon}
                    className="h-5 w-5"
                  />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-xl">
                    {stat.label}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.sublabel}</div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative"
            >
              <div className="absolute inset-0 rounded-full bg-none" />
              <Button
                asChild
                size="lg"
                className="relative h-14 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-8 font-semibold text-white shadow-lg transition-all hover:shadow-blue-500/25"
              >
                <Link href="/hubs" className="group flex items-center">
                  <HugeiconsIcon
                    icon={SparklesIcon}
                    className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12"
                  />
                  Discover Hubs
                  <HugeiconsIcon
                    icon={ArrowRightIcon}
                    className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 rounded-full border-white/10 bg-white/5 px-8 font-semibold text-white backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
              >
                <Link
                  href="https://docs.interchat.dev"
                  className="group flex items-center"
                >
                  Learn how it works
                  <HugeiconsIcon
                    icon={ArrowRightIcon}
                    className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 text-gray-500 text-sm"
          >
            Trusted by communities worldwide • Free to use • Simple Setup
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
