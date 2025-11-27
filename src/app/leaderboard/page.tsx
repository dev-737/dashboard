'use client';

import { motion } from 'motion/react';
import { Trophy, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LeaderboardComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 container mx-auto px-4 text-center">
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
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-xl opacity-50"
            />
            <div className="relative bg-zinc-900 p-6 rounded-full border border-zinc-800 shadow-2xl">
              <Trophy className="w-16 h-16 text-yellow-400" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-yellow-200 fill-yellow-200" />
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
              Leaderboards
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-purple-600 to-brand-blue-600">
              Coming Soon
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            We're building the ultimate way to track top hubs, most active
            servers, and rising stars. Get ready to compete and climb the
            ranks!
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 py-6 text-lg font-medium"
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Return Home
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px),
                            linear-gradient(to bottom, #333 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
