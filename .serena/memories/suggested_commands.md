# Suggested Development Commands

## Daily Development

```bash
npm run dev          # Start development server at localhost:3000
npm run build        # Build for production
npm run start        # Start production server
```

## Code Quality (Task Completion)

```bash
npm run typecheck    # TypeScript type checking - RUN BEFORE COMMITTING
npm run lint         # Run Biome linter - RUN BEFORE COMMITTING
npm run format       # Format code with Biome
```

## Database Operations

```bash
# Prisma commands (run from projects/web/)
npx prisma generate              # Generate Prisma client (auto-runs on npm install)
npx prisma studio                # Open database GUI
npx prisma migrate dev           # Create and apply migration
npx prisma migrate dev --name "migration_name"  # Create named migration
npx prisma migrate deploy        # Apply migrations in production
npx prisma migrate reset         # Reset database and apply all migrations
npx prisma db push               # Push schema changes without migration (dev only)
npx prisma db pull               # Pull schema from database
```

## Analysis and Performance

```bash
npm run analyze      # Analyze bundle size (sets ANALYZE=true)
npm run perf:test    # Run performance tests
```

## Testing

```bash
npm test             # Run tests (when configured)
```

## Common Workflows

### After changing Prisma schema:
```bash
npx prisma migrate dev --name "description"
# Prisma client regenerates automatically
```

### Fresh install:
```bash
npm install          # Also runs prisma generate via postinstall
```

### Clean rebuild:
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Git Commands (Linux)

Standard git commands work as expected:
```bash
git status
git add .
git commit -m "message"
git push
```
