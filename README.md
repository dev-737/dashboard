# InterChat Web Dashboard 🌐

A modern, responsive web dashboard for InterChat built with Next.js 15, React 19, and TypeScript. Provides comprehensive hub management, analytics, and administrative tools for Discord server networks.

## ✨ Features

### 🎛️ Hub Management
- **Hub Overview**: Comprehensive dashboard with statistics and activity metrics
- **Connection Management**: View and manage server connections to hubs
- **Moderation Tools**: Review reports, handle appeals, and manage infractions
- **Member Management**: Control hub members, permissions, and roles
- **Invite System**: Generate and manage hub invitation codes
- **Analytics Dashboard**: Track hub growth, engagement, and performance metrics

### 🔐 Authentication & Security
- **Discord OAuth**: Seamless authentication with Discord accounts
- **Role-based Access**: Different permission levels for users, moderators, and admins
- **Session Management**: Secure session handling with NextAuth.js
- **Account Management**: User profile settings and account deletion options
- **Security Features**: CSRF protection, secure headers, and rate limiting

### 📊 Analytics & Insights
- **Real-time Metrics**: Live data synchronization with Discord bot
- **Performance Dashboards**: Message throughput, response times, and uptime stats
- **User Analytics**: Activity patterns, engagement metrics, and growth tracking
- **Hub Statistics**: Message volume, member activity, and moderation insights
- **Export Capabilities**: Download reports and analytics data

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Themes**: System preference-aware theme switching
- **Accessible Interface**: WCAG compliant with keyboard navigation support
- **Component Library**: Consistent design system with Radix UI components
- **Real-time Updates**: Live data refresh without page reloads

### 🛡️ Administrative Tools
- **NSFW Compliance**: Content moderation and compliance monitoring
- **Announcement System**: Send announcements to all connected hubs
- **Bot Management**: View bot status, performance, and configuration
- **User Management**: Search, manage, and moderate users across the network
- **System Health**: Monitor service health and performance metrics

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Radix UI with custom component library
- **Authentication**: NextAuth.js with Discord OAuth provider
- **Database**: Prisma ORM with PostgreSQL
- **API**: tRPC for type-safe client-server communication
- **State Management**: TanStack Query for server state
- **File Uploads**: UploadThing for secure file handling
- **Monitoring**: Sentry for error tracking and performance monitoring
- **Analytics**: Custom analytics implementation

### Project Structure
```
projects/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── _components/        # Page-specific components
│   │   ├── api/                # API routes and webhooks
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── admin/          # Admin panel
│   │   │   ├── hubs/           # Hub management
│   │   │   └── settings/       # User settings
│   │   ├── auth/               # Authentication pages
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable components
│   │   ├── ui/                 # Base UI components
│   │   ├── forms/              # Form components
│   │   ├── charts/             # Chart components
│   │   └── dashboard/          # Dashboard-specific components
│   ├── lib/                    # Utility libraries
│   │   ├── auth.ts             # Authentication configuration
│   │   ├── db.ts               # Database connection
│   │   ├── trpc.ts             # tRPC configuration
│   │   └── utils.ts            # Utility functions
│   ├── server/                 # Server-side code
│   │   ├── api/                # tRPC API routes
│   │   │   ├── routers/        # API route definitions
│   │   │   └── trpc.ts         # tRPC server setup
│   │   └── auth/               # Server-side authentication
│   ├── styles/                 # Global styles
│   │   └── globals.css         # Tailwind and custom styles
│   └── types/                  # TypeScript type definitions
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma           # Prisma schema definition
│   └── migrations/             # Database migration files
├── public/                     # Static assets
│   ├── images/                 # Image assets
│   └── icons/                  # Icon files
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

### API Architecture
- **tRPC**: Type-safe API with automatic TypeScript inference
- **Server Actions**: Next.js server actions for form handling
- **Middleware**: Authentication, CORS, and rate limiting
- **Webhooks**: Discord webhook handlers and external integrations
- **Real-time**: WebSocket connections for live data updates

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**: Required for Next.js and build tools
- **PostgreSQL**: Database server
- **Redis**: Session storage and caching (optional but recommended)
- **Discord Application**: For OAuth authentication

### Installation

1. **Navigate to web directory**:
```bash
cd projects/web
```

2. **Install dependencies**:
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Configure environment variables** (create `.env.local`):
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/interchat"
DIRECT_URL="postgresql://user:password@localhost:5432/interchat"

# NextAuth.js Configuration
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# UploadThing
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Sentry (optional)
SENTRY_DSN="your-sentry-dsn"

# Application Settings
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"

# External Services
TOP_GG_WEBHOOK_SECRET="your-topgg-webhook-secret"
```

4. **Set up the database**:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Optional: Seed the database
npx prisma db seed
```

5. **Run the development server**:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## 📖 Development

### Development Workflow

1. **Start development server**:
```bash
npm run dev
```

2. **Run type checking**:
```bash
npm run typecheck
```

3. **Run linting and formatting**:
```bash
# Lint code
npm run lint

# Format code
npm run format
```

4. **Build for production**:
```bash
npm run build
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server with hot reload |
| `build` | Build production application |
| `start` | Start production server |
| `lint` | Run Biome linter and formatter |
| `format` | Format code with Biome |
| `typecheck` | Run TypeScript type checking |
| `analyze` | Analyze bundle size |
| `perf:test` | Run performance tests |
| `postinstall` | Generate Prisma client after install |

### Database Operations

#### Prisma Commands
```bash
# Generate Prisma client
npx prisma generate

# View database in browser
npx prisma studio

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy

# Create migration from schema changes
npx prisma migrate dev --name "migration_name"
```

#### Schema Management
```bash
# Pull schema from existing database
npx prisma db pull

# Push schema changes without migrations
npx prisma db push

# Seed the database
npx prisma db seed
```

### Adding New Features

#### Creating API Routes
```typescript
// src/server/api/routers/example.ts
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const exampleRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.example.findMany();
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.example.create({
        data: { name: input.name },
      });
    }),
});
```

#### Creating Components
```typescript
// src/components/ui/example.tsx
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ExampleProps {
  children: ReactNode;
  className?: string;
}

export function Example({ children, className }: ExampleProps) {
  return (
    <div className={cn('rounded-lg border p-4', className)}>
      {children}
    </div>
  );
}
```

#### Adding Pages
```typescript
// src/app/example/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Example Page',
  description: 'An example page for InterChat',
};

export default function ExamplePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Example Page</h1>
    </div>
  );
}
```

### State Management

#### Using tRPC
```typescript
// Client-side data fetching
import { api } from '@/lib/trpc';

export function ExampleComponent() {
  const { data, isLoading } = api.example.getAll.useQuery();
  const createMutation = api.example.create.useMutation();

  const handleCreate = (name: string) => {
    createMutation.mutate({ name });
  };

  // Component JSX
}
```

#### Server Actions
```typescript
// src/actions/server-actions.ts
'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function createExample(name: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return await db.example.create({
    data: { name },
  });
}
```

## 🎨 Styling and Design

### Tailwind CSS Configuration

The project uses a custom Tailwind configuration with:
- **Design Tokens**: Consistent colors, spacing, and typography
- **Custom Components**: Pre-built component classes
- **Responsive Design**: Mobile-first responsive utilities
- **Dark Mode**: System preference-aware dark mode support

### Component Library

Built on Radix UI primitives with custom styling:
- **Buttons**: Multiple variants and sizes
- **Forms**: Input, select, checkbox, and radio components
- **Layout**: Card, sheet, dialog, and grid components
- **Navigation**: Navbar, sidebar, and breadcrumb components
- **Data Display**: Table, chart, and metric components

### Theming

```typescript
// Custom theme configuration
const theme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
  },
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
  },
};
```

## 🔧 Configuration

### Environment Variables

#### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `NEXTAUTH_SECRET` | NextAuth.js encryption secret | Random string |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` |
| `DISCORD_CLIENT_ID` | Discord OAuth client ID | Discord application ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth client secret | Discord application secret |

#### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection string | - |
| `SENTRY_DSN` | Sentry error tracking URL | - |
| `UPLOADTHING_SECRET` | UploadThing API secret | - |
| `NEXT_PUBLIC_BASE_URL` | Public base URL | `http://localhost:3000` |

### Next.js Configuration

Key configuration features:
- **Performance Optimizations**: Bundle optimization and tree shaking
- **Image Optimization**: WebP/AVIF support with responsive loading
- **Security Headers**: CSP, HSTS, and other security headers
- **Experimental Features**: PPR, view transitions, and parallel compilation

### Authentication Configuration

NextAuth.js setup with Discord provider:
```typescript
// src/lib/auth.ts
export const authConfig = {
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
};
```

## 🚀 Deployment

### Production Build

1. **Build the application**:
```bash
npm run build
```

2. **Test the production build**:
```bash
npm run start
```

### Deployment Platforms

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Production deployment
vercel --prod
```

#### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway deploy
```

### Environment Setup

#### Production Environment Variables
```env
NODE_ENV="production"
NEXTAUTH_URL="https://your-domain.com"
DATABASE_URL="postgresql://prod_user:password@prod_host:5432/interchat"
SENTRY_DSN="https://your-sentry-dsn.ingest.sentry.io/..."
```

#### Database Migration
```bash
# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching**: Aggressive caching with Redis and CDN
- **Lazy Loading**: Component and route-based lazy loading

### Performance Monitoring
- **Web Vitals**: Core Web Vitals tracking with Sentry
- **Real User Monitoring**: Performance tracking for real users
- **Bundle Size**: Automated bundle size monitoring
- **Database Performance**: Query optimization and connection pooling

### Performance Tips
```bash
# Analyze bundle size
npm run analyze

# Run performance tests
npm run perf:test

# Monitor Core Web Vitals
# Check Sentry dashboard for performance insights
```

## 🧪 Testing

### Testing Stack
- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: Playwright for end-to-end testing
- **Type Safety**: TypeScript for compile-time error detection
- **API Testing**: tRPC integration tests

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run typecheck

# All tests
npm run test:all
```

## 🐛 Troubleshooting

### Common Issues

**Build Errors**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Database Connection Issues**:
```bash
# Test database connection
npx prisma db pull

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

**Authentication Issues**:
- Verify Discord OAuth credentials
- Check NEXTAUTH_SECRET is set
- Ensure NEXTAUTH_URL matches your domain
- Verify callback URLs in Discord application settings

**Performance Issues**:
- Enable Redis caching
- Optimize database queries
- Use Next.js Image component
- Enable bundle analysis

### Debug Mode

Enable debug logging:
```env
DEBUG="*"
NEXTAUTH_DEBUG="true"
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Set up development environment
4. Make changes and test thoroughly
5. Run linting and type checking
6. Submit pull request

### Code Standards
- **TypeScript**: Strict mode enabled with proper typing
- **ESLint/Biome**: Automated code formatting and linting
- **Component Structure**: Consistent component patterns
- **Testing**: Unit tests for critical functionality
- **Documentation**: JSDoc comments for complex functions

### Pull Request Process
1. Update documentation if needed
2. Add tests for new features
3. Ensure all CI checks pass
4. Request review from maintainers

## 📜 License

This project is part of InterChat and licensed under the MIT License. See [LICENSE.md](../../LICENSE.md) for details.

---

## 🔗 Related Documentation

- **[Bot Documentation](../bot/README.md)**: Discord bot component
- **[CLI Documentation](../cli/README.md)**: Development CLI tools
- **[Database Documentation](../db/README.md)**: Database schema and migrations
- **[API Documentation](./docs/api.md)**: tRPC API reference
- **[Component Library](./docs/components.md)**: UI component documentation
