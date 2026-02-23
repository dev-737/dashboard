'use client';

import {
  Message02Icon,
  PlusSignCircleIcon,
  Shield01Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';

import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AnimatedEmptyStateProps {
  type: 'owned' | 'managed' | 'moderated';
}

export function AnimatedEmptyState({ type }: AnimatedEmptyStateProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const getContent = () => {
    switch (type) {
      case 'owned':
        return {
          title: 'No Owned Hubs',
          description:
            "You don't own any hubs yet. Create your first hub to get started.",
          message:
            "As a hub owner, you'll have full control over settings, members, and connections.",
          icon: (
            <HugeiconsIcon
              icon={Message02Icon}
              className="h-16 w-16 text-purple-400"
            />
          ),
          showButton: true,
        };
      case 'managed':
        return {
          title: 'No Managed Hubs',
          description: "You don't manage any hubs yet.",
          message:
            'Hub owners can assign you as a manager to help with hub administration.',
          icon: (
            <HugeiconsIcon
              icon={Shield01Icon}
              className="h-16 w-16 text-blue-400"
            />
          ),
          showButton: false,
        };
      case 'moderated':
        return {
          title: 'No Moderated Hubs',
          description: "You don't moderate any hubs yet.",
          message:
            'Hub owners can assign you as a moderator to help with content moderation.',
          icon: (
            <HugeiconsIcon
              icon={UserMultipleIcon}
              className="h-16 w-16 text-indigo-400"
            />
          ),
          showButton: false,
        };
      default:
        return {
          title: 'No Hubs',
          description: "You don't have any hubs yet.",
          message: 'Create your first hub to get started.',
          icon: (
            <HugeiconsIcon
              icon={Message02Icon}
              className="h-16 w-16 text-gray-400"
            />
          ),
          showButton: true,
        };
    }
  };

  const content = getContent();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="rounded-2xl border-gray-800/50 bg-transparent backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center pb-2 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={
              inView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }
            }
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4 rounded-full border border-purple-500/20 bg-linear-to-br from-purple-500/10 to-blue-500/10 p-4"
          >
            {content.icon}
          </motion.div>
          <CardTitle className="text-white text-xl">{content.title}</CardTitle>
          <CardDescription className="text-gray-400">
            {content.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-gray-400">{content.message}</p>
          {content.showButton && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={
                inView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }
              }
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                asChild
                className="btn-primary border-none bg-linear-to-r text-white"
              >
                <Link href="/dashboard/hubs/create">
                  <HugeiconsIcon
                    icon={PlusSignCircleIcon}
                    className="mr-2 h-4 w-4"
                  />
                  Create Hub
                </Link>
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
