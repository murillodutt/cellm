---
description: Vue 3 Composition API patterns for components and composables. Activates when editing .vue files or composables to enforce script setup, typed props/emits, and canonical section ordering.
user-invocable: false
---

`<script setup lang="ts">` with section order: imports → props/emits → state → computed → methods → watchers → lifecycle.

**Props** — generic typed: `defineProps<{ name: Type }>()`.

**Emits** — typed: `defineEmits<{ event: [payload: Type] }>()`.

**v-model** — `defineModel<T>()`, never manual prop+emit pair.

**Composables** — `use` prefix, return reactive refs.

**Store destructuring** — `storeToRefs(store)` for state, `store.action()` for actions.

## NEVER

- **Options API** — no `data()`, `methods:`, `computed:`, `watch:`
- **Untyped props/emits** — no `defineProps(['name'])`
- **`any`** — use `unknown` + type guards
- **`<script>` without `setup`** — always `<script setup lang="ts">`
- **Destructure store without `storeToRefs`** — loses reactivity
