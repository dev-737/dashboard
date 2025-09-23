'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, ChevronDown, Plus, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AccordionItemProps {
  readonly title: string;
  readonly content: React.ReactNode;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly index: number;
}

function AccordionItem({ title, content, isOpen, onToggle, index }: AccordionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative"
    >
      {/* Hover glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 rounded-[calc(var(--radius)+4px)] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />

      <div
        className={cn(
          'relative bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl',
          'border border-gray-800/60 hover:border-gray-700/80',
          'transition-all duration-500 overflow-hidden',
          'hover:shadow-2xl hover:shadow-purple-500/10',
          isOpen
            ? 'rounded-[var(--radius)] rounded-b-none shadow-2xl shadow-purple-500/20'
            : 'rounded-[var(--radius)]',
          'group-hover:scale-[1.02] group-hover:z-10',
        )}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-transparent to-blue-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          animate={isOpen ? { opacity: [0.05, 0.15, 0.05] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Subtle animated mesh pattern */}
        <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500">
          <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] animate-pulse' />
        </div>

        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent pointer-events-none" />

        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-blue-500/15 rounded-[var(--radius)] rounded-b-none"
          />
        )}

        <Button
          onClick={onToggle}
          className={cn(
            'relative w-full px-6 py-7 lg:px-8 lg:py-8',
            'flex items-center justify-between',
            'text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
            'transition-all duration-300',
            'hover:bg-gradient-to-r hover:from-gray-800/30 hover:to-gray-700/30',
          )}
          aria-expanded={isOpen}
          aria-controls={`faq-content-${index}`}
          tabIndex={0}
        >
          <div className="flex items-center gap-6 flex-1">
            <motion.div
              className={cn(
                'relative flex items-center justify-center w-12 h-12 rounded-[var(--radius-button)]',
                'bg-gradient-to-br from-purple-500/20 to-blue-500/20',
                'border border-purple-500/30 backdrop-blur-sm',
                'transition-all duration-300',
                isOpen &&
                  'bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-purple-400/50 shadow-xl shadow-purple-500/30',
              )}
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {/* Background glow */}
              <div className="absolute inset-0 rounded-[var(--radius-button)] bg-gradient-to-br from-purple-400/20 to-blue-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <motion.div
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative z-10"
              >
                <Plus
                  className={cn(
                    'w-5 h-5 transition-colors duration-300',
                    isOpen ? 'text-purple-200' : 'text-purple-400 group-hover:text-purple-300',
                  )}
                />
              </motion.div>
            </motion.div>

            <h3 className="text-xl lg:text-2xl font-semibold text-white group-hover:text-purple-100 transition-colors duration-300 leading-tight">
              {title}
            </h3>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="ml-4 p-2 rounded-full hover:bg-white/5 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronDown
              className={cn(
                'w-5 h-5 transition-colors duration-300',
                isOpen ? 'text-purple-300' : 'text-gray-400 group-hover:text-gray-300',
              )}
            />
          </motion.div>
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`faq-content-${index}`}
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
              opacity: { duration: 0.3, delay: 0.1 },
              y: { duration: 0.4 },
            }}
            className="overflow-hidden relative z-10"
          >
            <div
              className={cn(
                'bg-gradient-to-br from-gray-800/90 to-gray-900/95 backdrop-blur-xl',
                'border-x border-b border-gray-800/60',
                'rounded-b-[var(--radius)]',
                'relative shadow-2xl shadow-black/30',
              )}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"
              />

              {/* Subtle border gradient */}
              <div className="absolute inset-0 rounded-b-[var(--radius)] border border-transparent bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:xor] pointer-events-none" />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="relative p-7 lg:p-9"
              >
                <div className="text-gray-200 leading-relaxed space-y-4 text-base lg:text-lg [&_a]:text-purple-400 [&_a]:hover:text-purple-300 [&_a]:transition-colors [&_a]:duration-200 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-purple-400/50 [&_a]:hover:decoration-purple-300/70">
                  {content}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!mounted) {
    return <div className="h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />;
  }

  return (
    <section className="relative py-24 md:py-40 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/30 via-gray-900/20 to-transparent" />

        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.5, 1],
          }}
          className="absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1.1, 1, 1.1],
            x: [0, -30, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
            times: [0, 0.5, 1],
          }}
          className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-3xl"
        />

        {/* Additional accent gradients */}
        <motion.div
          animate={{
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-2xl"
        />

        <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="40" cy="40" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_120%)]' />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 lg:mb-24 relative"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block mb-8"
          >
            <div className="relative group">
              {/* Badge glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-[calc(var(--radius-badge)+4px)] blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative flex items-center justify-center bg-gray-800/60 text-white px-8 py-4 rounded-[var(--radius-badge)] border border-gray-700/60 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group-hover:border-gray-600/80">
                <Sparkles
                  className="w-5 h-5 mr-3 text-purple-400 animate-pulse"
                  aria-hidden="true"
                />
                <span className="font-semibold tracking-wide text-base bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300">
                  Frequently Asked Questions
                </span>
              </div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
          >
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-white">
              Everything About
            </span>
            <motion.span
              className="block mt-3 md:mt-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              InterChat
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl mx-auto text-xl text-gray-300 leading-relaxed"
          >
            Everything you need to know about connecting your Discord communities with InterChat.
            Find comprehensive answers to common questions about setup, advanced features, and
            community moderation.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto"
        >
          <motion.div
            animate={{
              opacity: [0, 0.4, 0],
              scale: [0.98, 1.02, 0.98],
            }}
            transition={{
              repeat: Infinity,
              duration: 6,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-[var(--radius-modal)] bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-blue-500/15 blur-2xl"
          />

          {/* FAQ items container with better spacing */}
          <div className="relative space-y-6" role="region" aria-labelledby="faq-heading">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <AccordionItem
                  title={faq.title}
                  content={
                    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <div itemProp="text">{faq.content}</div>
                    </div>
                  }
                  isOpen={openIndex === index}
                  onToggle={() => toggleAccordion(index)}
                  index={index}
                />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 lg:mt-24 text-center relative"
        >
          <Button
            variant="ghost"
            className={cn(
              'group/button relative px-10 py-5 rounded-[var(--radius-button)]',
              'bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-xl',
              'border border-gray-600/60 hover:border-purple-500/60',
              'transition-all duration-500',
              'hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:ring-offset-2 focus:ring-offset-gray-900',
            )}
            asChild
          >
            <Link
              href="/docs"
              className="flex items-center justify-center gap-4"
              aria-label="View All InterChat Documentation"
            >
              {/* Button glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-[calc(var(--radius-button)+4px)] opacity-0 group-hover/button:opacity-100 transition-opacity duration-500 blur-sm" />

              <span className="relative font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 group-hover/button:from-purple-300 group-hover/button:to-blue-300 transition-all duration-300">
                View All InterChat Documentation
              </span>
              <motion.div
                className="relative p-2 rounded-[var(--radius-button)] bg-gradient-to-r from-purple-500/25 to-blue-500/25 border border-purple-500/40 group-hover/button:from-purple-500/35 group-hover/button:to-blue-500/35 group-hover/button:border-purple-400/60 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowRight
                  className="w-4 h-4 text-purple-300 group-hover/button:text-purple-200 transition-all duration-300 transform group-hover/button:translate-x-1"
                  aria-hidden="true"
                />
              </motion.div>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

const faqs = [
  {
    id: 'what-is-interchat',
    title: 'What is InterChat?',
    content: (
      <>
        InterChat is a powerful Discord bot that revolutionizes multi-server communication by
        allowing cross-community messaging. It allows you to link channels in your server
        to dynamic &quot;hubs&quot; (virtual group of servers) where you can engage with other servers that have joined the
        same hub. Experience the future of Discord community connectivity and discover how InterChat
        can transform your server into a thriving hub of cross-community collaboration.
      </>
    ),
  },
  {
    id: 'how-do-i-get-started',
    title: 'How do I get started with InterChat?',
    content: (
      <>
        Getting started with InterChat is incredibly simple! First, invite the bot to your server
        using our secure invitation system. Once added, use the intuitive{' '}
        <code className="px-2 py-1 bg-gray-800/60 rounded text-purple-300">/setup</code> command to
        link any channel to an existing hub or create your own. Within minutes, you&apos;ll be chatting
        with communities from around the world! For comprehensive setup guides, advanced
        configuration options, and troubleshooting, check out our detailed{' '}
        <Link
          href="/docs"
          className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-2 transition-colors duration-200"
        >
          documentation
        </Link>
        . Unlock the full potential of cross-server communication today.
      </>
    ),
  },
  {
    id: 'what-is-a-hub',
    title: 'What is an InterChat hub?',
    content: (
      <>
        An InterChat hub is the core feature that makes cross-server communication possible—think of
        it as an advanced &quot;group chat&quot; system that connects multiple Discord communities. When
        servers link their channels to the same hub, all messages, reactions, and interactions are
        synchronized across all connected communities. Hubs can be public (discoverable
        by everyone) or private (invitation-only), and you have complete control over creating,
        managing, and customizing your own hubs. Explore our vibrant ecosystem of community-created
        hubs using the{' '}
        <Link
          href="/hubs"
          className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-2 transition-colors duration-200"
        >
          Hub Browser
        </Link>
        ! Join thousands of communities already connected through InterChat hubs.
      </>
    ),
  },
  {
    id: 'is-interchat-free-to-use',
    title: 'Is InterChat free to use?',
    content: (
      <>
        Absolutely! InterChat is completely free and proudly open-source, developed by passionate
        community members for the entire Discord ecosystem. Our commitment to keeping InterChat free
        ensures that every community, regardless of size or budget, can benefit from enhanced
        cross-server communication. You can support our mission by contributing code, reporting
        bugs, suggesting innovative features, or becoming a GitHub sponsor. For those who want to
        show extra appreciation, consider donating through{' '}
        <Link
          href="/donate"
          className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-2 transition-colors duration-200"
        >
          Ko-Fi
        </Link>{' '}
        to help us maintain our servers, develop new features, and continue providing this free
        service to the Discord community.
      </>
    ),
  },
  {
    id: 'advanced-features',
    title: 'How do I learn more about InterChat?',
    content: (
      <>
        InterChat offers a wealth of advanced features designed to enhance your cross-server
        communication experience! From custom moderation tools and message filtering to hub
        analytics and automated welcome systems, there&apos;s always more to discover. Our comprehensive{' '}
        <Link
          href="/docs"
          className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-2 transition-colors duration-200"
        >
          documentation
        </Link>{' '}
        features step-by-step tutorials, command references, best practices guides, and
        troubleshooting resources. We&apos;ve designed our commands to be intuitive and self-explanatory,
        with helpful tips and examples built right in. Whether you&apos;re a server administrator looking
        to optimize your community&apos;s experience or a curious user wanting to explore new
        possibilities, our documentation will guide you every step of the way.
      </>
    ),
  },
  {
    id: 'moderation-safety',
    title: 'How does InterChat handle moderation and safety?',
    content: (
      <>
        Safety and moderation are top priorities for InterChat. We provide comprehensive moderation
        tools including automated spam detection, customizable word filters, user reporting systems,
        and granular permission controls. Hub moderators can manage cross-server behavior, while
        individual servers maintain full control over their local moderation policies. Our advanced
        systems monitor for malicious behavior and ensure that communities can maintain their unique
        culture while participating in the broader InterChat network. Learn more about our safety
        features and moderation best practices in our dedicated safety documentation section.
      </>
    ),
  },
];