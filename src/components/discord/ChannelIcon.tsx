'use client';

import {
  HashtagIcon,
  LockIcon,
  Message02Icon,
  MessageMultiple01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { ChannelType } from 'discord-api-types/v10';
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
      icon = (
        <HugeiconsIcon
          strokeWidth={3}
          icon={HashtagIcon}
          className={className}
        />
      );
      tooltipText = 'Text Channel';
      break;
    case ChannelType.GuildAnnouncement:
      icon = (
        <HugeiconsIcon
          strokeWidth={3}
          icon={HashtagIcon}
          className={className}
        />
      );
      tooltipText = 'Announcement Channel';
      break;
    case ChannelType.PublicThread:
      icon = (
        <HugeiconsIcon
          strokeWidth={3}
          icon={Message02Icon}
          className={className}
        />
      );
      tooltipText = 'Public Thread';
      break;
    case ChannelType.PrivateThread:
      icon = (
        <div className="relative">
          <HugeiconsIcon
            strokeWidth={3}
            icon={Message02Icon}
            className={className}
          />
          <HugeiconsIcon
            icon={LockIcon}
            className="absolute -top-1 -right-1 h-2 w-2"
          />
        </div>
      );
      tooltipText = 'Private Thread';
      break;
    case ChannelType.AnnouncementThread:
      icon = (
        <HugeiconsIcon
          strokeWidth={3}
          icon={Message02Icon}
          className={className}
        />
      );
      tooltipText = 'Announcement Thread';
      break;
    case ChannelType.GuildForum:
      icon = (
        <HugeiconsIcon
          strokeWidth={3}
          icon={MessageMultiple01Icon}
          className={className}
        />
      );
      tooltipText = 'Forum Channel';
      break;
    case ChannelType.GuildMedia:
      icon = (
        <HugeiconsIcon
          strokeWidth={3}
          icon={MessageMultiple01Icon}
          className={className}
        />
      );
      tooltipText = 'Media Channel';
      break;
    default:
      icon = (
        <HugeiconsIcon
          strokeWidth={3}
          icon={HashtagIcon}
          className={className}
        />
      );
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
