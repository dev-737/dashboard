'use client';

import {
  Cancel01Icon,
  CheckmarkSquare01Icon,
  CrownIcon,
  GiftIcon,
  SparklesIcon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GradientText } from '@/components/ui/shadcn-io/gradient-text';
import { createCheckoutSession, createGiftCheckoutSession } from './actions';

const tiers = [
  {
    id: 'CORE',
    name: 'InterCore',
    price: '$2.99',
    period: '/month',
    description:
      'Premium features for yourself - elevate how you use our service.',
    icon: StarIcon,
    iconColor: 'text-blue-400',
    features: [
      'Nitro like customisation',
      'Create more hubs (3)',
      'An exclusive global badge',
      'Priority Support',
    ],
    buttonText: 'Get Started',
    popular: false,
    priceId:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_CORE || 'price_core_placeholder',
  },
  {
    id: 'PLUS',
    name: 'InterPlus',
    price: '$4.99',
    period: '/month',
    description: 'Got a community to manage? InterPlus is for you.',
    icon: SparklesIcon,
    iconColor: 'text-purple-400',
    features: [
      'Everything in Core - plus more',
      'Nitro like customisation for your guild',
      'Longer text limit in hubs',
      'More accepted media types',
      'External emojis pass through',
      'And more...',
    ],
    buttonText: 'Get Started',
    popular: true,
    priceId:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PLUS || 'price_plus_placeholder',
  },
  {
    id: 'PRO',
    name: 'InterPro',
    price: '$7.99',
    period: '/month',
    description: 'Run your own hub? This one is for you.',
    icon: CrownIcon,
    iconColor: 'text-amber-400',
    features: [
      'Everything in Plus',
      'Hoisted on our discovery page',
      'Custom badges',
      'Special font support',
      'Advanced automoderation',
      'And more...',
    ],
    buttonText: 'Get Started',
    popular: false,
    priceId:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || 'price_pro_placeholder',
  },
];

const comparisonFeatures = [
  {
    category: 'Capacity & Limitations',
    items: [
      {
        name: 'Hub creation limit',
        free: '1 hub',
        core: '3 hubs',
        plus: '3 hubs',
        pro: '3 hubs',
      },
      {
        name: 'Elevated hub connections to your server',
        free: '2 connections',
        core: '5 connections',
        plus: '10 connections',
        pro: '25 connections',
      },
      {
        name: 'Higher character limit',
        free: '1000 characters',
        core: '1000 characters',
        plus: '2000 characters',
        pro: '3000 characters',
      },
      {
        name: 'Prolonged message retention',
        free: '1 day',
        core: '1 day',
        plus: '7 days',
        pro: 'Up to 30 days',
      },
      {
        name: 'Access to premium broadcast nodes',
        free: false,
        core: false,
        plus: true,
        pro: true,
      },
      {
        name: 'Advanced automoderation',
        free: false,
        core: false,
        plus: false,
        pro: true,
      },
    ],
  },
  {
    category: 'Customisation & Branding',
    items: [
      {
        name: 'Enhanced profile customisation',
        free: false,
        core: true,
        plus: true,
        pro: true,
      },
      {
        name: 'Global user badge',
        free: false,
        core: true,
        plus: true,
        pro: true,
      },
      {
        name: 'Custom guild profile',
        free: false,
        core: false,
        plus: true,
        pro: true,
      },
      {
        name: 'Hub hoisting on website',
        free: false,
        core: false,
        plus: true,
        pro: true,
      },
      { name: 'Hub badge', free: false, core: false, plus: true, pro: true },
      {
        name: 'Custom hub badges',
        free: false,
        core: false,
        plus: false,
        pro: true,
      },
      {
        name: 'Vanity invites',
        free: false,
        core: false,
        plus: false,
        pro: true,
      },
      {
        name: 'Nickname instead of display name',
        free: false,
        core: false,
        plus: true,
        pro: true,
      },
      {
        name: 'Preserve special text formatting',
        free: false,
        core: false,
        plus: true,
        pro: true,
      },
      {
        name: 'Customisable logs ',
        free: false,
        core: false,
        plus: true,
        pro: true,
      },
    ],
  },
  {
    category: 'Media & Content Features',
    items: [
      {
        name: 'External emojis',
        free: false,
        core: false,
        plus: true,
        pro: true,
      },
      { name: 'Send videos', free: false, core: false, plus: true, pro: true },
      {
        name: 'Send voice notes',
        free: false,
        core: false,
        plus: true,
        pro: true,
      },
    ],
  },
  {
    category: 'Control',
    items: [
      {
        name: 'Priority support',
        free: false,
        core: true,
        plus: true,
        pro: true,
      },
      { name: 'Hub backups', free: false, core: false, plus: true, pro: true },
      {
        name: 'Hub analytics & metrics',
        free: false,
        core: false,
        plus: true,
        pro: true,
      },
    ],
  },
];

const faqs = [
  {
    question: 'How do I cancel?',
    answer:
      'You may cancel your subscription at any time via your profile page. This will end your subscription billing, and your access to premium features will be limited.',
  },
  {
    question: 'How many hubs / guilds can I use my premium on?',
    answer:
      'Each plan allows you to use premium features on 1 guild / hub. You may change which guild / hub you use your premium on given this has not been changed in the last seven days.',
  },
  {
    question: 'Can I be refunded?',
    answer:
      'We do not offer refunds for premium subscriptions certain conditions have been met - you may request a refund via a ticket. We cannot guarantee a refund will be granted.',
  },
  {
    question: 'How does my premium activate?',
    answer:
      'You will automatically be upgraded, and will receive a direct message from the discord bot to confirm. If your DMs are not open, the upgrade process will still proceed, but you will not receive confirmation. Please allow up to five minutes for your upgrade to take effect, and if you have not received a confirmation message, please contact support.',
  },
];

export default function PremiumPage() {
  const premiumGradient =
    'linear-gradient(90deg, var(--color-brand-blue-500) 0%, var(--color-brand-purple-500) 25%, #a78bff 50%, var(--color-primary) 75%, var(--color-brand-blue-500) 100%)';
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [giftTierDialog, setGiftTierDialog] = useState<{
    tierName: string;
    tierId: string;
    priceId: string;
  } | null>(null);
  const [giftCheckoutLoading, setGiftCheckoutLoading] = useState(false);

  const handleCheckout = async (
    tierName: string,
    tierId: string,
    priceId: string
  ) => {
    try {
      setLoadingTier(tierName);
      const res = await createCheckoutSession(priceId, tierId);

      if (res.error) {
        toast.error(res.error);
        setLoadingTier(null);
        return;
      }

      if (res.url) {
        window.location.href = res.url;
      }
    } catch {
      toast.error('Failed to initiate checkout. Please try again.');
      setLoadingTier(null);
    }
  };

  const handleGiftCheckoutClick = (
    tierName: string,
    tierId: string,
    priceId: string
  ) => {
    setGiftTierDialog({ tierName, tierId, priceId });
  };

  const proceedWithGiftCheckout = async () => {
    if (!giftTierDialog) return;
    try {
      setGiftCheckoutLoading(true);
      const res = await createGiftCheckoutSession(
        giftTierDialog.priceId,
        giftTierDialog.tierId,
        'FREE'
      );

      if (res.error) {
        toast.error(res.error);
        setGiftCheckoutLoading(false);
        return;
      }

      if (res.url) {
        window.location.href = res.url;
      }
    } catch {
      toast.error('Failed to initiate gift checkout. Please try again.');
      setGiftCheckoutLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-main pt-32 pb-24">
      {/* Absolute Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-200 w-200 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-200 w-200 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] absolute inset-0 bg-[url('/assets/grid.svg')] bg-center opacity-30" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-blue-300 shadow-blue-500/10 shadow-inner backdrop-blur-sm">
            <HugeiconsIcon
              strokeWidth={2}
              icon={SparklesIcon}
              className="h-4 w-4 animate-pulse text-blue-400"
            />
            <span className="font-semibold text-sm tracking-wide">
              Take your experiance to the next level
            </span>
          </div>

          <h1 className="mb-6 bg-linear-to-b from-white via-gray-100 to-gray-400 bg-clip-text font-extrabold text-5xl text-transparent tracking-tight md:text-7xl">
            Upgrade to <br className="hidden md:block" />
            <GradientText text="Premium" gradient={premiumGradient} />
          </h1>
          <p className="mx-auto max-w-2xl text-gray-400/90 text-lg leading-relaxed md:text-xl">
            Gain exclusive access to premium features and take your experiance
            to the next level.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {tiers.map((tier, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              key={tier.name}
              className={`group relative flex flex-col overflow-hidden rounded-4xl border bg-[#050810]/60 p-10 backdrop-blur-3xl transition-all duration-500 hover:-translate-y-2 ${
                tier.popular
                  ? 'z-10 border-[#7B61FF]/30 shadow-2xl shadow-[#7B61FF]/10 md:scale-[1.03]'
                  : 'border-white/4 hover:border-white/8 hover:bg-[#070B18]/60'
              }`}
            >
              {/* Inner Hover Glow */}
              <div
                className={`absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 ${
                  tier.popular
                    ? 'bg-[radial-gradient(circle_at_top,rgba(123,97,255,0.1),transparent_70%)]'
                    : 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_70%)]'
                }`}
              />

              {/* Motta-style Top Border Accent */}
              <div
                className={`absolute top-0 right-0 left-0 h-1.5 w-full transition-opacity duration-500 ${tier.popular ? 'opacity-100' : 'bg-white/10 opacity-0 group-hover:opacity-100'}`}
                style={{
                  background: tier.popular ? premiumGradient : undefined,
                }}
              />

              {tier.popular && (
                <div className="absolute top-6 right-6">
                  <span className="rounded-full border border-[#7B61FF]/50 bg-[#7B61FF]/10 px-3.5 py-1 font-bold text-[#A78BFF] text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(123,97,255,0.2)] backdrop-blur-md">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className={`rounded-2xl bg-[#0A0F1E] p-3.5 shadow-inner ring-1 ${
                      tier.popular
                        ? 'shadow-[#7B61FF]/10 ring-[#7B61FF]/30'
                        : 'shadow-white/5 ring-white/5'
                    } ${tier.iconColor}`}
                  >
                    <HugeiconsIcon
                      strokeWidth={2}
                      icon={tier.icon}
                      className="h-7 w-7"
                    />
                  </div>
                  <h2 className="font-bold text-2xl text-white tracking-tight">
                    {tier.name}
                  </h2>
                </div>

                <div className="mb-4 flex items-baseline gap-1">
                  <span className="font-extrabold text-5xl text-white tracking-tighter drop-shadow-sm">
                    {tier.price}
                  </span>
                  <span className="font-medium text-gray-500 text-lg">
                    {tier.period}
                  </span>
                </div>

                <p className="mb-8 min-h-12 font-medium text-gray-400/90 text-sm leading-relaxed">
                  {tier.description}
                </p>

                <div className="mb-8 h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

                <ul className="mb-10 flex-1 space-y-4">
                  {tier.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 rounded-full p-0.5 ${tier.popular ? 'bg-[#7B61FF]/20 text-[#A78BFF]' : 'bg-white/5 text-gray-400'}`}
                      >
                        <HugeiconsIcon
                          strokeWidth={2}
                          icon={CheckmarkSquare01Icon}
                          className="h-4 w-4 shrink-0"
                        />
                      </div>
                      <span className="font-medium text-gray-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex gap-2">
                  <Button
                    size="lg"
                    disabled={loadingTier !== null}
                    onClick={() =>
                      handleCheckout(tier.name, tier.id, tier.priceId)
                    }
                    className={`relative h-14 flex-1 rounded-2xl font-bold transition-all duration-300 ${
                      tier.popular
                        ? 'border-none bg-linear-to-r from-[#4E56FF] to-[#7B61FF] text-white shadow-[0_8_30px_rgba(123,97,255,0.4)] hover:scale-[1.02] hover:shadow-[0_8_40px_rgba(123,97,255,0.6)]'
                        : 'border border-white/10 bg-white/5 text-white hover:scale-[1.02] hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {loadingTier === tier.name ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        Redirecting...
                      </div>
                    ) : (
                      tier.buttonText
                    )}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    disabled={loadingTier !== null}
                    onClick={() =>
                      handleGiftCheckoutClick(tier.name, tier.id, tier.priceId)
                    }
                    className="relative h-14 w-14 shrink-0 rounded-2xl border-white/10 bg-white/5 px-0 text-indigo-300 backdrop-blur-md transition-all duration-300 hover:scale-[1.05] hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-200"
                    title="Buy as a Gift"
                  >
                    <HugeiconsIcon icon={GiftIcon} className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mx-auto mt-32 max-w-6xl"
        >
          <div className="mb-12 text-center">
            <h2 className="font-bold text-3xl text-white tracking-tight md:text-5xl">
              Compare Plans
            </h2>
            <p className="mt-4 text-gray-400">
              Find the absolute perfect fit for your needs.
            </p>
          </div>

          <div className="overflow-x-auto rounded-4xl border border-white/5 bg-[#050810]/40 p-8 backdrop-blur-2xl">
            <div className="min-w-200">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 border-white/10 border-b pb-6">
                <div className="col-span-1"></div>
                <div className="col-span-1 text-center font-bold text-gray-400">
                  Free
                </div>
                <div className="col-span-1 text-center font-bold text-[#6352BE]">
                  Core
                </div>
                <div className="col-span-1 text-center font-bold text-[#7B61FF]">
                  Plus
                </div>
                <div className="col-span-1 text-center font-bold text-[#D55CFF]">
                  Pro
                </div>
              </div>

              {/* Table Body */}
              {comparisonFeatures.map((section, idx) => (
                <div key={idx} className="mb-8 last:mb-0">
                  <div className="py-4 font-semibold text-sm text-white/80 uppercase tracking-wider">
                    {section.category}
                  </div>
                  <div className="space-y-2">
                    {section.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="group grid grid-cols-5 items-center gap-4 rounded-xl p-4 transition-colors hover:bg-white/2"
                      >
                        <div className="col-span-1 font-medium text-gray-300">
                          {item.name}
                        </div>

                        {/* Cells mapping logic */}
                        {[item.free, item.core, item.plus, item.pro].map(
                          (val, colIdx) => (
                            <div
                              key={colIdx}
                              className="col-span-1 flex justify-center text-center"
                            >
                              {typeof val === 'boolean' ? (
                                val ? (
                                  <HugeiconsIcon
                                    icon={CheckmarkSquare01Icon}
                                    className={`h-5 w-5 ${colIdx === 0 ? 'text-gray-500' : colIdx === 1 ? 'text-[#6352BE]' : colIdx === 2 ? 'text-[#7B61FF]' : 'text-[#D55CFF]'}`}
                                  />
                                ) : (
                                  <HugeiconsIcon
                                    icon={Cancel01Icon}
                                    className="h-5 w-5 text-red-500/50"
                                  />
                                )
                              ) : (
                                <span
                                  className={`font-semibold ${colIdx === 0 ? 'text-gray-400' : 'text-gray-200'}`}
                                >
                                  {val}
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mx-auto mt-32 max-w-4xl"
        >
          <div className="mb-12 text-center">
            <h2 className="font-bold text-3xl text-white tracking-tight md:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-gray-400">
              Everything you need to know about Premium.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-white/5 bg-[#050810]/40 p-8 backdrop-blur-2xl transition-all hover:border-white/10 hover:bg-white/2"
              >
                <h3 className="mb-3 font-bold text-lg text-white">
                  {faq.question}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="font-medium text-gray-500 text-sm">
              Still have questions?{' '}
              <a
                href="https://interchat.dev/support"
                className="pointer-events-auto text-[#7B61FF] underline underline-offset-4 transition-colors hover:text-[#A78BFF]"
              >
                Contact Support
              </a>
            </p>
          </div>
        </motion.div>
      </div>
      <Dialog
        open={!!giftTierDialog}
        onOpenChange={(open) => !open && setGiftTierDialog(null)}
      >
        <DialogContent className="border-white/10 bg-[#0A0F1E] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <HugeiconsIcon
                icon={GiftIcon}
                className="h-5 w-5 text-indigo-400"
              />
              Purchase Gift Code: {giftTierDialog?.tierName}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              You are about to purchase a gift code for{' '}
              {giftTierDialog?.tierName}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
              <p className="font-medium text-indigo-200 text-sm">
                Detailed instructions on retrieving your generated gift code:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-indigo-300 text-sm">
                <li>
                  The gift code will be securely generated after successful
                  payment.
                </li>
                <li>
                  The code will be displayed to you upon returning to the
                  success page.
                </li>
                <li>
                  We'll also send the gift code directly to your DMs within the
                  next 5 minutes.
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setGiftTierDialog(null)}
              disabled={giftCheckoutLoading}
              className="mt-2 border-white/10 bg-transparent text-gray-300 hover:bg-white/5 sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              onClick={proceedWithGiftCheckout}
              disabled={giftCheckoutLoading}
              className="bg-indigo-600 font-semibold text-white hover:bg-indigo-700"
            >
              {giftCheckoutLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Redirecting...
                </div>
              ) : (
                'Proceed to Checkout'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
