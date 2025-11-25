# Development Workflow & Best Practices

## Getting Started

### Initial Setup
1. **Clone repository** and navigate to project directory
2. **Install dependencies**: `npm install`
3. **Setup environment variables**: Copy `.env.example` to `.env` and fill required values
4. **Generate Prisma Client**: `npx prisma generate`
5. **Run migrations**: `npx prisma migrate dev`
6. **Start dev server**: `npm run dev`

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random string for session encryption
- `NEXTAUTH_URL`: Application URL (e.g., `http://localhost:3000`)
- `DISCORD_CLIENT_ID`: Discord OAuth app ID
- `DISCORD_CLIENT_SECRET`: Discord OAuth secret
- Redis connection details (optional for caching)
- Sentry DSN (optional for error tracking)
- UploadThing keys (for file uploads)

## Development Commands

### Primary Workflow
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run Biome linter
npm run format       # Auto-format code with Biome
npm run typecheck    # TypeScript type checking
```

### Database Commands
```bash
npx prisma generate        # Regenerate Prisma Client (after schema changes)
npx prisma db push         # Push schema directly to DB (prototyping only)
npx prisma migrate dev     # Create and apply migrations (proper workflow)
npx prisma migrate reset   # Reset database (WARNING: deletes all data)
npx prisma studio          # Open Prisma Studio (GUI for data)
```

### Utility Commands
```bash
npm run analyze                    # Analyze bundle size
npx biome check --apply .         # Auto-fix linting issues
npx @next/codemod <transform>     # Run Next.js codemods
```

## Code Quality Workflow

### Before Committing
1. **Run linter**: `npm run lint`
2. **Fix issues**: `npm run format`
3. **Type check**: `npm run typecheck`
4. **Test build**: `npm run build` (at least for major changes)
5. **Review changes**: Ensure no debug code or console.logs remain

### During Development
- **Hot Reload**: Changes auto-reload in dev mode
- **Error Overlay**: Next.js shows errors in browser
- **Type Safety**: IDE should show TypeScript errors in real-time
- **Biome**: Configure IDE to format on save

## Common Development Patterns

### Adding a New Page
1. Create `src/app/path/to/page/page.tsx`
2. Export default component (can be async for Server Component)
3. Add `loading.tsx` for loading state (optional)
4. Add `error.tsx` for error boundary (optional)
5. Export `metadata` or `generateMetadata` for SEO

### Adding a New tRPC Route
1. Create/edit router in `src/server/routers/`
2. Add procedures with input validation (Zod)
3. Import and add to `src/server/routers/index.ts`
4. Use in client with `trpc.routerName.procedureName.useQuery()` or `.useMutation()`

### Adding a New Component
1. Create in appropriate `src/components/` subdirectory
2. Use TypeScript for props interface
3. Use `cn()` for className merging
4. Add `'use client'` if component needs interactivity
5. Export component at end of file

### Adding a New Hook
1. Create in `src/hooks/use-hook-name.ts`
2. Follow naming: `use` + description
3. Return object or array of values
4. Document parameters and return values

### Database Schema Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Commit both schema and migration files
4. Test with `npx prisma studio`

## Debugging

### Common Issues
**Build Errors:**
- Clear cache: `rm -rf .next`
- Reinstall: `rm -rf node_modules package-lock.json && npm install`

**Database Issues:**
- Check `DATABASE_URL` in `.env`
- Verify Prisma Client is generated: `npx prisma generate`
- Reset if needed: `npx prisma migrate reset`

**Auth Issues:**
- Verify Discord OAuth credentials
- Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- Ensure callback URLs match in Discord app settings

**Type Errors:**
- Regenerate Prisma types: `npx prisma generate`
- Restart TypeScript server in IDE
- Check for circular dependencies

**Performance:**
- Enable Redis caching
- Use React Query for client-side caching
- Optimize images with next/image
- Check bundle size: `npm run analyze`

### Debug Logging
In development, set environment variables:
```env
DEBUG="*"
NEXTAUTH_DEBUG="true"
```

## Testing Strategy
- **Type Safety**: TypeScript + Prisma provides compile-time safety
- **Linting**: Biome catches common errors
- **Manual Testing**: Development server for quick iteration
- **Build Testing**: `npm run build` before major deploys

## Deployment

### Pre-Deploy Checklist
- [ ] All tests passing
- [ ] Type check passes
- [ ] Build succeeds locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] No sensitive data exposed

### Vercel Deployment (Recommended)
1. Connect GitHub repository
2. Configure environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Auto-deploys on push to main

## Performance Monitoring
- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: Web Vitals and Core Web Vitals
- **Next.js**: Built-in performance insights in development