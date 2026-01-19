---
id: TS-INDEX
version: v0.10.0
status: OK
tags: [typescript, types]
budget: ~1300 tokens
---

# TypeScript Patterns

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

## TS-006: $fetch Typing

> Problem: Using `any` in $fetch calls loses type safety

```typescript
// [-] Wrong
const data = await $fetch<any>('/api/users/1')
const result = await $fetch('/api', { method: 'POST' as any })

// [+] Correct
const data = await $fetch<User>('/api/users/1')
const result = await $fetch<void>('/api/action', { method: 'POST' })
```

**Related:** NX-006, TS-007, TS-015

## TS-007: HTTP Method Literals

> Problem: Unnecessary casts for HTTP methods

```typescript
// [-] Wrong
await $fetch('/api/users', { method: 'POST' as any, body: data })

// [+] Correct
await $fetch('/api/users', { method: 'POST', body: data })
await $fetch('/api/users/1', { method: 'PUT', body: data })
await $fetch('/api/users/1', { method: 'DELETE' })
```

**Related:** TS-006

## TS-008: Nullable Fields

> Problem: API returns null but function does not accept it

```typescript
// [-] Wrong
function formatCurrency(value: string | number) { ... }

// [+] Correct
function formatCurrency(value: string | number | null) {
  if (value === null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value))
}
```

## TS-009: Union Type Assertions

> Problem: Using `as any` for type compatibility

```typescript
// [-] Wrong
const session = data as any

// [+] Correct
type SessionUnion = QuizSession | WordCloudSession | ChallengeSession
const session = data as SessionUnion
```

**Related:** VU-008

## TS-010: DateValue shallowRef

> Problem: `ref<CalendarDate>` causes #private error due to Vue deep proxy

```typescript
// [-] Wrong
const date = ref<CalendarDate>(val)

// [+] Correct
import type { DateValue } from '@internationalized/date'
const date = shallowRef<DateValue | undefined>(undefined)
```

**Related:** VU-007

## TS-011: Editor Custom Handlers

> Problem: Record<string, unknown> incompatible with EditorCustomHandlers

```typescript
// [-] Wrong
const handlers: Record<string, unknown> = {}

// [+] Correct
import type { EditorCustomHandlers } from '@nuxt/ui'

const handlers = computed<EditorCustomHandlers>(() => ({
  imageUpload: {
    canExecute: () => true,
    execute: fn,
    isActive: () => false
  },
}))
```

**Related:** NX-009

## TS-012: Error Handling

> Problem: Error typed as `any` in catch block

```typescript
// [-] Wrong
catch (e: any) {
  toast.add({ title: e.message })
}

// [+] Correct
catch (err: unknown) {
  const e = err as { data?: { message?: string } }
  toast.add({ title: e.data?.message || 'Error', color: 'error' })
}
```

**Related:** TS-014

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

## TS-015: Deep Type Instantiation (TS2589)

> Problem: TS2589 error - Type instantiation excessively deep in complex $fetch calls

```typescript
// [-] Wrong (causes TS2589)
const data = await $fetch<ComplexType>('/api/complex')

// [+] Correct - Create wrapper
// app/utils/typedFetch.ts
export const typedFetch = $fetch as <T>(
  ...args: Parameters<typeof $fetch>
) => Promise<T>

// Usage
const data = await typedFetch<ComplexType>('/api/complex')
```

**Related:** TS-006
