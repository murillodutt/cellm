---
id: TS-FETCH
version: v1.1.0
status: OK
tags: [typescript, fetch, http]
budget: ~350 tokens
---

# TypeScript Fetch Patterns

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
