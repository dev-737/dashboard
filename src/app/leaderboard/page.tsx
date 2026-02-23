'use client';

import {
  ArrowLeftIcon,
  Award01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';

import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function LeaderboardComingSoon() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-20%] h-[50%] w-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      <div className="container z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-50 blur-xl"
            />
            <div className="relative rounded-full border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
              <HugeiconsIcon
                strokeWidth={2}
                icon={Award01Icon}
                className="h-16 w-16 text-yellow-400"
              />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -top-2 -right-2"
            >
              <HugeiconsIcon
                strokeWidth={2}
                icon={SparklesIcon}
                className="h-8 w-8 fill-yellow-200 text-yellow-200"
              />
            </motion.div>
          </div>

          <h1 className="mb-6 font-bold text-5xl tracking-tight md:text-7xl">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Leaderboards
            </span>
            <br />
            <span className="bg-linear-to-r from-(--color-brand-purple-600) to-(--color-blue-600) bg-clip-text text-transparent">
              Coming Soon
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl text-zinc-400 leading-relaxed">
            We're building the ultimate way to track top hubs, most active
            servers, and rising stars. Get ready to compete and climb the ranks!
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/">
              <Button
                size="lg"
                className="rounded-full bg-white px-8 py-6 font-medium text-black text-lg hover:bg-zinc-200"
              >
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={ArrowLeftIcon}
                  className="mr-2 h-5 w-5"
                />
                Return Home
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px),
                            linear-gradient(to bottom, #333 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
    </div>
  );
}
