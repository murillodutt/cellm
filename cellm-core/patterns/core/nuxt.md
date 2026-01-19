---
id: NX-INDEX
tags: [nuxt, ssr]
---

# Nuxt Patterns

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

## NX-003: SSR-Safe useState

```typescript
// [+] SSR-safe
const count = useState('count', () => 0)

// [-] Do not use ref for shared state
const count = ref(0) // Leaks between requests on the server
```

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

## NX-005: Server Utils

```typescript
// server/utils/db.ts
export const db = drizzle(...)

// Use in API routes
// server/api/users.get.ts
export default defineEventHandler(async () => {
  return await db.select().from(users)
})
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

## NX-008: ClientOnly for Browser Components

> Problem: Browser-only components (charts, datepickers) cause hydration mismatch or "window is not defined" errors during SSR

```vue
<!-- [-] Wrong -->
<LineChart :data="data" />

<!-- [+] Correct -->
<ClientOnly>
  <LineChart :data="data" />
</ClientOnly>
```

**When to use ClientOnly:**
- Charts (nuxt-charts, canvas/svg libraries)
- Date pickers (complex calendar components)
- Maps/Editors (Google Maps, Leaflet, TipTap)

**Related:** VU-007, NX-015

## NX-009: Nuxt UI Type Imports

> Problem: Component types from @nuxt/ui not found or incorrectly imported as values

```typescript
// [-] Wrong
import { TableColumn } from '@nuxt/ui'

// [+] Correct
import type { TableColumn, DropdownItem, EditorCustomHandlers } from '@nuxt/ui'
```

**Related:** TS-013, TS-011

## NX-010: getQuery Type Conversion

> Problem: Query params from getQuery are always strings, need explicit conversion

```typescript
// server/api/items.get.ts
export default defineEventHandler((event) => {
  const query = getQuery(event)

  // [-] Wrong - id is string
  const id = query.id

  // [+] Correct - convert to number
  const id = Number(query.id)
  if (!id) throw createError({ statusCode: 400, message: 'ID required' })

  // Boolean: query.active === 'true'
  // Array: String(query.ids).split(',')
})
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

## NX-014: Async Context Loss

> Problem: "Nuxt instance unavailable" error when using composables after await

```typescript
// [-] Wrong - composable after await
async function setup() {
  const data = await fetchData()
  const route = useRoute()  // ERROR: Nuxt instance unavailable
}

// [+] Correct - composables BEFORE await
async function setup() {
  const route = useRoute()
  const data = await fetchData()
}
```

**Alternatives:**
- Reorder: declare composables BEFORE any await
- Use call/runWithContext to restore instance
- Enable experimental.asyncContext in nuxt.config.ts

## NX-015: Hydration Fixes

> Problem: Attribute differences (especially IDs) between server HTML and client hydration

```typescript
// [-] Wrong - dynamic ID causes mismatch
const id = Math.random().toString()

// [+] Correct - use useId()
const id = useId()
// In template: <input :id="id" />
```

**Solutions:**
- Dynamic IDs: useId() (Nuxt 3.10+)
- Inconsistent keys: use stable keys based on unique data
- Browser modules: wrap in <ClientOnly>

**Related:** NX-008

## NX-016: SSR Navigation

> Problem: navigateTo doesn't work in fetch interceptors or Nitro handlers during SSR

```typescript
// [-] Wrong - navigateTo in SSR interceptor
if (!authenticated) {
  navigateTo('/login')  // Doesn't work
}

// [+] Correct - use writeHead
if (import.meta.server) {
  event.node.res.writeHead(302, { Location: '/login' })
  event.node.res.end()
  return
}
```

**Related:** NX-011

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

## NX-018: UModal v4 API

> Problem: Using old UModal API from Nuxt UI v3

| Aspect | v3 (Old) | v4 (Correct) |
|--------|----------|--------------|
| Model | `v-model="x"` | `v-model:open="x"` |
| Title | `#header` slot | `title` prop |
| Content | direct or `#content` | `#body` slot |

```vue
<!-- [+] Correct UModal v4 -->
<UModal
  v-model:open="showConfirm"
  title="Confirm Delete"
  :ui="{ footer: 'justify-end' }"
>
  <template #body>
    <p>Are you sure you want to delete this item?</p>
  </template>
  <template #footer>
    <UButton variant="outline" @click="showConfirm = false">Cancel</UButton>
    <UButton color="error" @click="confirmDelete">Delete</UButton>
  </template>
</UModal>
```

**Policy:**
- ALLOWED: Destructive confirmations (delete, cancel, logout)
- PROHIBITED: Forms, inputs, selects, complex interactions
- If needs form -> use navigateTo() for drill-down page

## NX-019: NuxtHub Blob Storage

> Problem: Code uses `hubBlob()` which does NOT exist. NuxtHub auto-imports `blob` as instance

```typescript
// [-] Wrong - hubBlob() does not exist
const blob = hubBlob()
await blob.put(filename, file, options)

// [+] Correct - 'blob' is auto-imported
const result = await blob.put(filename, file, { prefix: 'media' })
// Normalize pathname (blob.put returns without leading slash)
const url = result.pathname.startsWith('/')
  ? result.pathname
  : `/${result.pathname}`
```

**API Methods:**
- `blob.put(key, value, options)` - Upload
- `blob.get(key)` - Download (returns Blob | null)
- `blob.del(key)` - Delete
- `blob.head(key)` - Get metadata
- `blob.list(options)` - List blobs
