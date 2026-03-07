'use client';

import {
  Cancel01Icon,
  CheckmarkCircle01Icon,
  GiftIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  claimGiftCode,
  type GiftCodeStatus,
  getGiftCodeStatus,
} from '@/app/premium/actions';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/shadcn-io/gradient-text';

interface GiftPageClientProps {
  codeId: string;
  initialStatus: GiftCodeStatus | null;
}

export default function GiftPageClient({
  codeId,
  initialStatus,
}: GiftPageClientProps) {
  const router = useRouter();

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(!initialStatus);
  const [codeStatus, setCodeStatus] = useState<GiftCodeStatus | null>(
    initialStatus
  );

  const premiumGradient =
    'linear-gradient(90deg, var(--color-brand-blue-500) 0%, var(--color-brand-purple-500) 25%, #a78bff 50%, var(--color-primary) 75%, var(--color-brand-blue-500) 100%)';

  useEffect(() => {
    // If we already have initial status from server, skip fetch
    if (initialStatus) return;

    if (!codeId) {
      setCodeStatus({ status: 'not_found' });
      setLoading(false);
      return;
    }

    getGiftCodeStatus(codeId)
      .then((status) => setCodeStatus(status))
      .catch(() => setCodeStatus({ status: 'not_found' }))
      .finally(() => setLoading(false));
  }, [codeId, initialStatus]);

  const handleClaim = async () => {
    if (!codeId) return;

    setIsClaiming(true);
    try {
      const result = await claimGiftCode(codeId);

      if ('error' in result && result.error) {
        toast.error('Failed to claim gift', { description: result.error });
        setIsClaiming(false);
        return;
      }

      if ('url' in result && result.url) {
        // Discounted gift, redirect to checkout
        toast.success('Redirecting to checkout for your discounted premium...');
        window.location.href = result.url;
        return;
      }

      if ('success' in result && result.success) {
        // Free gift claimed successfully
        setClaimed(true);
        toast.success('Gift claimed successfully!', {
          description: 'You now have premium access. Enjoy!',
        });
        // Slight delay before redirecting to premium/dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch {
      toast.error('Something went wrong. Please try again later.');
      setIsClaiming(false);
    }
  };

  const tierDisplayName =
    codeStatus?.status === 'valid'
      ? `Inter${codeStatus.tier.charAt(0)}${codeStatus.tier.slice(1).toLowerCase()}`
      : '';

  const renderContent = () => {
    if (loading) {
      return (
        <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
          <div className="h-20 w-20 animate-pulse rounded-3xl bg-white/5" />
          <div className="space-y-3">
            <div className="mx-auto h-5 w-48 animate-pulse rounded-lg bg-white/5" />
            <div className="mx-auto h-10 w-64 animate-pulse rounded-lg bg-white/5" />
            <div className="mx-auto h-4 w-56 animate-pulse rounded-lg bg-white/5" />
          </div>
          <p className="animate-pulse text-gray-500 text-sm">
            Verifying gift code...
          </p>
        </div>
      );
    }

    if (claimed) {
      return (
        <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="flex h-24 w-24 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
          >
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-12 w-12" />
          </motion.div>
          <div>
            <h1 className="mb-2 font-extrabold text-3xl text-white tracking-tight">
              Claimed Successfully!
            </h1>
            <p className="text-gray-400">
              Your premium access has been activated. Redirecting you to your
              dashboard...
            </p>
          </div>
        </div>
      );
    }

    if (!codeStatus || codeStatus.status === 'not_found') {
      return (
        <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-400 shadow-inner ring-1 ring-red-500/20">
            <HugeiconsIcon icon={Cancel01Icon} className="h-10 w-10" />
          </div>
          <div className="space-y-3">
            <h1 className="font-extrabold text-3xl text-white tracking-tight">
              Gift Code Not Found
            </h1>
            <p className="px-4 text-gray-400">
              This gift code doesn&apos;t exist or is invalid. Please
              double-check the link you received.
            </p>
          </div>
          <Button
            asChild
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 font-semibold text-white hover:bg-white/10"
          >
            <Link href="/premium">Browse Premium Plans</Link>
          </Button>
        </div>
      );
    }

    if (codeStatus.status === 'claimed') {
      return (
        <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-400 shadow-inner ring-1 ring-blue-500/20">
            <HugeiconsIcon icon={InformationCircleIcon} className="h-10 w-10" />
          </div>
          <div className="space-y-3">
            <h1 className="font-extrabold text-3xl text-white tracking-tight">
              Already Claimed
            </h1>
            <p className="px-4 text-gray-400">
              This gift code has already been redeemed by another user.
            </p>
          </div>
          <Button
            asChild
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 font-semibold text-white hover:bg-white/10"
          >
            <Link href="/premium">Browse Premium Plans</Link>
          </Button>
        </div>
      );
    }

    // Valid code — show claim UI
    return (
      <div className="relative z-10 flex flex-col items-center space-y-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-[#4E56FF]/20 to-[#7B61FF]/20 text-[#A78BFF] shadow-inner ring-1 ring-[#7B61FF]/30">
          <HugeiconsIcon icon={GiftIcon} className="h-10 w-10" />
        </div>

        <div className="space-y-3">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-blue-300 backdrop-blur-sm">
            <HugeiconsIcon
              icon={SparklesIcon}
              className="h-4 w-4 text-blue-400"
            />
            <span className="font-semibold text-xs uppercase tracking-wide">
              You received a gift!
            </span>
          </div>
          <h1 className="mb-2 font-extrabold text-4xl text-white tracking-tight">
            Claim your <br />
            <GradientText text={tierDisplayName} gradient={premiumGradient} />
          </h1>
          <p className="mt-2 px-4 text-gray-400">
            {codeStatus.isFree
              ? 'Unlock exclusive premium features — completely free, courtesy of your gifter.'
              : "You've received a discounted premium subscription. Complete checkout to activate."}
          </p>
          <p className="text-gray-500 text-xs">
            Code:{' '}
            <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">
              {codeId}
            </span>
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
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-main px-4 py-24">
      {/* Absolute Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-20%] h-[800px] w-[800px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] absolute inset-0 bg-[url('/assets/grid.svg')] bg-center opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="group relative flex flex-col overflow-hidden rounded-4xl border border-white/10 bg-[#050810]/60 p-10 shadow-2xl shadow-[#7B61FF]/10 backdrop-blur-3xl">
          {/* Inner Hover Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(123,97,255,0.15),transparent_70%)] opacity-100 transition-opacity duration-700" />
          <div
            className="absolute top-0 right-0 left-0 h-1.5 w-full"
            style={{ background: premiumGradient }}
          />

          {renderContent()}
        </div>
      </motion.div>
    </div>
  );
}
