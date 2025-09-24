import { Github, Globe, Linkedin, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useId } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DiscordIcon } from './DiscordIcon';

interface Contributor {
  name: string;
  role: string;
  roleType: 'developer' | 'staff' | 'translator';
  avatar?: string;
  github?: string;
  discord?: string;
  linkedin?: string;
  website?: string;
}

const getRoleBadgeStyles = (roleType: Contributor['roleType']) => {
  switch (roleType) {
    case 'developer':
      return 'bg-purple-600 dark:bg-purple-700 text-white';
    case 'staff':
      return 'bg-emerald-600 dark:bg-emerald-700 text-white';
    case 'translator':
      return 'bg-amber-600 dark:bg-amber-700 text-white';
    default:
      return '';
  }
};

const contributors: Contributor[] = [
  // Developers
  {
    name: 'devoid.',
    role: 'Lead Developer',
    roleType: 'developer',
    avatar:
      'https://cdn.discordapp.com/avatars/701727675311587358/789fb02094d8963727a2cf6bf78c99fe.webp?size=4096',
    github: 'dev-737',
    discord: 'cgYgC6YZyX',
  },
  {
    name: 'devoid.',
    role: 'Developer',
    roleType: 'developer',
    avatar:
      'https://cdn.discordapp.com/avatars/934537337113804891/d9f083f11890342530765b68221a0de1.webp?size=4096',
    github: 'dev-737',
  },
  // Staff
  {
    name: 'hecash',
    role: 'Community Manager',
    roleType: 'staff',
    avatar:
      'https://cdn.discordapp.com/avatars/1160735837940617336/d21ca7a5f0734334387cd53e8dbd8a38.webp?size=4096',
    discord: '37cjURADY3',
    website: 'https://jetskiiix.straw.page',
  },
  {
    name: 'orange_mitro',
    role: 'Moderator',
    roleType: 'staff',
    avatar:
      'https://cdn.discordapp.com/avatars/994411851557392434/3a60b2ba79d2e71617334f4eef98ec8c.webp?size=4096',
  },
  {
    name: 'loveitsgood',
    role: 'Bot Moderator',
    roleType: 'staff',
    avatar:
      'https://cdn.discordapp.com/avatars/853178500193583104/9ed1f465b20a1b95c2d960f7ae35ed85.webp?size=4096',
  },
  // Translators
  {
    name: 'spacelemoon',
    role: 'Russian Translator',
    roleType: 'translator',
    avatar:
      'https://cdn.discordapp.com/avatars/845357241132384286/954653d2f58cdf003709515df5820a0c.webp?size=4096',
  },
  {
    name: 'dannybarbosabr',
    role: 'Portuguese Translator', // Corrected spelling
    roleType: 'translator',
    avatar:
      'https://cdn.discordapp.com/avatars/1067849662347878401/ed4f535c935e9c7d946e9ee8bb57ba06.webp?size=4096',
    discord: 'b4dyWb3wGX',
    github: 'DannyBarbosaBR',
    linkedin: 'daniel-barbosa-de-lima-4181b4266',
  },
  {
    name: 'Chenxian.201277050224',
    role: 'Chinese Translator',
    roleType: 'translator',
  },
  {
    name: 'wakabearhasaname',
    role: 'Hindi Translator',
    avatar:
      'https://cdn.discordapp.com/avatars/1065564110844071996/2add66078f6c8a2908e46f87113ddb3f.webp?size=4096',
    roleType: 'translator',
  },
  {
    name: 'lautydev',
    role: 'Spanish Translator',
    roleType: 'translator',
    avatar:
      'https://cdn.discordapp.com/avatars/656842811496333322/de43b1b4de1e91581ee9db3ad9852694.webp?size=4096',
    github: 'LautyDev',
  },
  {
    name: 'tnfangel',
    role: 'Spanish Translator',
    roleType: 'translator',
    avatar:
      'https://cdn.discordapp.com/avatars/456361646273593345/e53fd8d7fad3914bbff129f04cbd058d.webp?size=4096',
    github: 'tnfAngel',
    website: 'https://www.tnfangel.com',
  },
];

export const CreditsSection = () => {
  const teamId = useId();
  const sortedContributors = [...contributors].sort((a, b) => {
    if (a.roleType === b.roleType) return 0;
    if (a.roleType === 'developer') return -1;
    if (b.roleType === 'developer') return 1;
    if (a.roleType === 'staff') return -1;
    if (b.roleType === 'staff') return 1;
    return 0;
  });

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-24 md:py-32"
      id={teamId}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 animate-pulse rounded-full bg-primary-alt/5 blur-3xl delay-1000" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-gray-700/60 bg-gradient-to-r from-gray-800/60 to-gray-800/40 px-4 py-2 text-gray-300 text-sm shadow-lg backdrop-blur-xl">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            <span className="font-semibold tracking-wide">Meet Our Team</span>
          </div>

          <h2 className="mb-6 font-bold text-4xl text-white tracking-tight md:text-6xl">
            The Talented Team Behind{' '}
            <span className="bg-gradient-to-r from-primary via-primary-alt to-primary bg-clip-text text-transparent">
              InterChat&apos;s Success
            </span>
          </h2>

          <p className="mx-auto max-w-3xl text-gray-300 text-lg leading-relaxed md:text-xl">
            Meet the dedicated individuals who contribute their skills and
            passion to make InterChat a reality. From developers to community
            managers and translators, our team works tirelessly to provide you
            with the best possible cross-server Discord experience.
          </p>
        </motion.div>

        <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sortedContributors.map((contributor, index) => (
            <motion.div
              key={contributor.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
              itemScope
              itemType="https://schema.org/Person"
            >
              <div className="-inset-1 absolute rounded-[var(--radius-modal)] bg-gradient-to-br from-primary/20 to-primary-alt/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60" />

              <div className="relative rounded-[var(--radius-modal)] border border-gray-700/60 bg-gray-800/60 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-gray-800/80 hover:shadow-2xl hover:shadow-primary/10 group-hover:scale-[1.02] group-hover:border-gray-600/70">
                <div className="flex items-start gap-4">
                  {contributor.avatar ? (
                    <div className="relative">
                      <div className="-inset-1 absolute rounded-full bg-gradient-to-r from-primary/30 to-primary-alt/30 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
                      <Image
                        src={contributor.avatar}
                        alt={`${contributor.name}'s avatar`} 
                        width={64}
                        height={64}
                        className="relative rounded-full border-2 border-gray-700/50 transition-colors duration-300 group-hover:border-gray-600/70"
                        itemProp="image"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-600/50 bg-gradient-to-br from-gray-700/60 to-gray-800/60 text-primary transition-colors duration-300 group-hover:border-primary/50">
                      <span className="font-bold text-xl">
                        {contributor.name[0]}
                      </span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4
                      className="mb-2 font-bold text-lg text-white transition-colors duration-300 group-hover:text-primary"
                      itemProp="name"
                    >
                      {contributor.name}
                    </h4>
                    <Badge
                      className={cn(
                        'mb-4',
                        getRoleBadgeStyles(contributor.roleType)
                      )}
                      itemProp="jobTitle"
                    >
                      {contributor.role}
                    </Badge>

                    {/* Social links */}
                    <div className="flex gap-2">
                      {contributor.github && (
                        <Link
                          href={`https://github.com/${contributor.github}?utm_source=interchat.dev&utm_medium=referral`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link rounded-[var(--radius)] p-2 transition-colors hover:bg-gray-700/50"
                          aria-label={`View ${contributor.name}'s GitHub profile`}
                        >
                          <Github
                            className="h-4 w-4 text-gray-400 transition-colors group-hover/link:text-white"
                            aria-hidden="true"
                          />
                        </Link>
                      )}
                      {contributor.linkedin && (
                        <Link
                          href={`https://linkedin.com/${contributor.linkedin}?utm_source=interchat.dev&utm_medium=referral`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link rounded-[var(--radius)] p-2 transition-colors hover:bg-gray-700/50"
                          aria-label={`View ${contributor.name}'s LinkedIn profile`}
                        >
                          <Linkedin
                            className="h-4 w-4 text-gray-400 transition-colors group-hover/link:text-white"
                            aria-hidden="true"
                          />
                        </Link>
                      )}
                      {contributor.website && (
                        <Link
                          href={`${contributor.website}?utm_source=interchat.dev`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link rounded-[var(--radius)] p-2 transition-colors hover:bg-gray-700/50"
                          aria-label={`Visit ${contributor.name}'s website`}
                        >
                          <Globe
                            className="h-4 w-4 text-gray-400 transition-colors group-hover/link:text-white"
                            aria-hidden="true"
                          />
                        </Link>
                      )}
                      {contributor.discord && (
                        <Link
                          href={`https://discord.com/invite/${contributor.discord}?utm_source=interchat.dev&utm_medium=referral`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link rounded-[var(--radius)] p-2 transition-colors hover:bg-gray-700/50"
                          aria-label={`Contact ${contributor.name} on Discord`}
                        >
                          <DiscordIcon
                            className="h-4 w-4 fill-gray-400 transition-colors group-hover/link:fill-white"
                            aria-hidden="true"
                          />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
