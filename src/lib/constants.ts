// Hub modules bits
export const HubModulesBits = {
  Reactions: 1 << 0,
  HideLinks: 1 << 1,
  SpamFilter: 1 << 2,
  BlockInvites: 1 << 3,
  UseNicknames: 1 << 4,
  BlockNSFW: 1 << 5,
  AllowVideos: 1 << 6,
  BlockAttachments: 1 << 7,
  BlockTenorGifs: 1 << 8,
} as const;

// Hub modules descriptions
export const HubModulesDescriptions = {
  [HubModulesBits.Reactions]: 'Allow message reactions in the hub',
  [HubModulesBits.HideLinks]: 'Hide links in messages',
  [HubModulesBits.SpamFilter]: 'Enable spam filtering',
  [HubModulesBits.BlockInvites]: 'Block Discord invite links',
  [HubModulesBits.UseNicknames]:
    'Use server nicknames instead of Discord usernames',
  [HubModulesBits.BlockNSFW]: 'Block NSFW content',
  [HubModulesBits.AllowVideos]: 'Allow video attachments in messages',
  [HubModulesBits.BlockAttachments]: 'Block image and sticker attachments',
  [HubModulesBits.BlockTenorGifs]: 'Block all GIF attachments (including Tenor)',
} as const;

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
  { code: 'et', name: 'Estonian' },
] as const;

export enum PermissionLevel {
  NONE = 0,
  MODERATOR = 1,
  MANAGER = 2,
  OWNER = 3,
}
