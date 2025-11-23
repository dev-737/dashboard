'use client';

import {
  AlertTriangle,
  BadgeAlert,
  Ban,
  Gavel,
  MessageSquareWarning,
  Scale,
  Shield,
  ShieldAlert,
} from 'lucide-react';

const InterChatRules = () => {
  const rules = [
    {
      id: 1,
      title: 'Hate Speech & Harassment',
      icon: <Scale className="h-6 w-6 text-rose-500" />,
      notAllowed: [
        'Using slurs or hate speech to attack others',
        'Harassing or threatening users',
        'Naming a hub with offensive or hateful language',
      ],
      warning:
        'Hubs that allow casual slur usage are not automatically banned, but if hate speech is reported and ignored, the hub may face action.',
    },
    {
      id: 2,
      title: 'Illegal Content',
      icon: <Gavel className="h-6 w-6 text-amber-500" />,
      notAllowed: [
        'Sharing links to illegal content (e.g., CSAM, hacking tools)',
        'Encouraging violence, self-harm, or criminal activity',
        'Doxxing (posting private info like addresses)',
      ],
      warning:
        "Discussions about laws, crime, or mental health are allowed as long as they don't promote harm.",
    },
    {
      id: 3,
      title: 'Severe NSFW & Gore',
      icon: <Ban className="h-6 w-6 text-rose-500" />,
      notAllowed: [
        'Posting gore or extreme gore in InterChat',
        'Posting sexual content in non-NSFW hubs',
        'Running an NSFW hub without properly labeling it',
      ],
      warning:
        'Mild NSFW jokes and discussions are fine in appropriate spaces that allow it.',
    },
    {
      id: 4,
      title: 'Severe Spam & Raiding',
      icon: <MessageSquareWarning className="h-6 w-6 text-orange-500" />,
      notAllowed: [
        'Mass spamming or bot floods',
        'Organizing raids on other hubs',
        'Scam links and phishing',
      ],
      warning: "Fast-moving chats are fine if they're natural conversations.",
    },
    {
      id: 5,
      title: 'Impersonation & Fraud',
      icon: <BadgeAlert className="h-6 w-6 text-red-500" />,
      notAllowed: [
        'Impersonating InterChat staff or hub moderators',
        'Creating fake hubs pretending to be official communities',
        'Running cryptocurrency or NFT scams',
        'Selling or trading accounts/hubs',
      ],
      warning:
        'Discussions about cryptocurrencies and NFTs are allowed, but organizing trades or sales is prohibited.',
    },
    {
      id: 6,
      title: 'Exploitation & Abuse',
      icon: <ShieldAlert className="h-6 w-6 text-rose-500" />,
      notAllowed: [
        'Grooming or predatory behavior towards minors',
        'Sharing or requesting personal information of others',
        'Blackmailing or threatening to expose private details',
        'Creating hubs dedicated to harassing specific individuals',
      ],
      warning:
        'Any content involving the exploitation of minors will result in immediate permanent ban and Discord being notified.',
    },
    {
      id: 7,
      title: 'Malicious Software',
      icon: <Shield className="h-6 w-6 text-amber-500" />,
      notAllowed: [
        'Sharing malware, viruses, or harmful scripts',
        'Distributing token grabbers or account stealers',
        "Promoting fake 'free nitro' or similar scams",
        'Sharing tools designed to harm Discord servers',
      ],
      warning:
        'Discussing cybersecurity topics is allowed, but sharing harmful tools or exploits is strictly prohibited.',
    },
  ];

  return (
    <section className="min-h-screen w-full bg-linear-to-br from-gray-50 via-purple-50/20 to-gray-100 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-800">
      <main className="container relative mx-auto px-4 pt-28 pb-20">
        {/* Animated decorative elements */}
        <div className="absolute top-20 left-1/4 h-60 w-60 rounded-full bg-purple-600 opacity-5 blur-xl"></div>
        <div className="absolute right-1/4 bottom-20 h-80 w-80 rounded-full bg-purple-600 opacity-5 blur-xl"></div>
        <div className="absolute top-40 right-1/3 h-40 w-40 rounded-full bg-purple-500 opacity-5 blur-xl"></div>

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-block">
              <div className="flex items-center justify-center rounded-full border border-purple-200 bg-purple-100 px-5 py-2 text-purple-700 shadow-sm dark:border-purple-700/40 dark:bg-purple-900/30 dark:text-purple-300">
                <ShieldAlert className="mr-2 h-5 w-5" />
                <span className="font-medium">Base Rules</span>
              </div>
            </div>

            <h1 className="mb-6 bg-linear-to-r from-purple-600 to-blue-500 bg-clip-text font-bold text-4xl text-transparent dark:from-purple-400 dark:to-blue-300">
              Community Guidelines
            </h1>

            <p className="mx-auto mb-12 max-w-2xl text-gray-600 text-lg dark:text-gray-300">
              To keep InterChat safe and manageable, all hubs and users must
              follow these
              <span className="font-bold"> absolute rules</span>. Violating them
              can result in
              <span className="font-bold">
                {' '}
                warnings, suspensions, or permanent bans
              </span>{' '}
              from InterChat.
            </p>
          </div>

          <div className="space-y-6">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="overflow-hidden rounded-xl border border-purple-100 bg-white/40 shadow-lg backdrop-blur-xl dark:border-primary/20 dark:bg-white/5"
              >
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-purple-100 p-3 dark:bg-primary/10">
                      {rule.icon}
                    </div>
                    <h2 className="font-semibold text-xl text-zinc-700 dark:text-zinc-100">
                      {rule.id}. {rule.title}
                    </h2>
                  </div>

                  <div className="pl-16">
                    <div className="mb-4">
                      <p className="mb-2 flex items-center font-semibold text-rose-600 dark:text-rose-400">
                        <Ban className="mr-2 h-4 w-4" /> Not Allowed:
                      </p>
                      <ul className="list-disc space-y-2 pl-6 marker:text-rose-400">
                        {rule.notAllowed.map((item, i) => (
                          <li
                            key={`${rule.id}-notallowed-${i}-${item.slice(0, 20)}`}
                            className="text-zinc-600 dark:text-zinc-300"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-950/30">
                      <p className="flex items-center text-amber-800 text-sm dark:text-amber-300">
                        <AlertTriangle className="mr-2 h-4 w-4 flex-shrink-0" />
                        {rule.warning}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Line to separate sections */}
            <div className="my-12 h-px w-full bg-gray-200 dark:bg-gray-700"></div>

            {/* Enforcement Section */}
            <div className="mt-12 overflow-hidden rounded-xl border border-purple-300 bg-white/40 shadow-lg backdrop-blur-xl dark:border-primary/30 dark:bg-white/5">
              <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex-shrink-0 rounded-lg bg-purple-100 p-3 dark:bg-primary/10">
                    <BadgeAlert className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                  </div>
                  <h2 className="font-semibold text-xl text-zinc-700 dark:text-zinc-100">
                    How Are Violations Enforced?
                  </h2>
                </div>

                <div className="pl-16">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 font-medium text-purple-700 text-sm dark:bg-primary/10 dark:text-purple-300">
                        1
                      </span>
                      <span>
                        <strong>User Reports First:</strong> If a hub/user is
                        reported, we investigate.
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 font-medium text-purple-700 text-sm dark:bg-primary/10 dark:text-purple-300">
                        2
                      </span>
                      <span>
                        <strong>Warnings Before Suspensions:</strong> Unless
                        it&apos;s extremely serious.
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 font-medium text-purple-700 text-sm dark:bg-primary/10 dark:text-purple-300">
                        3
                      </span>
                      <span>
                        <strong>Repeat Offenses:</strong> Lead to hub/user bans.
                      </span>
                    </li>
                  </ul>

                  <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800/30 dark:bg-purple-900/20">
                    <p className="flex items-center text-purple-800 text-sm dark:text-purple-200">
                      <MessageSquareWarning className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="font-semibold">
                        InterChat allows hubs to have their own rules
                      </span>
                      , but violations of these base rules will result in
                      action.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-700/30 dark:bg-amber-900/10">
            <div className="mb-3 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              <h3 className="font-semibold text-amber-800 text-lg dark:text-amber-400">
                Additional Considerations
              </h3>
            </div>
            <p className="text-amber-800/90 text-base dark:text-amber-300/90">
              The rules and examples listed above are not exhaustive. InterChat
              moderators reserve the right to take action against any behavior
              that threatens the safety, integrity, or well-being of our
              community, even if not explicitly listed here. We encourage users
              to exercise good judgment and maintain a respectful environment.
            </p>
          </div>

          <div className="mt-12 border-gray-200 border-t pt-8 dark:border-gray-700/50">
            <div className="flex flex-col items-center justify-center gap-6 text-center md:flex-row">
              <p className="text-gray-600 dark:text-gray-400">
                These rules are enforced for everyone&apos;s safety
              </p>
              <a
                href="/support"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-full border border-purple-200 bg-purple-100 px-4 py-2 text-purple-700 transition-colors duration-200 hover:bg-purple-200 dark:border-purple-700/40 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/40"
              >
                <Shield className="mr-2 h-4 w-4" />
                <span className="font-medium">Report a Violation</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};

export default InterChatRules;
