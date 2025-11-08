'use client';

import { ArrowRight, Home, Sparkles, Users, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-20 md:py-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/3 h-80 w-80 animate-pulse rounded-full bg-primary-alt/10 blur-3xl delay-1000" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-gray-700/60 bg-gradient-to-r from-gray-800/60 to-gray-800/40 px-4 py-2 text-gray-300 text-sm shadow-lg backdrop-blur-xl">
            <Zap className="h-4 w-4 animate-pulse text-emerald-400" />
            <span className="font-semibold tracking-wide">
              Fast, clean, and easy to use
            </span>
          </div>
          <h3 className="mb-6 font-bold text-4xl text-white tracking-tight md:text-6xl lg:text-7xl">
            Get started with{' '}
            <span className="bg-gradient-to-r from-primary via-primary-alt to-primary bg-clip-text text-transparent">
              InterChat
            </span>
          </h3>
          <p className="mx-auto mb-10 max-w-3xl text-gray-300 text-lg leading-relaxed md:text-xl">
            Connect your Discord servers in minutes. Explore public hubs or
            build your own community network.
            <span className="mt-2 block text-gray-400">
              Join thousands of communities already using InterChat to bridge
              their servers.
            </span>
          </p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 flex flex-wrap justify-center gap-8"
          >
            {[
              { icon: Users, label: '12,000+', sublabel: 'Connected Servers' },
              { icon: Home, label: '30+', sublabel: 'Hubs Chatting Now' },
              { icon: Zap, label: '99.9%', sublabel: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="rounded-[var(--radius)] border border-gray-700/50 bg-gray-800/60 p-2">
                  <stat.icon className="h-5 w-5 text-primary" />
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
              <div className="absolute inset-0 rounded-[var(--radius-button)] bg-gradient-to-r from-primary to-primary-alt opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-30" />
              <Button
                asChild
                size="lg"
                className="relative h-14 bg-gradient-to-r from-primary to-primary-alt px-8 font-semibold text-white shadow-lg hover:from-primary-alt hover:to-primary hover:shadow-xl"
              >
                <Link href="/hubs" className="group flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  Discover Hubs
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 border-gray-600/70 bg-gray-800/60 px-8 font-semibold text-white shadow-lg backdrop-blur-xl hover:border-gray-500/70 hover:bg-gray-800/80"
              >
                <Link
                  href="https://docs.interchat.dev"
                  className="group flex items-center"
                >
                  Learn how it works
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
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
            className="mt-8 text-gray-400 text-sm"
          >
            Trusted by communities worldwide • Free to use • Simple Setup
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
