---
id: PN-INDEX
version: v0.10.0
status: OK
tags: [pinia, state]
budget: ~500 tokens
---

# Pinia Patterns

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

## PN-004: Persist (with plugin)

```typescript
export const useUserStore = defineStore('user', () => {
  // ...
}, {
  persist: {
    storage: persistedState.localStorage
  }
})
```

## PN-005: Reset State

```typescript
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)

  function $reset() {
    user.value = null
  }

  return { user, $reset }
})
```

## PN-006: Setup Store Pattern

> Problem: Using Options API syntax in Pinia stores makes composition and typing harder

```typescript
// [-] Wrong - Options API style
export const useFinanceStore = defineStore('finance', {
  state: () => ({ charges: [] as Charge[] }),
  getters: { pending: (state) => state.charges.filter(...) },
  actions: { async fetch() { ... } }
})

// [+] Correct - Setup Store (Composition API)
export const useFinanceStore = defineStore('finance', () => {
  const charges = ref<Charge[]>([])
  const loading = ref(false)

  const pending = computed(() =>
    charges.value.filter(c => c.status === 'IN_REVIEW')
  )

  async function fetch() {
    loading.value = true
    try {
      charges.value = await $fetch('/api/charges')
    } finally {
      loading.value = false
    }
  }

  return { charges, loading, pending, fetch }
})
```

**Benefits:**

- Full TypeScript inference
- Better composable integration
- Easier testing
- Consistent with Vue 3 setup syntax
