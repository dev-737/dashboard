import { HubActivityLevel } from '@/lib/generated/prisma/client';

export { HubActivityLevel as ActivityLevel } from '@/lib/generated/prisma/client';

export const HUBS_PER_PAGE = 12;

export enum SortOptions {
  Trending = 'trending',
  MostUpvotedNew = 'most_upvoted_new',
  MostRecentPopular = 'most_recent_popular',
  Activity = 'activity', // Consolidated activity sort
  Created = 'created', // Newest first
  Name = 'name', // A-Z
  Upvotes = 'upvotes', // Total upvotes desc
  Servers = 'servers', // Total connected servers desc
  Rating = 'rating', // Average review rating desc
}

export enum ContentFilter {
  All = 'all',
  SFW = 'sfw',
  NSFW = 'nsfw',
}

export enum VerificationStatus {
  All = 'all',
  Verified = 'verified',
  Partnered = 'partnered',
  VerifiedOrPartnered = 'verified_or_partnered',
}

// Activity level descriptions for UI components
// Updated thresholds to match our new filtering (all hubs have at least 1 connection)
export const ACTIVITY_LEVEL_INFO = {
  [HubActivityLevel.HIGH]: {
    label: 'High Activity',
    description: '20+ servers, very active',
    color: 'bg-green-500',
    borderColor: 'border-green-500',
    threshold: 50,
  },
  [HubActivityLevel.MEDIUM]: {
    label: 'Medium Activity',
    description: '5-19 servers, moderately active',
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
    threshold: 15,
  },
  [HubActivityLevel.LOW]: {
    label: 'Low Activity',
    description: '1-4 servers, quiet',
    color: 'bg-gray-500',
    borderColor: 'border-gray-500',
    threshold: 0,
  },
} as const;

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'pl', name: 'Polish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'cs', name: 'Czech' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'et', name: 'Estonian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
  { code: 'fa', name: 'Persian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ne', name: 'Nepali' },
  { code: 'si', name: 'Sinhala' },
  { code: 'my', name: 'Myanmar' },
  { code: 'km', name: 'Khmer' },
  { code: 'lo', name: 'Lao' },
  { code: 'ka', name: 'Georgian' },
  { code: 'hy', name: 'Armenian' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'ky', name: 'Kyrgyz' },
  { code: 'uz', name: 'Uzbek' },
  { code: 'tg', name: 'Tajik' },
  { code: 'mn', name: 'Mongolian' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'be', name: 'Belarusian' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'sq', name: 'Albanian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'me', name: 'Montenegrin' },
  { code: 'is', name: 'Icelandic' },
  { code: 'fo', name: 'Faroese' },
  { code: 'mt', name: 'Maltese' },
  { code: 'ga', name: 'Irish' },
  { code: 'gd', name: 'Scottish Gaelic' },
  { code: 'cy', name: 'Welsh' },
  { code: 'br', name: 'Breton' },
  { code: 'eu', name: 'Basque' },
  { code: 'ca', name: 'Catalan' },
  { code: 'gl', name: 'Galician' },
  { code: 'oc', name: 'Occitan' },
  { code: 'co', name: 'Corsican' },
  { code: 'sc', name: 'Sardinian' },
  { code: 'rm', name: 'Romansh' },
  { code: 'lb', name: 'Luxembourgish' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'zu', name: 'Zulu' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'sw', name: 'Swahili' },
  { code: 'am', name: 'Amharic' },
  { code: 'ha', name: 'Hausa' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ig', name: 'Igbo' },
  { code: 'mg', name: 'Malagasy' },
  { code: 'ms', name: 'Malay' },
  { code: 'tl', name: 'Filipino' },
  { code: 'haw', name: 'Hawaiian' },
  { code: 'mi', name: 'Maori' },
  { code: 'sm', name: 'Samoan' },
  { code: 'to', name: 'Tongan' },
  { code: 'fj', name: 'Fijian' },
  { code: 'other', name: 'Other' },
];

export const REGIONS = [
  { code: 'na', name: 'North America' },
  { code: 'sa', name: 'South America' },
  { code: 'eu', name: 'Europe' },
  { code: 'as', name: 'Asia' },
  { code: 'af', name: 'Africa' },
  { code: 'oc', name: 'Oceania' },
  { code: 'global', name: 'Global' },
];

// Popular tags for hub discovery
export const POPULAR_TAGS = [
  'gaming',
  'art',
  'technology',
  'music',
  'anime',
  'memes',
  'education',
  'community',
  'programming',
  'design',
  'sports',
  'movies',
  'books',
  'food',
  'travel',
  'photography',
  'science',
  'writing',
  'roleplay',
  'politics',
  'news',
  'fashion',
  'pets',
  'fitness',
];
