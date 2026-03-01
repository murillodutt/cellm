---
description: Convert a Claude Code plan file into a CellmOS spec check with phases and tasks. Reads a plan markdown, extracts structure, creates the check and decomposes into the database.
argument-hint: "<path-to-plan.md>"
allowed-tools: mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_get_counters, Read, Grep, Glob, Bash(git rev-parse *), AskUserQuestion
---

# Plan-to-Spec Thinking — Before Converting

A plan is a dense intention document. Extract its atoms into the database.

## Framework

1. **Read** — Read the plan file from the provided path. Understand scope, files, order, and verification criteria.
2. **Detect Project** — `git rev-parse --show-toplevel` → last path segment = project name.
3. **Deduplicate** — `spec_search(query: plan title, nodeType: "check", limit: 5)`. If a matching check exists, show it and AskUserQuestion: "This plan appears already converted. View existing spec, update it, or create new?"
4. **Extract Briefing** — Derive the 3 mandatory fields from the plan content:
   - `context`: what exists today, one sentence
   - `problem`: what is wrong or missing, one sentence
   - `principle`: the guiding rule for all decisions, one sentence
   - If the plan is not in English, translate all extracted content to English. The DB is always English regardless of plan language.
5. **Present** — Show the extracted briefing + proposed phase breakdown to the user via AskUserQuestion. Allow adjustments before creating anything.
6. **Create Check** — `spec_create_node(nodeType: "check")` with the briefing body. Then `spec_transition(event: "started")` to activate it.
7. **Create Phases** — One `spec_create_node(nodeType: "phase", parentId: checkId)` per work group. Each phase MUST include:
   - `description`: 1-sentence summary of what the phase delivers (required)
   - `briefing`: objective, successCriteria, keyFiles, constraints
   - `specialist`: role, focus, tools
   - `dependsOnPhase` in body when ordering matters
   - DAG: Foundation → Data Layer → UI → Integration → Polish (skip irrelevant layers, add domain-specific)
8. **Create Tasks** — One `spec_create_node(nodeType: "task", parentId: phaseId)` per atomic action. Each task has:
   - `action`: imperative verb, one concern per task
   - `fileRef`: string, single most relevant file path (not an array — multi-file work = split into separate tasks)
   - `diffExpected`: true when modifying existing files
9. **Create Gaps and Decisions** — Scan plan for unresolved questions → `spec_create_node(nodeType: "gap", parentId: checkId)` with `{ discovery, fix? }`. Explicit architectural choices → `spec_create_node(nodeType: "decision", parentId: checkId)` with `{ choice, rationale }`.
10. **Edges** — `spec_add_edge` for cross-phase dependencies if needed.
11. **Summary** — `spec_get_counters` → show final structure to user.
12. **Next Step** — Tell the user: "Check created and activated. Next: `/cellm:implement` to work task-by-task, `/cellm:spec-treat` for interactive step-by-step, or `/cellm:orchestrate` to execute all phases with agent delegation."

## Plan Section Mapping

| Plan Section | CellmOS Target |
|---|---|
| Title / objective | Check `title` |
| Context / motivation | Check body `context` |
| Problem statement | Check body `problem` |
| Guiding principle / constraint | Check body `principle` |
| Implementation order / phases | Phases with `dependsOnPhase` |
| Action items / files to create | Tasks with `action` + `fileRef` |
| Files to modify | Tasks with `action` + `fileRef` + `diffExpected: true` |
| Validation / verification steps | Notes in task action (verifications added during treat/orchestrate) |
| Open questions / risks | Gap nodes under check |
| Decisions already made | Decision nodes under check |

## Composite Action Detection

Before creating any task, scan the plan item for:
- **Commas separating elements**: "add X, Y, Z" → 3 tasks
- **"and" joining distinct concerns**: "create header and footer" → 2 tasks
- **Enumerated visual elements**: "group number, leader name, member count" → 3 tasks
- **Multiple file references**: "update A.vue and B.ts" → 2 tasks (one per fileRef)

Each element becomes its own task. A composite action that survives as one task will have partial implementations slip through undetected.

## Atomicity Test

Can this task be completed in one focused session? If no, split it.
Can you verify it passed without running the whole system? If no, refine the action.
Does the fileRef point to a single file? If it needs multiple files, split into 1 task per file.

## fileRef Completeness Trace

Component fileRef alone is incomplete when data flows through layers. When a task involves displaying data (signals: "display", "show", "list", "fetch", "render"), trace the data source:
1. Identify the component's data provider (composable, store, or direct API call).
2. Check if the described field exists in the data source's type definition.
3. If missing: create separate tasks for API route and composable/store with note "Data source requires modification."

Example: plan says "show leader name in GrupoCard" → tasks: one for GrupoCard.vue, one for useGrupos.ts, one for server/api/grupos/index.get.ts.

## Mobile-First Consistency

If `check.principle` contains "mobile-first" or target is a mobile PWA:
1. Scan tasks for desktop-heavy patterns: UTable, grid-cols-3+, overflow-x-auto, wide fixed-width layouts.
2. Flag for review or create a replacement task in a Polish phase.
3. Preferred mobile alternatives: card lists over tables, vertical stacks over multi-column grids.

## NEVER

- **Create without user confirmation** — always present briefing + phases before writing to DB
- **Treat the plan file as source of truth after migration** — it is not. The DB is. Inform the user the plan file can be archived or deleted.
- **Lose detail** — visual specs (px, colors, classes) go into task `action` field, not discarded
- **Write non-English content to the DB** — translate from source plan if necessary. All titles, briefings, actions, and descriptions must be in English.
- **Create vague tasks** — "implement feature" is not a task. "Create POST /api/x endpoint with Zod validation" is.
- **Skip project detection** — always derive from git root
- **Leave the check in pending** — always transition to started after creation
- **Pass fileRef as array** — it is a string. Multi-file = multiple tasks.
