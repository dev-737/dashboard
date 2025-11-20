'use client';

import { LayoutDashboard, Plus, Search, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const actions = [
  {
    title: 'Dashboard',
    description: 'Manage your hubs and connections',
    icon: LayoutDashboard,
    href: '/dashboard',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    border: 'group-hover:border-blue-500/50',
    iconColor: 'text-blue-400',
  },
  {
    title: 'Discover Hubs',
    description: 'Find communities to connect with',
    icon: Search,
    href: '/discover',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'group-hover:border-emerald-500/50',
    iconColor: 'text-emerald-400',
  },
  {
    title: 'Create Hub',
    description: 'Start your own community network',
    icon: Plus,
    href: '/dashboard/hubs/create',
    gradient: 'from-purple-500/20 to-pink-500/20',
    border: 'group-hover:border-purple-500/50',
    iconColor: 'text-purple-400',
  },
  {
    title: 'Moderation Tools',
    description: 'Keep your communities safe',
    icon: Shield,
    href: 'https://docs.interchat.dev/hub-management/moderation',
    gradient: 'from-orange-500/20 to-red-500/20',
    border: 'group-hover:border-orange-500/50',
    iconColor: 'text-orange-400',
  },
];

export function ActionGrid() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-gray-950 via-gray-900 to-gray-950 px-4 py-20 md:py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-bold text-2xl text-white md:text-3xl"
          >
            What would you like to do?
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={action.href} className="block h-full">
                <div
                  className={cn(
                    'group relative h-full overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
                    action.border
                  )}
                >
                  <div
                    className={cn(
                      'absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                      action.gradient
                    )}
                  />

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className={cn('mb-4 rounded-xl bg-gray-800/50 p-3 shadow-inner', action.iconColor)}>
                      <action.icon className="h-8 w-8" />
                    </div>
                    <h3 className="mb-2 font-semibold text-lg text-white">
                      {action.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
