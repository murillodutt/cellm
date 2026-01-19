---
id: DOM-FE-001
paths: ["app/**"]
---

# Frontend Rules

## Components

```vue
<script setup lang="ts">
// Required order:
// 1. Imports
// 2. Props/Emits
// 3. Composables
// 4. Refs/State
// 5. Computed
// 6. Methods
// 7. Watch
// 8. Lifecycle
</script>

<template>
  <!-- Clean template, logic in script -->
</template>
```

## Naming

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | UserCard.vue |
| Composables | useXxx | useAuth.ts |
| Pages | kebab-case | user-profile.vue |

## State

- Local: `ref()`, `reactive()`
- Shared: `useState()` (SSR-safe)
- Global complex: Pinia

## Data Fetching

```typescript
// Always with key
const { data } = await useAsyncData('key', fetcher)

// Error handling
const { data, error } = await useFetch('/api/users')
if (error.value) {
  // handle
}
```

## Nuxt UI

- Always semantic tokens
- Never direct color Tailwind classes
