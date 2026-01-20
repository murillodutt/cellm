---
id: NX-DATA
version: v0.10.0
status: OK
tags: [nuxt, data-fetching]
budget: ~300 tokens
---

# Nuxt Data Patterns

## NX-001: Data Fetching with Key

```typescript
// [+] Always with a unique key
const { data } = await useAsyncData('users', () =>
  $fetch('/api/users')
)

// [+] Dynamic key
const { data } = await useAsyncData(
  `user-${id}`,
  () => $fetch(`/api/users/${id}`)
)
```

## NX-002: useFetch vs useAsyncData

```typescript
// useFetch: simple cases
const { data } = await useFetch('/api/users')

// useAsyncData: more control
const { data, refresh, pending } = await useAsyncData(
  'users',
  () => $fetch('/api/users'),
  {
    watch: [filter],
    transform: (data) => data.items
  }
)
```

## NX-006: useFetch Default Object

> Problem: Default as empty array `() => []` causes incorrect type in data destructuring

```typescript
// [-] Wrong
const { data } = await useFetch<Item[]>('/api/items', {
  default: () => []
})

// [+] Correct
const { data } = await useFetch<{ items: Item[] }>('/api/items', {
  default: () => ({ items: [] })
})
```

**Related:** TS-006

## NX-012: Content v3 queryCollection

> Problem: Using deprecated queryContent API from Nuxt Content v2

```typescript
// [-] Wrong (Content v2)
const posts = await queryContent('blog').find()

// [+] Correct (Content v3)
const { data } = await useAsyncData('posts', async () => {
  return await queryCollection('blog')
    .order('date', 'DESC')
    .all() as BlogPost[]
})
```

**Related:** NX-013

## NX-013: Content v3 Config

> Problem: Markdown config options not applied due to obsolete keys

```typescript
// nuxt.config.ts

// [-] Wrong
export default defineNuxtConfig({
  content: { documentDriven: false }
})

// [+] Correct
export default defineNuxtConfig({
  content: {
    build: {
      markdown: {
        toc: { depth: 3 }
      }
    }
  }
})
```

**Related:** NX-012
