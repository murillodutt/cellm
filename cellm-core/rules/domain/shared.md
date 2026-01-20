---
id: DOM-SH-001
version: v1.1.0
status: OK
paths: ["shared/**"]
budget: ~350 tokens
---

# Shared Rules

## Purpose

Isomorphic code (works on both client and server).

## Allowed

- TypeScript types
- Interfaces
- Zod schemas
- Pure functions (no side effects)
- Constants

## Prohibited

- Imports from 'vue'
- Imports from 'nuxt'
- Imports from server/*
- Imports from app/*
- DOM access
- Filesystem access

## Structure

```text
shared/
  types/
    user.ts        # export type User = {...}
    api.ts         # export type ApiResponse<T> = {...}
    index.ts       # re-exports
  
  schemas/
    user.ts        # export const UserSchema = z.object({...})
    index.ts       # re-exports
  
  utils/
    format.ts      # export function formatDate(d: Date): string
    validate.ts    # export function isEmail(s: string): boolean
    index.ts       # re-exports
  
  constants/
    index.ts       # export const MAX_RETRIES = 3
```

## Example

```typescript
// shared/types/user.ts
export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

// shared/schemas/user.ts
import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  createdAt: z.date()
})

export type User = z.infer<typeof UserSchema>
```
