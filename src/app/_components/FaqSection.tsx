'use client';

import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  readonly title: string;
  readonly content: React.ReactNode;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly index: number;
}

function AccordionItem({
  title,
  content,
  isOpen,
  onToggle,
  index,
}: AccordionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <div
        className={cn(
          'rounded-(--radius) border border-gray-700/60 bg-gray-800/60',
          'shadow-lg backdrop-blur-xl transition-all duration-200',
          'hover:border-gray-600/70 hover:bg-gray-800/80 hover:shadow-xl'
        )}
      >
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-between rounded-(--radius) p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <h3 className="pr-4 font-semibold text-lg text-white">{title}</h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-gray-300" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-gray-700/50 border-t px-6 pt-4 pb-6 text-gray-300">
                {content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-gray-950 via-gray-900 to-gray-950 py-20 md:py-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/3 h-80 w-80 rounded-full bg-primary-alt/8 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-(--radius-button) border border-gray-700/60 bg-linear-to-r from-gray-800/60 to-gray-800/40 px-4 py-2 text-gray-300 text-sm shadow-lg backdrop-blur-xl">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            <span className="font-semibold tracking-wide">
              Frequently Asked Questions
            </span>
          </div>

          <h2 className="mb-6 font-bold text-4xl text-white tracking-tight md:text-5xl">
            Quick answers about{' '}
            <span className="bg-linear-to-r from-primary via-primary-alt to-primary bg-clip-text text-transparent">
              InterChat
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-gray-300 text-lg">
            Everything you need to know to get started.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-4xl space-y-4"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.id}
              title={faq.title}
              content={faq.content}
              isOpen={openIndex === index}
              onToggle={() => toggleAccordion(index)}
              index={index}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <Button
            variant="outline"
            className="border-gray-600/70 bg-gray-800/60 text-gray-300 shadow-lg backdrop-blur-xl transition-all duration-200 hover:border-gray-500/70 hover:bg-gray-800/80 hover:text-white"
            asChild
          >
            <Link
              href="https://docs.interchat.dev"
              className="flex items-center gap-2"
            >
              View Documentation
              <ArrowRight className="h-4 w-4" />
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
        InterChat is a Discord bot that makes chatting across servers easy. It
        lets you link channels in your server to “hubs,” which are groups of
        servers where messages flow between them. Basically, it’s like expanding
        your community beyond your own server so you can talk and collaborate
        with other communities easily.
      </>
    ),
  },
  {
    id: 'how-do-i-get-started',
    title: 'How do I get started with InterChat?',
    content: (
      <>
        Getting started is simple. Invite InterChat to your server, then use the{' '}
        <code className="rounded bg-gray-700/60 px-2 py-1 text-primary">
          /setup
        </code>{' '}
        command to connect a channel to an existing hub or create a new one.
        That’s it—you’ll be chatting with other communities in minutes! For
        detailed instructions and advanced options, check out our{' '}
        <Link
          href="https://docs.interchat.dev"
          className="font-medium text-primary underline underline-offset-2 transition-colors duration-200 hover:text-primary-alt"
        >
          documentation
        </Link>
        .
      </>
    ),
  },
  {
    id: 'what-is-a-hub',
    title: 'What is an InterChat hub?',
    content: (
      <>
        A hub is basically a group chat that connects multiple servers. When you
        link your channel to a hub, messages and reactions are shared across all
        connected servers. Hubs can be public or private, and you can manage
        them however you want. Want to see what hubs are out there? Check out
        our{' '}
        <Link
          href="/hubs"
          className="font-medium text-primary underline underline-offset-2 transition-colors duration-200 hover:text-primary-alt"
        >
          Hub Browser
        </Link>
        .
      </>
    ),
  },
  {
    id: 'is-interchat-free-to-use',
    title: 'Is InterChat free to use?',
    content: (
      <>
        Yes! InterChat is completely free. Anyone can use it, no matter the
        server size.
      </>
    ),
  },
  {
    id: 'advanced-features',
    title: 'How do I learn more about InterChat?',
    content: (
      <>
        InterChat has lots of features beyond basic chat: moderation tools, hub
        analytics, automated welcomes, and more. All of it is explained
        step-by-step in our{' '}
        <Link
          href="https://docs.interchat.dev"
          className="font-medium text-primary underline underline-offset-2 transition-colors duration-200 hover:text-primary-alt"
        >
          documentation
        </Link>
        , with tips and examples built in. Whether you’re running a server or
        just curious, it’s all there.
      </>
    ),
  },
  {
    id: 'moderation-safety',
    title: 'How does InterChat handle moderation and safety?',
    content: (
      <>
        Safety comes first. InterChat includes spam detection, word filters,
        reporting tools, and permission controls. Hub moderators can manage
        cross-server behavior, and servers keep control over their own rules.
        Our systems watch for bad behavior so communities can stay safe while
        still connecting with others.
      </>
    ),
  },
];
