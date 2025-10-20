'use client';

import { Shield } from 'lucide-react';
import { Link } from '@/components/Link';

export default function PrivacyPolicy() {
  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <main className="container relative mx-auto px-4 py-20">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-6 inline-block">
              <div className="flex items-center justify-center rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 px-6 py-3 text-purple-300 backdrop-blur-sm shadow-lg shadow-purple-500/20">
                <Shield className="mr-3 h-6 w-6" />
                <span className="font-semibold text-lg">Privacy Policy</span>
              </div>
            </div>

            <h1 className="mb-6 bg-gradient-to-r from-white via-purple-100 to-indigo-200 bg-clip-text text-transparent text-5xl font-extrabold md:text-6xl lg:text-7xl">
              InterChat Privacy Policy
            </h1>

            <p className="mx-auto mb-16 max-w-2xl text-lg font-medium tracking-wide text-purple-300/80">
              Last updated: September 16, 2025
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-gray-700/30 bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-8 shadow-2xl backdrop-blur-xl shadow-purple-500/10">
                <p className="mb-6 text-sm font-bold uppercase tracking-wider text-purple-300">
                  On this page
                </p>
                <nav className="space-y-4 text-sm">
                  <a
                    href="#info-we-collect"
                    className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium"
                  >
                    1. Information We Collect
                  </a>
                  <a
                    href="#how-we-use"
                    className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium"
                  >
                    2. How We Use Your Information
                  </a>
                  <a
                    href="#data-retention"
                    className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium"
                  >
                    3. Data Retention
                  </a>
                  <a
                    href="#sharing"
                    className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium"
                  >
                    4. Data Sharing & Third Parties
                  </a>
                  <a
                    href="#data-transfers"
                    className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium"
                  >
                    5. Data Transfers
                  </a>
                  <a
                    href="#your-rights"
                    className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium"
                  >
                    6. Your Rights
                  </a>
                  <a
                    href="#cookies"
                    className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium"
                  >
                    7. Cookies & Tracking
                  </a>
                  <a
                    href="#children"
                    className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium"
                  >
                    8. Children's Privacy
                  </a>
                  <a
                    href="#changes"
                    className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium"
                  >
                    9. Changes to this Policy
                  </a>
                  <a
                    href="#contact"
                    className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium"
                  >
                    10. Contact Us
                  </a>
                </nav>
              </div>
            </aside>{' '}
            <div className="min-w-0">
              <div className="prose prose-lg prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-purple-300 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-2">
                <div className="space-y-16">
                  <section className="group">
                    <h2
                      id="info-we-collect"
                      className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300"
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
                        <li className="hover:text-purple-200 transition-colors">
                          Discord User ID and Username
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          Server names and IDs
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          Channel IDs
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
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
                        <li className="hover:text-purple-200 transition-colors">
                          Device information (IP address, browser type/version,
                          operating system)
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          Diagnostic data (error logs, timestamps, request
                          metadata)
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          General usage statistics
                        </li>
                      </ul>
                      <p>
                        <strong className="text-purple-300">
                          Optional Contact Data (Legal Basis: Consent)
                        </strong>
                      </p>
                      <ul className="space-y-2">
                        <li className="hover:text-purple-200 transition-colors">
                          Email address (if you contact us directly)
                        </li>
                      </ul>
                      <p className="bg-gradient-to-r from-red-400/20 to-orange-400/20 border border-red-500/30 rounded-xl p-4 text-red-200">
                        We do not knowingly collect data from children under 16
                        in the EU, or under 13 elsewhere.
                      </p>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="how-we-use"
                      className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300"
                    >
                      2. How We Use Your Information
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>We process your data to:</p>
                      <ul className="space-y-2">
                        <li className="hover:text-purple-200 transition-colors">
                          Provide and operate InterChat services, including
                          cross-server messaging (Contract)
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          Maintain, improve, and secure our service (Legitimate
                          Interest)
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          Enforce community guidelines and prevent abuse
                          (Legitimate Interest)
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          Respond to support requests (Contract / Consent)
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          Analyze usage trends to improve performance
                          (Legitimate Interest)
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          Comply with legal obligations and protect our rights
                          (Legal Obligation)
                        </li>
                      </ul>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="data-retention"
                      className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300"
                    >
                      3. Data Retention
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <ul className="space-y-3">
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">
                            Message content:
                          </strong>{' '}
                          Deleted automatically after 7 days (unless reported
                          for moderation).
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">
                            Usage logs & diagnostic data:
                          </strong>{' '}
                          Retained for up to 90 days for security and analytics.
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">
                            Contact data (emails):
                          </strong>{' '}
                          Retained for up to 1 year unless the inquiry is
                          resolved sooner.
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
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
                      className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300"
                    >
                      4. Data Sharing and Third-Party Services
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        We share data with trusted providers to operate
                        InterChat:
                      </p>
                      <ul className="space-y-3">
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">
                            Discord API:
                          </strong>{' '}
                          Bot functionality and user authentication
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">
                            Oracle Cloud Infrastructure:
                          </strong>{' '}
                          Hosting and storage (DPA in place)
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">
                            Cloudflare:
                          </strong>{' '}
                          Network performance and security (DPA in place)
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">Sentry:</strong>{' '}
                          Error monitoring and diagnostics (DPA in place)
                        </li>
                      </ul>
                      <p className="bg-gradient-to-r from-blue-400/20 to-cyan-400/20 border border-blue-500/30 rounded-xl p-4 text-blue-200">
                        All third parties are contractually obligated to process
                        your data only as necessary and in compliance with GDPR.
                      </p>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="data-transfers"
                      className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300"
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
                      className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300"
                    >
                      6. Your Rights
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>Depending on your location, you have the right to:</p>
                      <ol className="space-y-2 list-decimal list-inside">
                        <li className="hover:text-purple-200 transition-colors">
                          Access your personal data
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          Request correction or deletion
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          Export your data in a commonly used format
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          Withdraw consent where processing is based on consent
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          Object to processing based on legitimate interest
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          File a complaint with your local supervisory authority
                        </li>
                      </ol>
                      <p className="bg-gradient-to-r from-green-400/20 to-emerald-400/20 border border-green-500/30 rounded-xl p-4 text-green-200">
                        <strong className="text-green-300">
                          How to exercise these rights:
                        </strong>{' '}
                        Contact us at our{' '}
                        <span className="text-green-300 font-semibold">
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
                      className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300"
                    >
                      7. Cookies and Tracking
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>We use cookies for:</p>
                      <ul className="space-y-3">
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">
                            Essential cookies:
                          </strong>{' '}
                          Required for the service to work
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">
                            Functionality cookies:
                          </strong>{' '}
                          Remember your preferences
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">
                            Analytics cookies:
                          </strong>{' '}
                          Understand usage trends (requires opt-in)
                        </li>
                      </ul>
                      <p className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-500/30 rounded-xl p-4 text-yellow-200">
                        You can manage or disable cookies in your browser, but
                        some features may not function correctly.
                      </p>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="children"
                      className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300"
                    >
                      8. Children's Privacy
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p className="bg-gradient-to-r from-red-400/20 to-pink-400/20 border border-red-500/30 rounded-xl p-4 text-red-200">
                        InterChat is{' '}
                        <strong className="text-red-300">
                          not intended for children under 16 in the EU
                        </strong>
                        , or under 13 elsewhere. If we learn personal data from
                        a child was collected, we will delete it immediately.
                        Parents or guardians may contact us to request deletion.
                      </p>
                    </div>
                  </section>
                  <section className="group">
                    <h2
                      id="changes"
                      className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300"
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
                      className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300"
                    >
                      10. Contact Us
                    </h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        For questions or requests regarding this Privacy Policy:
                      </p>
                      <ul className="space-y-2">
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">
                            Official Discord server
                          </strong>{' '}
                          <span className="text-purple-400 font-semibold">
                            <Link href="https://interchat.dev/support">
                              https://interchat.dev/support
                            </Link>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </section>{' '}
                  <section>
                    <h2 id="data-transfers" className="text-2xl font-bold">
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
                    <h2 id="your-rights" className="text-2xl font-bold">
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
                    <h2 id="cookies" className="text-2xl font-bold">
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
                    <h2 id="children" className="text-2xl font-bold">
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
                    <h2 id="changes" className="text-2xl font-bold">
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
                    <h2 id="contact" className="text-2xl font-bold">
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

          <footer className="mt-20 border-t border-gray-700/30 pt-12 text-center">
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700/20">
              <p className="text-gray-300 text-lg">
                This privacy policy is part of our{' '}
                <span className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
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
