---
id: NX-SSR
version: v1.1.0
status: OK
tags: [nuxt, ssr, hydration]
budget: ~400 tokens
---

# Nuxt SSR Patterns

## NX-003: SSR-Safe useState

```typescript
// [+] SSR-safe
const count = useState('count', () => 0)
// [-] ref(0) leaks between requests on server
```

## NX-008: ClientOnly for Browser Components

```vue
<!-- [-] <LineChart :data="data" /> -->
<!-- [+] -->
<ClientOnly>
  <LineChart :data="data" />
</ClientOnly>
```

**Use for:** Charts, date pickers, maps, editors

**Related:** VU-007, NX-015

## NX-014: Async Context Loss

```typescript
// [-] composable after await = "Nuxt instance unavailable"
async function setup() {
  const data = await fetchData()
  const route = useRoute()  // ERROR
}

// [+] composables BEFORE await
async function setup() {
  const route = useRoute()
  const data = await fetchData()
}
```

## NX-015: Hydration Fixes

```typescript
// [-] const id = Math.random().toString()
// [+] const id = useId()
```

**Solutions:** useId() for dynamic IDs, stable keys, ClientOnly wrapper

**Related:** NX-008

## NX-016: SSR Navigation

```typescript
// [-] navigateTo('/login') in SSR interceptor doesn't work
// [+] Use writeHead
if (import.meta.server) {
  event.node.res.writeHead(302, { Location: '/login' })
  event.node.res.end()
  return
}
```

**Related:** NX-011
