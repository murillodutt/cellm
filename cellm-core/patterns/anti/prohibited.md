---
id: ANTI-INDEX
version: v0.10.0
status: OK
severity: critical
alwaysApply: true
budget: ~600 tokens
---

# Prohibited

**ANTI-001: Never `any`**
→ use specific type or `unknown`

```typescript
// [-] Wrong
const data: any = {}

// [+] Correct
const data: unknown = {}
```

**ANTI-002: Never hardcode colors**
→ use tokens: primary, neutral, error

```vue
<!-- [-] -->
<div class="text-blue-500">

<!-- [+] -->
<div class="text-primary">
```

**ANTI-003: Never sync I/O**
→ use async/await, fs/promises

```typescript
// [-] Wrong
const data = fs.readFileSync('file.txt')

// [+] Correct
const data = await fs.promises.readFile('file.txt')
```

**ANTI-004: Never console.log in production**
→ use structured logger

```typescript
// [-] Wrong
console.log('Error', err)

// [+] Correct
logger.error('Failed to process', { err })
```

**ANTI-005: Never expose stack traces**
→ generic errors for client

```typescript
// [-] Wrong
throw createError({ message: err.stack })

// [+] Correct
throw createError({ message: 'Internal Server Error' })
```

---

## Quick Lookup

| Error | Pattern | Fix |
 | ------- |--------- | ----- |
| TS2589 | TS-015 | Use typedFetch wrapper |
| TS2345 | TS-006 | Type $fetch call |
| TS7006 | TS-014 | Use explicit types |
| hydration mismatch | NX-015 | Use computed/mounted/useId |
| vue/valid-v-model | VU-007 | Use shallowRef |
| @typescript-eslint/no-explicit-any | TS-014 | Use alternatives |

## Banned Libraries

| Ban | Use Instead |
 | ----- |-------------|
| axios | $fetch |
| moment.js | date-fns |
| lodash | native ES6+ |
| vuex | Pinia |
| express | h3 (Nitro) |
| heroicons | i-lucide-* |

## Banned UI Patterns

| Ban | Use Instead |
 | ----- |-------------|
| UDrawer | navigateTo() drill-down |
| USlideover | navigateTo() drill-down |
| UModal with forms | separate page |
| hardcoded hex colors | semantic tokens (--ui-*) |
| bg-[#xxx] | Tailwind semantic classes |

## Banned Practices

| Ban | Fix |
 | ----- |-----|
| @ts-ignore | Fix the underlying error |
| as unknown as T | Use type narrowing |
| eslint-disable | Fix the code violation |

## TypeScript Bans

| Ban | Correct | Pattern |
 | ----- |--------- | --------- |
| `$fetch<any>()` | `$fetch<T>()` | TS-006 |
| `method: 'POST' as any` | `method: 'POST'` | TS-007 |
| `field: string` (null possible) | `field: string \| null` | TS-008 |
| `session as any` | `session as TypeA \| TypeB` | TS-009 |
| `ref<CalendarDate>()` | `shallowRef<DateValue>()` | TS-010 |
| `catch (e: any)` | `catch (err: unknown)` | TS-012 |
| `import { MyType }` | `import type { MyType }` | TS-013 |
| `$fetch<ComplexType>()` | `typedFetch<T>()` | TS-015 |

## Vue Bans

| Ban | Correct | Pattern |
 | ----- |--------- | --------- |
| `ref<ComplexClass>()` | `shallowRef<T>()` | VU-007 |
| `computed(() => ...)` | `computed<T>(() => ...)` | VU-008 |
| `v-if="item.type === 'x'"` | Type guard function | VU-009 |
| `reactive<any>({})` | `reactive<Record<K,V>>({})` | VU-010 |

## Nuxt Bans

| Ban | Correct | Pattern |
 | ----- |--------- | --------- |
| `useFetch` without key | `useFetch(url, { key })` | NX-006 |
| Chart without ClientOnly | `<ClientOnly>` wrapper | NX-008 |
| `Date.now()` in template | Use computed or mounted | NX-015 |
| `v-model="x"` in UModal | `v-model:open="x"` | NX-018 |
| `#header` slot in UModal | `title` prop | NX-018 |
| Forms in UModal | navigateTo() drill-down | NX-018 |

## Charts Bans

| Ban | Correct |
 | ----- |---------|
| Hardcoded hex colors | `useChartConfig().colors` |
| CSS `--vis-*` variables | Tailwind/designStore |
| Inline color definitions | chartColors composable |

## Navigation Bans

| Ban | Fix |
 | ----- |-----|
| Orphaned page | Add entry in sidebar menu |
| URL-only access | Add to global search |
| Misplaced route | Move to correct semantic group |
