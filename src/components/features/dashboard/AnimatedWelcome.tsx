'use client';

import {
  Activity,
  type LucideIcon,
  MessageSquare,
  Hand,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  return (
    <motion.div
      className="relative mb-8 overflow-hidden rounded-xl border border-gray-800/50 bg-dash-surface"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

      {/* Subtle glow */}
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row md:px-8">
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 font-medium text-purple-400 text-sm"
          >
            <Hand className="h-4 w-4" />
            <span>InterChat Dashboard</span>
          </motion.div>

          <motion.h1
            className="font-bold text-2xl text-white md:text-3xl"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome back,{' '}
            <span className="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {user.name || 'User'}
            </span>
          </motion.h1>

          <motion.p
            className="max-w-md text-gray-400"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Manage your communities and explore new possibilities.
          </motion.p>
        </div>

        <motion.div
          className="flex w-full flex-wrap gap-3 md:w-auto"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Quick Action Cards */}
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
            <QuickAction
              icon={MessageSquare}
              label="Hubs"
              onClick={() => router.push('/dashboard?tab=hubs')}
            />
            <QuickAction
              icon={Users}
              label="Servers"
              onClick={() => router.push('/dashboard?tab=servers')}
            />
            <QuickAction
              icon={Activity}
              label="Profile"
              onClick={() => router.push('/dashboard/settings')}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-700/50 bg-gray-900/50 px-4 py-3 transition-all hover:border-purple-500/30 hover:bg-gray-800 sm:flex-none"
    >
      <Icon className="h-4 w-4 text-gray-400 transition-colors group-hover:text-purple-400" />
      <span className="text-sm font-medium text-gray-300 group-hover:text-white">
        {label}
      </span>
    </button>
  );
}
