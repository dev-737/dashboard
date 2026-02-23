'use client';

import {
  CookieIcon,
  EyeIcon,
  File01Icon,
  GlobeIcon,
  LockIcon,
  Mail01Icon,
  Shield01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen w-full bg-[#030812] text-gray-200 selection:bg-purple-500/30">
      {/* Background Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/5 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[600px] w-[600px] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <main className="container relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-20">
        {/* Header */}
        <div className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-purple-300 backdrop-blur-sm">
            <HugeiconsIcon
              strokeWidth={3}
              icon={Shield01Icon}
              className="mr-2 h-4 w-4"
            />
            <span className="font-medium text-sm">Privacy Policy</span>
          </div>

          <h1 className="mb-6 bg-linear-to-r from-white via-purple-100 to-gray-300 bg-clip-text font-bold text-4xl text-transparent tracking-tight sm:text-5xl md:text-6xl">
            InterChat Privacy Policy
          </h1>

          <p className="mx-auto max-w-2xl text-gray-400 text-lg">
            Your privacy is important to us. This policy outlines how we
            collect, use, and protect your data.
          </p>
          <p className="mt-4 font-mono text-gray-500 text-sm">
            Last updated: September 16, 2025
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
              <p className="mb-4 font-semibold text-gray-200 text-sm uppercase tracking-wider">
                Table of Contents
              </p>
              <nav className="space-y-1 text-sm">
                {[
                  {
                    href: '#info-we-collect',
                    label: '1. Information We Collect',
                  },
                  { href: '#how-we-use', label: '2. How We Use Information' },
                  { href: '#data-retention', label: '3. Data Retention' },
                  { href: '#sharing', label: '4. Data Sharing' },
                  { href: '#data-transfers', label: '5. Data Transfers' },
                  { href: '#your-rights', label: '6. Your Rights' },
                  { href: '#cookies', label: '7. Cookies & Tracking' },
                  { href: '#children', label: "8. Children's Privacy" },
                  { href: '#changes', label: '9. Changes to Policy' },
                  { href: '#contact', label: '10. Contact Us' },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-4 py-2.5 text-gray-400 transition-all hover:bg-white/5 hover:text-purple-300"
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
            <section id="info-we-collect" className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <HugeiconsIcon
                    strokeWidth={3}
                    icon={EyeIcon}
                    className="h-5 w-5"
                  />
                </div>
                <h2 className="font-bold text-2xl text-gray-100">
                  1. Information We Collect
                </h2>
              </div>
              <div className="space-y-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
                <div>
                  <h3 className="mb-3 font-semibold text-lg text-purple-300">
                    Discord Data
                  </h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {[
                      'User ID & Username',
                      'Server Names & IDs',
                      'Channel IDs',
                      'Message Content (for functionality)',
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-gray-400 text-sm"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="h-px bg-white/5" />
                <div>
                  <h3 className="mb-3 font-semibold text-lg text-purple-300">
                    Usage Data
                  </h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {[
                      'Device Information',
                      'IP Address',
                      'Browser Type',
                      'Error Logs & Diagnostics',
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-gray-400 text-sm"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="how-we-use" className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <HugeiconsIcon
                    strokeWidth={3}
                    icon={File01Icon}
                    className="h-5 w-5"
                  />
                </div>
                <h2 className="font-bold text-2xl text-gray-100">
                  2. How We Use Your Information
                </h2>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
                <ul className="space-y-4">
                  {[
                    'Provide and operate InterChat services, including cross-server messaging.',
                    'Maintain, improve, and secure our service.',
                    'Enforce community guidelines and prevent abuse.',
                    'Respond to support requests.',
                    'Analyze usage trends to improve performance.',
                    'Comply with legal obligations.',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-gray-300">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-gray-500 text-xs">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="data-retention" className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <HugeiconsIcon
                    strokeWidth={3}
                    icon={LockIcon}
                    className="h-5 w-5"
                  />
                </div>
                <h2 className="font-bold text-2xl text-gray-100">
                  3. Data Retention
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                  <h3 className="mb-2 font-semibold text-gray-200">
                    Message Content
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Deleted automatically after{' '}
                    <span className="font-medium text-purple-400">7 days</span>{' '}
                    unless reported for moderation.
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                  <h3 className="mb-2 font-semibold text-gray-200">
                    Logs & Diagnostics
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Retained for up to{' '}
                    <span className="font-medium text-purple-400">90 days</span>{' '}
                    for security and analytics.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="sharing" className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                  <HugeiconsIcon
                    strokeWidth={3}
                    icon={GlobeIcon}
                    className="h-5 w-5"
                  />
                </div>
                <h2 className="font-bold text-2xl text-gray-100">
                  4. Data Sharing
                </h2>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
                <p className="mb-6 text-gray-400">
                  We share data with trusted third-party providers to operate
                  InterChat:
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { name: 'Discord API', role: 'Bot functionality & Auth' },
                    { name: 'Oracle Cloud', role: 'Hosting & Storage' },
                    { name: 'Cloudflare', role: 'Security & Performance' },
                    { name: 'Sentry', role: 'Error Monitoring' },
                  ].map((service) => (
                    <div
                      key={service.name}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4"
                    >
                      <span className="font-medium text-gray-200">
                        {service.name}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {service.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="data-transfers" className="scroll-mt-32">
              <h2 className="mb-4 font-bold text-2xl text-gray-100">
                5. Data Transfers
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Your data may be processed outside your country. We use
                appropriate safeguards such as Standard Contractual Clauses to
                ensure your data remains protected according to global
                standards.
              </p>
            </section>

            {/* Section 6 */}
            <section id="your-rights" className="scroll-mt-32">
              <h2 className="mb-6 font-bold text-2xl text-gray-100">
                6. Your Rights
              </h2>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  {[
                    'Access your data',
                    'Request correction/deletion',
                    'Export your data',
                    'Withdraw consent',
                  ].map((right) => (
                    <div
                      key={right}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      {right}
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
                  <p className="text-purple-200 text-sm">
                    <span className="font-semibold">How to exercise:</span>{' '}
                    Contact us at our{' '}
                    <Link
                      href="https://interchat.dev/support"
                      className="underline hover:text-white"
                    >
                      support server
                    </Link>
                    . Requests are processed within 30 days.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="cookies" className="scroll-mt-32">
              <div className="mb-4 flex items-center gap-3">
                <HugeiconsIcon
                  icon={CookieIcon}
                  className="h-5 w-5 text-gray-400"
                />
                <h2 className="font-bold text-2xl text-gray-100">
                  7. Cookies & Tracking
                </h2>
              </div>
              <p className="mb-4 text-gray-400">
                We use cookies for essential functionality, preferences, and
                anonymous analytics. You can control these through your browser
                settings.
              </p>
            </section>

            {/* Section 8 */}
            <section id="children" className="scroll-mt-32">
              <div className="mb-4 flex items-center gap-3">
                <HugeiconsIcon
                  icon={UserIcon}
                  className="h-5 w-5 text-rose-400"
                />
                <h2 className="font-bold text-2xl text-gray-100">
                  8. Children's Privacy
                </h2>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6">
                <p className="text-rose-200/90">
                  InterChat is not intended for children under 13 (or 16 in the
                  EU). We do not knowingly collect data from children. If
                  discovered, such data is deleted immediately.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="changes" className="scroll-mt-32">
              <h2 className="mb-4 font-bold text-2xl text-gray-100">
                9. Changes to Policy
              </h2>
              <p className="text-gray-400">
                We may update this policy. Significant changes will be announced
                on our website and Discord server before taking effect.
              </p>
            </section>

            {/* Section 10 */}
            <section id="contact" className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-3">
                <HugeiconsIcon
                  icon={Mail01Icon}
                  className="h-5 w-5 text-gray-400"
                />
                <h2 className="font-bold text-2xl text-gray-100">
                  10. Contact Us
                </h2>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
                <p className="mb-6 text-gray-400">
                  Have questions about your privacy?
                </p>
                <a
                  href="https://interchat.dev/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-black transition-transform hover:scale-105"
                >
                  Join Support Server
                </a>
              </div>
            </section>

            {/* Footer Link01Icon */}
            <div className="border-white/10 border-t pt-8 text-center">
              <p className="text-gray-500">
                This policy is part of our{' '}
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
