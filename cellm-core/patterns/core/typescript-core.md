---
id: TS-CORE
version: v0.10.0
status: OK
tags: [typescript, types]
budget: ~400 tokens
---

# TypeScript Core Patterns

## TS-001: Types over any

```typescript
// [-]
function process(data: any) {}

// [+]
function process<T>(data: T) {}
function process(data: unknown) {}
```

## TS-002: Type Guards

```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  )
}
```

## TS-003: Zod for Runtime

```typescript
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2)
})

type User = z.infer<typeof UserSchema>
```

## TS-004: Discriminated Unions

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

function handle(result: Result<User>) {
  if (result.success) {
    // result.data is User
  } else {
    // result.error is string
  }
}
```

## TS-005: Utility Types

```typescript
// Partial - all props optional
type UpdateUser = Partial<User>

// Pick - subset of props
type UserPreview = Pick<User, 'id' | 'name'>

// Omit - exclude props
type CreateUser = Omit<User, 'id' | 'createdAt'>
```

## TS-013: Type Imports

> Problem: Importing types as values or vice versa

```typescript
// [-] Wrong
import { MyType } from 'pkg'

// [+] Correct
import type { User, ApiResponse } from '~/types'
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
```

**Related:** NX-009, ES-001

## TS-014: Anti-any Alternatives

> Problem: Using `any` disables type checking and allows silent bugs

```typescript
// [-] Wrong
function handle(data: any) { ... }

// [+] Correct
function handle<T extends Record<string, unknown>>(data: T) { ... }

// Alternatives to any:
// - specific types/interfaces
// - Record<string, unknown>
// - unknown + type narrowing
```

**Related:** VU-009, TS-012
