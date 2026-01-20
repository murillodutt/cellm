---
id: VU-CORE
version: v1.1.0
status: OK
tags: [vue, components]
budget: ~400 tokens
---

# Vue Core Patterns

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
