'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

import { Activity, BarChart3, MessageSquare, Users } from 'lucide-react';

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
      <div className="relative mb-8 h-[200px] overflow-hidden rounded-xl border border-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" />
      </div>
    );
  }

  return (
    <motion.div
      className="relative mb-8 h-[200px] overflow-hidden rounded-xl border border-gray-800/50 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4">
          <MessageSquare className="h-8 w-8 text-purple-400" />
        </div>
        <div className="absolute top-4 right-4">
          <BarChart3 className="h-8 w-8 text-blue-400" />
        </div>
        <div className="absolute bottom-4 left-4">
          <Users className="h-8 w-8 text-indigo-400" />
        </div>
        <div className="absolute right-4 bottom-4">
          <Activity className="h-8 w-8 text-pink-400" />
        </div>
      </div>

      {/* Content container */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="mb-2 font-bold text-2xl text-white md:text-3xl">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {user.name || 'User'}
            </span>
          </h1>
          <p className="max-w-md text-gray-400 text-sm md:text-base">
            Manage your cross-server communities and connect Discord servers
            worldwide
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
