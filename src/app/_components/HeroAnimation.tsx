'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

// --- Assets / Icons ---

const ServerIcon = ({ label, color }: { label: string; color: string }) => (
  <div
    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${color} shadow-lg ring-2 ring-white/10 backdrop-blur-md`}
  >
    <span className="font-bold text-white/90">{label}</span>
  </div>
);

const MessageBubble = ({ className }: { className?: string }) => (
  <div
    className={`flex h-8 w-12 items-center justify-center rounded-xl bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] ${className}`}
  >
    <div className="h-1.5 w-6 rounded-full bg-slate-900/20" />
  </div>
);

const Portal = () => (
  <div className="relative flex h-32 w-32 items-center justify-center">
    {/* Outer Glow Ring */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 rounded-full border border-purple-500/30 border-t-purple-400 border-l-transparent opacity-50 shadow-[0_0_40px_rgba(168,85,247,0.2)]"
    />
    {/* Inner Spinning Core */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-4 rounded-full border-2 border-sky-400/40 border-dashed shadow-[0_0_20px_rgba(56,189,248,0.3)]"
    />
    {/* Central Singularity */}
    <div className="absolute inset-10 rounded-full bg-linear-to-br from-purple-600 to-blue-600 opacity-20 blur-xl" />
    <div className="z-10 h-2 w-2 rounded-full bg-white shadow-[0_0_15px_white]" />
  </div>
);

// --- Main Component ---

export function HeroAnimation() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((prev) => prev + 1);
    }, 4000); // 4 second loop cycle
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/5 bg-slate-950/50 p-8 shadow-2xl backdrop-blur-xl md:p-14">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex flex-col items-center justify-between gap-8 md:flex-row md:gap-4">
        {/* LEFT: Source Server */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
          >
            <ServerIcon
              label="A"
              color="from-indigo-500 via-purple-500 to-pink-500"
            />
            <div className="h-2 w-16 rounded-full bg-white/10" />
            <div className="h-2 w-10 rounded-full bg-white/10" />

            {/* Emitting Message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={cycle}
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [10, -20, -20, -20],
                  x: [0, 0, 100, 150], // Fly towards portal
                  scale: [0.5, 1, 1, 0.2], // Shrink as it enters portal
                }}
                transition={{
                  duration: 1.5,
                  times: [0, 0.2, 0.8, 1],
                  ease: 'easeInOut',
                }}
                className="absolute top-0 -right-4 z-20"
              >
                <MessageBubble className="bg-indigo-400" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <p className="font-medium text-indigo-300 text-sm">Discord Server</p>
        </div>

        {/* CENTER: The Portal */}
        <div className="relative z-10 flex shrink-0 items-center justify-center px-4 md:px-12">
          <Portal />

          {/* Connection Line Left */}
          <div className="absolute left-0 top-1/2 -z-10 h-px w-full bg-linear-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>

        {/* RIGHT: Destination Servers */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex flex-col gap-3">
            {['B', 'C', 'D'].map((label, idx) => (
              <motion.div
                key={label}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 * idx }}
                className="relative flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-3 pr-8 backdrop-blur-md"
              >
                <ServerIcon
                  label={label}
                  color="from-sky-500 via-blue-500 to-cyan-500"
                />
                <div className="flex flex-col gap-2">
                  <div className="h-2 w-20 rounded-full bg-white/10" />
                  <div className="h-2 w-12 rounded-full bg-white/10" />
                </div>

                {/* Incoming Message */}
                <AnimatePresence>
                  {cycle >= 0 && (
                    <motion.div
                      key={`${cycle}-${label}`}
                      initial={{ opacity: 0, x: -80, scale: 0.2 }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                        x: [-80, -20, 0, 0],
                        scale: [0.2, 1, 1, 1],
                      }}
                      transition={{
                        duration: 2,
                        delay: 1.4 + idx * 0.2, // Staggered arrival after portal transit
                        times: [0, 0.2, 0.3, 1],
                      }}
                      className="absolute -left-3 top-1/2 z-20 -translate-y-1/2"
                    >
                      <MessageBubble className="h-6 w-8 scale-75 bg-sky-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Infinite Scale Hint */}
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-1"
          >
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <p className="mt-2 text-[10px] text-gray-500 uppercase tracking-widest">
              No Limit
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
