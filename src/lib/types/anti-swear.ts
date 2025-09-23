import { BlockWordAction } from '@/lib/generated/prisma/client';

export enum MatchPattern {
  EXACT = 'exact',
  PREFIX = 'prefix',
  SUFFIX = 'suffix',
  SUBSTRING = 'substring',
}

export interface AntiSwearPattern {
  id?: string;
  pattern: string;
}

export interface AntiSwearRule {
  id: string;
  name: string;
  patterns: AntiSwearPattern[];
  actions: BlockWordAction[];
}

export const BlockWordActionLabels: Record<BlockWordAction, string> = {
  [BlockWordAction.BLOCK_MESSAGE]: 'Block Message',
  [BlockWordAction.BLACKLIST]: 'Blacklist User (Deprecated, use Ban instead.)',
  [BlockWordAction.SEND_ALERT]: 'Send Alert',
  [BlockWordAction.WARN]: 'Warn User',
  [BlockWordAction.MUTE]: 'Mute User',
  [BlockWordAction.BAN]: 'Ban User Permanently',
};

export const MatchPatternLabels: Record<MatchPattern, string> = {
  [MatchPattern.EXACT]: 'Exact Match',
  [MatchPattern.PREFIX]: 'Starts With',
  [MatchPattern.SUFFIX]: 'Ends With',
  [MatchPattern.SUBSTRING]: 'Contains',
};

export const MatchPatternDescriptions: Record<MatchPattern, string> = {
  [MatchPattern.EXACT]: 'Matches only the exact word',
  [MatchPattern.PREFIX]: 'Matches words that start with this pattern',
  [MatchPattern.SUFFIX]: 'Matches words that end with this pattern',
  [MatchPattern.SUBSTRING]: 'Matches words that contain this pattern',
};

export const MatchPatternExamples: Record<MatchPattern, string> = {
  [MatchPattern.EXACT]: '"bad" matches only "bad"',
  [MatchPattern.PREFIX]: '"bad*" matches "bad", "badly", "badness"',
  [MatchPattern.SUFFIX]: '"*bad" matches "bad", "reallybad", "toobad"',
  [MatchPattern.SUBSTRING]:
    '"*bad*" matches "bad", "badly", "reallybad", "badness"',
};

// Helper function to convert a word and pattern to the stored format
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
    case MatchPattern.SUBSTRING:
      return `*${word}*`;
  }
}

// Helper function to parse a stored word into its pattern and base word
export function parseWordPattern(storedWord: string): {
  word: string;
  pattern: MatchPattern;
} {
  if (storedWord.startsWith('*') && storedWord.endsWith('*')) {
    return {
      word: storedWord.slice(1, -1),
      pattern: MatchPattern.SUBSTRING,
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

// Convert a pattern string to an AntiSwearPattern object
export function stringToPattern(pattern: string): AntiSwearPattern {
  return {
    pattern,
  };
}

// Convert a word and match pattern to an AntiSwearPattern object
export function wordAndMatchPatternToPattern(
  word: string,
  matchPattern: MatchPattern
): AntiSwearPattern {
  return {
    pattern: formatWordWithPattern(word, matchPattern),
  };
}

// Convert an AntiSwearPattern to a display string
export function patternToDisplayString(pattern: AntiSwearPattern): string {
  return pattern.pattern;
}

// Get the match pattern from an AntiSwearPattern
export function getMatchPatternFromPattern(
  pattern: AntiSwearPattern
): MatchPattern {
  const { pattern: matchPattern } = parseWordPattern(pattern.pattern);
  return matchPattern;
}
