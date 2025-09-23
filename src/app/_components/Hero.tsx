'use client';

import { ArrowRight, LayoutDashboard, Play, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { StaticHeroBackground } from '@/app/_components/StaticHeroBackground';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { Button } from '@/components/ui/button';

export function Hero() {
  const heroId = useId();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section
      id={heroId}
      className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 pt-24 pb-20 md:pt-32 md:pb-28"
    >
      <StaticHeroBackground />
      <div className="absolute inset-0 bg-mesh-gradient opacity-20 mix-blend-overlay" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          {/* Top Center Text Content */}
          <div className="mb-12 w-full md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-gray-700/60 bg-gradient-to-r from-gray-800/60 to-gray-800/40 px-4 py-2 text-gray-300 text-sm shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-gray-600/70"
            >
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              <Link href="https://docs.interchat.tech/changelog">
                <AnimatedShinyText className="font-semibold tracking-wide">
                  Introducing InterChat v5
                </AnimatedShinyText>
              </Link>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mb-6 bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text font-extrabold text-4xl text-transparent leading-[1.1] tracking-tight md:text-6xl lg:text-7xl"
            >
              Connect Chats,{' '}
              <span className="relative bg-gradient-to-r from-primary via-primary-alt to-primary bg-clip-text text-transparent">
                Share Conversations.
              </span>
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
                <div className="absolute inset-0 rounded-[var(--radius-button)] bg-gradient-to-r from-primary to-primary-alt opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-30" />
                <Button
                  size="lg"
                  className="relative h-14 bg-gradient-to-r from-primary to-primary-alt px-8 font-semibold text-white shadow-lg transition-all duration-300 hover:from-primary-alt hover:to-primary hover:shadow-xl"
                >
                  <Link href="/invite" className="flex items-center">
                    Add to Discord
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
                  <Link href="/dashboard" className="flex items-center">
                    Explore Dashboard
                    <LayoutDashboard className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
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
                Join 11,000+ servers already connected.
              </span>
            </motion.p>
          </div>

          {/* Video Section - Full Glory Below Text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative mx-auto w-full max-w-5xl"
          >
            <div className="-inset-4 absolute rounded-[var(--radius-modal)] bg-gradient-to-r from-primary/40 via-primary-alt/40 to-primary/40 opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40" />

            <div className="relative overflow-hidden rounded-[var(--radius-modal)] border border-gray-700/60 bg-gradient-to-br from-gray-900/90 to-gray-950/90 shadow-2xl backdrop-blur-xl">
              {/* Video Header */}
              <div className="flex items-center justify-between border-gray-700/50 border-b bg-gray-900/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-alt">
                    <Play className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium text-gray-200">
                    InterChat in Action (Coming Soon)
                  </span>
                </div>
              </div>

              {/* Video Container */}
              <div className="relative aspect-video bg-gray-900/50">
                {/* Placeholder for video - you can replace this with your actual video */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800/80 to-gray-900/80">
                  {!isVideoPlaying ? (
                    <motion.button
                      onClick={() => setIsVideoPlaying(true)}
                      className="group relative"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary-alt opacity-60 blur-xl transition-opacity duration-300 group-hover:opacity-80" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-gradient-to-r from-primary to-primary-alt shadow-2xl md:h-24 md:w-24">
                        <Play className="ml-1 h-8 w-8 text-white md:h-10 md:w-10" />
                      </div>
                    </motion.button>
                  ) : (
                    /* Replace this div with your actual video element */
                    <div className="flex h-full w-full items-center justify-center text-white">
                      {/* Video element would go here */}
                      <video
                        className="h-full w-full object-cover"
                        controls
                        autoPlay
                        poster="/path-to-your-video-poster.jpg"
                      >
                        <source
                          src="/path-to-your-video.mp4"
                          type="video/mp4"
                        />
                        <track
                          kind="captions"
                          src="/path-to-captions.vtt"
                          srcLang="en"
                          label="English captions"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>

                {/* Video Overlay Text (appears over video) */}
                {!isVideoPlaying && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="absolute right-6 bottom-6 left-6"
                  >
                    <div className="rounded-[var(--radius)] border border-primary/30 bg-gradient-to-r from-primary/10 to-primary-alt/10 p-4 text-gray-300 text-sm backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">
                            Watch how cross-server communication works
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
