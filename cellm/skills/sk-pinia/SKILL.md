---
name: pinia
description: |
  Pinia state management for Vue/Nuxt applications.
  Use when: creating stores, managing global state, complex state logic.
  Triggers: store files, defineStore, storeToRefs, useStore.
allowed-tools: Read, Grep, Glob, Edit, Write
model: inherit
---

# Pinia

## Setup Store (Recommended)

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // Getters (computed)
  const isAuthenticated = computed(() => !!user.value)
  const fullName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
  )

  // Actions
  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    try {
      user.value = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    navigateTo('/login')
  }

  return {
    // State
    user,
    isLoading,
    // Getters
    isAuthenticated,
    fullName,
    // Actions
    login,
    logout
  }
})
```

## Use in Components

```vue
<script setup lang="ts">
const userStore = useUserStore()

// Access state with reactivity
const { user, isLoading } = storeToRefs(userStore)

// Call actions
await userStore.login({ email, password })
</script>
```

## Persist State

```typescript
export const useUserStore = defineStore('user', () => {
  // ...
}, {
  persist: true  // Requires pinia-plugin-persistedstate
})
```

## Rules

1. Always Setup Store (not Options API)
2. Use `storeToRefs` to maintain reactivity when destructuring
3. Async actions with try/finally
4. Name stores with `use` prefix and `Store` suffix
5. Keep stores focused - one domain per store
