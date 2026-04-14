---
description: Pinia state management for Vue/Nuxt applications. Activates on store files to enforce Setup Store syntax, storeToRefs destructuring, and focused single-domain stores. Use when creating or editing Pinia stores, composables with shared state, or store-consuming components.
cellm_scope: universal
user-invocable: false
---

Setup Store syntax only. `storeToRefs()` for state destructuring. One domain per store.

**Naming** — `use` + domain + `Store`: `useUserStore`, `useCartStore`.

**Components** — `const { user } = storeToRefs(store)` for state, `store.login()` for actions.

**Async** — always `try/finally` to reset loading state.

**Persist** — `{ persist: true }` third argument.

## NEVER

- **Options Store** — no `state()`, `getters:`, `actions:`
- **Destructure without `storeToRefs`** — loses reactivity
- **God stores** — one domain per store
- **Direct `$state` mutation** — use actions
- **`any` in stores** — fully typed
