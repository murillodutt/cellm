---
description: Break a requirement into dependency-ordered task groups in the spec database. Decomposes checks into phases and tasks with DAG ordering.
user-invocable: true
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
6. **Edges** — After all phases exist, create DAG edges (see [Edge Creation](#edge-creation)).

## Edge Creation

Cross-phase ordering uses `spec_add_edge`. Call it **after** all phases are created.

```
spec_add_edge({
  project: "project-name",
  sourceId: "phase-that-blocks",   // must complete first
  targetId: "phase-that-waits",    // cannot start until source completes
  edgeType: "blocks"
})
```

| edgeType | Meaning | When to use |
|----------|---------|-------------|
| `blocks` | source must complete before target starts | Phase ordering (P1 blocks P2) |
| `depends_on` | source cannot start until target completes | Inverse of blocks (P2 depends_on P1) |
| `implements` | source task implements target requirement | Task-to-requirement traceability |
| `tests` | source verification tests target task | Verification-to-task link |
| `related` | informational link | Cross-reference without ordering |

`dependsOnPhase` in phase body = **informational context** for the specialist.
`spec_add_edge` = **enforceable DAG constraint** in the database.
Use both: body for human context, edge for machine enforcement.

## Phase Enrichment

When creating phases via `spec_create_node`, enrich the body with `briefing` and `specialist`:

**briefing** (provide for every phase):
- `objective`: 1 imperative sentence — what the phase delivers concretely
- `successCriteria`: deterministic exit — a grep, test, or typecheck command that proves completion
- `keyFiles`: files the specialist should READ before starting (context files, not modification targets)
- `constraints`: hard limits derived from check.principle

**specialist** (provide for every phase):
- `role`: inferred from work type — component/page work = "frontend", API/endpoint = "backend", schema/migration = "database", config/deploy = "infra", scan/verify = "audit"
- `focus`: 1 sentence — what the specialist should prioritize above all else
- `tools`: primary tools (e.g., "Read, Edit, Grep" for frontend; "Bash, Grep" for audit)

## Atomicity Test

Can this task be completed in one focused session? If no, split it.
Can you verify it passed without running the whole system? If no, refine the action.
Does the action describe a single visual element or behavioral assertion? If it lists multiple (commas, "and", enumerated elements), split into 1 task per element.

## Composite Action Detection

Before finalizing any task, scan the action text for:
- **Commas separating elements**: "add X, Y, Z" → 3 tasks
- **"and" joining distinct concerns**: "create header and footer" → 2 tasks
- **Enumerated visual elements**: "group number, leader name, member count" → 3 tasks

Each element becomes its own task with its own fileRef and verification assertion. A composite action that survives as one task will have partial implementations slip through undetected.

## fileRef Completeness

Component fileRef alone is incomplete when data flows through layers. When a task involves displaying data (signals: "display", "show", "list", "fetch", "render"), trace the data source:
1. Identify the component's data provider (composable, store, or direct API call).
2. Check if the described field exists in the data source's type definition.
3. If missing: add API route + composable/store as additional fileRefs with note "Data source requires modification."

Example: task "show leader name in GrupoCard" → fileRefs must include `GrupoCard.vue` + `useGrupos.ts` + `server/api/grupos/index.get.ts`.

## Mobile-First Consistency Audit

After decomposition, if `check.principle` contains "mobile-first" or target is a mobile PWA:
1. Scan tasks for desktop-heavy components: `UTable`, `grid-cols-3+`, `overflow-x-auto`, wide fixed-width layouts.
2. Flag for review or create a replacement task in the Polish phase.
3. Preferred mobile alternatives: card lists over tables, vertical stacks over multi-column grids, swipeable carousels over horizontal overflow.

## NEVER

- **Markdown files** — tasks are `spec_create_node(nodeType: "task")`, not tasks.md
- **Circular dependencies** — phases form a DAG, edges enforce it
- **Vague tasks** — "implement feature" is not a task. "Create POST /api/x endpoint" is.
- **God tasks** — if it crosses multiple files AND multiple concerns, split it
- **Non-English content** — all phase titles, task actions, and descriptions must be in English
