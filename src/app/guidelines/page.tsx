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
      icon: <Scale className="h-6 w-6 text-rose-400" />,
      description:
        'We have zero tolerance for hate speech and targeted harassment.',
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
      icon: <Gavel className="h-6 w-6 text-amber-400" />,
      description:
        'Do not use InterChat to promote or facilitate illegal acts.',
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
      icon: <Ban className="h-6 w-6 text-rose-400" />,
      description:
        'Keep sensitive content in designated areas and label it properly.',
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
      icon: <MessageSquareWarning className="h-6 w-6 text-orange-400" />,
      description: 'Respect other communities and keep conversations organic.',
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
      icon: <BadgeAlert className="h-6 w-6 text-red-400" />,
      description: 'Be yourself. Do not deceive others for personal gain.',
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
      icon: <ShieldAlert className="h-6 w-6 text-rose-400" />,
      description: 'Protecting the vulnerable is our top priority.',
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
      icon: <Shield className="h-6 w-6 text-amber-400" />,
      description: 'Do not distribute harmful software or tools.',
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
    <div className="min-h-screen w-full bg-[#030812] text-gray-200 selection:bg-purple-500/30">
      {/* Background Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      <main className="container relative z-10 mx-auto max-w-6xl px-4 pt-32 pb-20">
        {/* Header */}
        <div className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-purple-300 backdrop-blur-sm">
            <ShieldAlert className="mr-2 h-4 w-4" />
            <span className="font-medium text-sm">Community Standards</span>
          </div>

          <h1 className="mb-6 bg-linear-to-r from-white via-purple-100 to-gray-300 bg-clip-text font-bold text-4xl text-transparent tracking-tight sm:text-5xl md:text-6xl">
            Community Guidelines
          </h1>

          <p className="mx-auto max-w-2xl text-gray-400 text-lg leading-relaxed">
            To keep InterChat safe and enjoyable for everyone, we've established
            these core principles. Violating them may result in{' '}
            <span className="font-semibold text-purple-400">
              warnings, suspensions, or permanent bans
            </span>
            .
          </p>
        </div>

        {/* Rules Grid */}
        <div className="mb-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-purple-500/10"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="shrink-0 rounded-xl bg-purple-500/10 p-3 ring-1 ring-purple-500/20 transition-colors group-hover:bg-purple-500/20">
                  {rule.icon}
                </div>
                <h2 className="font-semibold text-gray-100 text-xl">
                  {rule.title}
                </h2>
              </div>

              <p className="mb-6 text-gray-400 text-sm leading-relaxed">
                {rule.description}
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 font-semibold text-rose-400 text-xs uppercase tracking-wider">
                    <Ban className="h-3 w-3" /> Prohibited
                  </p>
                  <ul className="space-y-2">
                    {rule.notAllowed.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-gray-400 text-sm transition-colors group-hover:text-gray-300"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose-500/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 border-white/5 border-t pt-4">
                  <p className="flex gap-2 rounded-lg border border-amber-500/10 bg-amber-500/5 p-3 text-amber-400/90 text-xs leading-relaxed">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {rule.warning}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enforcement Section */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl md:p-12">
          <div className="-mt-20 -mr-20 absolute top-0 right-0 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center justify-center rounded-full bg-purple-500/10 p-3 ring-1 ring-purple-500/20">
                <Gavel className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="mb-4 font-bold text-3xl text-white">
                Enforcement Process
              </h2>
              <p className="mb-8 text-gray-400 text-lg">
                We believe in fair and transparent moderation. Our goal is to
                correct behavior, not just punish it.
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: 'Report & Investigate',
                    desc: 'We review every report thoroughly before taking action.',
                  },
                  {
                    title: 'Warning System',
                    desc: 'For minor offenses, we issue warnings to educate users.',
                  },
                  {
                    title: 'Decisive Action',
                    desc: 'Severe or repeated violations result in immediate bans.',
                  },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 font-bold text-purple-400 text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-200">
                        {step.title}
                      </h3>
                      <p className="text-gray-500 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-6 md:p-8">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-200 text-lg">
                <MessageSquareWarning className="h-5 w-5 text-purple-400" />
                Hub Autonomy
              </h3>
              <p className="mb-6 text-gray-400 leading-relaxed">
                InterChat hubs are allowed to have their own additional rules.
                However, these{' '}
                <span className="font-medium text-gray-200">
                  Community Guidelines are absolute
                </span>{' '}
                and supersede any local hub rules. A hub cannot "allow" what
                InterChat forbids.
              </p>

              <div className="flex flex-col gap-4 border-white/5 border-t pt-4 sm:flex-row">
                <a
                  href="/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-medium text-sm text-white transition-all hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <Shield className="h-4 w-4" />
                  Report Violation
                </a>
                <a
                  href="/terms"
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-medium text-gray-300 text-sm transition-all hover:bg-white/10"
                >
                  View Terms
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterChatRules;
