import { motion } from 'motion/react';

interface DiscordMessageProps {
  username: string;
  content: string;
  fromServer?: string;
  delay?: number;
  avatarUrl?: string | null;
}

export function DiscordMessage({
  username,
  content,
  fromServer,
  delay = 0,
  avatarUrl,
}: DiscordMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex gap-3 rounded-lg bg-gray-800/60 p-3 backdrop-blur-sm"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className="h-10 w-10 flex-shrink-0 rounded-full"
        />
      ) : (
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-linear-to-br from-primary to-primary-alt" />
      )}
      <div className="flex-1 text-left">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-semibold text-sm text-white">{username}</span>
          {fromServer && (
            <span className="rounded bg-primary/20 px-1.5 py-0.5 font-medium text-primary text-xs">
              From {fromServer}
            </span>
          )}
          <span className="text-gray-500 text-xs">just now</span>
        </div>
        <p className="text-left text-gray-300 text-sm">{content}</p>
      </div>
    </motion.div>
  );
}
