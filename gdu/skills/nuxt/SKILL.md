---
description: Nuxt 4 patterns for full-stack Vue applications. Activates on nuxt.config, app/, server/, and pages/ to enforce correct data fetching, routing, and server/client separation.
user-invocable: false
---

`app/` frontend, `server/` backend, `shared/` isomorphic.

**Data fetching** — `useFetch('/api/endpoint')` simple, `useAsyncData('key', () => $fetch(...))` with dedup key/transform.

**Server routes** — file-based with method suffix: `server/api/users/[id].get.ts`. Use `defineEventHandler`, `getRouterParam`, `readBody`.

**State** — `useState('key', () => default)` for SSR-safe. Complex → Pinia.

**Config** — `useRuntimeConfig()`, never `process.env` in client.

**Errors** — `throw createError({ statusCode: 404, statusMessage: 'Not found' })`.

## NEVER

- **Raw `$fetch` in component setup** — use `useFetch`/`useAsyncData`
- **`process.env` in client** — use `useRuntimeConfig().public`
- **Components in `server/`** — Nitro-only, no Vue
- **Server imports in `app/`** — never import from `server/`
- **Missing method suffix** — always `.get.ts`, `.post.ts`
- **`navigateTo` in server context** — only in middleware/composable
