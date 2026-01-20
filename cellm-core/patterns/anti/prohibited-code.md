---
id: ANTI-CODE
version: v1.1.0
status: OK
severity: critical
alwaysApply: true
budget: ~350 tokens
---

# Prohibited Code Patterns

## TypeScript Bans

| Ban | Correct | Pattern |
| --- | ------- | ------- |
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
| --- | ------- | ------- |
| `ref<ComplexClass>()` | `shallowRef<T>()` | VU-007 |
| `computed(() => ...)` | `computed<T>(() => ...)` | VU-008 |
| `v-if="item.type === 'x'"` | Type guard function | VU-009 |
| `reactive<any>({})` | `reactive<Record<K,V>>({})` | VU-010 |

## Nuxt Bans

| Ban | Correct | Pattern |
| --- | ------- | ------- |
| `useFetch` without key | `useFetch(url, { key })` | NX-006 |
| Chart without ClientOnly | `<ClientOnly>` wrapper | NX-008 |
| `Date.now()` in template | Use computed or mounted | NX-015 |
| `v-model="x"` in UModal | `v-model:open="x"` | NX-018 |
| `#header` slot in UModal | `title` prop | NX-018 |
| Forms in UModal | navigateTo() drill-down | NX-018 |

## Charts Bans

| Ban | Correct |
| --- | ------- |
| Hardcoded hex colors | `useChartConfig().colors` |
| CSS `--vis-*` variables | Tailwind/designStore |
| Inline color definitions | chartColors composable |
