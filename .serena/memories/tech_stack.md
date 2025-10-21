# Technology Stack

## Core Technologies

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components
- **API**: tRPC for type-safe client-server communication
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js v5 with Discord OAuth
- **State Management**: TanStack Query (via tRPC)

## Development Tools

- **Linting/Formatting**: Biome (single quotes, 2-space indentation)
- **Type Checking**: TypeScript with strict mode
- **Monitoring**: Sentry for error tracking
- **File Uploads**: UploadThing
- **Caching**: Redis (optional but recommended)

## Key Dependencies

- **UI Components**: Radix UI primitives (41+ components)
- **Icons**: Lucide React
- **Animations**: Framer Motion (motion package)
- **Date Handling**: date-fns
- **Utilities**: lodash-es, clsx, class-variance-authority

## Database

- **Prisma**: ORM for database operations
- **PostgreSQL**: Primary database (shared with Python bot)
- **Important**: Web uses Prisma schema while bot uses SQLAlchemy - schemas must be manually synchronized

## Environment

- **Node.js**: Modern version with ESM support
- **Package Manager**: npm
- **Platform**: Linux (Ubuntu/Debian-based)
