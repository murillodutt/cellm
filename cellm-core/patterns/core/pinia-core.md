---
id: PN-CORE
version: v1.1.0
status: OK
tags: [pinia, state]
budget: ~300 tokens
---

# Pinia Core Patterns

> Part of: [Patterns Index](../index.md#pinia)

## PN-001: Setup Store

```typescript
// [+] Always Setup Store
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  async function login(creds: Credentials) {
    user.value = await $fetch('/api/auth/login', {
      method: 'POST',
      body: creds
    })
  }

  return { user, isAuthenticated, login }
})
```

## PN-002: storeToRefs

```typescript
// [+] Maintain reactivity
const store = useUserStore()
const { user, isAuthenticated } = storeToRefs(store)

// [-] Loses reactivity
const { user } = useUserStore()
```

## PN-003: Async Actions

```typescript
async function fetchUsers() {
  isLoading.value = true
  error.value = null

  try {
    users.value = await $fetch('/api/users')
  } catch (e) {
    error.value = e
  } finally {
    isLoading.value = false
  }
}
```

## Related

- [pinia-advanced.md](pinia-advanced.md) - Persist, reset, setup patterns
