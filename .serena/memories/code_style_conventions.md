# Code Style & Conventions

## TypeScript Standards
- **Strict Mode**: Enabled in tsconfig.json
- **Type Inference**: Prefer explicit types for function signatures, infer for locals
- **Interface vs Type**: Use `interface` for object shapes, `type` for unions/intersections
- **Path Aliases**: Use `@/*` for imports (e.g., `@/components/ui/button`)

## React Patterns
- **Server Components**: Default for pages, explicitly mark client components with `'use client'`
- **Component Structure**: 
  - Props type defined inline or as separate interface
  - Functional components using arrow functions or `function` keyword
  - Export at end of file
- **Naming Conventions**:
  - Components: PascalCase (e.g., `UserNav`, `HubEditForm`)
  - Files: PascalCase for components, kebab-case for utilities
  - Hooks: camelCase with `use` prefix (e.g., `useHubSettings`)
- **Props Destructuring**: Destructure props in function signature
- **Async Components**: Server components can be `async` for data fetching

## Next.js App Router Patterns
- **Dynamic Loading**: Use `next/dynamic` for heavy components
- **Metadata**: Export `metadata` object or `generateMetadata` function
- **Loading States**: Provide `loading.tsx` for route segments
- **Error Boundaries**: Use `error.tsx` for graceful error handling
- **Route Groups**: Use `(groupName)` for logical grouping without affecting URL
- **Parallel Routes**: Use `@folder` for parallel route rendering

## Styling
- **CSS Framework**: Tailwind CSS 4 (v4 syntax)
- **Class Utility**: Use `cn()` from `@/lib/utils` to merge classes
- **Component Variants**: Use `class-variance-authority` (cva) for variant-based styling
- **Naming**: Use Tailwind utility classes, avoid custom CSS unless necessary
- **Color Scheme**: Dark theme by default (grays, purples, blues)
- **Gradient Pattern**: `from-purple-500 to-blue-500` for brand gradients

## Component Patterns
- **Radix UI**: Base primitives for accessible components
- **Composition**: Use Slot pattern from Radix for composability
- **Forwarding Refs**: Use React.forwardRef for components needing ref access
- **Display Names**: Set displayName for debugging

## tRPC Patterns
- **Router Organization**: One router per domain (hub, user, server, etc.)
- **Procedures**: 
  - `publicProcedure` for unauthenticated endpoints
  - `protectedProcedure` for authenticated-only endpoints
- **Input Validation**: Always use Zod schemas for input validation
- **Error Handling**: Throw `TRPCError` with appropriate codes
- **Mutations**: Use `.mutation()` for write operations, `.query()` for reads

## Database (Prisma)
- **Client Access**: Import from `@/lib/prisma` (singleton pattern)
- **Queries**: Use Prisma's type-safe query API
- **Relations**: Leverage `include` and `select` for optimized queries
- **Transactions**: Use `db.$transaction()` for atomic operations

## File Naming
- **Components**: `ComponentName.tsx`
- **Hooks**: `use-hook-name.ts`
- **Utils**: `util-name.ts`
- **Types**: `type-name.ts` or `type-name.d.ts`
- **Pages**: `page.tsx` (App Router convention)
- **Layouts**: `layout.tsx`
- **API Routes**: `route.ts`

## Import Order (Auto-sorted by Biome)
1. External dependencies (React, Next.js, etc.)
2. Internal absolute imports (`@/...`)
3. Relative imports (`./`, `../`)
4. Type imports (if separated)

## Code Formatting
- **Indentation**: 2 spaces (per Biome config)
- **Quotes**: Single quotes for strings
- **Trailing Commas**: ES5 style (functions, arrays, objects)
- **Semicolons**: Automatic (Biome decides)
- **Line Length**: No strict limit, but keep readable

## Naming Patterns
- **Boolean Props**: Prefix with `is`, `has`, `should`, `can` (e.g., `isOpen`, `hasError`)
- **Event Handlers**: Prefix with `on` or `handle` (e.g., `onClick`, `handleSubmit`)
- **State**: Descriptive names (e.g., `isLoading`, `userData`, `selectedHub`)
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for config objects

## Comments
- **JSDoc**: Use for exported functions, complex utilities
- **Inline**: Sparingly, explain _why_ not _what_
- **TODO**: Use `// TODO:` for future improvements

## Best Practices
- **Avoid Prop Drilling**: Use Context or state management when needed
- **Component Size**: Keep components focused and small
- **Performance**: Use `React.memo`, `useMemo`, `useCallback` judiciously
- **Error Handling**: Always handle errors gracefully
- **Accessibility**: Use semantic HTML, ARIA labels when needed
- **Security**: Never expose sensitive data client-side