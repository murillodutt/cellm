---
description: CELLM engineering axioms plus pre-write discipline against silent assumptions, premature complexity, drive-by edits, and unverifiable goals. Activates when adding logic, changing control flow, or introducing dependencies in source files. Inactive on read-only operations, pure formatting/whitespace changes, comment-only edits, type-only refinements, and renames/moves with no semantic change.
cellm_scope: universal
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

## Pre-Write Discipline

Bias: caution over speed. Trivial edits use judgment. For non-trivial work,
pass these checks before the first edit:

| Guard | Required Before Editing | Blocks |
|-------|-------------------------|--------|
| THINK BEFORE CODING | Name assumptions, ambiguity, simplest safe interpretation. Push back when a simpler path exists. Stop and ask when confused. | Silent assumptions, confident wrong paths, hidden confusion |
| SIMPLICITY FIRST | Add complexity only when needed now, with a real second consumer or explicit contract. If 200 LOC could be 50, rewrite. Senior-engineer test: would they call it overcomplicated? | Premature abstractions, speculative options, framework-shaped code for one case |
| SURGICAL CHANGES | Every touched line traces to the request or to an orphan this change created. Match existing style. Mention unrelated dead code, do not delete it. | Drive-by refactors, style drift, adjacent rewrites, unrequested cleanup |
| GOAL-DRIVEN EXECUTION | Define the falsifiable finish line before building. Bugs get reproduction; features get expected behavior; refactors get before/after green. State a step → verify plan for multi-step work. | "Make it work" loops, weak success criteria, closure without evidence |

Plan template for multi-step tasks:

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

If a task is trivial, satisfy the guards silently and proceed. If the work is
ambiguous, risky, broad, or architectural, state the guard outcome before
editing.

## NEVER

- **Suppress warnings** — every warning is a real problem to fix
- **Maintain compatibility layers** — migrate completely, then delete
- **Eagerly load** what can be lazy — `defineAsyncComponent`, dynamic imports, `.client.vue`
- **Defer** what takes less effort now than later
- **Add abstraction before timing proves it** — correct shape too early is still wrong
- **Touch neighboring code as a side quest** — record it as follow-up unless it blocks the goal

---

Pre-Write Discipline adapted from Tilly's behavioral guidelines (MIT,
github.com/forrestchang/tilly-engineer-skills).
