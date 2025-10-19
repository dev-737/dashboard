'use client';

import { ChannelType } from 'discord-api-types/v10';
import { Hash, Lock, MessageSquare, MessagesSquare } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChannelIconProps {
  type: number;
  className?: string;
  showTooltip?: boolean;
}

export function ChannelIcon({
  type,
  className = 'h-4 w-4',
  showTooltip = false,
}: ChannelIconProps) {
  let icon: React.ReactNode;
  let tooltipText = '';

  switch (type) {
    case ChannelType.GuildText:
      icon = <Hash className={className} />;
      tooltipText = 'Text Channel';
      break;
    case ChannelType.GuildAnnouncement:
      icon = <Hash className={className} />;
      tooltipText = 'Announcement Channel';
      break;
    case ChannelType.PublicThread:
      icon = <MessageSquare className={className} />;
      tooltipText = 'Public Thread';
      break;
    case ChannelType.PrivateThread:
      icon = (
        <div className="relative">
          <MessageSquare className={className} />
          <Lock className="-top-1 -right-1 absolute h-2 w-2" />
        </div>
      );
      tooltipText = 'Private Thread';
      break;
    case ChannelType.AnnouncementThread:
      icon = <MessageSquare className={className} />;
      tooltipText = 'Announcement Thread';
      break;
    case ChannelType.GuildForum:
      icon = <MessagesSquare className={className} />;
      tooltipText = 'Forum Channel';
      break;
    case ChannelType.GuildMedia:
      icon = <MessagesSquare className={className} />;
      tooltipText = 'Media Channel';
      break;
    default:
      icon = <Hash className={className} />;
      tooltipText = 'Channel';
  }

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{icon}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return icon;
}
