'use client';

import { ArrowLeft01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutCancelledPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-main pt-32 pb-24">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-4xl">
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.15)]"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="h-10 w-10 text-red-500"
              strokeWidth={2}
            />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 font-extrabold text-4xl text-white tracking-tight md:text-5xl"
          >
            Checkout Cancelled
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 max-w-lg text-gray-400 text-lg"
          >
            Your payment process was cancelled and you haven't been charged. You
            can always try again later.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/premium">
              <Button
                size="lg"
                className="w-full rounded-xl bg-white text-black hover:bg-gray-200 sm:w-auto"
              >
                Try Again
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  className="mr-2 h-4 w-4"
                />
                Return to Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
