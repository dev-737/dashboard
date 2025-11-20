'use client';

import {
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const features = [
  {
    id: 'cross-server',
    title: 'The Wormhole',
    description:
      "Connect channels across servers. It's like a portal gun for your messages. Messages flow instantly, media is shared, and chaos is distributed.",
    icon: MessageSquare,
    className: 'md:col-span-2 md:row-span-2',
    mockup: '/assets/images/features/CrossChat.png',
    gradient: 'from-emerald-500/20 to-green-500/20',
  },
  {
    id: 'moderation',
    title: 'The Bouncer',
    description:
      'Keep the trolls out. Global bans, auto-mod, and tools that actually work.',
    icon: Shield,
    className: 'md:col-span-1 md:row-span-1',
    mockup: '/assets/images/features/NSFWDetection.svg',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'dashboard',
    title: 'Control Center',
    description:
      "Manage everything from one place. It's so pretty you might actually want to use it.",
    icon: Settings,
    className: 'md:col-span-1 md:row-span-1',
    mockup: '/assets/images/features/dashboard.png',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
];

export function FeaturesShowcase() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-gray-950 via-gray-900 to-gray-950 py-20 md:py-32">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-(--radius-button) border border-gray-700/60 bg-linear-to-r from-gray-800/60 to-gray-800/40 px-4 py-2 text-gray-300 text-sm shadow-lg backdrop-blur-xl">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            <span className="font-semibold tracking-wide">
              Not just another bot
            </span>
          </div>

          <h2 className="mb-6 font-bold text-4xl text-white tracking-tight md:text-6xl">
            Features that <br className="hidden md:block" />
            <span className="bg-linear-to-r from-primary via-primary-alt to-primary bg-clip-text text-transparent">
              actually make sense
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-2">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                'group relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm transition-all hover:border-gray-700',
                feature.className
              )}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-10',
                  feature.gradient
                )}
              />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-gray-800/50 p-3 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-2xl text-white">
                    {feature.title}
                  </h3>
                </div>

                <p className="mb-8 max-w-md text-gray-400 text-lg leading-relaxed">
                  {feature.description}
                </p>

                <div className="mt-auto overflow-hidden rounded-xl border border-gray-800 bg-gray-950/50 shadow-2xl">
                   <div className="relative aspect-video w-full">
                      <Image
                        src={feature.mockup}
                        alt={feature.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
