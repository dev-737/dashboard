import { ChevronDown, Hash, Users } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface DiscordServerCardProps {
  serverName: string;
  channelName: string;
  children?: ReactNode;
  isActive?: boolean;
}

export function DiscordServerCard({
  serverName,
  channelName,
  children,
  isActive = false,
}: DiscordServerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.5 }}
      className="group relative w-full overflow-hidden rounded-lg bg-[#36393f] shadow-2xl"
      style={{ boxShadow: '0 8px 16px rgba(0, 0, 0, 0.24)' }}
    >
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-primary-alt/10"
        />
      )}

      <div className="flex h-12 items-center justify-between border-[#202225] border-b bg-[#2f3136] px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-white">{serverName}</span>
          <ChevronDown className="h-4 w-4 text-[#b9bbbe]" />
        </div>
      </div>

      <div className="flex">
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-[#202225] border-b bg-[#36393f] px-3 py-2">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-[#b9bbbe]" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-white">
                  {channelName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#b9bbbe]" />
            </div>
          </div>

          <div className="min-h-[140px] space-y-2 bg-[#36393f] p-3">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
