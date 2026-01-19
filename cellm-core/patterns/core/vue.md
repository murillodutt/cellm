---
id: VU-INDEX
version: v0.10.0
status: OK
tags: [vue, components]
budget: ~800 tokens
---

# Vue Patterns

## VU-001: Composition API

```vue
<script setup lang="ts">
// Always setup, never Options API
</script>
```

## VU-002: Typed Props

```typescript
// [+] With generics
const props = defineProps<{
  user: User
  loading?: boolean
}>()

// [+] With defaults
const props = withDefaults(defineProps<{
  count?: number
}>(), {
  count: 0
})
```

## VU-003: Typed Emits

```typescript
const emit = defineEmits<{
  update: [user: User]
  delete: [id: string]
  (e: 'change', value: string): void
}>()
```

## VU-004: Custom v-model

```vue
<script setup lang="ts">
const model = defineModel<string>()
// Equivalent to:
// props: ['modelValue']
// emits: ['update:modelValue']
</script>

<template>
  <input v-model="model" />
</template>
```

## VU-005: Typed Provide/Inject

```typescript
// Define key
const UserKey = Symbol() as InjectionKey<User>

// Provide
provide(UserKey, user)

// Inject
const user = inject(UserKey)
```

## VU-006: Async Components

```typescript
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
```

## VU-007: shallowRef for External Classes

> Problem: Vue tries to proxy #private properties in external classes, causing runtime errors

```typescript
// [-] Wrong
const editor = ref(ExternalClassInstance)

// [+] Correct
const editor = shallowRef(ExternalClassInstance)

// Guidelines:
// - ref(): primitives, simple objects
// - shallowRef(): classes with #private, large/complex objects
```

**Related:** TS-010, NX-008

## VU-008: Typed Computed

> Problem: Computed without explicit type can infer `any` or overly complex types

```typescript
// [-] Wrong
const filtered = computed(() => items.value.filter(i => i.active))

// [+] Correct
const filtered = computed<Item[]>(() =>
  items.value.filter(i => i.active)
)
```

## VU-009: Type Guards

> Problem: Using `as SpecificType` without prior field existence check

```typescript
// [-] Wrong
const questions = (obj as QuizSession).questions

// [+] Correct
function isQuizSession(s: SessionUnion): s is QuizSession {
  return s.type === 'quiz'
}

if (isQuizSession(session)) {
  session.questions  // properly typed
}
```

**Related:** TS-009

## VU-010: Typed Reactive Record

> Problem: Reactive with overly generic Record (Record<string, any>)

```typescript
// [-] Wrong
const answers = reactive<Record<string, any>>({})

// [+] Correct
const answers = reactive<Record<number, string>>({})
answers[questionId] = selectedOption  // typed
```

**Related:** TS-014

## VU-011: resolveComponent in Render Functions

> Problem: Component not found when using h() directly with strings

```typescript
// [-] Wrong
import { h } from 'vue'
return h('UBadge', { color: 'primary' }, () => 'Text')

// [+] Correct
import { h, resolveComponent } from 'vue'
const UBadge = resolveComponent('UBadge')
return h(UBadge, { color: 'primary' }, () => 'Text')
```
