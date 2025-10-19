'use client';

import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({
  count,
  className,
}: NotificationBadgeProps) {
  // Don't render anything if there are no unread notifications
  if (count <= 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className={cn(
          'absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 font-bold text-[10px] text-white shadow-md',
          className
        )}
      >
        {count > 9 ? '9+' : count}
      </motion.div>
    </AnimatePresence>
  );
}
