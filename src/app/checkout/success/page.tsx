'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Tick01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GradientText } from '@/components/ui/shadcn-io/gradient-text';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.2)]"
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
                className="mb-4 text-4xl md:text-5xl font-extrabold text-white tracking-tight"
            >
                Payment <GradientText text="Successful" gradient="linear-gradient(90deg, #22c55e, #10b981)" />
            </motion.h1>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8 max-w-lg text-gray-400 text-lg"
            >
                Thank you for your purchase! Your premium subscription is now active. You should see the changes reflected in your account shortly.
            </motion.p>

            {sessionId && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-10 text-xs text-gray-500 font-mono"
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
                    <Button size="lg" className="rounded-xl bg-white text-black hover:bg-gray-200">
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
        <div className="relative min-h-screen bg-dash-main pt-32 pb-24 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-[120px]" />
            </div>

            <div className="container relative z-10 mx-auto max-w-4xl">
                <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-gray-400">Loading...</div>}>
                    <SuccessContent />
                </Suspense>
            </div>
        </div>
    );
}
