---
description: "Convert a Claude Code plan file into a CellmOS spec check. Use when: plan ready to execute, user wants spec-driven workflow, or user says 'decompose this plan'. Reads plan markdown, creates check with phases and tasks."
user-invocable: true
argument-hint: "<path-to-plan.md>"
allowed-tools: mcp__cellm-oracle__spec_decompose, mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_get_counters, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, Read, Grep, Glob, Bash(git rev-parse *), AskUserQuestion
---

# Plan-to-Spec Thinking — Before Converting

A plan is a dense intention document. Extract its atoms into the database.

## Mantra (ALL pass)
> "Verify before you act, take the best path — never the first, and document everything, because if it's not documented, it doesn't exist. No shortcuts. No exceptions."


## Framework

1. **Read** — Read the plan file from the provided path. Understand scope, files, order, and verification criteria.
2. **Detect Project** — `git rev-parse --show-toplevel` → last path segment = project name.
3. **Deduplicate** — `spec_search(query: plan title, nodeType: "check", limit: 5)`. If a matching check exists, show it and AskUserQuestion: "This plan appears already converted. View existing spec, update it, or create new?"
4. **Extract Briefing** — Derive the 3 mandatory fields from the plan content:
   - `context`: what exists today, one sentence
   - `problem`: what is wrong or missing, one sentence
   - `principle`: the guiding rule for all decisions, one sentence
   - If the plan is not in English, translate all extracted content to English. The DB is always English regardless of plan language.
5. **DSE Alignment** — `dse_search` for decisions relevant to the plan scope (layout, components, patterns, breakpoints). Validate that the extracted `principle` does not contradict existing DSE decisions. Surface applicable `avoid` rules and existing components that phases should reuse. Include relevant DSE decisions in phase `constraints`.
6. **Present** — Show the extracted briefing + proposed phase breakdown + applicable DSE decisions to the user via AskUserQuestion. Allow adjustments before creating anything.
7. **Batch Create (preferred)** — Use `spec_decompose` to create the entire tree in one atomic call:
    ```
    spec_decompose({
      project, sessionId,
      check: { title, body: { context, problem, principle }, priority?, tags?, fileRefs? },
      phases: [{ title, body: { description, briefing?, specialist? }, tasks: [{ title, body: { action, fileRef?, diffExpected? } }] }],
      decisions?: [{ title, body: { choice, alternatives?, rationale } }],
      gaps?: [{ title, body: { discovery, fix? } }],
      edges?: [{ sourcePhaseIndex, targetPhaseIndex, edgeType: "blocks" }],
      autoStart: true
    })
    ```
    This replaces steps 8-11 with a single call. All nodes and edges are created atomically. On success, skip to step 12.
8. **Fallback: Create Check** — If `spec_decompose` is unavailable, use individual calls: `spec_create_node(nodeType: "check", sessionId: <current-session-id>)` with the briefing body. Capture the returned node `id` as `checkId`. Then `spec_transition(event: "started")` to activate it.
9. **Fallback: Create Phases** — One `spec_create_node(nodeType: "phase", parentId: checkId, sessionId: <current-session-id>)` per work group. Each phase MUST include:
   - `description`: 1-sentence summary of what the phase delivers (required)
   - `briefing`: objective, successCriteria, keyFiles, constraints (include DSE decisions from step 5)
   - `specialist`: role, focus, tools
   - `dependsOnPhase` in body when ordering matters
   - DAG: Foundation → Data Layer → UI → Integration → Polish (skip irrelevant layers, add domain-specific)
10. **Fallback: Create Tasks** — One `spec_create_node(nodeType: "task", parentId: phaseId, sessionId: <current-session-id>)` per atomic action. Each task has:
   - `action`: imperative verb, one concern per task
   - `fileRef`: string, single most relevant file path (not an array — multi-file work = split into separate tasks)
   - `diffExpected`: true when modifying existing files
11. **Fallback: Create Gaps and Decisions** — Scan plan for unresolved questions → `spec_create_node(nodeType: "gap", parentId: checkId, sessionId: <current-session-id>)` with `{ discovery, fix? }`. Explicit architectural choices → `spec_create_node(nodeType: "decision", parentId: checkId, sessionId: <current-session-id>)` with `{ choice, rationale }`.
12. **Fallback: Edges** — After all phases exist, create DAG edges:
    ```
    spec_add_edge({
      project: "project-name",
      sourceId: "phase-that-blocks",   // must complete first
      targetId: "phase-that-waits",    // cannot start until source completes
      edgeType: "blocks"
    })
    ```
    Use `blocks` for "P1 must finish before P2 starts", `depends_on` for the inverse direction. `dependsOnPhase` in body is informational context; `spec_add_edge` is the enforceable constraint.
13. **Summary** — `spec_get_counters` → show final structure to user. Auto-chain supported: calling `completed` from `pending`/`active` resolves intermediate states. Auto-rollup: when all child tasks complete, the parent phase auto-completes — but each leaf task must be explicitly transitioned.
14. **Next Step** — Tell the user: "Check created and activated. Next: `/cellm:implement` to work task-by-task, `/cellm:spec-treat` for interactive step-by-step, or `/cellm:orchestrate` to execute all phases with agent delegation."

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

## Decomposition Quality Gates

Apply these checks from `create-tasks` (canonical source) to every task before creation:

- **Composite Action Detection**: Split commas, "and", enumerated elements, multiple fileRefs into separate tasks.
- **Atomicity Test**: One session? One file? Verifiable independently? If not, split.
- **fileRef Completeness Trace**: When displaying data, trace to data source — component alone is insufficient. Create tasks for API route + composable if field is missing upstream.
- **Mobile-First Consistency**: If principle contains "mobile-first", flag desktop-heavy patterns (UTable, grid-cols-3+) and prefer card lists over tables.

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after conversion, write feedback entry to `dev-cellm-feedback/entries/plan-to-spec-{date}-{seq}.md`. Note which plan sections mapped cleanly vs required interpretation, whether DSE alignment surfaced useful constraints, and how many composite actions were split. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## NEVER

- **Skip DSE alignment** — always `dse_search` before presenting phases to catch contradictions with existing design decisions
- **Create without user confirmation** — always present briefing + phases before writing to DB
- **Treat the plan file as source of truth after migration** — it is not. The DB is. Inform the user the plan file can be archived or deleted.
- **Lose detail** — visual specs (px, colors, classes) go into task `action` field, not discarded
- **Write non-English content to the DB** — translate from source plan if necessary. All titles, briefings, actions, and descriptions must be in English.
- **Create vague tasks** — "implement feature" is not a task. "Create POST /api/x endpoint with Zod validation" is.
- **Skip project detection** — always derive from git root
- **Leave the check in pending** — always transition to started after creation
- **Pass fileRef as array** — it is a string. Multi-file = multiple tasks.
- **Ignore BLOCKED_BY_DEPENDENCY** — if `spec_transition` returns this error, check predecessor phase status
- **Invalid parent-child hierarchies** — check→phase/task/gap/decision/requirement/verification, phase→task/gap/decision/verification, task→gap/verification. Service rejects violations with INVALID_CHILD_TYPE.
- **Skip the Evolutionary Analytical Feedback** — when CELLM_DEV_MODE is true, reflection after conversion is mandatory
