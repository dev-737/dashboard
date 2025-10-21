# Code Style Conventions

## TypeScript Style

- **Formatter**: Biome (configured in `biome.jsonc`)
- **Quote Style**: Single quotes (`'hello'`)
- **Indentation**: 2 spaces
- **Trailing Commas**: ES5 style (in objects, arrays)
- **Line Length**: No strict limit, but keep reasonable
- **Semicolons**: Required
- **Type Hints**: Required for all function signatures and complex variables

## Naming Conventions

### Components (PascalCase)
- **All component files**: `ConnectionEditForm.tsx`, `HubLayout.tsx`, `AnimatedWelcome.tsx`
- **Component functions**: `export function MyComponent() {}`
- **Directories**: lowercase with hyphens (feature-name) or camelCase for utilities

### Variables and Functions (camelCase)
- **Variables**: `const userData = ...`
- **Functions**: `function getUserData() {}`
- **Hooks**: `use` prefix - `useHubData()`, `useConnections()`
- **Server Actions**: `async function createHub() {}`

### Constants (UPPER_SNAKE_CASE or camelCase)
- **Global constants**: `MAX_FILE_SIZE`, `DEFAULT_TIMEOUT`
- **Enum-like objects**: `const STATUS = { ACTIVE: 'active', INACTIVE: 'inactive' }`

### Types and Interfaces (PascalCase)
- **Interfaces**: `interface UserProfile {}`
- **Types**: `type HubData = ...`
- **Enums**: `enum Status { Active, Inactive }`

## Import Organization

Biome auto-organizes imports in groups:
1. Node built-ins (if any)
2. External packages (`react`, `next`, etc.)
3. Internal imports with `@/` alias
4. Relative imports (`./`, `../`)

Use path alias `@/` for all internal imports:
```typescript
import { db } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
```

## TypeScript Patterns

### Props Interfaces
```typescript
interface MyComponentProps {
  title: string;
  optional?: number;
  onClick: () => void;
}

export function MyComponent({ title, optional, onClick }: MyComponentProps) {
  // ...
}
```

### Server Components (default)
```typescript
// No 'use client' directive
export default async function Page() {
  const data = await db.query.findMany();
  return <div>{/* ... */}</div>;
}
```

### Client Components (when needed)
```typescript
'use client';
import { useState } from 'react';

export function InteractiveComponent() {
  const [state, setState] = useState(0);
  // ...
}
```

## Tailwind CSS Usage

- Use `cn()` utility from `@/lib/utils` for conditional classes
- Prefer Tailwind utilities over custom CSS
- Use component variants with `class-variance-authority` (cva)

```typescript
import { cn } from '@/lib/utils';

<div className={cn('rounded-md px-4 py-2', isActive && 'bg-blue-500')} />
```

## Component Organization

- **UI Components**: `src/components/ui/` (base, reusable)
- **Feature Components**: Domain folders (e.g., `src/components/features/dashboard/`)
- **Layout Components**: `src/components/layout/`
- **Form Components**: `src/components/forms/`

## File Structure

- Use PascalCase for all component files
- One component per file (unless tightly coupled)
- Colocate related files (component + styles + tests)
- Use index files sparingly (prefer explicit imports)

## Best Practices

- **Server Components First**: Use Server Components by default, only add `'use client'` when needed
- **No Emoji by Default**: Only use emojis if explicitly requested
- **Explicit Types**: Always type function parameters and return values
- **Error Handling**: Use try-catch in async functions, handle errors gracefully
- **Comments**: Use JSDoc for complex functions, inline comments for tricky logic
