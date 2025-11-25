# Next.js Configuration Deep Dive

## Performance Optimizations

### Build Configuration
- **React Strict Mode**: Enabled for development checks
- **Powered By Header**: Disabled for security
- **Compression**: Enabled
- **Turbopack**: Enabled (Next.js 15 feature)
- **Console Removal**: Production builds remove all console logs except `console.error`

### Cache Components (Next.js 16.0.3 feature)
**Enabled** with custom cache life profiles:
- **`user-data`**: Stale 5min, revalidate 1min, expire 10min
- **`hub-data`**: Stale 10min, revalidate 5min, expire 30min
- **`platform-stats`**: Stale 15min, revalidate 5min, expire 30min
- **`discover-data`**: Stale 5min, revalidate 2min, expire 15min

### Experimental Features
- **Package Optimization**: Pre-optimized imports for 18+ libraries (Radix UI, Lucide, TanStack Query, etc.)
- **View Transitions**: Enabled for smooth page transitions
- **Parallel Builds**: `parallelServerCompiles`, `parallelServerBuildTraces`, `webpackBuildWorker`
- **CSS Optimization**: `optimizeCss` with `useLightningcss`
- **Web Vitals Attribution**: Tracking CLS, LCP, FCP, FID, TTFB
- **Scroll Restoration**: Automatic scroll position restoration
- **ESM Externals**: Enabled for better module resolution
- **Typed Environment**: Type-safe env variables

### Image Optimization
- **Formats**: WebP, AVIF
- **Qualities**: [60]
- **Minimization**: Enabled
- **Allowed Domains**: `cdn.discordapp.com`, `uploadthing.com`, `utfs.io`

### Cache Headers
Strategic cache control for static assets:
- **Static files** (`/public`): 1 day cache, stale-while-revalidate
- **Service Worker**: No cache, must revalidate

### Code Splitting (Webpack)
Custom split chunks for optimal loading:
- **Vendors**: General node_modules
- **Motion**: Framer Motion / Motion library (separate chunk)
- **UI**: Radix UI components (separate chunk)

## Redirects
- `/support` → Discord invite
- `/hubs` → `/discover`
- `/invite` → Discord OAuth
- `/vote` → Top.gg
- `/docs/*` → External docs site

## Sentry Integration
- **Organization**: `interchatapp`
- **Project**: `interchat-website`
- **Tunnel Route**: `/monitoring` (avoids ad blockers)
- **Features**: Client file upload, automatic Vercel monitors, sourcemaps (CI only)
- **Performance**: Logger disabled, telemetry off

## Security Headers
(Configured via `headers()` function)

## Development
- **TypeScript**: Strict mode with path aliases
- **Module Resolution**: Bundler mode
- **Runtime**: Vercel Edge optimized Prisma client