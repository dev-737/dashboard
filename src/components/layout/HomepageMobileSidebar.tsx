'use client';

import {
  ArrowRightIcon,
  Cancel01Icon,
  LinkSquare02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { AnimatePresence, motion, type Variants } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

interface HomepageMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | undefined;
  links: {
    text: string;
    url: string;
    external?: boolean;
  }[];
}

export function HomepageMobileSidebar({
  isOpen,
  onClose,
  user,
  links,
}: HomepageMobileSidebarProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Only mount the portal on the client side
  useEffect(() => {
    setMounted(true);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const sidebarVariants: Variants = {
    closed: {
      x: '100%', // Slide in from right
      opacity: 0.5,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-9998 bg-[#030812]/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed top-0 right-0 bottom-0 z-9999 flex w-[320px] max-w-[85vw] flex-col overflow-hidden border-white/5 border-l bg-[#030812] shadow-2xl"
          >
            {/* Header */}
            <div className="relative flex h-20 shrink-0 items-center justify-between px-6">
              <div className="absolute inset-0 bg-linear-to-b from-purple-500/5 to-transparent opacity-50" />
              <Link
                href="/"
                className="group relative flex items-center gap-3"
                onClick={onClose}
              >
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-purple-500/10 to-blue-500/10 ring-1 ring-white/10 transition-transform duration-500 group-hover:rotate-12">
                  <Image
                    src="/assets/images/logos/interchat.png"
                    alt="InterChat"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <span className="bg-linear-to-r from-white via-white to-gray-400 bg-clip-text font-bold text-lg text-transparent tracking-tight">
                  InterChat
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="relative z-10 h-8 w-8 rounded-full text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <nav className="space-y-2">
                {links.map((link) => (
                  <motion.div key={link.url} variants={itemVariants}>
                    <Link
                      href={link.url}
                      onClick={onClose}
                      className={cn(
                        'group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3.5 transition-all duration-300',
                        pathname === link.url
                          ? 'bg-white/3 text-white shadow-inner'
                          : 'text-gray-400 hover:bg-white/2 hover:text-gray-200'
                      )}
                    >
                      {pathname === link.url && (
                        <div className="absolute top-1.5 bottom-1.5 left-0 w-1 rounded-full bg-linear-to-b from-purple-500 to-blue-500" />
                      )}

                      <span className="truncate font-medium text-sm">
                        {link.text}
                      </span>
                      {link.external && (
                        <HugeiconsIcon
                          icon={LinkSquare02Icon}
                          className="ml-auto h-3.5 w-3.5 opacity-50 transition-opacity duration-300 group-hover:opacity-100"
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                variants={itemVariants}
                className="mt-8 space-y-4 border-white/5 border-t pt-8"
              >
                <div className="group relative">
                  <div className="absolute inset-0 rounded-xl bg-linear-to-r from-purple-500/20 to-blue-500/20 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
                  <Button
                    asChild
                    className="btn-primary relative w-full border border-white/10 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/20"
                  >
                    <Link
                      href="/invite"
                      className="group/btn flex items-center justify-center gap-2"
                      onClick={onClose}
                    >
                      Invite Bot
                      <HugeiconsIcon
                        icon={ArrowRightIcon}
                        className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                      />
                    </Link>
                  </Button>
                </div>

                {!user && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-white/10 bg-white/5 text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                      onClick={onClose}
                    >
                      Login
                    </Link>
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
