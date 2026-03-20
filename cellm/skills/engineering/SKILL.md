---
description: Four CELLM engineering axioms that calibrate all code decisions: ONE VERSION, RESOLVE>SILENCE, LAZY>EAGER, NOW>LATER. Activates on source files. Use when editing code to enforce consistent engineering principles across the codebase.
user-invocable: false
---

# Engineering Axioms — Before Code

Four non-negotiable principles for every line of code:

| Axiom | Meaning | Anti-Pattern |
|-------|---------|-------------|
| ONE VERSION | No v1/v2 coexistence. Migrate all, remove old. | `if (version === 1)`, compatibility layers, `convertOldToNew()` |
| RESOLVE > SILENCE | Fix the cause, never suppress. | `@ts-ignore`, `eslint-disable`, silent catch, `optimizeDeps.exclude` |
| LAZY > EAGER | Load on-demand by default. | Eager imports of heavy deps, non-lazy components, blocking initialization |
| NOW > LATER | Can be done now? Do it now. | TODO comments for trivial fixes, deferred cleanup |

## NEVER

- **Suppress warnings** — every warning is a real problem to fix
- **Maintain compatibility layers** — migrate completely, then delete
- **Eagerly load** what can be lazy — `defineAsyncComponent`, dynamic imports, `.client.vue`
- **Defer** what takes less effort now than later
