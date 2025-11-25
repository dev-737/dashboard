# Task Completion Checklist

Before considering any task complete, follow this comprehensive checklist:

## Pre-Commit Quality Checks

### 1. Code Quality
- [ ] **Linting**: Run `npm run lint` - No Biome errors or warnings
- [ ] **Formatting**: Run `npm run format` - Code properly formatted
- [ ] **Type Checking**: Run `npm run typecheck` - Zero TypeScript errors
- [ ] **Build Verification**: Run `npm run build` - Successful production build
  - Pay special attention to build-time errors (can be subtle in Next.js)
  - Check for any warnings about missing optimizations

### 2. Code Cleanliness
- [ ] Remove all `console.log` statements (except intentional logging)
- [ ] Remove commented-out code
- [ ] Remove TODO comments (or create GitHub issues)
- [ ] No unused imports (Biome should catch these)
- [ ] No unused variables (TypeScript should catch these)
- [ ] Proper error handling in place

### 3. Next.js Specific
- [ ] **Server vs Client Components**: Correct use of `'use client'` directive
  - Interactive components (events, hooks): Need `'use client'`
  - Data fetching, static content: Server Components (no directive)
- [ ] **Hydration**: No mismatches between server and client HTML
  - Avoid conditional rendering based on browser-only APIs
  - Use `useEffect` for browser-only initialization
  - Check for invalid HTML nesting (e.g., `<p>` inside `<p>`)
- [ ] **Metadata**: SEO metadata added for new pages
- [ ] **Loading States**: `loading.tsx` added where appropriate
- [ ] **Error Boundaries**: `error.tsx` considered for error handling

### 4. Database Changes
If schema was modified:
- [ ] Migration created: `npx prisma migrate dev --name descriptive_name`
- [ ] Prisma Client regenerated: `npx prisma generate`
- [ ] Migration tested in development
- [ ] Migration file committed to Git
- [ ] Schema changes documented (if breaking)

### 5. API Changes (tRPC)
If routers were modified:
- [ ] Input validation with Zod schemas
- [ ] Proper authentication (`publicProcedure` vs `protectedProcedure`)
- [ ] Error handling with `TRPCError`
- [ ] Types automatically updated on client (verify with `npm run typecheck`)

### 6. UI/UX
- [ ] **Responsive Design**: Tested on mobile, tablet, desktop breakpoints
- [ ] **Accessibility**: 
  - Keyboard navigation works
  - Semantic HTML used
  - ARIA labels where needed
- [ ] **Dark Mode**: Components look good in dark theme
- [ ] **Loading States**: Proper loading indicators for async operations
- [ ] **Error States**: User-friendly error messages

### 7. Performance
- [ ] **Images**: Using `next/image` component (not `<img>`)
- [ ] **Heavy Components**: Consider dynamic imports with loading states
- [ ] **Database Queries**: No N+1 queries (use `include` or `select`)
- [ ] **Unnecessary Re-renders**: Check for proper memoization if needed

### 8. Security
- [ ] No sensitive data exposed to client
- [ ] No hardcoded credentials or API keys
- [ ] Input sanitization in place
- [ ] Authorization checks in protected routes/procedures

## Common Issues & Solutions

### Hydration Errors
**Symptom**: "Hydration failed" error in browser console
**Common Causes**:
- Using `window`, `document`, `localStorage` in Server Component
- Conditional rendering based on client-only state
- Invalid HTML nesting (e.g., `<div>` inside `<p>`)
- Different content rendered on server vs client

**Solution**:
- Move browser APIs to `useEffect` in Client Component
- Use `'use client'` directive for interactive components
- Fix HTML nesting issues
- Ensure consistent rendering on server and client

### Missing 'use client' Directive
**Symptom**: "You're importing a component that needs X. It only works in a Client Component..."
**Solution**: Add `'use client'` at top of file that uses:
- Event handlers (`onClick`, `onChange`, etc.)
- Hooks (`useState`, `useEffect`, etc.)
- Browser APIs (`window`, `localStorage`, etc.)

### tRPC Type Mismatch
**Symptom**: TypeScript errors when calling tRPC procedures
**Solution**:
- Ensure server is running (types are generated at runtime)
- Restart TypeScript server in IDE
- Check that router is properly exported in `src/server/routers/index.ts`

### Build Failures
**Symptom**: `npm run build` fails but dev works
**Common Causes**:
- Type errors only caught at build time
- Missing environment variables
- Unused exports or circular dependencies
- Static generation issues (data fetching errors)

**Solution**:
- Read error message carefully
- Run `npm run typecheck` first
- Check Next.js build output for specific file errors
- Verify environment variables

### Prisma Client Errors
**Symptom**: "PrismaClient is unable to run in the browser"
**Solution**: Don't import `db` in Client Components - use tRPC instead

**Symptom**: Type errors after schema changes
**Solution**: Run `npx prisma generate` to update Prisma Client types

## Testing Strategy

### Manual Testing Checklist
- [ ] Happy path works end-to-end
- [ ] Error scenarios handled gracefully
- [ ] Edge cases considered
- [ ] Different user roles tested (if applicable)
- [ ] Mobile responsiveness verified

### Before Major Features
- [ ] Test all affected pages/routes
- [ ] Verify database migrations work
- [ ] Check console for warnings/errors
- [ ] Test authentication flows if modified
- [ ] Verify no performance regressions

## Documentation

### When to Update Docs
- [ ] New environment variable added (update README)
- [ ] Breaking changes to API/database
- [ ] New development commands/scripts
- [ ] Architectural changes

### Code Comments
- [ ] Complex logic explained with comments
- [ ] JSDoc for exported functions
- [ ] Type annotations for non-obvious types
