'use client';

import {
  Alert01Icon,
  CopyrightIcon,
  Dollar01Icon,
  File01Icon,
  JusticeScale01Icon,
  LegalHammerIcon,
  Link01Icon,
  MailIcon,
  MinusSignIcon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen w-full bg-[#030812] text-gray-200 selection:bg-purple-500/30">
      {/* Background Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <main className="container relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-20">
        {/* Header */}
        <div className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-purple-300 backdrop-blur-sm">
            <HugeiconsIcon icon={JusticeScale01Icon} className="mr-2 h-4 w-4" />
            <span className="font-medium text-sm">Terms of Service</span>
          </div>

          <h1 className="mb-6 bg-linear-to-r from-white via-purple-100 to-gray-300 bg-clip-text font-bold text-4xl text-transparent tracking-tight sm:text-5xl md:text-6xl">
            InterChat Terms of Service
          </h1>

          <p className="mx-auto max-w-2xl text-gray-400 text-lg">
            Please read these terms carefully before using our services.
          </p>
          <p className="mt-4 font-mono text-gray-500 text-sm">
            Effective date: September 16, 2025
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
                  { href: '#definitions', label: '1. Definitions' },
                  { href: '#eligibility', label: '2. Eligibility' },
                  { href: '#acceptance', label: '3. Acceptance' },
                  { href: '#account', label: '4. Account Responsibility' },
                  { href: '#acceptable-use', label: '5. Acceptable Use' },
                  { href: '#user-content', label: '6. User Content' },
                  { href: '#moderation', label: '7. Moderation' },
                  { href: '#fees', label: '10. Fees & Payments' },
                  {
                    href: '#intellectual-property',
                    label: '11. Intellectual Property',
                  },
                  { href: '#termination', label: '12. Termination' },
                  { href: '#disclaimers', label: '13. Disclaimers' },
                  { href: '#contact', label: '19. Contact' },
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
            <section id="definitions" className="scroll-mt-32">
              <h2 className="mb-6 font-bold text-2xl text-gray-100">
                1. Definitions
              </h2>
              <div className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
                <div className="flex gap-4">
                  <span className="min-w-[100px] font-semibold text-purple-300">
                    Service
                  </span>
                  <p className="text-gray-400">
                    The InterChat bot, website, APIs, and related software.
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="min-w-[100px] font-semibold text-purple-300">
                    User
                  </span>
                  <p className="text-gray-400">
                    Any person or entity that uses the Service.
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="min-w-[100px] font-semibold text-purple-300">
                    User Content
                  </span>
                  <p className="text-gray-400">
                    Messages, files, images, or other materials you submit.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="eligibility" className="scroll-mt-32">
              <h2 className="mb-4 font-bold text-2xl text-gray-100">
                2. Eligibility
              </h2>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6">
                <p className="text-rose-200/90">
                  You must be at least 13 years old (or 16 in the EU) to use
                  InterChat. If you are under the required age, you are
                  prohibited from using the Service.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="acceptance" className="scroll-mt-32">
              <h2 className="mb-4 font-bold text-2xl text-gray-100">
                3. Acceptance of Terms
              </h2>
              <p className="text-gray-400">
                By using the Service, you agree to these Terms and our{' '}
                <Link
                  href="/privacy"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Privacy Policy
                </Link>
                . If you do not agree, do not use the Service.
              </p>
            </section>

            {/* Section 4 */}
            <section id="account" className="scroll-mt-32">
              <h2 className="mb-4 font-bold text-2xl text-gray-100">
                4. Account Responsibility
              </h2>
              <p className="text-gray-400">
                You are responsible for all activity on your account. Keep your
                credentials secure. Report unauthorized access immediately to
                our support team.
              </p>
            </section>

            {/* Section 5 */}
            <section id="acceptable-use" className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                  <HugeiconsIcon icon={MinusSignIcon} className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-2xl text-gray-100">
                  5. Acceptable Use
                </h2>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
                <p className="mb-4 text-gray-300">You agree NOT to:</p>
                <ul className="space-y-3">
                  {[
                    'Engage in illegal activity or traffic illicit goods.',
                    'Distribute malware or attempt to exploit the Service.',
                    "Spam, scrape, or violate Discord's Terms of Service.",
                    'Harass, threaten, or abuse other users.',
                    'Reverse-engineer or bypass security controls.',
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

            {/* Section 6 */}
            <section id="user-content" className="scroll-mt-32">
              <h2 className="mb-4 font-bold text-2xl text-gray-100">
                6. User Content
              </h2>
              <p className="mb-4 text-gray-400">
                You retain ownership of your content. By submitting it, you
                grant InterChat a license to host, use, and distribute it solely
                to provide the Service.
              </p>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-blue-200 text-sm">
                  If your content infringes copyright, please follow our DMCA
                  process by contacting support.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="moderation" className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <HugeiconsIcon icon={LegalHammerIcon} className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-2xl text-gray-100">
                  7. Moderation & Enforcement
                </h2>
              </div>
              <p className="mb-4 text-gray-400">
                We reserve the right to remove content and suspend users for
                violations. We maintain logs for moderation purposes.
              </p>
              <p className="text-gray-400">
                <span className="font-semibold text-gray-200">Appeals:</span>{' '}
                You may appeal enforcement actions via our support server.
              </p>
            </section>

            {/* Section 10 */}
            <section id="fees" className="scroll-mt-32">
              <div className="mb-4 flex items-center gap-3">
                <HugeiconsIcon
                  icon={Dollar01Icon}
                  className="h-5 w-5 text-green-400"
                />
                <h2 className="font-bold text-2xl text-gray-100">
                  10. Fees & Paid Features
                </h2>
              </div>
              <p className="text-gray-400">
                InterChat is primarily free. If we introduce paid features,
                separate terms will apply.
              </p>
            </section>

            {/* Section 11 */}
            <section id="intellectual-property" className="scroll-mt-32">
              <div className="mb-4 flex items-center gap-3">
                <HugeiconsIcon
                  icon={CopyrightIcon}
                  className="h-5 w-5 text-gray-400"
                />
                <h2 className="font-bold text-2xl text-gray-100">
                  11. Intellectual Property
                </h2>
              </div>
              <p className="text-gray-400">
                InterChat branding and software are our property. You may not
                copy or use them without permission.
              </p>
            </section>

            {/* Section 12 */}
            <section id="termination" className="scroll-mt-32">
              <h2 className="mb-4 font-bold text-2xl text-gray-100">
                12. Termination
              </h2>
              <p className="text-gray-400">
                We may terminate your access at any time for violations or legal
                reasons. Your rights under these Terms end immediately upon
                termination.
              </p>
            </section>

            {/* Section 13 */}
            <section id="disclaimers" className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <HugeiconsIcon icon={Alert01Icon} className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-2xl text-gray-100">
                  13. Disclaimers & Liability
                </h2>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 md:p-8">
                <p className="mb-4 text-gray-400">
                  The Service is provided "as is". We disclaim all warranties.
                  We are not liable for indirect damages or data loss.
                </p>
                <p className="text-gray-500 text-sm">
                  Our total liability is limited to the amount you paid us in
                  the last 12 months or $100 USD.
                </p>
              </div>
            </section>

            {/* Section 19 */}
            <section id="contact" className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-3">
                <HugeiconsIcon
                  icon={MailIcon}
                  className="h-5 w-5 text-gray-400"
                />
                <h2 className="font-bold text-2xl text-gray-100">
                  19. Contact Us
                </h2>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
                <p className="mb-6 text-gray-400">
                  For legal inquiries or support:
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
                By using InterChat, you agree to these Terms and our{' '}
                <Link
                  href="/privacy"
                  className="text-purple-400 transition-colors hover:text-purple-300"
                >
                  Privacy Policy
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
