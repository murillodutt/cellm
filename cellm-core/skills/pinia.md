---
skill: pinia
triggers: ["**/store/**", "**/stores/**"]
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

// Access state
const { user, isLoading } = storeToRefs(userStore)

// Call actions
await userStore.login({ email, password })
</script>
```

## Rules

1. Always Setup Store (not Options)
2. Use `storeToRefs` to maintain reactivity
3. Async actions with try/finally
4. Name stores with `use` prefix and `Store` suffix
