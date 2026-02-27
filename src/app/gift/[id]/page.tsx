'use client';

import { SparklesIcon, GiftIcon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'motion/react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/shadcn-io/gradient-text';
import { claimGiftCode } from '@/app/premium/actions';

export default function GiftPage() {
    const params = useParams();
    const router = useRouter();
    const codeId = typeof params.id === 'string' ? params.id : '';

    const [isClaiming, setIsClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);

    const premiumGradient = "linear-gradient(90deg, var(--color-brand-blue-500) 0%, var(--color-brand-purple-500) 25%, #a78bff 50%, var(--color-primary) 75%, var(--color-brand-blue-500) 100%)";

    const handleClaim = async () => {
        if (!codeId) return;

        setIsClaiming(true);
        try {
            const result = await claimGiftCode(codeId);

            if (result.error) {
                toast.error('Failed to claim gift', { description: result.error });
                setIsClaiming(false);
                return;
            }

            if (result.url) {
                // Discounted gift, redirect to checkout
                toast.success('Redirecting to checkout for your discounted premium...');
                window.location.href = result.url;
                return;
            }

            if (result.success) {
                // Free gift claimed successfully
                setClaimed(true);
                toast.success('Gift claimed successfully!', {
                    description: 'You now have premium access. Enjoy!'
                });
                // Slight delay before redirecting to premium/dashboard
                setTimeout(() => {
                    router.push('/dashboard');
                }, 3000);
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again later.');
            setIsClaiming(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dash-main py-24 px-4">
            {/* Absolute Background Effects */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-purple-600/20 blur-[120px]" />
                <div className="absolute right-[-10%] bottom-[-20%] h-[800px] w-[800px] rounded-full bg-blue-600/20 blur-[120px]" />
                <div className="mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] absolute inset-0 bg-[url('/assets/grid.svg')] bg-center opacity-30" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg"
            >
                <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#050810]/60 p-10 backdrop-blur-3xl shadow-2xl shadow-[#7B61FF]/10">

                    {/* Inner Hover Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(123,97,255,0.15),transparent_70%)] opacity-100 transition-opacity duration-700" />
                    <div
                        className="absolute top-0 right-0 left-0 h-1.5 w-full"
                        style={{ background: premiumGradient }}
                    />

                    {claimed ? (
                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                            >
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-12 w-12" />
                            </motion.div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Claimed Successfully!</h1>
                                <p className="text-gray-400">Your premium access has been activated. Redirecting you to your dashboard...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-[#4E56FF]/20 to-[#7B61FF]/20 shadow-inner ring-1 ring-[#7B61FF]/30 text-[#A78BFF]">
                                <HugeiconsIcon icon={GiftIcon} className="h-10 w-10" />
                            </div>

                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-blue-300 backdrop-blur-sm mb-2">
                                    <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 text-blue-400" />
                                    <span className="text-xs font-semibold tracking-wide uppercase">You received a gift!</span>
                                </div>
                                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                                    Claim your <br />
                                    <GradientText text="Premium" gradient={premiumGradient} />
                                </h1>
                                <p className="text-gray-400 mt-2 px-4">
                                    Unlock exclusive features and elevate your experience. Your code <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">{codeId}</span> is ready to be redeemed.
                                </p>
                            </div>

                            <Button
                                onClick={handleClaim}
                                disabled={isClaiming || !codeId}
                                className="relative h-14 w-full rounded-2xl border-none font-bold text-lg text-white shadow-[0_8_30px_rgba(123,97,255,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8_40px_rgba(123,97,255,0.6)]"
                                style={{ background: premiumGradient }}
                            >
                                {isClaiming ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Processing...
                                    </div>
                                ) : (
                                    'Claim Gift Now'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
