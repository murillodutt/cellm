---
name: typescript
description: |
  TypeScript patterns and best practices.
  Use when: writing TypeScript code, defining types, type safety issues.
  Triggers: .ts files, type definitions, generics, type errors.
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/types/**/*"
allowed-tools: Read, Grep, Glob, Edit, Write
model: inherit
---

# TypeScript

## Type Definitions

```typescript
// Interfaces for objects
interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

// Types for unions/primitives
type Status = 'pending' | 'active' | 'inactive'
type ID = string | number

// Generics
interface ApiResponse<T> {
  data: T
  error?: string
}
```

## Type Guards

```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  )
}

// Usage
if (isUser(data)) {
  console.log(data.email) // Type-safe
}
```

## Utility Types

```typescript
// Partial - all optional
type UpdateUser = Partial<User>

// Pick - subset
type UserPreview = Pick<User, 'id' | 'name'>

// Omit - exclude
type CreateUser = Omit<User, 'id' | 'createdAt'>

// Required - all required
type RequiredUser = Required<User>

// Record - key-value
type UserMap = Record<string, User>
```

## Zod Schemas

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  age: z.number().optional()
})

type User = z.infer<typeof userSchema>

// Validate
const result = userSchema.safeParse(input)
if (result.success) {
  // result.data is typed
}
```

## $fetch Typing

```typescript
// Typed response
const user = await $fetch<User>('/api/user/1')

// With error handling
const { data, error } = await useFetch<User>('/api/user/1')
```

## Rules

1. Prefer interfaces for objects, types for unions
2. Always define return types for functions
3. Use `unknown` instead of `any`
4. Use Zod for runtime validation
5. Avoid type assertions (`as`) when possible
