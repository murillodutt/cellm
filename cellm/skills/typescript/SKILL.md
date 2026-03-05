---
description: TypeScript patterns for type-safe code. Activates on .ts/.tsx files to enforce strict typing, Zod validation, and proper use of generics and utility types.
user-invocable: false
---

Explicit return types on every function. Interfaces for objects. Types for unions/intersections. Zod for runtime validation with `z.infer<typeof schema>`.

**Utility types** — `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>` over manual redefinition.

**Type guards** — `function isUser(v: unknown): v is User` with runtime checks, not assertions.

**Zod** — `safeParse` for external input, access `.data` only after `.success`.

**$fetch** — `$fetch<User>('/api/user/1')` or `useFetch<User>(...)`.

## NEVER

- **`any`** — use `unknown` + type guards or Zod
- **Type assertions (`as`)** — fix at source, don't cast
- **Untyped returns** — explicit on every function
- **Manual type redefinition** — use utility types
- **`// @ts-ignore`** — fix the error
- **Unvalidated external input** — Zod required
