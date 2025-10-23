'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  MessageSquare,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

interface AnimatedWelcomeProps {
  user: User;
}

export function AnimatedWelcome({ user }: AnimatedWelcomeProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render content after component is mounted on client
  if (!isMounted) {
    return (
      <div className="relative mb-8 h-[30vh] overflow-hidden rounded-2xl border border-gray-800/50 md:h-[40vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-indigo-900/30" />
      </div>
    );
  }

  const floatingIcons = [
    {
      Icon: MessageSquare,
      className:
        'absolute top-[10%] left-[5%] h-16 w-16 text-purple-400/20 md:h-20 md:w-20',
      delay: 0,
    },
    {
      Icon: BarChart3,
      className:
        'absolute top-[15%] right-[8%] h-12 w-12 text-blue-400/20 md:h-16 md:w-16',
      delay: 0.1,
    },
    {
      Icon: Users,
      className:
        'absolute bottom-[12%] left-[8%] h-14 w-14 text-indigo-400/20 md:h-18 md:w-18',
      delay: 0.2,
    },
    {
      Icon: Activity,
      className:
        'absolute bottom-[15%] right-[5%] h-16 w-16 text-pink-400/20 md:h-20 md:w-20',
      delay: 0.15,
    },
    {
      Icon: Zap,
      className:
        'absolute top-[50%] left-[15%] h-10 w-10 text-yellow-400/15 md:h-12 md:w-12',
      delay: 0.25,
    },
    {
      Icon: Sparkles,
      className:
        'absolute top-[40%] right-[12%] h-10 w-10 text-cyan-400/15 md:h-12 md:w-12',
      delay: 0.3,
    },
  ];

  return (
    <motion.div
      className="relative mb-8 overflow-hidden rounded-2xl border border-gray-800/30 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-indigo-900/30 shadow-2xl shadow-purple-900/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-blue-600/10" />

      {/* Floating decorative icons */}
      <div className="absolute inset-0">
        {floatingIcons.map(({ Icon, className, delay }, index) => (
          <motion.div
            key={index}
            className={className}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              delay: delay,
              duration: 0.8,
              ease: 'easeOut',
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
              repeatDelay: 3,
            }}
          >
            <Icon className="h-full w-full" />
          </motion.div>
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Content container */}
      <div className="relative z-10 flex min-h-[30vh] flex-col items-center justify-center px-6 py-12 md:min-h-[40vh]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Greeting badge */}
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4 text-purple-300" />
            <span className="font-medium text-purple-200 text-sm">
              Dashboard
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="mb-4 font-bold text-3xl text-white md:text-5xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {user.name || 'User'}
            </span>
            !
          </motion.h1>

          {/* Description */}
          <motion.p
            className="mx-auto max-w-2xl text-gray-300 text-base leading-relaxed md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Manage your cross-server communities and connect Discord servers
            worldwide with InterChat
          </motion.p>

          {/* Quick stats */}
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            {[
              { icon: MessageSquare, label: 'Hubs', color: 'purple' },
              { icon: Users, label: 'Servers', color: 'blue' },
              { icon: Activity, label: 'Active', color: 'pink' },
            ].map(({ icon: Icon, label, color }, index) => (
              <motion.div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-gray-700/50 bg-gray-900/30 px-4 py-2 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <Icon
                  className={`h-4 w-4 ${
                    color === 'purple'
                      ? 'text-purple-400'
                      : color === 'blue'
                        ? 'text-blue-400'
                        : 'text-pink-400'
                  }`}
                />
                <span className="font-medium text-gray-300 text-sm">
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
