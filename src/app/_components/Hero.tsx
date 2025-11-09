'use client';

import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useId } from 'react';
import { StaticHeroBackground } from '@/app/_components/StaticHeroBackground';
import { HeroAnimation } from '@/app/_components/HeroAnimation';
// import { AnimatedShinyText } from '@/components/ui/AnimatedShinyText';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/shadcn-io/gradient-text';

export function Hero() {
  const heroId = useId();
  //   const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section
      id={heroId}
      className="relative overflow-hidden bg-linear-to-b from-gray-950 via-gray-900 to-gray-950 pt-24 pb-20 md:pt-32 md:pb-28"
    >
      <StaticHeroBackground />
      <div className="absolute inset-0 bg-mesh-gradient opacity-20 mix-blend-overlay" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <div className="mb-12 w-full md:mb-16">
            {/*   <motion.div */}
            {/*     initial={{ opacity: 0, y: 20 }} */}
            {/*     animate={{ opacity: 1, y: 0 }} */}
            {/*     transition={{ duration: 0.5 }} */}
            {/*     className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-gray-700/60 bg-linear-to-r from-gray-800/60 to-gray-800/40 px-4 py-2 text-gray-300 text-sm shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-gray-600/70" */}
            {/*   > */}
            {/*     <Sparkles className="h-4 w-4 animate-pulse text-primary" /> */}
            {/*     <Link href="https://docs.interchat.dev/changelog"> */}
            {/*       <AnimatedShinyText className="font-semibold tracking-wide"> */}
            {/*         Introducing InterChat v5 */}
            {/*       </AnimatedShinyText> */}
            {/*     </Link> */}
            {/*   </motion.div> */}
            {/**/}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mb-6 bg-linear-to-br from-white via-gray-100 to-gray-300 bg-clip-text font-extrabold text-4xl text-transparent leading-[1.1] tracking-tight md:text-6xl lg:text-7xl"
            >
              Connect Chats <GradientText text="Share Conversations" />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mb-8 max-w-3xl text-gray-300 text-lg leading-relaxed md:text-xl"
            >
              InterChat links Discord servers in real-time, letting messages,
              media, and interactions flow between them. So everyone feels part
              of the same space, no matter where they are.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mb-6 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative"
              >
                <div className="absolute inset-0 rounded-(--radius-button) bg-linear-to-r from-primary to-primary-alt opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-30" />
                <Button
                  size="lg"
                  className="relative h-14 bg-linear-to-r from-primary to-primary-alt px-8 font-semibold text-white shadow-lg transition-all duration-300 hover:from-primary-alt hover:to-primary hover:shadow-xl"
                >
                  <Link href="/invite" className="flex items-center">
                    Invite Now
                    <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-gray-600/70 bg-gray-800/60 px-8 font-semibold text-white shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-gray-500/70 hover:bg-gray-800/80"
                >
                  <Link href="/discover" className="flex items-center">
                    Discover Hubs
                    <Sparkles className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mx-auto max-w-lg text-gray-400 text-sm leading-relaxed"
            >
              No setup hassle. Keep full moderation control while you connect
              communities across servers.
              <span className="font-medium text-gray-300">
                {' '}
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
            <HeroAnimation />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
