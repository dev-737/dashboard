'use client';

import {
  ExternalLink,
  FileText,
  Heart,
  HelpCircle,
  MessageCircle,
  Shield,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Footer() {
  const footerLinks = {
    legal: [
      { label: 'Terms of Service', href: '/terms', icon: FileText },
      { label: 'Privacy Policy', href: '/privacy', icon: Shield },
      { label: 'Community Guidelines', href: '/guidelines', icon: Users },
      { label: 'Support', href: '/support', icon: HelpCircle },
    ],
    social: [
      {
        label: 'Discord Server',
        href: '/support',
        icon: MessageCircle,
        description: 'Join InterChat HQ',
      },
      {
        label: 'Twitter',
        href: 'https://twitter.com/oxaradev',
        icon: ExternalLink,
        description: '@InterChatApp',
      },
    ],
    resources: [
      {
        label: 'Documentation',
        href: 'https://docs.interchat.dev',
        icon: FileText,
      },
      {
        label: 'Status Page',
        href: 'https://status.interchat.dev',
        icon: Shield,
      },
      {
        label: 'Changelog',
        href: 'https://docs.interchat.dev/changelog',
        icon: FileText,
      },
    ],
  };

  return (
    <footer className="border-gray-800/50 border-t bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/assets/images/logos/InterChatLogo.webp"
                alt="InterChat Logo"
                height={40}
                width={40}
                className="rounded-full"
              />
              <h3 className="font-bold text-white text-xl">InterChat</h3>
            </div>
            <p className="mb-6 text-gray-400 text-sm leading-relaxed">
              Connecting Discord communities across servers. Build bridges,
              share experiences, and grow your community with InterChat&apos;s
              cross-server hub system.
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 fill-current text-red-400" />
              <span>for the Discord community</span>
            </div>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="mb-4 font-semibold text-lg text-white">
              Legal & Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 text-sm transition-colors duration-200 hover:text-white"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="mb-4 font-semibold text-lg text-white">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 text-sm transition-colors duration-200 hover:text-white"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="mb-4 font-semibold text-lg text-white">Community</h4>
            <div className="space-y-4">
              {footerLinks.social.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="flex items-center gap-3 rounded-lg border border-gray-700/50 bg-gray-800/30 p-3 transition-all duration-200 hover:border-gray-600/50 hover:bg-gray-800/50">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700/50 transition-transform duration-200 group-hover:scale-110">
                        <link.icon className="h-4 w-4 text-gray-300 group-hover:text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-white transition-colors group-hover:text-blue-300">
                          {link.label}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {link.description}
                        </div>
                      </div>
                      <ExternalLink className="ml-auto h-3 w-3 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 border-gray-800/50 border-t pt-8"
        >
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} InterChat. All rights reserved.
            </div>

            <div className="flex items-center gap-4">
              <div className="text-gray-500 text-sm">
                Version {`${process.env.NEXT_PUBLIC_VERSION}`}
              </div>
              <Button
                className="flex items-center gap-2"
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open('https://status.interchat.dev', '_blank')
                }
              >
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                <span className="text-gray-500 text-sm">
                  All systems operational
                </span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}