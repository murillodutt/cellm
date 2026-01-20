---
id: TS-ADVANCED
version: v0.10.0
status: OK
tags: [typescript, advanced]
budget: ~350 tokens
---

# TypeScript Advanced Patterns

## TS-009: Union Type Assertions

> Problem: Using `as any` for type compatibility

```typescript
// [-] Wrong
const session = data as any

// [+] Correct
type SessionUnion = QuizSession | WordCloudSession | ChallengeSession
const session = data as SessionUnion
```

**Related:** VU-008

## TS-010: DateValue shallowRef

> Problem: `ref<CalendarDate>` causes #private error due to Vue deep proxy

```typescript
// [-] Wrong
const date = ref<CalendarDate>(val)

// [+] Correct
import type { DateValue } from '@internationalized/date'
const date = shallowRef<DateValue | undefined>(undefined)
```

**Related:** VU-007

## TS-011: Editor Custom Handlers

> Problem: Record<string, unknown> incompatible with EditorCustomHandlers

```typescript
// [-] Wrong
const handlers: Record<string, unknown> = {}

// [+] Correct
import type { EditorCustomHandlers } from '@nuxt/ui'

const handlers = computed<EditorCustomHandlers>(() => ({
  imageUpload: {
    canExecute: () => true,
    execute: fn,
    isActive: () => false
  },
}))
```

**Related:** NX-009

## TS-012: Error Handling

> Problem: Error typed as `any` in catch block

```typescript
// [-] Wrong
catch (e: any) {
  toast.add({ title: e.message })
}

// [+] Correct
catch (err: unknown) {
  const e = err as { data?: { message?: string } }
  toast.add({ title: e.data?.message || 'Error', color: 'error' })
}
```

**Related:** TS-014
