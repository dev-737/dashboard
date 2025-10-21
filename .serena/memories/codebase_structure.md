# Codebase Structure

## Root Directory: `/home/deboid/Documents/code/interchat.py/projects/web`

```
projects/web/
├── src/                      # Source code
│   ├── app/                  # Next.js App Router
│   ├── components/           # React components
│   ├── server/               # Server-side code
│   ├── lib/                  # Utilities and libraries
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   ├── actions/              # Server actions
│   ├── types/                # TypeScript definitions
│   ├── constants/            # Application constants
│   ├── styles/               # Global styles
│   ├── auth.ts               # NextAuth configuration
│   ├── middleware.ts         # Next.js middleware
│   └── instrumentation*.ts   # Sentry instrumentation
├── prisma/                   # Prisma ORM
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
│   └── assets/               # Organized assets
│       ├── images/           # Images (features, logos, defaults)
│       └── icons/            # SVG icons
├── next.config.mjs           # Next.js configuration
├── biome.jsonc               # Biome configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
└── CLAUDE.md                 # Project documentation
```

## App Router Structure (`src/app/`)

```
app/
├── _components/              # Landing page components
├── api/                      # API routes
│   ├── auth/                 # NextAuth routes
│   ├── trpc/[trpc]/         # tRPC API endpoint
│   └── webhooks/             # External webhooks
├── dashboard/                # Main dashboard (protected)
│   ├── admin/                # Admin panel
│   ├── hubs/[hubId]/        # Hub management
│   ├── connections/[id]/     # Connection management
│   ├── settings/             # User settings
│   ├── error.tsx             # Dashboard error boundary
│   ├── loading.tsx           # Dashboard loading state
│   └── not-found.tsx         # Dashboard 404 page
├── discover/                 # Public hub discovery
├── hubs/[hubId]/            # Public hub pages
├── login/                    # Login page
├── admin/                    # Admin-only pages
├── error.tsx                 # Global error boundary
├── loading.tsx               # Global loading state
├── not-found.tsx             # Global 404 page
├── layout.tsx                # Root layout
└── page.tsx                  # Homepage
```

## Components Structure (`src/components/`)

```
components/
├── ui/                       # Base UI components (41 files)
│   ├── Button.tsx            # Radix UI primitives
│   ├── Dialog.tsx
│   ├── Input.tsx
│   └── ...                   # 38 more components
├── layout/                   # Layout components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── UserNav.tsx
│   ├── DashboardTopbar.tsx
│   ├── DashboardMobileSidebar.tsx
│   ├── DashboardBreadcrumb.tsx
│   └── DashboardPageFooter.tsx
├── features/                 # Feature-specific components
│   ├── dashboard/            # Dashboard domain
│   │   ├── hubs/             # Hub management (27 files)
│   │   ├── connections/      # Connection management
│   │   ├── servers/          # Server management
│   │   ├── notifications/    # Notification UI
│   │   ├── onboarding/       # Guided tour
│   │   └── shared/           # Shared dashboard components
│   ├── discover/             # Hub discovery
│   ├── hubs/                 # General hub components
│   └── moderation/           # Moderation components
├── forms/                    # Form components
│   ├── HubCreateForm/        # Multi-step hub creation
│   │   ├── HubCreateForm.tsx
│   │   ├── StepIndicator.tsx
│   │   ├── BasicInfoStep.tsx
│   │   ├── DescriptionSettingsStep.tsx
│   │   └── RulesWelcomeStep.tsx
│   ├── HubEditForm/          # Hub editing
│   │   ├── HubEditForm.tsx
│   │   ├── BasicInfoSection.tsx
│   │   ├── WelcomeMessageSection.tsx
│   │   └── RulesSection.tsx
│   ├── ConnectionEditForm.tsx
│   ├── UserSettingsForm.tsx
│   ├── DurationSelector.tsx
│   ├── WordTagInput.tsx
│   └── PatternBuilder.tsx
├── discord/                  # Discord integration
│   ├── ChannelIcon.tsx
│   ├── DiscordChannelSelector.tsx
│   └── DiscordRoleSelector.tsx
├── magicui/                  # Magic UI components
└── providers/                # React context providers
    ├── QueryProvider.tsx
    ├── TRPCProvider.tsx
    └── HydrationProvider.tsx
```

## Server Structure (`src/server/`)

```
server/
├── routers/                  # tRPC routers
│   ├── hub.ts                # Hub operations
│   ├── user.ts               # User operations
│   ├── server.ts             # Server operations
│   ├── moderation.ts         # Moderation tools
│   ├── connection.ts         # Connection management
│   ├── appeal.ts             # Appeal system
│   ├── announcement.ts       # Announcements
│   ├── discover.ts           # Hub discovery
│   ├── tags.ts               # Tag management
│   └── index.ts              # Main router (combines all)
└── trpc.ts                   # tRPC setup
```

## Library Structure (`src/lib/`)

```
lib/
├── prisma.ts                 # Prisma client singleton
├── utils.ts                  # Utility functions (cn, etc.)
├── constants.ts              # Application constants
├── permissions.ts            # Permission checking
├── rate-limit.ts             # Rate limiting
├── rate-limit-middleware.ts  # Rate limit middleware
├── rate-limit-config.ts      # Rate limit configuration
├── redis-config.ts           # Redis configuration
├── hub-queries.ts            # Hub database queries
├── hub-bans.ts               # Hub ban utilities
├── platform-stats.ts         # Platform statistics
├── performance-cache.ts      # Performance caching
└── services/                 # Service layer utilities
```

## Hooks Structure (`src/hooks/`)

Custom React hooks for data fetching and state management:

```
hooks/
├── use-hub.ts                # Hub management hooks
├── use-connections.ts        # Connection hooks
├── use-tags.ts               # Tag management hooks
└── use-*.ts                  # Other custom hooks
```

## Public Assets (`public/`)

```
public/
├── assets/
│   ├── images/
│   │   ├── features/         # Feature screenshots
│   │   ├── logos/            # Logo files
│   │   ├── defaults/         # Default avatars/banners
│   │   └── blog/             # Blog images
│   └── icons/                # SVG icons
├── favicon.ico
└── robots.txt
```

## Configuration Files

- **next.config.mjs**: Next.js configuration (redirects, headers, optimizations)
- **biome.jsonc**: Biome linter/formatter config
- **tsconfig.json**: TypeScript configuration
- **sentry.*.config.ts**: Sentry error tracking
- **prisma/schema.prisma**: Database schema
- **.env.local**: Environment variables (not in git)

## Key File Locations

### Authentication
- `src/auth.ts` - NextAuth.js configuration
- `src/middleware.ts` - Route protection

### Database
- `prisma/schema.prisma` - Schema definition
- `src/lib/prisma.ts` - Client singleton
- `prisma/migrations/` - Migration files

### API
- `src/server/routers/` - All tRPC routers
- `src/app/api/trpc/[trpc]/route.ts` - tRPC HTTP handler

### Styling
- `src/styles/globals.css` - Global CSS + Tailwind
- `src/lib/utils.ts` - `cn()` utility for class merging
