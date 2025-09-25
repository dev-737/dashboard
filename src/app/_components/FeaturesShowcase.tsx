'use client';

import {
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const features = [
  {
    id: 'cross-server',
    title: 'Cross-Server Communication',
    description:
      'Connect Discord servers with our advanced hub system. Messages flow instantly between connected channels while maintaining server identity.',
    icon: MessageSquare,
    color: 'from-emerald-500/20 to-green-500/20',
    borderColor: 'border-emerald-500/30',
    benefits: [
      'Instant message delivery',
      'Server identity preservation',
      'Unlimited connections',
      'Rich media support',
    ],
    mockup: '/features/CrossChat.png',
    isReversed: false,
  },
  {
    id: 'moderation',
    title: 'Advanced Moderation',
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    description:
      'Keep your communities safe with powerful moderation tools. Hub-specific and global controls ensure the right balance of openness and security.',
    icon: Shield,
    benefits: [
      'Hub-specific bans',
      'Global blacklists',
      'Auto-moderation',
      'Detailed logging',
    ],
    mockup: '/features/NSFWDetection.svg',
    isReversed: true,
  },
  {
    id: 'dashboard',
    title: 'Modern Dashboard',
    description:
      'Manage your hubs and connections with our beautifully redesigned dashboard. Intuitive controls at your fingertips.',
    icon: Settings,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    benefits: [
      'Intuitive UI/UX',
      'Easy hub management',
      'Mobile responsive',
      'Dark mode optimized',
    ],
    mockup: '/features/dashboard.png',
    isReversed: true,
  },
];

export function FeaturesShowcase() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-20 md:py-32">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/3 h-80 w-80 rounded-full bg-primary-alt/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-gray-700/60 bg-gradient-to-r from-gray-800/60 to-gray-800/40 px-4 py-2 text-gray-300 text-sm shadow-lg backdrop-blur-xl">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            <span className="font-semibold tracking-wide">
              Powerful Features
            </span>
          </div>

          <h2 className="mb-6 font-bold text-4xl text-white tracking-tight md:text-6xl">
            Everything you need for
            <span className="block bg-gradient-to-r from-primary via-primary-alt to-primary bg-clip-text text-transparent">
              Cross-Server Chatting
            </span>
          </h2>

          <p className="mx-auto max-w-3xl text-gray-300 text-lg leading-relaxed md:text-xl">
            InterChat v5 combines cutting-edge technology with intuitive design
            to deliver the ultimate cross-server Discord experience.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${
                feature.isReversed ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              {/* Content */}
              <div className={feature.isReversed ? 'lg:col-start-2' : ''}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-gradient-to-br ${feature.color} border ${feature.borderColor} backdrop-blur-xl`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-2xl text-white md:text-3xl">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-gray-300 text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                        <span className="text-gray-300 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual/Mockup */}

              <div className={feature.isReversed ? 'lg:col-start-1' : ''}>
                <div className="group relative">
                  <div
                    className={`-inset-4 absolute bg-gradient-to-r ${feature.color} rounded-[var(--radius-modal)] opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40`}
                  />
                  <Card className="relative overflow-hidden rounded-[var(--radius-modal)] border-gray-700/60 bg-gray-800/40 shadow-2xl backdrop-blur-xl">
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      {
                        <Image
                          src={feature.mockup}
                          alt={feature.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 800px, 100vw"
                        />
                      }
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mt-24 text-center md:mt-32"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-gray-700/60 bg-gradient-to-r from-gray-800/60 to-gray-800/40 px-4 py-2 text-gray-300 text-sm shadow-lg backdrop-blur-xl">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="font-semibold tracking-wide">
              Ready to get started?
            </span>
          </div>

          <h3 className="mb-4 font-bold text-3xl text-white md:text-4xl">
            Join thousands of communities using InterChat
          </h3>

          <p className="mx-auto mb-8 max-w-2xl text-gray-300 text-lg">
            Set up cross-server communication in minutes. No complex
            configuration required.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="h-12 bg-gradient-to-r from-primary to-primary-alt px-8 font-semibold text-white shadow-lg hover:from-primary-alt hover:to-primary"
              >
                <Link href="/invite" className="flex items-center">
                  Add to Discord
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-gray-600/70 bg-gray-800/60 px-8 font-semibold text-white backdrop-blur-xl hover:bg-gray-800/80"
              >
                <Link
                  href="https://docs.interchat.dev"
                  className="flex items-center"
                >
                  View Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
