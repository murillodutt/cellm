---
id: SK-VUE
version: v1.1.0
status: OK
skill: vue
triggers: ["app/**/*.vue"]
budget: ~350 tokens
---

# Vue 3

## Composition API

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed, watch, onMounted } from 'vue'
import type { User } from '~/shared/types'

// 2. Props/Emits
const props = defineProps<{
  user: User
  loading?: boolean
}>()

const emit = defineEmits<{
  update: [user: User]
  delete: [id: string]
}>()

// 3. Refs and State
const count = ref(0)
const name = ref('')

// 4. Computed
const fullName = computed(() => `${props.user.firstName} ${props.user.lastName}`)

// 5. Methods
function increment() {
  count.value++
}

// 6. Watchers
watch(() => props.user, (newVal) => {
  console.log('User changed:', newVal)
}, { deep: true })

// 7. Lifecycle
onMounted(() => {
  // init
})
</script>
```

## Rules

1. Always `<script setup lang="ts">`
2. Order: imports → props/emits → state → computed → methods → watch → lifecycle
3. Never Options API
4. Typed props with generics
5. Typed emits

## Composables

```typescript
// composables/useCounter.ts
export function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  const decrement = () => count.value--
  return { count, increment, decrement }
}
```
