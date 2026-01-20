---
id: NX-API
version: v1.1.0
status: OK
tags: [nuxt, api, server]
budget: ~450 tokens
---

# Nuxt API Patterns

## NX-005: Server Utils

```typescript
// server/utils/db.ts
export const db = drizzle(...)

// server/api/users.get.ts
export default defineEventHandler(async () => {
  return await db.select().from(users)
})
```

## NX-009: Nuxt UI Type Imports

```typescript
// [-] import { TableColumn } from '@nuxt/ui'
// [+] import type { TableColumn, DropdownItem } from '@nuxt/ui'
```

**Related:** TS-013, TS-011

## NX-010: getQuery Type Conversion

```typescript
export default defineEventHandler((event) => {
  const query = getQuery(event)
  // [-] const id = query.id // string!
  // [+] const id = Number(query.id)
  if (!id) throw createError({ statusCode: 400, message: 'ID required' })
})
```

## NX-018: UModal v4 API

| v3 (Old) | v4 (Correct) |
| -------- | ------------ |
| `v-model="x"` | `v-model:open="x"` |
| `#header` slot | `title` prop |
| `#content` | `#body` slot |

**Policy:** Destructive confirmations only. Forms -> navigateTo() drill-down.

## NX-019: NuxtHub Blob Storage

```typescript
// [-] const blob = hubBlob() // does NOT exist
// [+] 'blob' is auto-imported
const result = await blob.put(filename, file, { prefix: 'media' })
const url = result.pathname.startsWith('/') ? result.pathname : `/${result.pathname}`
```

**API:** `blob.put()`, `blob.get()`, `blob.del()`, `blob.head()`, `blob.list()`
