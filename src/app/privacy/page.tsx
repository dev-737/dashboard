'use client';

import { Shield } from 'lucide-react';
import { Link } from '@/components/Link';

export default function PrivacyPolicy() {
  return (
    <section className="min-h-screen w-full bg-linear-to-br from-gray-900 via-slate-900 to-black">
      <main className="container relative mx-auto px-4 py-20">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-6 inline-block">
              <div className="flex items-center justify-center rounded-full border border-purple-500/30 bg-linear-to-r from-purple-900/50 to-indigo-900/50 px-6 py-3 text-purple-300 shadow-lg shadow-purple-500/20 backdrop-blur-sm">
                <Shield className="mr-3 h-6 w-6" />
                <span className="font-semibold text-lg">Privacy Policy</span>
              </div>
            </div>

            <h1 className="mb-6 bg-linear-to-r from-white via-purple-100 to-indigo-200 bg-clip-text font-extrabold text-5xl text-transparent md:text-6xl lg:text-7xl">
              InterChat Privacy Policy
            </h1>

            <p className="mx-auto mb-16 max-w-2xl font-medium text-lg text-purple-300/80 tracking-wide">
              Last updated: September 16, 2025
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-gray-700/30 bg-linear-to-br from-gray-900/80 to-gray-800/80 p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-xl">
                <p className="mb-6 font-bold text-purple-300 text-sm uppercase tracking-wider">
                  On this page
                </p>
                <nav className="space-y-4 text-sm">
                  <a
                    href="#info-we-collect"
                    className="block text-gray-300 transition-all duration-200 hover:translate-x-1 hover:font-medium hover:text-purple-400"
                  >
                    1. Information We Collect
                  </a>
                  <a
                    href="#how-we-use"
                    className="block text-gray-300 transition-all duration-200 hover:translate-x-1 hover:font-medium hover:text-purple-400"
                  >
                    2. How We Use Your Information
                  </a>
                  <a
                    href="#data-retention"
                    className="block text-gray-300 transition-all duration-200 hover:translate-x-1 hover:font-medium hover:text-purple-400"
                  >
                    3. Data Retention
                  </a>
                  <a
                    href="#sharing"
                    className="block text-gray-300 transition-all duration-200 hover:translate-x-1 hover:font-medium hover:text-purple-400"
                  >
                    4. Data Sharing & Third Parties
                  </a>
                  <a
                    href="#data-transfers"
                    className="block text-gray-300 transition-all duration-200 hover:translate-x-1 hover:font-medium hover:text-purple-400"
                  >
                    5. Data Transfers
                  </a>
                  <a
                    href="#your-rights"
                    className="block text-gray-300 transition-all duration-200 hover:translate-x-1 hover:font-medium hover:text-purple-400"
                  >
                    6. Your Rights
                  </a>
                  <a
                    href="#cookies"
                    className="block text-gray-300 transition-all duration-200 hover:translate-x-1 hover:font-medium hover:text-purple-400"
                  >
                    7. Cookies & Tracking
                  </a>
                  <a
                    href="#children"
                    className="block text-gray-300 transition-all duration-200 hover:translate-x-1 hover:font-medium hover:text-purple-400"
                  >
                    8. Children's Privacy
                  </a>
                  <a
                    href="#changes"
                    className="block text-gray-300 transition-all duration-200 hover:translate-x-1 hover:font-medium hover:text-purple-400"
                  >
                    9. Changes to this Policy
                  </a>
                  <a
                    href="#contact"
                    className="block text-gray-300 transition-all duration-200 hover:translate-x-1 hover:font-medium hover:text-purple-400"
                  >
                    10. Contact Us
                  </a>
                </nav>
              </div>
            </aside>{' '}
            <div className="min-w-0">
              <div className="prose prose-lg prose-invert prose-li:my-2 max-w-none prose-ol:list-decimal prose-ul:list-disc prose-ol:pl-6 prose-ul:pl-6 prose-headings:text-white prose-li:text-gray-300 prose-p:text-gray-300 prose-strong:text-purple-300">
                <div className="space-y-16">
                  <section className="group">
                    <h2
                      id="info-we-collect"
                      className="mb-6 bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text font-bold text-3xl text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:to-indigo-300"
                    >
                      1. Information We Collect
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        <strong className="text-purple-300">
                          Discord Data (Legal Basis: Contract / Legitimate
                          Interest)
                        </strong>
                      </p>
                      <ul className="space-y-2">
                        <li className="transition-colors hover:text-purple-200">
                          Discord User ID and Username
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Server names and IDs
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Channel IDs
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Message content (for cross-server communication and
                          moderation)
                        </li>
                      </ul>
                      <p>
                        <strong className="text-purple-300">
                          Usage Data (Legal Basis: Legitimate Interest)
                        </strong>
                      </p>
                      <ul className="space-y-2">
                        <li className="transition-colors hover:text-purple-200">
                          Device information (IP address, browser type/version,
                          operating system)
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Diagnostic data (error logs, timestamps, request
                          metadata)
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          General usage statistics
                        </li>
                      </ul>
                      <p>
                        <strong className="text-purple-300">
                          Optional Contact Data (Legal Basis: Consent)
                        </strong>
                      </p>
                      <ul className="space-y-2">
                        <li className="transition-colors hover:text-purple-200">
                          Email address (if you contact us directly)
                        </li>
                      </ul>
                      <p className="rounded-xl border border-red-500/30 bg-linear-to-r from-red-400/20 to-orange-400/20 p-4 text-red-200">
                        We do not knowingly collect data from children under 16
                        in the EU, or under 13 elsewhere.
                      </p>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="how-we-use"
                      className="mb-6 bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text font-bold text-3xl text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:to-indigo-300"
                    >
                      2. How We Use Your Information
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>We process your data to:</p>
                      <ul className="space-y-2">
                        <li className="transition-colors hover:text-purple-200">
                          Provide and operate InterChat services, including
                          cross-server messaging (Contract)
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Maintain, improve, and secure our service (Legitimate
                          Interest)
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Enforce community guidelines and prevent abuse
                          (Legitimate Interest)
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Respond to support requests (Contract / Consent)
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Analyze usage trends to improve performance
                          (Legitimate Interest)
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Comply with legal obligations and protect our rights
                          (Legal Obligation)
                        </li>
                      </ul>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="data-retention"
                      className="mb-6 bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text font-bold text-3xl text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:to-indigo-300"
                    >
                      3. Data Retention
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <ul className="space-y-3">
                        <li className="transition-colors hover:text-purple-200">
                          <strong className="text-purple-300">
                            Message content:
                          </strong>{' '}
                          Deleted automatically after 7 days (unless reported
                          for moderation).
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          <strong className="text-purple-300">
                            Usage logs & diagnostic data:
                          </strong>{' '}
                          Retained for up to 90 days for security and analytics.
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          <strong className="text-purple-300">
                            Contact data (emails):
                          </strong>{' '}
                          Retained for up to 1 year unless the inquiry is
                          resolved sooner.
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          <strong className="text-purple-300">
                            Other necessary records:
                          </strong>{' '}
                          Retained only as long as required by law or to provide
                          the service.
                        </li>
                      </ul>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="sharing"
                      className="mb-6 bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text font-bold text-3xl text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:to-indigo-300"
                    >
                      4. Data Sharing and Third-Party Services
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        We share data with trusted providers to operate
                        InterChat:
                      </p>
                      <ul className="space-y-3">
                        <li className="transition-colors hover:text-purple-200">
                          <strong className="text-purple-300">
                            Discord API:
                          </strong>{' '}
                          Bot functionality and user authentication
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          <strong className="text-purple-300">
                            Oracle Cloud Infrastructure:
                          </strong>{' '}
                          Hosting and storage
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          <strong className="text-purple-300">
                            Cloudflare:
                          </strong>{' '}
                          Network performance and security
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          <strong className="text-purple-300">Sentry:</strong>{' '}
                          Error monitoring and diagnostics
                        </li>
                      </ul>
                      <p className="rounded-xl border border-blue-500/30 bg-linear-to-r from-blue-400/20 to-cyan-400/20 p-4 text-blue-200">
                        All third parties are contractually obligated to process
                        your data only as necessary and in compliance with GDPR.
                      </p>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="data-transfers"
                      className="mb-6 bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text font-bold text-3xl text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:to-indigo-300"
                    >
                      5. Data Transfers
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        Your data may be processed outside your country,
                        including outside the UK/EU. We use appropriate
                        safeguards such as
                        <strong className="text-purple-300">
                          {' '}
                          Standard Contractual Clauses
                        </strong>{' '}
                        or ensure transfers occur to jurisdictions with{' '}
                        <strong className="text-purple-300">
                          adequate protections
                        </strong>
                        .
                      </p>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="your-rights"
                      className="mb-6 bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text font-bold text-3xl text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:to-indigo-300"
                    >
                      6. Your Rights
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>Depending on your location, you have the right to:</p>
                      <ol className="list-inside list-decimal space-y-2">
                        <li className="transition-colors hover:text-purple-200">
                          Access your personal data
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Request correction or deletion
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Export your data in a commonly used format
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Withdraw consent where processing is based on consent
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          Object to processing based on legitimate interest
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          File a complaint with your local supervisory authority
                        </li>
                      </ol>
                      <p className="rounded-xl border border-green-500/30 bg-linear-to-r from-green-400/20 to-emerald-400/20 p-4 text-green-200">
                        <strong className="text-green-300">
                          How to exercise these rights:
                        </strong>{' '}
                        Contact us at our{' '}
                        <span className="font-semibold text-green-300">
                          <Link href="https://interchat.dev/support">
                            support server
                          </Link>
                        </span>{' '}
                        with your request. Include sufficient information to
                        identify your data (e.g., Discord ID). Requests will be
                        processed within{' '}
                        <strong className="text-green-300">30 days</strong>.
                      </p>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="cookies"
                      className="mb-6 bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text font-bold text-3xl text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:to-indigo-300"
                    >
                      7. Cookies and Tracking
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>We use cookies for:</p>
                      <ul className="space-y-3">
                        <li className="transition-colors hover:text-purple-200">
                          <strong className="text-purple-300">
                            Essential cookies:
                          </strong>{' '}
                          Required for the service to work
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          <strong className="text-purple-300">
                            Functionality cookies:
                          </strong>{' '}
                          Remember your preferences
                        </li>
                        <li className="transition-colors hover:text-purple-200">
                          <strong className="text-purple-300">
                            Analytics cookies:
                          </strong>{' '}
                          Understand usage trends (requires opt-in)
                        </li>
                      </ul>
                      <p className="rounded-xl border border-yellow-500/30 bg-linear-to-r from-yellow-400/20 to-orange-400/20 p-4 text-yellow-200">
                        You can manage or disable cookies in your browser, but
                        some features may not function correctly.
                      </p>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="children"
                      className="mb-6 bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text font-bold text-3xl text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:to-indigo-300"
                    >
                      8. Children's Privacy
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p className="rounded-xl border border-red-500/30 bg-linear-to-r from-red-400/20 to-pink-400/20 p-4 text-red-200">
                        InterChat is{' '}
                        <strong className="text-red-300">
                          not intended for children under 13
                        </strong>
                        . If we learn personal data from a child was collected,
                        we will delete it immediately. Parents or guardians may
                        contact us to request deletion.
                      </p>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="changes"
                      className="mb-6 bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text font-bold text-3xl text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:to-indigo-300"
                    >
                      9. Changes to this Policy
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        We may update this Privacy Policy. Significant changes
                        will be posted on our website and/or official Discord
                        server{' '}
                        <strong className="text-purple-300">
                          before they take effect
                        </strong>
                        . The Last updated date reflects the most recent
                        revision.
                      </p>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="contact"
                      className="mb-6 bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text font-bold text-3xl text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:to-indigo-300"
                    >
                      10. Contact Us
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        For questions or requests regarding this Privacy Policy:
                      </p>
                      <ul className="space-y-2">
                        <li className="transition-colors hover:text-purple-200">
                          <strong className="text-purple-300">
                            Official Discord server
                          </strong>{' '}
                          <span className="font-semibold text-purple-400">
                            <Link href="https://interchat.dev/support">
                              https://interchat.dev/support
                            </Link>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </section>{' '}
                  <section>
                    <h2 id="data-transfers" className="font-bold text-2xl">
                      5. Data Transfers
                    </h2>
                    <p>
                      Your data may be processed outside your country, including
                      outside the UK/EU. We use appropriate safeguards such as
                      <strong> Standard Contractual Clauses</strong> or ensure
                      transfers occur to jurisdictions with{' '}
                      <strong>adequate protections</strong>.
                    </p>
                  </section>
                  <section>
                    <h2 id="your-rights" className="font-bold text-2xl">
                      6. Your Rights
                    </h2>
                    <p>Depending on your location, you have the right to:</p>
                    <ol>
                      <li>Access your personal data</li>
                      <li>Request correction or deletion</li>
                      <li>Export your data in a commonly used format</li>
                      <li>
                        Withdraw consent where processing is based on consent
                      </li>
                      <li>Object to processing based on legitimate interest</li>
                      <li>
                        File a complaint with your local supervisory authority
                      </li>
                    </ol>
                    <p>
                      <strong>How to exercise these rights:</strong> Contact us
                      at our{' '}
                      <Link href="https://interchat.dev/support">
                        support server
                      </Link>{' '}
                      with your request. Include sufficient information to
                      identify your data (e.g., Discord ID). Requests will be
                      processed within <strong>30 days</strong>.
                    </p>
                  </section>
                  <section>
                    <h2 id="cookies" className="font-bold text-2xl">
                      7. Cookies and Tracking
                    </h2>
                    <p>We use cookies for:</p>
                    <ul>
                      <li>
                        <strong>Essential cookies:</strong> Required for the
                        service to work
                      </li>
                      <li>
                        <strong>Functionality cookies:</strong> Remember your
                        preferences
                      </li>
                      <li>
                        <strong>Analytics cookies:</strong> Understand usage
                        trends (requires opt-in)
                      </li>
                    </ul>
                    <p>
                      You can manage or disable cookies in your browser, but
                      some features may not function correctly.
                    </p>
                  </section>
                  <section>
                    <h2 id="children" className="font-bold text-2xl">
                      8. Children’s Privacy
                    </h2>
                    <p>
                      InterChat is{' '}
                      <strong>
                        not intended for children under 16 in the EU
                      </strong>
                      , or under 13 elsewhere. If we learn personal data from a
                      child was collected, we will delete it immediately.
                      Parents or guardians may contact us to request deletion.
                    </p>
                  </section>
                  <section>
                    <h2 id="changes" className="font-bold text-2xl">
                      9. Changes to this Policy
                    </h2>
                    <p>
                      We may update this Privacy Policy. Significant changes
                      will be posted on our website and/or official Discord
                      server <strong>before they take effect</strong>. The Last
                      updated date reflects the most recent revision.
                    </p>
                  </section>
                  <section>
                    <h2 id="contact" className="font-bold text-2xl">
                      10. Contact Us
                    </h2>
                    <p>
                      For questions or requests regarding this Privacy Policy:
                    </p>
                    <ul>
                      <li>
                        <strong>Official Discord server</strong>{' '}
                        <Link href="https://interchat.dev/support">
                          https://interchat.dev/support
                        </Link>
                      </li>
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-20 border-gray-700/30 border-t pt-12 text-center">
            <div className="rounded-2xl border border-gray-700/20 bg-linear-to-r from-gray-900/50 to-gray-800/50 p-8 backdrop-blur-sm">
              <p className="text-gray-300 text-lg">
                This privacy policy is part of our{' '}
                <span className="font-semibold text-purple-400 transition-colors hover:text-purple-300">
                  <Link href="/terms">Terms of Service</Link>
                </span>
              </p>
            </div>
          </footer>
        </div>
      </main>
    </section>
  );
}
