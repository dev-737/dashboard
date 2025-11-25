'use client';

import { Heart, MessageCircle, Sparkles, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface PageFooterProps {
  /** Custom height for the footer. Defaults to providing enough space for mobile prompts */
  height?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show decorative elements */
  decorative?: boolean;
  /** Custom message to display */
  message?: string;
}

const heightClasses = {
  sm: 'h-20',
  md: 'h-32',
  lg: 'h-48',
  xl: 'h-64',
};

const decorativeMessages = [
  'Keep building amazing communities! 🚀',
  'Your hub is making Discord a better place ✨',
  'Great moderation keeps conversations flowing 💬',
  'Every connection makes the community stronger 🤝',
  'Building bridges between servers, one chat at a time 🌉',
];

export function PageFooter({
  height = 'md',
  decorative = true,
  message,
}: PageFooterProps) {
  const randomMessage =
    decorativeMessages[Math.floor(Math.random() * decorativeMessages.length)];
  const displayMessage = message || randomMessage;

  if (!decorative) {
    return (
      <div
        className={`w-full ${heightClasses[height]} shrink-0`}
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className={`w-full ${heightClasses[height]} relative flex shrink-0 items-center justify-center overflow-hidden`}
      aria-hidden="true"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-gray-950/80 via-gray-950/40 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            x: [0, 10, 0],
            y: [0, -5, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-purple-400/30 blur-sm"
        />
        <motion.div
          animate={{
            x: [0, -8, 0],
            y: [0, 3, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute top-1/3 right-1/3 h-1.5 w-1.5 rounded-full bg-indigo-400/40 blur-sm"
        />
        <motion.div
          animate={{
            x: [0, 5, 0],
            y: [0, -3, 0],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute bottom-1/3 left-1/2 h-1 w-1 rounded-full bg-cyan-400/35 blur-sm"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-md px-6 text-center">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mb-2 flex items-center justify-center gap-2"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="h-4 w-4 text-purple-400/70" />
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          >
            <Heart className="h-4 w-4 text-red-400/70" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          >
            <Users className="h-4 w-4 text-indigo-400/70" />
          </motion.div>

          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.5,
            }}
          >
            <MessageCircle className="h-4 w-4 text-emerald-400/70" />
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="font-medium text-gray-400/80 text-sm leading-relaxed"
        >
          {displayMessage}
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.1, duration: 0.8, ease: 'easeOut' }}
          className="mx-auto mt-3 h-px w-16 bg-linear-to-r from-transparent via-purple-400/30 to-transparent"
        />
      </div>
    </motion.div>
  );
}
