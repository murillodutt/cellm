---
description: Pinia state management for Vue/Nuxt applications. Activates on store files to enforce Setup Store syntax, storeToRefs destructuring, and focused single-domain stores. Use when creating or editing Pinia stores, composables with shared state, or store-consuming components.
user-invocable: false
---

Setup Store syntax only. `storeToRefs()` for state destructuring. One domain per store.

**Naming** — `use` + domain + `Store`: `useUserStore`, `useCartStore`.

**Components** — `const { user } = storeToRefs(store)` for state, `store.login()` for actions.

**Async** — always `try/finally` to reset loading state.

**Persist** — `{ persist: true }` third argument.

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after store implementation, write feedback entry to `dev-cellm-feedback/entries/pinia-{date}-{seq}.md`. Note which store patterns caused friction, whether storeToRefs was consistently used, and which state management anti-patterns were detected. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## NEVER

- **Options Store** — no `state()`, `getters:`, `actions:`
- **Destructure without `storeToRefs`** — loses reactivity
- **God stores** — one domain per store
- **Direct `$state` mutation** — use actions
- **`any` in stores** — fully typed
- **Skip the Evolutionary Analytical Feedback** — when CELLM_DEV_MODE is true, reflection after store implementation is mandatory
