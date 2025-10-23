import {
  BlockWordAction,
  type PatternMatchType,
} from '@/lib/generated/prisma/client';

export enum MatchPattern {
  EXACT = 'EXACT',
  PREFIX = 'PREFIX',
  SUFFIX = 'SUFFIX',
  WILDCARD = 'WILDCARD',
}

export interface AntiSwearPattern {
  id?: string;
  pattern: string;
  matchType?: PatternMatchType;
}

export interface AntiSwearRule {
  id: string;
  name: string;
  patterns: AntiSwearPattern[];
  actions: BlockWordAction[];
  enabled?: boolean;
  muteDurationMinutes?: number | null;
}

export interface AntiSwearWhitelistItem {
  id: string;
  word: string;
  reason?: string | null;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string | null;
  };
}

export const BlockWordActionLabels: Record<BlockWordAction, string> = {
  [BlockWordAction.BLOCK_MESSAGE]: 'Block Message',
  [BlockWordAction.BLACKLIST]: 'Blacklist User',
  [BlockWordAction.SEND_ALERT]: 'Send Alert to Moderators',
  [BlockWordAction.WARN]: 'Warn User',
  [BlockWordAction.MUTE]: 'Mute User',
  [BlockWordAction.BAN]: 'Ban User Permanently',
};

export const BlockWordActionDescriptions: Record<BlockWordAction, string> = {
  [BlockWordAction.BLOCK_MESSAGE]: 'Prevents the message from being sent',
  [BlockWordAction.BLACKLIST]: 'Legacy action - use Ban instead',
  [BlockWordAction.SEND_ALERT]: 'Notifies moderators but allows the message',
  [BlockWordAction.WARN]: 'Sends a warning to the user',
  [BlockWordAction.MUTE]:
    'Temporarily mutes the user for the specified duration',
  [BlockWordAction.BAN]: 'Permanently bans the user from the hub',
};

export const BlockWordActionColors: Record<BlockWordAction, string> = {
  [BlockWordAction.BLOCK_MESSAGE]:
    'bg-blue-500/20 text-blue-400 border-blue-500/30',
  [BlockWordAction.BLACKLIST]:
    'bg-gray-500/20 text-gray-400 border-gray-500/30',
  [BlockWordAction.SEND_ALERT]:
    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [BlockWordAction.WARN]:
    'bg-orange-500/20 text-orange-400 border-orange-500/30',
  [BlockWordAction.MUTE]:
    'bg-purple-500/20 text-purple-400 border-purple-500/30',
  [BlockWordAction.BAN]: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const MatchPatternLabels: Record<MatchPattern, string> = {
  [MatchPattern.EXACT]: 'Exact Match',
  [MatchPattern.PREFIX]: 'Starts With',
  [MatchPattern.SUFFIX]: 'Ends With',
  [MatchPattern.WILDCARD]: 'Contains',
};

export const MatchPatternDescriptions: Record<MatchPattern, string> = {
  [MatchPattern.EXACT]: 'Matches only the exact word',
  [MatchPattern.PREFIX]: 'Matches words that start with this pattern',
  [MatchPattern.SUFFIX]: 'Matches words that end with this pattern',
  [MatchPattern.WILDCARD]: 'Matches words that contain this pattern anywhere',
};

export const MatchPatternExamples: Record<MatchPattern, string> = {
  [MatchPattern.EXACT]: '"bad" matches only "bad"',
  [MatchPattern.PREFIX]: '"bad" matches "bad", "badly", "badness"',
  [MatchPattern.SUFFIX]: '"bad" matches "bad", "reallybad", "toobad"',
  [MatchPattern.WILDCARD]:
    '"bad" matches "bad", "badly", "reallybad", "badness"',
};

export function patternMatchTypeToMatchPattern(
  type: PatternMatchType
): MatchPattern {
  switch (type) {
    case 'EXACT':
      return MatchPattern.EXACT;
    case 'PREFIX':
      return MatchPattern.PREFIX;
    case 'SUFFIX':
      return MatchPattern.SUFFIX;
    case 'WILDCARD':
      return MatchPattern.WILDCARD;
    default:
      return MatchPattern.EXACT;
  }
}

export function matchPatternToPatternMatchType(
  pattern: MatchPattern
): PatternMatchType {
  switch (pattern) {
    case MatchPattern.EXACT:
      return 'EXACT';
    case MatchPattern.PREFIX:
      return 'PREFIX';
    case MatchPattern.SUFFIX:
      return 'SUFFIX';
    case MatchPattern.WILDCARD:
      return 'WILDCARD';
    default:
      return 'EXACT';
  }
}

export function formatWordWithPattern(
  word: string,
  pattern: MatchPattern
): string {
  switch (pattern) {
    case MatchPattern.EXACT:
      return word;
    case MatchPattern.PREFIX:
      return `${word}*`;
    case MatchPattern.SUFFIX:
      return `*${word}`;
    case MatchPattern.WILDCARD:
      return `*${word}*`;
  }
}

export function parseWordPattern(storedWord: string): {
  word: string;
  pattern: MatchPattern;
} {
  if (storedWord.startsWith('*') && storedWord.endsWith('*')) {
    return {
      word: storedWord.slice(1, -1),
      pattern: MatchPattern.WILDCARD,
    };
  }

  if (storedWord.startsWith('*')) {
    return {
      word: storedWord.slice(1),
      pattern: MatchPattern.SUFFIX,
    };
  }

  if (storedWord.endsWith('*')) {
    return {
      word: storedWord.slice(0, -1),
      pattern: MatchPattern.PREFIX,
    };
  }

  return {
    word: storedWord,
    pattern: MatchPattern.EXACT,
  };
}

export function stringToPattern(
  pattern: string,
  matchType?: PatternMatchType
): AntiSwearPattern {
  return {
    pattern,
    matchType: matchType || 'EXACT',
  };
}

export function wordAndMatchPatternToPattern(
  word: string,
  matchPattern: MatchPattern
): AntiSwearPattern {
  return {
    pattern: formatWordWithPattern(word, matchPattern),
    matchType: matchPatternToPatternMatchType(matchPattern),
  };
}

export function patternToDisplayString(pattern: AntiSwearPattern): string {
  return pattern.pattern;
}

export function getMatchPatternFromPattern(
  pattern: AntiSwearPattern
): MatchPattern {
  if (pattern.matchType) {
    return patternMatchTypeToMatchPattern(pattern.matchType);
  }
  const { pattern: matchPattern } = parseWordPattern(pattern.pattern);
  return matchPattern;
}

export const RULE_TEMPLATES = {
  PROFANITY: {
    name: 'Profanity Filter',
    actions: [
      BlockWordAction.BLOCK_MESSAGE,
      BlockWordAction.WARN,
    ] as BlockWordAction[],
    description: 'Blocks common profanity and warns users',
  },
  HARASSMENT: {
    name: 'Anti-Harassment',
    actions: [
      BlockWordAction.BLOCK_MESSAGE,
      BlockWordAction.MUTE,
    ] as BlockWordAction[],
    description: 'Blocks harassment terms and mutes users',
  },
  SPAM: {
    name: 'Spam Prevention',
    actions: [
      BlockWordAction.BLOCK_MESSAGE,
      BlockWordAction.SEND_ALERT,
    ] as BlockWordAction[],
    description: 'Detects and blocks spam content',
  },
  ZERO_TOLERANCE: {
    name: 'Zero Tolerance',
    actions: [
      BlockWordAction.BLOCK_MESSAGE,
      BlockWordAction.BAN,
    ] as BlockWordAction[],
    description: 'Blocks serious violations and bans users immediately',
  },
} as const;
