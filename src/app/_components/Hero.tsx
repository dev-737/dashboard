'use client';

import { ArrowRightIcon, SparklesIcon } from '@hugeicons/core-free-icons';

import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { useId } from 'react';
import { HeroAnimation } from '@/app/_components/HeroAnimation';
import { AnimatedShinyText } from '@/components/ui/AnimatedShinyText';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/shadcn-io/gradient-text';

export function Hero() {
  const heroId = useId();

  return (
    <section
      id={heroId}
      className="relative overflow-hidden bg-main pt-24 pb-20 md:pt-32 md:pb-28"
    >
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-200 w-200 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-200 w-200 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] absolute inset-0 bg-[url('/assets/grid.svg')] bg-center" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <div className="mb-12 w-full md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-purple-300 backdrop-blur-sm transition-all duration-300 hover:bg-purple-500/20"
            >
              <HugeiconsIcon
                strokeWidth={2}
                icon={SparklesIcon}
                className="h-4 w-4 animate-pulse text-purple-400"
              />
              <Link href="https://interchat.fun/invite">
                <AnimatedShinyText className="font-semibold text-sm tracking-wide">
                  InterChat v5.4.0 is out
                </AnimatedShinyText>
              </Link>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mb-6 bg-linear-to-b from-white via-white to-gray-400 bg-clip-text font-extrabold text-5xl text-transparent leading-[1.1] tracking-tight md:text-7xl lg:text-8xl"
            >
              Your Discord servers <br className="hidden md:block" />
              are{' '}
              <GradientText
                text="lonely."
                gradient="linear-gradient(90deg, var(--color-brand-blue-500) 0%, var(--color-brand-purple-500) 25%, #a78bff 50%, var(--color-primary) 75%, var(--color-brand-blue-500) 100%)"
              />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mb-10 max-w-3xl text-gray-400 text-lg leading-relaxed md:text-xl"
            >
              InterChat builds bridges between Discord servers. Share messages,
              memes and chaos across thousands of communities instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mb-8 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative"
              >
                <div className="absolute inset-0 rounded-full bg-none" />
                <Button
                  size="lg"
                  className="btn-primary relative h-14 rounded-full px-8 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-purple-500/25"
                >
                  <Link href="/invite" className="flex items-center gap-2">
                    Start Connecting
                    <HugeiconsIcon
                      strokeWidth={2}
                      icon={ArrowRightIcon}
                      className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-white/10 bg-white/5 px-8 font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                >
                  <Link href="/discover" className="flex items-center gap-2">
                    Explore Hubs
                    <HugeiconsIcon
                      strokeWidth={2}
                      icon={SparklesIcon}
                      className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12"
                    />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mx-auto max-w-lg text-gray-500 text-sm"
            >
              No setup hassle. Keep full moderation control.
              <span className="mt-1 block font-medium text-purple-400">
                Join 12,000+ servers already connected.
              </span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative mx-auto w-full max-w-5xl"
          >
            <div className="absolute inset-0 -z-10 rounded-full bg-purple-500/5 blur-3xl" />
            <HeroAnimation />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
