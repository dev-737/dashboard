'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { DiscordMessage } from './DiscordMessage';
import { DiscordServerCard } from './DiscordServerCard';
import { SquigglyConnectionLine } from './SquigglyConnectionLine';

const MESSAGE_CONTENT = 'Hey everyone! 👋 Check out this awesome feature!';
const SOURCE_SERVER = 'Gaming Server';

const DESTINATION_SERVERS = [
  { name: 'Art Community', avatar: 'A' },
  { name: 'Dev Team', avatar: 'D' },
  { name: 'Music Lovers', avatar: 'M' },
];

const channelNames = ['portal-into-discords', 'general', 'global'];

export function HeroAnimation() {
  const { data: session } = authClient.useSession();
  const [showSourceMessage, setShowSourceMessage] = useState(false);
  const [activeConnections, setActiveConnections] = useState<number[]>([]);
  const [showDestMessages, setShowDestMessages] = useState<number[]>([]);

  const sourceCardRef = useRef<HTMLDivElement>(null);
  const destCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const username = session?.user?.name || 'Alex';
  const avatarUrl = session?.user?.image;

  useEffect(() => {
    const timeline = [
      {
        time: 500,
        action: () => {
          setShowSourceMessage(true);
        },
      },
      {
        time: 1500,
        action: () => {
          setActiveConnections([0]);
        },
      },
      {
        time: 2500,
        action: () => {
          setShowDestMessages([0]);
        },
      },
      {
        time: 3000,
        action: () => {
          setActiveConnections((prev) => [...prev, 1]);
        },
      },
      {
        time: 4000,
        action: () => {
          setShowDestMessages((prev) => [...prev, 1]);
        },
      },
      {
        time: 4500,
        action: () => {
          setActiveConnections((prev) => [...prev, 2]);
        },
      },
      {
        time: 5500,
        action: () => {
          setShowDestMessages((prev) => [...prev, 2]);
        },
      },
    ];

    const timeouts = timeline.map(({ time, action }) =>
      setTimeout(action, time)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl border border-gray-800/60 bg-linear-to-br from-gray-900/95 via-gray-900/90 to-gray-950/95 p-8 shadow-2xl backdrop-blur-xl lg:p-12"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary-alt/5" />

        <motion.div
          className="relative grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center lg:justify-end">
            <div ref={sourceCardRef} className="w-full max-w-sm">
              <DiscordServerCard
                serverName={SOURCE_SERVER}
                channelName="cross-chat"
                isActive={activeConnections.length > 0}
              >
                <AnimatePresence>
                  {showSourceMessage && (
                    <DiscordMessage
                      username={username}
                      content={MESSAGE_CONTENT}
                      avatarUrl={avatarUrl}
                    />
                  )}
                </AnimatePresence>
              </DiscordServerCard>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {DESTINATION_SERVERS.map((server, index) => (
              <div
                key={server.name}
                ref={(el) => {
                  destCardRefs.current[index] = el;
                }}
                className="w-full max-w-sm"
              >
                <DiscordServerCard
                  serverName={server.name}
                  channelName={channelNames[index]}
                  isActive={showDestMessages.includes(index)}
                >
                  <AnimatePresence>
                    {showDestMessages.includes(index) && (
                      <DiscordMessage
                        username={username}
                        content={MESSAGE_CONTENT}
                        fromServer={SOURCE_SERVER}
                        avatarUrl={avatarUrl}
                      />
                    )}
                  </AnimatePresence>
                </DiscordServerCard>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <AnimatePresence>
              {activeConnections.map((connIndex) => {
                const sourceCard = sourceCardRef.current;
                const destCard = destCardRefs.current[connIndex];

                if (!sourceCard || !destCard) return null;

                const containerRect =
                  sourceCard.parentElement?.parentElement?.getBoundingClientRect();
                const sourceRect = sourceCard.getBoundingClientRect();
                const destRect = destCard.getBoundingClientRect();

                if (!containerRect) return null;

                const startX =
                  ((sourceRect.right - containerRect.left) /
                    containerRect.width) *
                  100;
                const startY =
                  ((sourceRect.top +
                    sourceRect.height / 2 -
                    containerRect.top) /
                    containerRect.height) *
                  100;
                const endX =
                  ((destRect.left - containerRect.left) / containerRect.width) *
                  100;
                const endY =
                  ((destRect.top + destRect.height / 2 - containerRect.top) /
                    containerRect.height) *
                  100;

                return (
                  <SquigglyConnectionLine
                    key={connIndex}
                    startX={startX}
                    startY={startY}
                    endX={endX}
                    endY={endY}
                    delay={0}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
      <div className="relative mt-8 flex items-center justify-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-linear-to-r from-gray-400 to-gray-500 bg-clip-text font-medium text-sm text-transparent"
        >
          An example of how InterChat bridges messages to-and-from discord
          servers part of the same{' '}
          <Link href="/discover" className="text-primary">
            hub
          </Link>
          .
        </motion.h2>
      </div>
    </div>
  );
}
