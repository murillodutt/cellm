---
name: pinia
description: Pinia state management for Vue/Nuxt applications. Activates on store files to enforce Setup Store syntax, storeToRefs destructuring, and focused single-domain stores.
paths:
  - "**/stores/**/*.ts"
  - "**/store/**/*.ts"
user-invocable: false
---

Every store uses **Setup Store syntax** (function-based `defineStore`). State is destructured with **`storeToRefs()`** to preserve reactivity. Each store owns **one domain** — never a god store.

```typescript
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    try {
      user.value = await $fetch('/api/auth/login', { method: 'POST', body: credentials })
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    navigateTo('/login')
  }

  return { user, isLoading, isAuthenticated, login, logout }
})
```

**In components** — `const store = useUserStore()`, then `const { user, isLoading } = storeToRefs(store)` for state, `store.login(...)` for actions.

**Naming** — `use` prefix + domain + `Store` suffix: `useUserStore`, `useCartStore`.

**Async actions** — always `try/finally` to reset loading state even on error.

**Persist** — `{ persist: true }` as third argument (requires `pinia-plugin-persistedstate`).

## NEVER

- **Options Store syntax** — no `state()`, `getters:`, `actions:` objects
- **Destructure without `storeToRefs`** — `const { count } = store` loses reactivity
- **God stores** — one store per domain, not one store for everything
- **Direct `store.$state` mutation** — use actions for state changes
- **`any` in store types** — fully type all state, getters, and action parameters
