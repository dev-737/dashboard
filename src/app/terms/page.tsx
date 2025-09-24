'use client';

import { Scale } from 'lucide-react';
import { Link } from '@/components/Link';

export default function TermsOfService() {
  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <main className="container relative mx-auto px-4 py-20">

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-6 inline-block">
              <div className="flex items-center justify-center rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 px-6 py-3 text-purple-300 backdrop-blur-sm shadow-lg shadow-purple-500/20">
                <Scale className="mr-3 h-6 w-6" />
                <span className="font-semibold text-lg">Terms of Service</span>
              </div>
            </div>

            <h1 className="mb-6 bg-gradient-to-r from-white via-purple-100 to-indigo-200 bg-clip-text text-transparent text-5xl font-extrabold md:text-6xl lg:text-7xl">
              InterChat Terms of Service
            </h1>

            <p className="mx-auto mb-16 max-w-2xl text-lg font-medium tracking-wide text-purple-300/80">
              Effective date: September 16, 2025
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-gray-700/30 bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-8 shadow-2xl backdrop-blur-xl shadow-purple-500/10">
                <p className="mb-6 text-sm font-bold uppercase tracking-wider text-purple-300">On this page</p>
                <nav className="space-y-4 text-sm">
                  <a href="#definitions" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">1. Definitions</a>
                  <a href="#eligibility" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">2. Eligibility</a>
                  <a href="#acceptance" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">3. Acceptance of Terms</a>
                  <a href="#account-responsibility" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">4. Account Responsibility</a>
                  <a href="#acceptable-use" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">5. Acceptable Use</a>
                  <a href="#user-content" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">6. User Content</a>
                  <a href="#moderation" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">7. Moderation & Enforcement</a>
                  <a href="#rate-limits" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">8. Rate Limits & Fair Use</a>
                  <a href="#third-party" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">9. Third-Party Services</a>
                  <a href="#fees" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">10. Fees & Paid Features</a>
                  <a href="#intellectual-property" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">11. Intellectual Property</a>
                  <a href="#termination" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">12. Termination</a>
                  <a href="#warranties" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">13. Warranties & Disclaimers</a>
                  <a href="#limitation" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">14. Limitation of Liability</a>
                  <a href="#indemnification" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">15. Indemnification</a>
                  <a href="#governing-law" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">16. Governing Law & Disputes</a>
                  <a href="#changes" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">17. Changes to the Terms</a>
                  <a href="#dmca" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">18. DMCA</a>
                  <a href="#contact" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">19. Contact</a>
                  <a href="#final-notes" className="block text-gray-300 hover:text-purple-400 transition-all duration-200 hover:translate-x-1 hover:font-medium">20. Final Notes</a>
                </nav>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="prose prose-lg prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-purple-300 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-2">
                <div className="space-y-16">
                  <section className="group">
                    <h2 id="definitions" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">1. Definitions</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <ul className="space-y-3">
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">Service</strong> — the InterChat bot, related software,
                          APIs, website, and any other features we provide.
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">You / User</strong> — any person or entity that uses the
                          Service.
                        </li>
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">User Content</strong> — messages, files, images, links, or
                          other material you submit, post, or transmit through the
                          Service.
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="eligibility" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">2. Eligibility</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p className="bg-gradient-to-r from-red-400/20 to-orange-400/20 border border-red-500/30 rounded-xl p-4 text-red-200">
                        You must be legally able to enter into contracts where you live.
                        Users in the EU must be at least 16 years old; elsewhere, at least
                        13. If you are under the required age, do not use the Service.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="acceptance" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">3. Acceptance of Terms</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        Use of the Service constitutes acceptance of these Terms and our{' '}
                        <span className="text-purple-400 font-semibold"><Link href="/privacy">Privacy Policy</Link></span>. Continued use after
                        changes means you accept the revised Terms.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="account-responsibility" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">4. Account Responsibility</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        You are responsible for all activity originating from your
                        accounts, including any bots or integrations you configure. Keep
                        credentials secure. Report unauthorized access immediately to{' '}
                        <span className="text-purple-400 font-semibold"><Link href="https://interchat.dev/support">our support server</Link></span>.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="acceptable-use" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">5. Acceptable Use</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        You agree to use the Service lawfully and in compliance with
                        Discord's Terms of Service and our Community Guidelines.
                      </p>
                      <p>Prohibited actions include, but are not limited to:</p>
                      <ul className="space-y-2">
                        <li className="hover:text-purple-200 transition-colors">Illegal activity, including trafficking in illicit goods or services.</li>
                        <li className="hover:text-purple-200 transition-colors">Malware distribution, infiltration, or exploitation attempts.</li>
                        <li className="hover:text-purple-200 transition-colors">Spam, bulk unsolicited messages, or automated scraping that violates Discord rules.</li>
                        <li className="hover:text-purple-200 transition-colors">Attempts to reverse-engineer, bypass, or subvert rate limits, security controls, or moderation.</li>
                        <li className="hover:text-purple-200 transition-colors">Harassment, threats, or targeted abuse.</li>
                      </ul>
                      <p className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-500/30 rounded-xl p-4 text-yellow-200">
                        We may refuse or suspend access for conduct we deem harmful.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="user-content" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">6. User Content</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        You retain ownership of your User Content. By submitting content you
                        grant InterChat a worldwide, royalty-free, sublicensable,
                        transferable license to host, use, reproduce, modify, publish, and
                        distribute that content solely to provide and improve the Service.
                      </p>
                      <p>
                        You warrant that you have the rights to submit your content and that it
                        does not violate any laws or third-party rights.
                      </p>
                      <p className="bg-gradient-to-r from-blue-400/20 to-cyan-400/20 border border-blue-500/30 rounded-xl p-4 text-blue-200">
                        If your content infringes copyright, follow our DMCA process (contact{' '}
                        <span className="text-blue-300 font-semibold"><Link href="https://interchat.dev/support">our support server</Link></span>
                        ). We will respond in accordance with applicable law.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="moderation" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">7. Moderation, Enforcement, and Data Handling</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        We operate automated and manual moderation. We may remove content,
                        mute users, suspend accounts, or ban users for violations.
                      </p>
                      <p>
                        <strong className="text-purple-300">Evidence and logs:</strong> We keep logs and message snapshots for
                        moderation and security. See the Privacy Policy for retention periods
                        and data handling details.
                      </p>
                      <p className="bg-gradient-to-r from-green-400/20 to-emerald-400/20 border border-green-500/30 rounded-xl p-4 text-green-200">
                        <strong className="text-green-300">Appeals:</strong> If you believe enforcement was incorrect, open a
                        ticket in{' '}
                        <span className="text-green-300 font-semibold"><Link href="https://interchat.dev/support">our support server</Link></span> with
                        your Discord ID, incident details, and supporting evidence. Appeals
                        are reviewed. Submitting an appeal does not guarantee reversal. Abuse
                        of the appeals process may result in permanent enforcement.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="rate-limits" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">8. Rate Limits and Fair Use</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        We apply rate limits and quotas. Excessive or abusive use can be
                        throttled, limited, or terminated. You will be notified when
                        practical.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="third-party" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">9. Third-Party Services</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        The Service uses third-party providers (e.g., Discord, hosting,
                        analytics). Those providers may have separate terms and privacy
                        practices. You agree we may share data required to operate the
                        Service. See our Privacy Policy.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="fees" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">10. Fees and Paid Features</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p className="bg-gradient-to-r from-emerald-400/20 to-green-400/20 border border-emerald-500/30 rounded-xl p-4 text-emerald-200">
                        InterChat is free unless we announce paid features. If we introduce
                        fees, we will publish terms for those features. Paid features may have
                        separate cancellation, refund, and billing terms.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="intellectual-property" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">11. Intellectual Property</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        InterChat and its content, trademarks, logos, and software are our
                        property or licensed to us. You may not copy, modify, publish,
                        distribute, or create derivative works without our written permission.
                      </p>
                      <p>
                        If you provide feedback or suggestions, you grant us an irrevocable,
                        perpetual, worldwide, royalty-free license to use that feedback for
                        any purpose.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="termination" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">12. Termination</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        We may suspend or terminate your access at our discretion for breach
                        of these Terms or for any lawful reason. On termination, your rights
                        under these Terms end immediately. We may preserve necessary records
                        and data per our retention policies and legal obligations.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="warranties" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">13. Warranties and Disclaimers</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        The Service is provided "as is" and "as available." We disclaim all
                        warranties, whether express or implied, including merchantability,
                        fitness for a particular purpose, and non-infringement. We do not
                        guarantee uptime, availability, or that the Service is free of defects.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="limitation" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">14. Limitation of Liability</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        To the fullest extent permitted by law, InterChat and its officers,
                        employees, agents, and partners will not be liable for indirect,
                        incidental, special, consequential, or punitive damages, or loss of
                        profits, data, or goodwill, arising from your use of the Service.
                      </p>
                      <p className="bg-gradient-to-r from-amber-400/20 to-yellow-400/20 border border-amber-500/30 rounded-xl p-4 text-amber-200">
                        Our total liability for direct damages is limited to the greater of
                        (a) the amount you paid us in the last 12 months, or (b) $100 USD.
                        This limitation applies even if we were advised of the possibility of
                        such damages.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="indemnification" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">15. Indemnification</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        You agree to indemnify and hold InterChat harmless from any claims,
                        liabilities, losses, damages, and expenses (including reasonable
                        attorneys' fees) arising from your use of the Service, your User
                        Content, or your breach of these Terms.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="changes" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">17. Changes to the Terms</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        We may change these Terms. For material changes, we will provide
                        notice via the website or our Discord server before they take effect.
                        Continued use after notice constitutes acceptance.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="dmca" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">18. DMCA and Copyright Agent</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>
                        If you believe content violates your copyright, contact our agent at{' '}
                        <span className="text-purple-400 font-semibold"><Link href="https://interchat.dev/support">our support server</Link></span>{' '}
                        with a DMCA takedown notice including identification of the
                        copyrighted work, location of infringing material, contact
                        information, a statement of good faith, and a signature.
                      </p>
                    </div>
                  </section>

                  <section className="group">
                    <h2 id="contact" className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300">19. Contact</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p>For questions, enforcement appeals, legal notices, or DMCA requests, contact:</p>
                      <ul className="space-y-2">
                        <li className="hover:text-purple-200 transition-colors">
                          <strong className="text-purple-300">Discord: {" "}</strong>
                          <span className="text-purple-400 font-semibold"><Link href="https://interchat.dev/support">Official InterChat support server</Link></span>
                        </li>
                      </ul>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-20 border-t border-gray-700/30 pt-12 text-center">
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700/20">
              <p className="text-gray-300 text-lg">
                By using InterChat, you agree to these Terms of Service and our{' '}
                <span className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"><Link href="/privacy">Privacy Policy</Link></span>
              </p>
            </div>
          </footer>
        </div>
      </main>
    </section>
  );
}