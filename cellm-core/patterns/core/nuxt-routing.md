---
id: NX-ROUTING
version: v1.1.0
status: OK
tags: [nuxt, routing, middleware]
budget: ~250 tokens
---

# Nuxt Routing Patterns

## NX-004: Middleware

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUserState()

  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})
```

## NX-007: definePageMeta

> Problem: Page without explicitly defined layout or middleware

```typescript
// [+] Always define page meta
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

// Common mappings:
// Backoffice: dashboard + ['auth']
// Student: mobile + ['auth']
// Public: default + []
// Focus: focus + ['auth']
```

## NX-011: Auth Middleware

> Problem: Route protection without centralized auth state and permissions check

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  if (!auth.hasPermission('admin')) {
    return navigateTo('/unauthorized')
  }
})
```

**Related:** NX-016

## NX-017: CORS Proxy

> Problem: Requests to external APIs without CORS headers are blocked by the browser

```typescript
// [-] Wrong - direct fetch blocked by CORS
const data = await $fetch('https://api-no-cors.com/data')

// [+] Correct - proxy through server
// server/api/proxy/[...path].ts
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  return await $fetch(`https://api.external.com/${path}`)
})

// Client usage
const data = await $fetch('/api/proxy/data')
```
