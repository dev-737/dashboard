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

// --- Portal Component ---

const Portal = ({ isActive }: { isActive: boolean }) => {
  const [particles, setParticles] = useState<
    {
      id: string;
      x: number;
      y: number;
      size: number;
      color: string;
      duration: number;
    }[]
  >([]);

  // Particle Spawner - Only runs when active
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const id = Math.random().toString(36);
      const angle = Math.random() * Math.PI * 2;
      const radiusX = 100;
      const radiusY = 160;
      const offset = 0.85 + Math.random() * 0.3;

      const x = Math.cos(angle) * radiusX * offset;
      const y = Math.sin(angle) * radiusY * offset;

      const size = Math.random() > 0.5 ? 4 : 2;
      const isBaseColor = Math.random() > 0.4;
      const color = isBaseColor ? '#56499d' : '#867bd6';

      const newParticle = {
        id,
        x,
        y,
        size,
        color,
        duration: 1 + Math.random() * 2,
      };

      setParticles((prev) => [...prev, newParticle]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, newParticle.duration * 1000);
    }, 60);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden bg-transparent selection:bg-indigo-500 selection:text-white">
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black" />

      {/* 3D Perspective Container */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ perspective: '1000px' }}
      >
        {/* Portal Group */}
        <motion.div
          className="group relative cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          transition={{ duration: 0.4 }}
        >
          {/* Tilt Wrapper */}
          <motion.div
            className="relative"
            style={{
              rotateX: 15,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Flash Effect on Warp */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute inset-0 z-50 rounded-[50%] bg-white mix-blend-overlay"
                />
              )}
            </AnimatePresence>

            {/* Main Portal Body */}
            <div className="relative mb-2 h-72 w-48 overflow-hidden rounded-[50%] border-4 border-[#56499d]/50 bg-black shadow-2xl md:h-96 md:w-64">
              {/* Layer 1: Main Swirl */}
              <motion.div
                className="absolute -inset-[50%]"
                animate={{ rotate: isActive ? 360 : 0 }}
                // Instant reset (duration: 0) when going back to idle so it snaps to 0
                // Smooth rotation (duration: 1) when active
                transition={{
                  duration: isActive ? 1.5 : 0,
                  ease: 'easeInOut',
                }}
              >
                <div
                  className="h-full w-full opacity-80"
                  style={{
                    background: `conic-gradient(from 0deg, #0f172a 0%, #56499d 20%, #0f172a 40%, #7c72c0 60%, #0f172a 80%, #56499d 100%)`,
                    filter: 'blur(8px)',
                  }}
                />
              </motion.div>

              {/* Layer 2: Inner Detail Swirl (Counter-rotate) */}
              <motion.div
                className="absolute -inset-[50%] opacity-70 mix-blend-screen"
                animate={{ rotate: isActive ? -360 : 0 }}
                transition={{
                  duration: isActive ? 1.5 : 0,
                  ease: 'easeInOut',
                }}
              >
                <div
                  className="h-full w-full"
                  style={{
                    background: `conic-gradient(from 180deg, transparent 0%, #867bd6 25%, transparent 50%, #56499d 75%, transparent 100%)`,
                    filter: 'blur(4px)',
                  }}
                />
              </motion.div>

              {/* Layer 3: Central Depth Void (Pulses when active) */}
              <motion.div
                className="absolute inset-6 rounded-[50%] bg-gray-950 opacity-80 mix-blend-multiply blur-md"
                animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                transition={{
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Particle System Container */}
            <div className="pointer-events-none absolute inset-0">
              <AnimatePresence>
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{
                      x: p.x,
                      y: p.y,
                      scale: 1,
                      opacity: 1,
                    }}
                    animate={{
                      y: p.y - 80, // Float up higher when warping
                      scale: 0,
                      opacity: 0,
                    }}
                    transition={{ duration: p.duration, ease: 'linear' }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: p.size,
                      height: p.size,
                      backgroundColor: p.color,
                      boxShadow: `0 0 4px ${p.color}`,
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// --- Main Component ---

export function HeroAnimation() {
  const [cycle, setCycle] = useState(0);
  const [isPortalActive, setIsPortalActive] = useState(false);

  useEffect(() => {
    const runCycle = () => {
      setCycle((prev) => prev + 1);

      // Timing Logic:
      // The message animation takes 1.5s total.
      // It starts traveling at t=0.
      // It hits the portal visually around t=0.8s.
      // We activate the portal just before impact and deactivate after it passes.

      setTimeout(() => {
        setIsPortalActive(true);
      }, 600); // Activate at 0.6s

      setTimeout(() => {
        setIsPortalActive(false);
      }, 1900); // Deactivate at 1.9s
    };

    // Run immediately
    runCycle();

    const interval = setInterval(runCycle, 4000); // 4 second loop cycle
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
                  times: [0, 0.2, 0.8, 1], // Hits portal around 0.8
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
          {/* PASSING THE STATE DOWN */}
          <div className="relative">
            <Portal isActive={isPortalActive} />
            <div className="absolute -bottom-13 left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap">
              <p className="animate-pulse font-mono text-[#7c72c0] text-sm tracking-[0.2em] drop-shadow-md">
                INTERCHAT HUB
              </p>
            </div>
          </div>

          {/* Connection Line Left */}
          <div className="absolute top-1/2 left-0 -z-10 h-px w-full bg-linear-to-r from-transparent via-purple-500/30 to-transparent" />
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
                      className="absolute top-1/2 -left-3 z-20 -translate-y-1/2"
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
              + connected servers
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
