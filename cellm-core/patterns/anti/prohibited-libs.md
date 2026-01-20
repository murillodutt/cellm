---
id: ANTI-LIBS
version: v0.10.0
status: OK
severity: critical
alwaysApply: true
budget: ~200 tokens
---

# Prohibited Libraries and Practices

## Banned Libraries

| Ban | Use Instead |
| --- | ----------- |
| axios | $fetch |
| moment.js | date-fns |
| lodash | native ES6+ |
| vuex | Pinia |
| express | h3 (Nitro) |
| heroicons | i-lucide-* |

## Banned UI Patterns

| Ban | Use Instead |
| --- | ----------- |
| UDrawer | navigateTo() drill-down |
| USlideover | navigateTo() drill-down |
| UModal with forms | separate page |
| hardcoded hex colors | semantic tokens (--ui-*) |
| bg-[#xxx] | Tailwind semantic classes |

## Banned Practices

| Ban | Fix |
| --- | --- |
| @ts-ignore | Fix the underlying error |
| as unknown as T | Use type narrowing |
| eslint-disable | Fix the code violation |
