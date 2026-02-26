---
name: create-tasks
description: Break a technical specification into actionable task groups sorted by dependency order. Reads spec.md and produces tasks.md with numbered groups and critical path.
argument-hint: "[spec-folder-path]"
allowed-tools: Read, Grep, Glob, Write, Edit, AskUserQuestion
---

Break spec.md into dependency-ordered task groups. Write `tasks.md` in the spec folder.

## Thinking Framework

1. **Locate** — Argument or most recent spec folder. Ask if ambiguous.
2. **Read** — spec.md + plan.md for scope and order hints.
3. **Decompose** — Groups follow dependency DAG:
   - Foundation (schema, types, utils) → Data Layer (DB ops, API) → State (stores, composables) → UI (components, pages) → Integration (wiring, routing) → Polish (a11y, responsive, dark mode)
   - Skip irrelevant groups. Add custom groups if needed.
4. **Define** — Each task is atomic, testable, traceable to spec.
5. **Present** — Show breakdown via AskUserQuestion. Allow adjustments.
6. **Write** — `tasks.md` with status symbols: `[ ]` pending, `[~]` in progress, `[x]` done, `[!]` blocked, `[-]` cancelled.

## NEVER

- **Tasks without spec** — always read spec.md first
- **Circular dependencies** — groups form a DAG
- **Vague tasks** — every task has clear scope and done criteria
- **God tasks** — if it takes more than one session, split it
