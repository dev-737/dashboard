# Database Schema Overview

The project uses **Prisma v7 ORM** with **PostgreSQL** (via @prisma/adapter-pg for Vercel Edge compatibility) and includes 50+ models for a comprehensive Discord-related application.

## Core Entities

### User Management
**User Model** (Central entity):
- Identity: `id`, `name`, `email`, `image`, `emailVerified`
- Stats: `messageCount`, `voteCount`, `reputation`, `hubJoinCount`, `hubEngagementScore`
- Settings: `showBadges`, `mentionOnReply`, `showNsfwHubs`, `voteRemindersEnabled`
- Activity: `lastMessageAt`, `lastVoted`, `lastHubJoinAt`, `activityLevel`
- Features: `badges[]`, `preferredLanguages[]`

**Account**: OAuth accounts (Discord)
**Session**: NextAuth sessions

### Hub System
**Hub** (Communication networks):
- Identity: `id`, `name`, `description`, `ownerId`
- Media: `iconUrl`, `bannerUrl`
- Content: `shortDescription`, `welcomeMessage`, `rules[]`, `customBadges`
- Stats: `weeklyMessageCount`, `averageRating`, `activityLevel`
- Visibility: `private`, `locked`, `nsfw`, `verified`, `partnered`, `featured`
- Settings: `language`, `region`, `settings` (bitfield), `appealCooldownHours`

**HubActivityMetrics**: Real-time hub analytics
- 24h metrics: `messagesLast24h`, `activeUsersLast24h`, `newConnectionsLast24h`
- 7d metrics: `messagesLast7d`, `activeUsersLast7d`, `newConnectionsLast7d`
- Growth: `memberGrowthRate`, `engagementRate`, `trendingScore`

**Connection**: Server-to-hub connections
- Channels: `channelId`, `webhookURL`, `webhookSecondaryURL`
- Relationship: `serverId`, `hubId`, `parentId`
- Status: `connected`, `invite`, `lastActive`

**HubModerator**: Hub staff
- Roles: `MODERATOR`, `MANAGER`

### Content & Messaging
**Message**: Hub messages
- Content: `content`, `imageUrl`
- Context: `hubId`, `channelId`, `guildId`, `authorId`
- References: `referredMessageId` (replies)
- Status: `PENDING`, `ACTIVE`, `DELETED`

**Broadcast**: Message broadcasts to servers

**HubMessageReaction**: Emoji reactions
- Data: `emoji`, `users[]` (user IDs)

### Moderation
**Infraction**: Moderation actions
- Types: `BAN`, `BLACKLIST`, `MUTE`, `WARNING`
- Data: `reason`, `expiresAt`, `evidenceMessageId`, `evidenceContent`, `evidenceImageUrl`
- Target: `userId`, `serverId`
- Status: `ACTIVE`, `REVOKED`, `APPEALED`

**Appeal**: Infraction appeals
- Status: `PENDING`, `ACCEPTED`, `REJECTED`
- Data: `reason`, `infractionId`, `userId`

**Blacklist**: User blacklists (global)
**ServerBlacklist**: Server blacklists (global)
**ServerBlocklist**: Per-server blocklists

### Auto-Moderation
**AntiSwearRule**: Profanity filtering rules
- Config: `name`, `enabled`, `muteDurationMinutes`
- Actions: `BLOCK_MESSAGE`, `SEND_ALERT`, `WARN`, `MUTE`, `BAN`, `BLACKLIST`

**AntiSwearPattern**: Filter patterns
- Match types: `EXACT`, `PREFIX`, `SUFFIX`, `WILDCARD`

**AntiSwearWhitelist**: Exempted words

**BlockWord**: Custom word filters (per hub)

### Reporting
**HubReport**: Hub-level reports
- Status: `PENDING`, `RESOLVED`, `IGNORED`
- Data: `reason`, `messageId`, `reportedUserId`, `reportedServerId`
- Handling: `handledBy`, `handledAt`, `actionTaken`

**GlobalReport**: Platform-wide reports

### Discovery & Engagement
**Tag**: Hub categorization
- Data: `name`, `category`, `description`, `color`
- Metadata: `isOfficial`, `usageCount`

**HubUpvote**: User upvotes for hubs
**HubReview**: Hub ratings and reviews
**HubRulesAcceptance**: User acceptance of hub rules

**HubInvite**: Invite codes
- Config: `code`, `maxUses`, `uses`, `expires`

### Gamification
**Achievement**: Unlockable achievements
- Data: `name`, `description`, `badgeEmoji`, `badgeUrl`
- Config: `threshold`, `secret`

**UserAchievement**: User unlocks
**UserAchievementProgress**: Progress tracking

**LeaderboardEntry**: Leaderboards
- Periods: `DAILY`, `WEEKLY`, `MONTHLY`, `ALL_TIME`
- Types: `USER`, `SERVER`, `HUB`
- Stats: `messageCount`, `score`, `rank`

**ReputationLog**: Reputation change history

### Hub Features
**HubAnnouncement**: Scheduled announcements
- Content: `title`, `content`, `imageUrl`, `thumbnailUrl`
- Schedule: `frequencyMs`, `previousAnnouncement`, `nextAnnouncement`

**HubLogConfig**: Logging channels
- Channels: `modLogsChannelId`, `joinLeavesChannelId`, `appealsChannelId`, `reportsChannelId`, etc.
- Roles: Corresponding role IDs for mentions

### Server Data
**ServerData**: Discord server info
- Data: `name`, `iconUrl`, `inviteCode`
- Stats: `messageCount`, `lastMessageAt`

### System
**DevAlerts**: Developer announcements

## Key Design Patterns

1. **Cascading Deletes**: Hub deletion removes all related data (connections, messages, etc.)
2. **Soft Deletes**: Messages use status field instead of hard deletes
3. **Composite Keys**: Many relations use composite unique constraints
4. **Indexes**: Extensive indexing for query performance
5. **JSON Fields**: `customBadges` for flexible data
6. **Arrays**: `rules[]`, `badges[]`, `users[]` for lists
7. **Enums**: Type-safe status/role fields

## Prisma Configuration
- **Provider**: PostgreSQL
- **Output**: Custom path `../src/lib/generated/prisma/client`
- **Runtime**: Vercel Edge
- **Module Format**: ESM
- **Preview Features**: `postgresqlExtensions`, `relationJoins`