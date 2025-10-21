# Task Completion Checklist

## Before Marking Task Complete

### 1. Code Quality Checks

```bash
npm run typecheck    # MUST pass - no TypeScript errors
npm run lint         # MUST pass - no linting errors
npm run format       # Auto-format all files
```

### 2. Build Verification

```bash
npm run build        # MUST succeed - verify no build errors
```

### 3. Functionality Testing

- [ ] Test the feature manually in development mode (`npm run dev`)
- [ ] Verify all user flows work as expected
- [ ] Check error handling and edge cases
- [ ] Test on different screen sizes if UI changes

### 4. Database Changes (if applicable)

- [ ] Prisma schema updated in `prisma/schema.prisma`
- [ ] Migration created: `npx prisma migrate dev --name "description"`
- [ ] Migration files committed to git
- [ ] Prisma client regenerated (happens automatically)

**CRITICAL**: If SQLAlchemy models were changed in the parent project:
- [ ] Manually sync Prisma schema with SQLAlchemy models
- [ ] Both systems must stay in sync (they share the same PostgreSQL database)

### 5. Code Review Self-Check

- [ ] No commented-out code (unless temporary with TODO)
- [ ] No console.log statements (use proper logging if needed)
- [ ] No hardcoded sensitive data (use environment variables)
- [ ] Proper error messages for user-facing errors
- [ ] TypeScript types are explicit (no `any` types)
- [ ] Components use proper naming conventions (PascalCase)

### 6. Performance Considerations

- [ ] Images optimized and using Next.js Image component
- [ ] No unnecessary client components (use Server Components when possible)
- [ ] Proper loading states for async operations
- [ ] Error boundaries in place for critical sections

### 7. Git Workflow

```bash
git status           # Review changed files
git add .            # Stage changes
git commit -m "descriptive message"
git push             # Push to remote
```

### 8. Documentation (if needed)

- [ ] Update CLAUDE.md if new patterns/conventions introduced
- [ ] Add comments for complex logic
- [ ] Update README if user-facing features changed

## Common Issues to Check

### TypeScript Errors
- Missing imports
- Incorrect type definitions
- Null/undefined handling
- Promise handling (async/await)

### Prisma Errors
- Schema syntax errors
- Missing relations
- Incorrect field types
- Migration conflicts

### Build Errors
- Import path issues
- Missing environment variables
- Next.js configuration problems
- Tailwind class issues

### Runtime Errors
- Authentication issues (NextAuth)
- Database connection problems
- tRPC procedure errors
- API endpoint failures

## Quick Fixes

### Clear caches:
```bash
rm -rf .next node_modules
npm install
```

### Reset database (dev only):
```bash
npx prisma migrate reset
```

### Regenerate Prisma client:
```bash
npx prisma generate
```
