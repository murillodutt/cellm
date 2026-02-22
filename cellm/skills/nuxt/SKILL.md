---
name: nuxt
description: Nuxt 4 patterns for full-stack Vue applications. Activates on nuxt.config, app/, server/, and pages/ to enforce correct data fetching, routing, and server/client separation.
paths:
  - "**/nuxt.config.ts"
  - "**/app.vue"
  - "**/app/**/*"
  - "**/server/**/*"
  - "**/pages/**/*"
user-invocable: false
---

Frontend lives in **`app/`**, backend in **`server/`**, shared isomorphic code in **`shared/`**. Every data fetch in components uses **`useFetch`** or **`useAsyncData`** — never raw `$fetch` in component setup.

```text
app/           # Frontend (auto-imported components, composables, pages)
server/        # Nitro backend (api/, utils/)
shared/        # Isomorphic types and utilities
```

**Data fetching** — `useFetch('/api/endpoint')` for simple, `useAsyncData('key', () => $fetch(...))` when you need a dedup key or transform.

**Server routes** — file-based with method suffix: `server/api/users/[id].get.ts`. Use `defineEventHandler`, `getRouterParam`, `readBody`.

**State** — `useState('key', () => default)` for SSR-safe globals. Complex state goes to Pinia.

**Middleware** — `defineNuxtRouteMiddleware((to, from) => { ... })` in `middleware/`.

**Error handling** — `throw createError({ statusCode: 404, statusMessage: 'Not found' })`.

**Config** — runtime config via `useRuntimeConfig()`, never `process.env` in client code.

## NEVER

- **Raw `fetch`/`$fetch` in component setup** — breaks SSR hydration, use `useFetch`/`useAsyncData`
- **`process.env` in client code** — use `useRuntimeConfig().public`
- **Components in `server/`** — server directory is Nitro-only, no Vue
- **Server imports in `app/`** — never import from `server/` in frontend code
- **Missing method suffix** on server routes — always `.get.ts`, `.post.ts`, etc.
- **`navigateTo` outside middleware/composable** — not available in server context
