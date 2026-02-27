'use client';

import {
  Alert01Icon,
  Dollar01Icon,
  LegalHammerIcon,
  MailIcon,
  MinusSignIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

export default function PremiumBillingTerms() {
  return (
    <div className="min-h-screen w-full bg-main text-gray-200 selection:bg-purple-500/30">
      {/* Background Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <main className="container relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-20">
        {/* Header */}
        <div className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-purple-300 backdrop-blur-sm">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Dollar01Icon}
              className="mr-2 h-4 w-4"
            />
            <span className="font-medium text-sm">Billing Terms</span>
          </div>

          <h1 className="mb-6 bg-linear-to-r from-white via-purple-100 to-gray-300 bg-clip-text font-bold text-4xl text-transparent tracking-tight sm:text-5xl md:text-6xl">
            Premium Billing Terms
          </h1>

          <p className="mx-auto max-w-2xl text-gray-400 text-lg">
            Please read these terms carefully before purchasing InterChat
            Premium.
          </p>
          <p className="mt-4 font-mono text-gray-500 text-sm">
            Effective date: September 16, 2025
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 rounded-2xl border border-white/5 bg-white/2 p-6 backdrop-blur-xl">
              <p className="mb-4 font-semibold text-gray-200 text-sm uppercase tracking-wider">
                Table of Contents
              </p>
              <nav className="space-y-1 text-sm">
                {[
                  { href: '#subscription-fees', label: '1. Subscription Fees' },
                  { href: '#billing-cycle', label: '2. Billing Cycle' },
                  { href: '#payment-methods', label: '3. Payment Methods' },
                  {
                    href: '#cancellations',
                    label: '4. Cancellations & Refunds',
                  },
                  {
                    href: '#upgrades-downgrades',
                    label: '5. Upgrades & Downgrades',
                  },
                  { href: '#price-changes', label: '6. Price Changes' },
                  { href: '#chargebacks', label: '7. Disputes & Chargebacks' },
                  { href: '#contact', label: '8. Contact' },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block truncate rounded-lg px-4 py-2.5 text-gray-400 transition-all hover:bg-white/5 hover:text-purple-300"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 space-y-16">
            {/* Section 1 */}
            <section id="subscription-fees" className="scroll-mt-32">
              <h2 className="mb-6 font-bold text-2xl text-gray-100">
                1. Subscription Fees
              </h2>
              <div className="space-y-4 rounded-2xl border border-white/5 bg-white/2 p-6 md:p-8">
                <p className="text-gray-400">
                  By subscribing to InterChat Premium (InterCore, InterPlus, or
                  InterPro), you agree to pay the recurring subscription fees
                  associated with the plan you select. All fees are stated in US
                  Dollars (USD) and are exclusive of any applicable taxes,
                  unless otherwise specified.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="billing-cycle" className="scroll-mt-32">
              <h2 className="mb-4 font-bold text-2xl text-gray-100">
                2. Billing Cycle
              </h2>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
                <p className="text-blue-200/90">
                  Subscriptions are billed on a recurring basis, automatically
                  renewing at the end of each billing cycle (e.g., monthly).
                  Your payment method will be charged automatically on the
                  renewal date unless you cancel your subscription beforehand.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="payment-methods" className="scroll-mt-32">
              <h2 className="mb-4 font-bold text-2xl text-gray-100">
                3. Payment Methods & Security
              </h2>
              <div className="space-y-4 rounded-2xl border border-white/5 bg-white/2 p-6 md:p-8">
                <p className="text-gray-400">
                  We accept major credit cards, debit cards, and other payment
                  methods as indicated during the checkout process. By providing
                  a payment method, you represent and warrant that you are
                  authorized to use the designated payment method.
                </p>
                <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                  <p className="text-purple-200/90 text-sm">
                    <strong className="text-purple-300">
                      Payment Processing via Stripe:
                    </strong>{' '}
                    All transactions are securely processed through our
                    third-party payment provider,{' '}
                    <a
                      href="https://stripe.com"
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2 hover:text-purple-100"
                    >
                      Stripe
                    </a>
                    . InterChat does not process, interact with, or store your
                    full credit card information or primary payment credentials
                    on our servers. Your payment details are transmitted
                    directly to Stripe via an encrypted connection and handled
                    entirely by them in accordance with Stripe's Services
                    Agreement and Privacy Policy.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="cancellations" className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={MinusSignIcon}
                    className="h-5 w-5"
                  />
                </div>
                <h2 className="font-bold text-2xl text-gray-100">
                  4. Cancellations & Refunds
                </h2>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/2 p-6 md:p-8">
                <p className="mb-4 text-gray-300">
                  Our policies regarding cancellations and refunds:
                </p>
                <ul className="space-y-3">
                  {[
                    'You may cancel your subscription at any time via your billing portal on the dashboard.',
                    'Upon cancellation, your premium features will remain active until the end of your current billing cycle.',
                    'We do not offer refunds for premium subscriptions once certain conditions have been met.',
                    'Exceptions may be made within the first 7 days via a support ticket, but are not guaranteed.',
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-400"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="upgrades-downgrades" className="scroll-mt-32">
              <h2 className="mb-4 font-bold text-2xl text-gray-100">
                5. Upgrades & Downgrades
              </h2>
              <p className="mb-4 text-gray-400">
                If you upgrade your plan, the new rate will take effect
                immediately, and you may be charged a prorated amount for the
                remainder of the current billing cycle. If you downgrade, your
                new rate and features will take effect at the start of your next
                billing cycle.
              </p>
            </section>

            {/* Section 6 */}
            <section id="price-changes" className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={Alert01Icon}
                    className="h-5 w-5"
                  />
                </div>
                <h2 className="font-bold text-2xl text-gray-100">
                  6. Price Changes
                </h2>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/2 p-6 md:p-8">
                <p className="text-gray-400">
                  We reserve the right to change our subscription fees at any
                  time. Any price changes will apply no earlier than 30 days
                  following notice to you, giving you the opportunity to cancel
                  your subscription before the change takes effect.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="chargebacks" className="scroll-mt-32">
              <div className="mb-4 flex items-center gap-3">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={LegalHammerIcon}
                  className="h-5 w-5 text-gray-400"
                />
                <h2 className="font-bold text-2xl text-gray-100">
                  7. Disputes & Chargebacks
                </h2>
              </div>
              <p className="text-gray-400">
                Engaging in chargebacks or payment disputes without first
                contacting our support team may result in the immediate
                suspension or termination of your account and access to the
                Service.
              </p>
            </section>

            {/* Section 8 */}
            <section id="contact" className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-3">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={MailIcon}
                  className="h-5 w-5 text-gray-400"
                />
                <h2 className="font-bold text-2xl text-gray-100">
                  8. Contact Us
                </h2>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/2 p-8 text-center">
                <p className="mb-6 text-gray-400">
                  For billing inquiries or support:
                </p>
                <a
                  href="https://interchat.dev/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-black transition-transform hover:scale-105"
                >
                  Contact Billing Support
                </a>
              </div>
            </section>

            {/* Footer Link */}
            <div className="border-white/10 border-t pt-8 text-center">
              <p className="text-gray-500">
                By purchasing a subscription, you also agree to our general{' '}
                <Link
                  href="/terms"
                  className="text-purple-400 transition-colors hover:text-purple-300"
                >
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
