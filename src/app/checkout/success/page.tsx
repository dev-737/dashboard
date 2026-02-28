'use client';

import {
  ArrowLeft01Icon,
  Copy01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/shadcn-io/gradient-text';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const giftCode = searchParams.get('gift_code');

  const handleCopyGiftCode = () => {
    if (giftCode) {
      navigator.clipboard.writeText(giftCode);
      toast.success('Gift code copied to clipboard!');
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 shadow-[0_0_40px_rgba(34,197,94,0.2)]"
      >
        <HugeiconsIcon
          icon={Tick01Icon}
          className="h-12 w-12 text-green-400"
          strokeWidth={2}
        />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-4 font-extrabold text-4xl text-white tracking-tight md:text-5xl"
      >
        Payment{' '}
        <GradientText
          text="Successful"
          gradient="linear-gradient(90deg, #22c55e, #10b981)"
        />
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 max-w-lg text-gray-400 text-lg"
      >
        {giftCode ? (
          <>
            Thank you for purchasing a gift! Your gift code has been generated.
            You will also receive it via DMs within the next 5 minutes.
          </>
        ) : (
          <>
            Thank you for your purchase! Your premium subscription is now
            active. You should see the changes reflected in your account
            shortly.
          </>
        )}
      </motion.p>

      {giftCode && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-8"
        >
          <div className="inline-block rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-6 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            <h3 className="mb-3 font-semibold text-indigo-400 text-sm uppercase tracking-wider">
              Your Gift Code
            </h3>
            <div className="flex items-center gap-3">
              <code className="rounded border border-white/10 bg-black/40 px-4 py-2 font-mono text-white text-xl">
                {giftCode}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyGiftCode}
                className="h-10 w-10 border-indigo-500/30 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 hover:text-indigo-200"
              >
                <HugeiconsIcon icon={Copy01Icon} className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-3 text-indigo-300/60 text-xs">
              Direct link:{' '}
              {typeof window !== 'undefined'
                ? `${window.location.origin}/gift/${giftCode}`
                : `/gift/${giftCode}`}
            </p>
          </div>
        </motion.div>
      )}

      {sessionId && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10 font-mono text-gray-500 text-xs"
        >
          Order Ref: {sessionId.slice(-10)}
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link href="/dashboard">
          <Button
            size="lg"
            className="rounded-xl bg-white text-black hover:bg-gray-200"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-main pt-32 pb-24">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-4xl">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center text-gray-400">
              Loading...
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
