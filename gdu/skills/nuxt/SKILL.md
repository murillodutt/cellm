---
description: Nuxt 4 patterns for full-stack Vue applications. Activates on nuxt.config, app/, server/, and pages/ to enforce correct data fetching, routing, server/client separation, and Nuxt UI integrations.
user-invocable: false
---

`app/` frontend, `server/` backend, `shared/` isomorphic.

**Data fetching** — `useFetch('/api/endpoint')` simple, `useAsyncData('key', () => $fetch(...))` with dedup key/transform.

**Server routes** — file-based with method suffix: `server/api/users/[id].get.ts`. Use `defineEventHandler`, `getRouterParam`, `readBody`.

**State** — `useState('key', () => default)` for SSR-safe. Complex state goes to Pinia.

**Config** — `useRuntimeConfig()`, never `process.env` in client.

**Errors** — `throw createError({ statusCode: 404, statusMessage: 'Not found' })`.

## Auto-Registered Integrations (Nuxt UI v4)

These modules are registered automatically by `@nuxt/ui` — do NOT install or configure separately:

| Module | What It Does | Usage |
|--------|-------------|-------|
| `@nuxt/icon` | 200k+ Iconify icons | `<UIcon name="i-lucide-star" />` |
| `@nuxt/fonts` | Auto-load fonts from CSS `--font-sans` declaration | Declare in `@theme {}` block |
| `@nuxtjs/color-mode` | Light/dark switching | `useColorMode()`, `<ColorModeButton />` |

## Optional Integration: `@nuxt/content`

Must be registered **after** `@nuxt/ui` in modules array. Provides: ContentSearch, ContentNavigation, ContentToc, ContentSurround, prose components.

Add `@source "../../../content/**/*"` in CSS for Tailwind class detection in markdown.

## NEVER

- **Raw `$fetch` in component setup** — use `useFetch`/`useAsyncData`
- **`process.env` in client** — use `useRuntimeConfig().public`
- **Components in `server/`** — Nitro-only, no Vue
- **Server imports in `app/`** — never import from `server/`
- **Missing method suffix** — always `.get.ts`, `.post.ts`
- **Install `@nuxt/icon` or `@nuxt/fonts` manually** — auto-registered by `@nuxt/ui`
