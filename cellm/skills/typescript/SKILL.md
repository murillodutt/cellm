---
name: typescript
description: TypeScript patterns for type-safe code. Activates on .ts/.tsx files to enforce strict typing, Zod validation, and proper use of generics and utility types.
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/types/**/*"
user-invocable: false
---

Every function has an **explicit return type**. Every object shape is an **interface**. Every union/primitive alias is a **type**. Runtime validation uses **Zod schemas** with `z.infer<typeof schema>` for type derivation.

```typescript
interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

type Status = 'pending' | 'active' | 'inactive'

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  age: z.number().optional()
})
type UserInput = z.infer<typeof userSchema>
```

**Interfaces** — objects and API contracts. **Types** — unions, intersections, mapped types.

**Utility types** — `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>` — use instead of manual redefinition.

**Type guards** — `function isUser(v: unknown): v is User` with runtime checks, not assertions.

**Generics** — `ApiResponse<T>` for reusable contracts. Constrain with `extends` when needed.

**Zod** — `safeParse` for external input, access `result.data` only after `result.success` check.

**$fetch typing** — `$fetch<User>('/api/user/1')` or `useFetch<User>(...)`.

## NEVER

- **`any`** — use `unknown` then narrow with type guards or Zod
- **Type assertions (`as`)** — fix the type at the source, don't cast
- **Untyped function returns** — every function declares its return type
- **Manual type redefinition** — use utility types (`Partial`, `Pick`, `Omit`)
- **`// @ts-ignore`** — fix the type error, don't suppress it
- **Runtime props without Zod** — external input must be validated, not trusted
