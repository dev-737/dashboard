import {
  Clock01Icon,
  HelpCircleIcon,
  LinkSquare02Icon,
  Shield01Icon,
  Wifi01Icon,
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';

/**
 * Beginner-friendly error message system for InterChat
 * Transforms technical errors into user-friendly messages with clear next steps
 */

interface ErrorSolution {
  id: string;
  title: string;
  description: string;
  steps: string[];
  difficulty: 'easy' | 'medium' | 'advanced';
  estimatedTime: string;
  helpLink?: string;
}

export interface BeginnerFriendlyError {
  title: string;
  description: string;
  icon: IconSvgElement;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category:
    | 'connection'
    | 'permission'
    | 'rate-limit'
    | 'network'
    | 'configuration'
    | 'discord'
    | 'unknown';
  solutions: ErrorSolution[];
  quickFix?: {
    label: string;
    action: () => void;
  };
  preventionTips?: string[];
  relatedHelp?: {
    title: string;
    link: string;
  }[];
}

/**
 * Maps technical error codes/messages to beginner-friendly explanations
 */
const ERROR_MAPPINGS: Record<string, BeginnerFriendlyError> = {
  // Permission Errors
  INSUFFICIENT_PERMISSIONS: {
    title: 'Permission Problem',
    description:
      "InterChat doesn't have the right permissions to do this action in your Discord server.",
    icon: Shield01Icon,
    severity: 'error',
    category: 'permission',
    solutions: [
      {
        id: 'check-bot-permissions',
        title: 'Check Bot Permissions',
        description:
          'Make sure InterChat has the necessary permissions in your server',
        steps: [
          'Go to your Discord server settings',
          "Click on 'Roles' in the left sidebar",
          "Find the 'InterChat' role",
          'Make sure these permissions are enabled: Manage Webhooks, Send Messages, Read Messages, Embed Links',
        ],
        difficulty: 'easy',
        estimatedTime: '2 minutes',
        helpLink: '/docs/guides/permissions',
      },
      {
        id: 'reinvite-bot',
        title: 'Re-invite the Bot',
        description: 'Sometimes re-inviting the bot fixes permission issues',
        steps: [
          'Go to the InterChat website',
          "Click 'Add to Discord'",
          'Select your server',
          'Make sure all permissions are checked',
          "Click 'Authorize'",
        ],
        difficulty: 'easy',
        estimatedTime: '1 minute',
        helpLink: '/invite',
      },
    ],
    preventionTips: [
      'Always grant all requested permissions when adding InterChat',
      'Avoid removing permissions from the InterChat role',
      'Check channel-specific permission overrides',
    ],
    relatedHelp: [
      { title: 'Permission Guide', link: '/docs/guides/permissions' },
      { title: 'Bot Setup', link: '/docs/getting-started' },
    ],
  },

  // Rate Limit Errors
  RATE_LIMITED: {
    title: 'Too Many Requests',
    description:
      'Discord is asking us to slow down to keep the service stable for everyone.',
    icon: Clock01Icon,
    severity: 'warning',
    category: 'rate-limit',
    solutions: [
      {
        id: 'wait-and-retry',
        title: 'Wait and Try Again',
        description: 'The easiest solution is to wait a moment and try again',
        steps: [
          'Wait 1-2 minutes',
          'Try your action again',
          "If it still doesn't work, wait a bit longer",
        ],
        difficulty: 'easy',
        estimatedTime: '2 minutes',
      },
    ],
    preventionTips: [
      'Avoid rapid-fire commands or actions',
      'This is normal during peak usage times',
      'Rate limits help keep Discord stable for everyone',
    ],
    relatedHelp: [
      { title: 'Understanding Rate Limits', link: '/docs/faq#rate-limits' },
    ],
  },

  // Connection Errors
  CONNECTION_FAILED: {
    title: 'Connection Problem',
    description:
      "We couldn't connect your channel to the hub. This usually happens due to setup issues.",
    icon: Wifi01Icon,
    severity: 'error',
    category: 'connection',
    solutions: [
      {
        id: 'check-channel-permissions',
        title: 'Check Channel Permissions',
        description: 'Make sure InterChat can access your channel',
        steps: [
          'Right-click on your channel',
          "Select 'Edit Channel'",
          "Go to 'Permissions'",
          "Make sure InterChat can 'View Channel', 'Send Messages', and 'Manage Webhooks'",
        ],
        difficulty: 'easy',
        estimatedTime: '3 minutes',
      },
      {
        id: 'try-different-channel',
        title: 'Try a Different Channel',
        description: 'Some channels have special restrictions',
        steps: [
          'Create a new text channel',
          "Make sure it's a regular text channel (not announcement, forum, etc.)",
          'Try connecting this new channel instead',
        ],
        difficulty: 'easy',
        estimatedTime: '2 minutes',
      },
    ],
    preventionTips: [
      'Use regular text channels for connections',
      'Avoid channels with special restrictions',
      "Make sure the channel isn't read-only",
    ],
    relatedHelp: [
      { title: 'Connection Guide', link: '/docs/guides/connections' },
      { title: 'Channel Setup', link: '/docs/guides/channel-setup' },
    ],
  },

  // Discord API Errors
  DISCORD_API_ERROR: {
    title: 'Discord Service Issue',
    description:
      "Discord's servers are having problems right now. This isn't something you did wrong.",
    icon: LinkSquare02Icon,
    severity: 'warning',
    category: 'discord',
    solutions: [
      {
        id: 'check-discord-status',
        title: 'Check Discord Status',
        description: 'See if Discord is having widespread issues',
        steps: [
          'Visit discordstatus.com',
          'Check if there are any ongoing incidents',
          'Wait for Discord to resolve the issue',
        ],
        difficulty: 'easy',
        estimatedTime: '1 minute',
        helpLink: 'https://discordstatus.com',
      },
      {
        id: 'try-again-later',
        title: 'Try Again Later',
        description: 'Discord issues usually resolve themselves quickly',
        steps: [
          'Wait 5-10 minutes',
          'Try your action again',
          "If it still doesn't work, check Discord status again",
        ],
        difficulty: 'easy',
        estimatedTime: '10 minutes',
      },
    ],
    preventionTips: [
      'Discord outages are rare but do happen',
      'These issues are always temporary',
      'No action needed on your part',
    ],
    relatedHelp: [
      { title: 'Discord Status', link: 'https://discordstatus.com' },
    ],
  },

  // Network Errors
  NETWORK_ERROR: {
    title: 'Connection Timeout',
    description:
      "We couldn't reach Discord's servers. This might be a temporary network issue.",
    icon: Wifi01Icon,
    severity: 'warning',
    category: 'network',
    solutions: [
      {
        id: 'refresh-page',
        title: 'Refresh the Page',
        description: 'A simple refresh often fixes temporary connection issues',
        steps: [
          'Press F5 or Ctrl+R (Cmd+R on Mac)',
          'Wait for the page to load completely',
          'Try your action again',
        ],
        difficulty: 'easy',
        estimatedTime: '30 seconds',
      },
      {
        id: 'check-internet',
        title: 'Check Your Internet',
        description: 'Make sure your internet connection is working',
        steps: [
          'Try visiting another website',
          'Check if Discord itself is working',
          "If other sites don't work, contact your internet provider",
        ],
        difficulty: 'easy',
        estimatedTime: '2 minutes',
      },
    ],
    preventionTips: [
      'Network issues are usually temporary',
      'Try refreshing before trying complex solutions',
    ],
  },

  // Unknown Errors
  UNKNOWN_ERROR: {
    title: 'Something Went Wrong',
    description:
      "We encountered an unexpected problem. Don't worry - this helps us improve InterChat!",
    icon: HelpCircleIcon,
    severity: 'error',
    category: 'unknown',
    solutions: [
      {
        id: 'try-again',
        title: 'Try Again',
        description: 'Many issues resolve themselves on retry',
        steps: [
          'Wait a moment',
          'Try the same action again',
          'If it works, great! If not, try the next solution',
        ],
        difficulty: 'easy',
        estimatedTime: '1 minute',
      },
      {
        id: 'refresh-and-retry',
        title: 'Refresh and Retry',
        description: 'A fresh start often helps',
        steps: [
          'Refresh the page (F5 or Ctrl+R)',
          'Wait for everything to load',
          'Try your action again',
        ],
        difficulty: 'easy',
        estimatedTime: '1 minute',
      },
      {
        id: 'contact-support',
        title: 'Contact Support',
        description: "If the problem persists, we're here to help",
        steps: [
          'Join our support server: discord.gg/cgYgC6YZyX',
          'Describe what you were trying to do',
          'Include any error messages you saw',
          'Our team will help you resolve the issue',
        ],
        difficulty: 'easy',
        estimatedTime: '5 minutes',
        helpLink: 'https://discord.gg/cgYgC6YZyX',
      },
    ],
    preventionTips: [
      'These errors help us improve InterChat',
      'Most issues are temporary and resolve quickly',
    ],
    relatedHelp: [
      { title: 'Support Server', link: 'https://discord.gg/cgYgC6YZyX' },
      { title: 'Troubleshooting Guide', link: '/docs/guides/troubleshooting' },
    ],
  },
};

/**
 * Converts technical error messages to beginner-friendly ones
 */
export function getBeginnerFriendlyError(
  error: Error | string | unknown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context?: {
    action?: string;
    component?: string;
    userId?: string;
  }
): BeginnerFriendlyError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorLower = errorMessage.toLowerCase();

  // Check for specific error patterns
  if (
    errorLower.includes('permission') ||
    errorLower.includes('403') ||
    errorLower.includes('unauthorized')
  ) {
    return ERROR_MAPPINGS.INSUFFICIENT_PERMISSIONS;
  }

  if (
    errorLower.includes('rate limit') ||
    errorLower.includes('429') ||
    errorLower.includes('too many requests')
  ) {
    return ERROR_MAPPINGS.RATE_LIMITED;
  }

  if (
    errorLower.includes('connection') ||
    errorLower.includes('webhook') ||
    errorLower.includes('channel')
  ) {
    return ERROR_MAPPINGS.CONNECTION_FAILED;
  }

  if (
    errorLower.includes('discord api') ||
    errorLower.includes('502') ||
    errorLower.includes('503')
  ) {
    return ERROR_MAPPINGS.DISCORD_API_ERROR;
  }

  if (
    errorLower.includes('network') ||
    errorLower.includes('timeout') ||
    errorLower.includes('fetch')
  ) {
    return ERROR_MAPPINGS.NETWORK_ERROR;
  }

  // Default to unknown error
  return ERROR_MAPPINGS.UNKNOWN_ERROR;
}
