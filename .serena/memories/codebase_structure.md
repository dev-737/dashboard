# Codebase Structure - Detailed

The project follows the **Next.js 16 App Router** architecture with TypeScript strict mode. Source code is organized in the `src` directory.

## Core Directory Structure

### `src/app` - Application Routes (App Router)
**Pages & Routes:**
- **`/` (landing)**: `page.tsx` - Homepage with Hero, Features, FAQ, CTA
- **`/login`**: Discord OAuth login page with error handling
- **`/discover`**: Hub discovery page with filtering and search
- **`/hubs/[hubId]`**: Public hub details, reviews, join flow
- **`/dashboard`**: Protected dashboard for managing connections, servers, and hubs
  - **`/dashboard/servers/[serverId]`**: Server management and connection setup
  - **`/dashboard/hubs/[hubId]`**: Hub management dashboard with:
    - `/infractions` - Moderation actions and appeals
    - `/members` - Member management
    - `/modules` - Feature toggles
    - `/appeals` - Appeal review interface
    - `/discoverability` - Public listing settings
    - `/connections` - Connected servers
    - `/reports` - Report management
    - `/automod` - Auto-moderation rules
    - `/logging` - Hub logging configuration
  - **`/dashboard/hubs/create`**: Hub creation wizard
  - **`/dashboard/connections/[connectionId]`**: Connection details and editing
  - **`/dashboard/settings`**: User account settings
  - **`/dashboard/my-appeals`**: User's appeal submissions
  - **`/dashboard/admin`**: Admin-only section for announcements
- **`/guidelines`**, **`/terms`**, **`/privacy`**: Legal pages

**API Routes:**
- **`/api/trpc/[trpc]`**: tRPC handler (main API endpoint)
- **`/api/uploadthing`**: File upload endpoint
- **`/api/webhooks/topgg`**: Top.gg voting webhook
- **`/api/auth/[...nextauth]`**: NextAuth.js routes
- **`/api/auth/deleteAccount`**: Account deletion endpoint

**Special Files:**
- `_components/`: Landing page components (Hero, CTA, TrendingHubs, etc.)
- `layout.tsx`: Root layout with providers
- `error.tsx`, `global-error.tsx`: Error boundaries
- `loading.tsx`: Loading states
- `not-found.tsx`: 404 page
- `robots.ts`, `sitemap.ts`: SEO metadata

### `src/server` - Backend Logic
**tRPC Routers (src/server/routers/):**
- **`hub.ts`**: Hub CRUD, settings, moderation
- **`user.ts`**: User profile, settings, achievements
- **`server.ts`**: Discord server data management
- **`moderation.ts`**: Infractions, bans, appeals
- **`announcement.ts`**: Hub announcements
- **`discover.ts`**: Public hub discovery with filters
- **`tags.ts`**: Hub tagging system
- **`connection.ts`**: Server-hub connections
- **`appeal.ts`**: Appeal submission and handling
- **`message.ts`**: Message queries and reports
- **`index.ts`**: Main router aggregation

**Core Files:**
- **`trpc.ts`**: tRPC initialization, context, procedures (publicProcedure, protectedProcedure)

### `src/components` - UI Components

**`ui/` - Base Components (Shadcn-inspired):**
- Primitives: `button`, `input`, `textarea`, `select`, `checkbox`, `switch`, `radio-group`, `slider`
- Overlays: `dialog`, `alert-dialog`, `dropdown-menu`, `popover`, `tooltip`, `sheet`
- Data Display: `table`, `card`, `badge`, `avatar`, `separator`, `skeleton`, `tabs`
- Feedback: `toast`, ` alert`, `progress`, `spinner`
- Custom: `InterChatSpinner`, `PremiumBadge`, `GradientText`, `AnimatedShinyText`

**`layout/` - Layout Components:**
- `Navbar.tsx`, `NavbarWrapper.tsx`: Main navigation
- `Footer.tsx`, `ConditionalFooter.tsx`: Page footers
- `DashboardMobileSidebar.tsx`, `DashboardTopbar.tsx`, `DashboardBreadcrumb.tsx`: Dashboard UI
- `UserNav.tsx`: User menu dropdown
- `Toaster.tsx`: Toast notification container

**`features/` - Feature Components:**
- **`landing/`**: Homepage sections
- **`discover/`**: Discovery page components
- **`hubs/`**: Hub detail components
- **`moderation/`**: Moderation UI
- **`dashboard/`**: Dashboard-specific components
  - `servers/`, `connections/`, `hubs/`, `notifications/`, `onboarding/`, `shared/`

**`forms/` - Form Components:**
- `HubEditForm/`, `HubCreateForm/`: Multi-section hub forms
- `ConnectionEditForm`, `UserSettingsForm`, `PatternBuilder`, `DurationSelector`

**`discord/` - Discord UI:**
- `DiscordChannelSelector`, `DiscordRoleSelector`, `ChannelIcon`

**`magicui/` - Special Effects:**
- `GridPattern`: Animated grid backgrounds

**`providers/` - Context Providers:**
- `QueryProvider`, `TrpcProvider`, `HydrationBoundary`

### `src/lib` - Shared Libraries

**Core Services:**
- **`prisma.ts`**: Prisma client with Vercel Postgres adapter
- **`redis-config.ts`**: Redis configuration for caching/sessions
- **`uploadthing.ts`**: File upload setup
- **`tanstack-query.ts`**: React Query configuration

**Services (`lib/services/`):**
- `TagManagementService.ts`: Tag CRUD operations

**Utilities:**
- `utils.ts`: cn() utility (Tailwind merge)
- `constants.ts`: App-wide constants
- `permissions.ts`: Role-based access control
- `hub-queries.ts`: Reusable hub queries
- `rate-limit.ts`, `rate-limit-config.ts`, `rate-limit-middleware.ts`: Rate limiting
- `performance-cache.ts`: Caching utilities
- `error-messages.ts`: Standardized error messages
- `hub-bans.ts`: Ban management utilities
- `platform-stats.ts`: Platform statistics
- `topgg-votes.ts`: Top.gg integration
- `create-dehydrated-state.ts`: SSR hydration

**Generated:**
- `lib/generated/prisma/client/`: Auto-generated Prisma client

**Types (`lib/types/`):**
- `anti-swear.ts`: Anti-profanity type definitions

**Discover:**
- `discover/query.ts`: Discovery query builders

### `src/hooks` - Custom React Hooks
Data Fetching:
- `use-hub.ts`, `use-connections.ts`, `use-appeals.ts`, `use-tags.ts`
- `use-hub-members.ts`, `use-hub-reviews.ts`, `use-hub-recommendations.ts`
- `use-infinite-hubs.ts`: Infinite scroll hubs
- `use-user-search.ts`: User search

UI Utilities:
- `use-mobile.tsx`: Mobile detection
- `use-toast.ts`: Toast notifications
- `use-error-notification.tsx`: Error handling
- `use-debounce.ts`: Debounced values

Settings:
- `use-hub-settings.ts`, `useNSFWPreference.ts`
- `use-discover-upvote.ts`: Hub upvoting
- `use-notifications.ts`: Notification preferences

### `src/types` - Type Definitions
- **`next-auth.d.ts`**: NextAuth session type augmentation
- **`global.d.ts`**: Global type declarations
- **`logging.ts`**: Logging type definitions

### `src/styles` - Global Styles
CSS files for global styling (Tailwind base, components, utilities)

### Configuration Files

**Root:**
- **`next.config.mjs`**: Next.js config with Sentry, caching strategies, image optimization, redirects
- **`tsconfig.json`**: TypeScript config (strict mode, path aliases `@/*`)
- **`biome.jsonc`**: Biome linter & formatter config
- **`package.json`**: Dependencies and scripts
- **`prisma/schema.prisma`**: Database schema (755 lines, 50+ models)
- **`.editorconfig`**: Editor preferences

## Code Organization Patterns

1. **Server Components by Default**: Most page components are React Server Components
2. **Dynamic Imports**: Features lazy-loaded with `next/dynamic`
3. **Co-location**: Route-specific components in `_components` folders
4. **Separation of Concerns**: UI components separate from business logic
5. **Type Safety**: End-to-end type safety with tRPC + Prisma
