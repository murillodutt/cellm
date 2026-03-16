---
description: Break a requirement into dependency-ordered task groups in the spec database. Decomposes checks into phases and tasks with DAG ordering.
user-invocable: true
argument-hint: "[check title or search term]"
allowed-tools: mcp__cellm-oracle__spec_decompose, mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_counters, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, AskUserQuestion
---

# Decomposition Thinking — Before Splitting

Find or create the check, then decompose into the database.

## Framework

1. **Detect Project** — `git rev-parse --show-toplevel` → last segment = project name.
2. **Locate** — `spec_search` for existing check, or create one via `/cellm:spec create`.
2. **Decompose** — Groups follow dependency DAG:
   - Foundation (schema, types) → Data Layer (DB, API) → State (stores, composables) → UI (components, pages) → Integration (wiring) → Polish (a11y, responsive)
   - Skip irrelevant layers. Add domain-specific groups.
3. **Define** — Each task is atomic, testable, traceable. One imperative action per task.
4. **Present** — Show breakdown. Allow adjustments via AskUserQuestion.
5. **Batch Create (preferred)** — If creating phases + tasks for an existing check, use `spec_decompose` to create the entire subtree atomically in one call (see plan-to-spec skill for full schema). This replaces steps 6-7 with a single call.
6. **Fallback: Create** — If `spec_decompose` is unavailable, use `spec_create_node(project, nodeType, sessionId: <current-session-id>, ...)` for each phase and task — `project` and `sessionId` params on every call for isolation and audit trail. `spec_add_edge` for cross-phase dependencies.
7. **Fallback: Edges** — After all phases exist, create DAG edges (see [Edge Creation](#edge-creation)). Auto-chain supported: calling `completed` from `pending`/`active` resolves intermediate states automatically. Auto-rollup: when all child tasks complete, the parent phase auto-completes — but each leaf task must be explicitly transitioned.

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

## Interface Contract Enforcement

When a check spans multiple domains (DB + API + UI), enforce type contracts across phase boundaries:

1. **Database phase** outputs: schema types, migration files. `fileRefs` must include type export paths.
2. **Backend phase** inputs: schema types. Outputs: API response types, Zod schemas. `fileRefs` must include both input schema paths and output type paths.
3. **Frontend phase** inputs: API response types. Outputs: typed components. `fileRefs` must include response type paths from predecessor.

Each phase's `briefing.constraints` must reference the output types of its predecessor:
- "API response must match CommentSchema from server/db/schema.ts"
- "Component props must type-check against GET /api/comments response"

This ensures the DAG is not just ordering but also **type-safe across boundaries**.

## Phase Enrichment

When creating phases via `spec_create_node`, enrich the body with `briefing` and `specialist`:

**briefing** (provide for every phase):
- `objective`: 1 imperative sentence — what the phase delivers concretely
- `successCriteria`: deterministic exit — a grep, test, or typecheck command that proves completion
- `keyFiles`: files the specialist should READ before starting (context files, not modification targets)
- `constraints`: hard limits derived from check.principle and DSE decisions (`dse_search` for UI/component phases to surface avoid rules and existing components)

**specialist** (provide for every phase):
- `role`: inferred from work type — component/page work = "frontend", API/endpoint = "backend", schema/migration = "database", config/deploy = "infra", scan/verify = "audit"
- `focus`: 1 sentence — what the specialist should prioritize above all else
- `tools`: primary tools (e.g., "Read, Edit, Grep" for frontend; "Bash, Grep" for audit)

## Recursive Sub-Tasks

Tasks can contain sub-tasks (`spec_create_node(nodeType: 'task', parentId: '<parent-task-id>')`). Use when a task is too complex for a single session but logically belongs under one parent.

- Sub-tasks are atomic (leaf nodes). Parent tasks are containers — they auto-complete via rollup when all children finish.
- Max depth: 5 levels (check=0...task=4). `spec_decompose` creates flat tasks; use individual `spec_create_node` calls for sub-tasks until Onda 2.
- Generate at least 1 verification per leaf task when the assertion is derivable from the action/fileRef (`spec_add_verification`).

## Atomicity Test

Can this task be completed in one focused session? If no, split it into sub-tasks.
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

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after decomposition, write feedback entry to `dev-cellm-feedback/entries/create-tasks-{date}-{seq}.md`. Note which composite actions were split, whether atomicity tests failed on first pass, and how interface contracts across phases were defined. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## NEVER

- **Markdown files** — tasks are `spec_create_node(nodeType: "task")`, not tasks.md
- **Circular dependencies** — phases form a DAG, edges enforce it
- **Vague tasks** — "implement feature" is not a task. "Create POST /api/x endpoint" is.
- **Ignore DSE for UI phases** — `dse_search` before defining constraints for component/page phases to include avoid rules and existing component mandates
- **God tasks** — if it crosses multiple files AND multiple concerns, split it
- **Non-English content** — all phase titles, task actions, and descriptions must be in English
- **Omit sessionId** — always pass `sessionId` to `spec_create_node` for audit trail
- **Ignore BLOCKED_BY_DEPENDENCY** — if `spec_transition` returns this error, check predecessor phase status before proceeding
- **Invalid parent-child hierarchies** — check→phase/task/gap/decision/requirement/verification, phase→task/gap/decision/verification, task→task/gap/verification. Service rejects violations with INVALID_CHILD_TYPE. Max depth: 5 (check=0, phase=1, task=2, sub-task=3, sub-sub-task=4).
- **Skip the Evolutionary Analytical Feedback** — when CELLM_DEV_MODE is true, reflection after decomposition is mandatory
