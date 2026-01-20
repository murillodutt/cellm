---
id: PN-ADVANCED
version: v1.1.0
status: OK
tags: [pinia, state, advanced]
budget: ~350 tokens
---

# Pinia Advanced Patterns

> Part of: [Patterns Index](../index.md#pinia)

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

## Related

- [pinia-core.md](pinia-core.md) - Basic store patterns
