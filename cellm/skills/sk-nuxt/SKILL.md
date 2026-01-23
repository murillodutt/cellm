---
name: nuxt
description: |
  Nuxt 4 patterns for full-stack Vue applications.
  Use when: working with Nuxt projects, server routes, data fetching, SSR.
  Triggers: nuxt.config, app directory, server directory, useFetch, useAsyncData.
allowed-tools: Read, Grep, Glob, Edit, Write
model: inherit
---

# Nuxt 4

## Structure

```text
app/           # Frontend
  components/  # Auto-imported
  composables/ # use* prefix
  pages/       # File routing
server/        # Nitro Backend
  api/         # Routes
  utils/       # Utils
shared/        # Isomorphic
```

## Data Fetching

```typescript
// With key for deduplication
const { data } = await useAsyncData('users', () => $fetch('/api/users'))

// Simple fetch
const { data } = await useFetch('/api/users')

// With options
const { data, refresh, status } = await useFetch('/api/users', {
  lazy: true,
  server: false,
  transform: (data) => data.users
})
```

## State

```typescript
// SSR-safe global state
const count = useState('count', () => 0)

// Complex state -> Pinia
const store = useUserStore()
```

## Server Route

```typescript
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  return await getUserById(id)
})
```

## Middleware

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUserStore()
  if (!user.isAuthenticated) {
    return navigateTo('/login')
  }
})
```

## Error Handling

```typescript
// Throw error
throw createError({
  statusCode: 404,
  statusMessage: 'User not found'
})

// Error page: error.vue
```

## Rules

1. Use app/ for frontend, server/ for backend
2. Always useAsyncData/useFetch for data (never raw fetch in components)
3. Use shared/ for isomorphic code
4. Server routes with .get.ts, .post.ts suffixes
