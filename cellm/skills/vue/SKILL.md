---
name: vue
description: Vue 3 Composition API patterns for components and composables. Activates when editing .vue files or composables to enforce script setup, typed props/emits, and canonical section ordering.
paths:
  - "**/*.vue"
  - "**/composables/**/*.ts"
user-invocable: false
---

Every Vue component uses **`<script setup lang="ts">`** with sections in this exact order: imports, props/emits, state, computed, methods, watchers, lifecycle.

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { User } from '~/shared/types'

const props = defineProps<{
  user: User
  loading?: boolean
}>()

const emit = defineEmits<{
  update: [user: User]
  delete: [id: string]
}>()

const count = ref(0)
const fullName = computed(() => `${props.user.firstName} ${props.user.lastName}`)

function increment() { count.value++ }

watch(() => props.user, (v) => console.log('changed:', v), { deep: true })
onMounted(() => { /* init */ })
</script>
```

**Props** — always generic typed: `defineProps<{ name: Type }>()`. No runtime props object.

**Emits** — always typed: `defineEmits<{ event: [payload: Type] }>()`.

**Composables** — `use` prefix, return reactive refs: `export function useCounter(initial = 0) { ... }`.

**v-model** — use `defineModel<T>()`, never manual prop+emit pair.

**Provide/Inject** — typed injection key: `provide('key', value)` / `inject<Type>('key')`.

**storeToRefs** — always destructure store state through `storeToRefs(store)`, never `store.someRef`.

## NEVER

- **Options API** — no `data()`, `methods:`, `computed:`, `watch:` objects
- **Untyped props/emits** — no `defineProps(['name'])` or `defineEmits(['click'])`
- **`any` type** — use `unknown` then narrow with type guards
- **`<script>` without `setup`** — every component is `<script setup lang="ts">`
- **Reactive destructuring** without `toRefs`/`storeToRefs` — loses reactivity
