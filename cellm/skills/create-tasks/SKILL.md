---
description: Break a requirement into dependency-ordered task groups in the spec database. Decomposes checks into phases and tasks with DAG ordering.
argument-hint: "[check title or search term]"
allowed-tools: mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_counters, AskUserQuestion
---

# Decomposition Thinking — Before Splitting

Find or create the check, then decompose into the database.

## Framework

1. **Locate** — `spec_search` for existing check, or create one via `/cellm:spec create`.
2. **Decompose** — Groups follow dependency DAG:
   - Foundation (schema, types) → Data Layer (DB, API) → State (stores, composables) → UI (components, pages) → Integration (wiring) → Polish (a11y, responsive)
   - Skip irrelevant layers. Add domain-specific groups.
3. **Define** — Each task is atomic, testable, traceable. One imperative action per task.
4. **Present** — Show breakdown. Allow adjustments via AskUserQuestion.
5. **Create** — `spec_create_node` for each phase and task. `spec_add_edge` for cross-phase dependencies.

## Atomicity Test

Can this task be completed in one focused session? If no, split it.
Can you verify it passed without running the whole system? If no, refine the action.

## NEVER

- **Markdown files** — tasks are `spec_create_node(nodeType: "task")`, not tasks.md
- **Circular dependencies** — phases form a DAG, edges enforce it
- **Vague tasks** — "implement feature" is not a task. "Create POST /api/x endpoint" is.
- **God tasks** — if it crosses multiple files AND multiple concerns, split it
