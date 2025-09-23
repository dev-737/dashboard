'use client';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Bell,
  Globe,
  MessageSquare,
  Server,
  Shield,
  Users,
  Zap,
} from 'lucide-react';

// Map of icon names to components
const IconMap = {
  BarChart3,
  MessageSquare,
  Server,
  Users,
  Activity,
  Zap,
  Shield,
  Globe,
  Bell,
};

type IconName = keyof typeof IconMap;

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  iconName: IconName;
  index: number;
  color?: 'purple' | 'blue' | 'emerald' | 'red' | 'orange' | 'yellow';
}

export function StatCard({
  title,
  value,
  description,
  iconName,
  index,
  color = 'purple',
}: StatCardProps) {
  const Icon = IconMap[iconName];

  const colorVariants = {
    purple: {
      gradient: 'from-purple-500/15 via-indigo-500/10 to-purple-600/15',
      border: 'border-purple-400/30',
      iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-500',
      iconGlow: 'shadow-lg shadow-purple-500/20',
      textAccent: 'text-purple-400',
      valueGradient:
        'bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-purple-500/20',
      hoverBorder: 'hover:border-purple-400/50',
      progressGradient: 'from-purple-500 to-indigo-500',
      decorationColor: 'bg-purple-500/20',
    },
    blue: {
      gradient: 'from-blue-500/15 via-cyan-500/10 to-blue-600/15',
      border: 'border-blue-400/30',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      iconGlow: 'shadow-lg shadow-blue-500/20',
      textAccent: 'text-blue-400',
      valueGradient:
        'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-blue-500/20',
      hoverBorder: 'hover:border-blue-400/50',
      progressGradient: 'from-blue-500 to-cyan-500',
      decorationColor: 'bg-blue-500/20',
    },
    emerald: {
      gradient: 'from-emerald-500/15 via-green-500/10 to-emerald-600/15',
      border: 'border-emerald-400/30',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
      iconGlow: 'shadow-lg shadow-emerald-500/20',
      textAccent: 'text-emerald-400',
      valueGradient:
        'bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-emerald-500/20',
      hoverBorder: 'hover:border-emerald-400/50',
      progressGradient: 'from-emerald-500 to-green-500',
      decorationColor: 'bg-emerald-500/20',
    },
    red: {
      gradient: 'from-red-500/15 via-pink-500/10 to-red-600/15',
      border: 'border-red-400/30',
      iconBg: 'bg-gradient-to-br from-red-500 to-pink-500',
      iconGlow: 'shadow-lg shadow-red-500/20',
      textAccent: 'text-red-400',
      valueGradient:
        'bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-red-500/20',
      hoverBorder: 'hover:border-red-400/50',
      progressGradient: 'from-red-500 to-pink-500',
      decorationColor: 'bg-red-500/20',
    },
    orange: {
      gradient: 'from-orange-500/15 via-amber-500/10 to-orange-600/15',
      border: 'border-orange-400/30',
      iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
      iconGlow: 'shadow-lg shadow-orange-500/20',
      textAccent: 'text-orange-400',
      valueGradient:
        'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-orange-500/20',
      hoverBorder: 'hover:border-orange-400/50',
      progressGradient: 'from-orange-500 to-amber-500',
      decorationColor: 'bg-orange-500/20',
    },
    yellow: {
      gradient: 'from-amber-500/15 via-yellow-500/10 to-amber-600/15',
      border: 'border-amber-400/30',
      iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-500',
      iconGlow: 'shadow-lg shadow-amber-500/20',
      textAccent: 'text-amber-400',
      valueGradient:
        'bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent',
      hoverGlow: 'hover:shadow-amber-500/20',
      hoverBorder: 'hover:border-amber-400/50',
      progressGradient: 'from-amber-500 to-yellow-500',
      decorationColor: 'bg-amber-500/20',
    },
  };

  const variant = colorVariants[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{
        y: -8,
        scale: 1.03,
        transition: { duration: 0.2, type: 'spring', stiffness: 300 },
      }}
      className="group h-full"
    >
      <div
        className={`relative h-full border bg-gradient-to-br from-gray-900/95 to-gray-950/95 p-6 backdrop-blur-xl ${variant.border} ${variant.hoverBorder}transition-all duration-300 ease-out before:absolute before:inset-0 before:bg-gradient-to-br hover:shadow-2xl hover:shadow-black/20 before:${variant.gradient}before:pointer-events-none overflow-hidden rounded-[8px] before:rounded-[8px]`}
      >
        {/* Background decoration */}
        <div
          className={`-top-4 -right-4 absolute h-24 w-24 rounded-full opacity-10 blur-xl ${variant.decorationColor}`}
        />

        {/* Subtle overlay gradient */}
        <div className="pointer-events-none absolute inset-0 rounded-[8px] bg-gradient-to-br from-white/5 to-transparent" />

        {/* Header */}
        <div className="relative mb-6 flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-gray-300 text-sm uppercase tracking-widest">
              {title}
            </h3>
            <p className="max-w-[200px] text-gray-400 text-xs leading-relaxed">
              {description}
            </p>
          </div>

          {/* Icon with glow effect */}
          <motion.div
            className={`relative p-3 ${variant.iconBg} ${variant.iconGlow}shadow-lg rounded-[12px] transition-all duration-300 group-hover:shadow-xl`}
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Icon className="h-6 w-6 text-white" />
            <div className="absolute inset-0 rounded-[12px] bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </motion.div>
        </div>

        {/* Value */}
        <motion.div
          className="relative space-y-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
        >
          <div
            className={`font-black text-5xl tracking-tight ${variant.valueGradient}`}
          >
            {value}
          </div>

          {/* Subtle progress bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-800/50">
            <motion.div
              className={`h-full bg-gradient-to-r ${variant.progressGradient}`}
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
            />
          </div>
        </motion.div>

        {/* Animated particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[8px]">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`particle-${index}-${i + 1}`}
              className="absolute h-1 w-1 rounded-full bg-white/30"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                left: `${20 + i * 30}%`,
                top: `${60 + i * 10}%`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
