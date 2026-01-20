---
id: VU-ADVANCED
version: v0.10.0
status: OK
tags: [vue, advanced]
budget: ~400 tokens
---

# Vue Advanced Patterns

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
