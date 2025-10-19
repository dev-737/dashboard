'use client';

import { PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// Generate deterministic values based on index
function getParticleProps(index: number) {
  // Use prime numbers for better distribution
  const width = ((index * 7919) % 40) + 10; // 10-50px
  const height = ((index * 6997) % 40) + 10; // 10-50px
  const left = (index * 5039) % 100; // 0-100%
  const top = (index * 4993) % 100; // 0-100%
  const xMove = ((index * 3989) % 60) - 30; // -30 to 30
  const yMove = ((index * 3967) % 60) - 30; // -30 to 30
  const duration = (index % 5) + 15; // 15-19 seconds (slower)
  const delay = index * 0.2; // Staggered start

  return { width, height, left, top, xMove, yMove, duration, delay };
}

interface ModernHeroProps {
  title: string;
  subtitle: string;
  stats: Array<{
    icon: React.ReactNode;
    value: number | string;
    label: string;
    color: string;
  }>;
  actionButton?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  gradientColors: {
    from: string;
    via: string;
    to: string;
  };
  particleColors: string[];
}

export function ModernHero({
  title,
  subtitle,
  stats,
  actionButton,
  gradientColors,
  particleColors,
}: ModernHeroProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render animations after component is mounted on client
  const renderParticles = isMounted ? (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => {
        const { width, height, left, top, xMove, yMove, duration, delay } =
          getParticleProps(i);

        // Get color based on index
        const colorIndex = i % particleColors.length;
        const particleColor = particleColors[colorIndex];

        return (
          <motion.div
            key={`particle-${i + 1}`}
            className={`absolute rounded-full ${particleColor}`}
            style={{
              width,
              height,
              left: `${left}%`,
              top: `${top}%`,
              filter: 'blur(8px)',
            }}
            initial={{ opacity: 0 }}
            animate={{
              x: [0, xMove],
              y: [0, yMove],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  ) : null;

  const { from, via, to } = gradientColors;

  return (
    <div className="relative mb-8 h-auto min-h-[250px] overflow-hidden rounded-xl shadow-lg sm:h-[30vh] md:h-[35vh]">
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${from} ${via} ${to} z-0`}
      />

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 z-0 bg-mesh-gradient opacity-30 mix-blend-overlay" />

      {/* Animated particles */}
      {renderParticles}

      {/* Content container */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-6">
        <motion.div
          className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="mb-3 text-center font-bold text-2xl text-white sm:text-3xl md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="mb-6 max-w-2xl px-2 text-center text-base text-gray-200 leading-relaxed sm:mb-8 sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {subtitle}
          </motion.p>

          <motion.div
            className="mb-6 grid w-full grid-cols-1 gap-4 px-2 sm:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={`stat-${stat.label}-${index + 1}`}
                className="hover:-translate-y-1 flex flex-col items-center justify-center gap-2 rounded-[var(--radius-button)] border border-gray-700/50 bg-gray-900/60 px-4 py-4 shadow-lg backdrop-blur-md transition-all duration-200 hover:shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
              >
                <div
                  className={`rounded-[var(--radius-avatar)] p-2 ${stat.color} mb-1 bg-opacity-20`}
                >
                  {stat.icon}
                </div>
                <span className="font-bold text-2xl text-white">
                  {stat.value}
                </span>
                <span className="text-gray-300 text-sm">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {actionButton && (
            <motion.div
              className="mt-2 flex w-full justify-center px-4 sm:mt-4 sm:px-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button
                asChild
                size="lg"
                className="hover:-translate-y-1 border-none bg-gradient-to-r from-primary-alt to-primary shadow-lg transition-all duration-300 hover:from-indigo-500 hover:to-purple-500 hover:shadow-xl"
              >
                <Link href={actionButton.href}>
                  {actionButton.icon || <PlusCircle className="mr-2 h-4 w-4" />}
                  {actionButton.label}
                </Link>
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
