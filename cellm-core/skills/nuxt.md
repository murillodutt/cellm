---
id: SK-NUXT
version: v1.1.0
status: OK
skill: nuxt
triggers: ["app/**", "server/**"]
budget: ~250 tokens
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
// With key
const { data } = await useAsyncData('users', () => $fetch('/api/users'))

// Simple
const { data } = await useFetch('/api/users')
```

## State

```typescript
// SSR-safe
const count = useState('count', () => 0)

// Complex → Pinia
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
