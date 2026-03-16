---
description: "Convert a Claude Code plan file into a CellmOS spec check. Use when: plan ready to execute, user wants spec-driven workflow, or user says 'decompose this plan'. Reads plan markdown, creates check with phases and tasks."
user-invocable: true
argument-hint: "<path-to-plan.md>"
allowed-tools: mcp__cellm-oracle__spec_decompose, mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_add_verification, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_get_counters, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, Read, Grep, Glob, Bash(git rev-parse *), AskUserQuestion
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
5. **Decompose into Phases** — Walk the plan's structure (sections, sub-sections, ordered steps) and group related work into phases following the DAG: Foundation → Data Layer → UI → Integration → Polish (skip irrelevant layers, add domain-specific). For each phase, extract the full briefing NOW — not later during creation. Use the [Phase Enrichment](#phase-enrichment) table to map plan sections to briefing fields. Every phase exits this step with objective, successCriteria, keyFiles, constraints, and specialist filled.
6. **DSE Alignment** — `dse_search` for decisions relevant to the plan scope (layout, components, patterns, breakpoints). Validate that the extracted `principle` does not contradict existing DSE decisions. Surface applicable `avoid` rules and existing components that phases should reuse. Merge relevant DSE decisions into each phase's `constraints`.
7. **Present** — Show the extracted check briefing + each phase with its full briefing + specialist + task list + applicable DSE decisions to the user via AskUserQuestion. The user must see what each phase contains — not just titles. Allow adjustments before creating anything.
8. **Create** — Use `spec_decompose` to create the entire tree in one atomic call:
    ```
    spec_decompose({
      project, sessionId,
      check: { title, body: { context, problem, principle }, priority?, tags?, fileRefs? },
      phases: [{
        title,
        body: {
          description,
          briefing: { objective, successCriteria, keyFiles, constraints },
          specialist: { role, focus, tools }
        },
        tasks: [{
          title,
          body: { action, fileRef?, diffExpected? },
          tasks?: [{ title, body: { action, fileRef?, diffExpected? } }]  // recursive sub-tasks
        }]
      }],
      decisions?: [{ title, body: { choice, alternatives?, rationale } }],
      gaps?: [{ title, body: { discovery, fix? } }],
      edges?: [{ sourcePhaseIndex, targetPhaseIndex, edgeType: "blocks" }],
      autoStart: true
    })
    ```
    If `spec_decompose` is unavailable, use individual `spec_create_node` calls — but the **same data quality applies**. Every phase gets full briefing + specialist. Every task gets a concrete action + fileRef. There is no "lite" path. See [Phase Enrichment](#phase-enrichment).
9. **Edges** — After creation, add DAG edges if not already set by `spec_decompose`:
    ```
    spec_add_edge({
      project: "project-name",
      sourceId: "phase-that-blocks",   // must complete first
      targetId: "phase-that-waits",    // cannot start until source completes
      edgeType: "blocks"
    })
    ```
    Use `blocks` for "P1 must finish before P2 starts", `depends_on` for the inverse direction. `dependsOnPhase` in body is informational context; `spec_add_edge` is the enforceable constraint.
10. **Summary** — `spec_get_counters` → show final structure to user. Auto-chain supported: calling `completed` from `pending`/`active` resolves intermediate states. Auto-rollup: when all child tasks complete, the parent phase auto-completes — but each leaf task must be explicitly transitioned.
11. **Next Step** — Tell the user: "Check created and activated. Next: `/cellm:implement` to work task-by-task, `/cellm:spec-treat` for interactive step-by-step, or `/cellm:orchestrate` to execute all phases with agent delegation."

## Phase Enrichment

Briefings are the soul of a phase. A phase without a briefing is a label — the implementer has no objective, no success criteria, no constraints. Plans are rich documents; the job of plan-to-spec is to distill that richness into structured briefings, not discard it.

**briefing** (mandatory for every phase):

| Field | Source in Plan | What to Extract |
|-------|----------------|-----------------|
| `objective` | Section heading + first paragraph | 1 imperative sentence — what the phase delivers concretely |
| `successCriteria` | Verification steps, acceptance criteria, test descriptions | Deterministic exit — a grep, test, or typecheck command that proves completion |
| `keyFiles` | File lists, "Arquivo:" annotations, code blocks with file paths | Files the specialist should READ before starting (context files, not just modification targets) |
| `constraints` | Decisions table, principles, DSE decisions from step 5 | Hard limits — type contracts from predecessor phases, DSE avoid rules, performance budgets |

**specialist** (mandatory for every phase):

| Field | How to Derive |
|-------|---------------|
| `role` | component/page work = "frontend", API/endpoint = "backend", schema/migration = "database", config/deploy = "infra", scan/verify = "audit" |
| `focus` | 1 sentence — what the specialist should prioritize above all else (derived from plan's critical path or risk areas) |
| `tools` | Primary tools — "Read, Edit, Grep" for frontend; "Bash, Grep, Read" for backend; "Read, Grep" for audit |

**Interface contracts across phases:** When a check spans multiple domains (DB + API + UI), each phase's `constraints` must reference the output types of its predecessor. Example: "API response must match CommentSchema from server/db/schema.ts". This ensures the DAG is type-safe across boundaries.

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
| Validation / verification steps | `spec_add_verification` on leaf tasks when the plan has explicit test commands, grep assertions, or acceptance criteria. Derive the `command` and `expected` fields directly from the plan. |
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
- **Lose detail** — visual specs (px, colors, classes) go into task `action` field, not discarded. Plan sections with file paths, code snippets, or specific values MUST survive as briefing fields (keyFiles, constraints) or task actions — never summarized away
- **Create phases without briefing** — a phase with only `description` is a label, not a spec. Every phase requires `briefing` (objective, successCriteria, keyFiles, constraints) and `specialist` (role, focus, tools). The plan contains this information — extract it
- **Write non-English content to the DB** — translate from source plan if necessary. All titles, briefings, actions, and descriptions must be in English.
- **Create vague tasks** — "implement feature" is not a task. "Create POST /api/x endpoint with Zod validation" is.
- **Skip project detection** — always derive from git root
- **Leave the check in pending** — always transition to started after creation
- **Pass fileRef as array** — it is a string. Multi-file = multiple tasks.
- **Ignore BLOCKED_BY_DEPENDENCY** — if `spec_transition` returns this error, check predecessor phase status
- **Invalid parent-child hierarchies** — check→phase/task/gap/decision/requirement/verification, phase→task/gap/decision/verification, task→task/gap/verification. Tasks can contain sub-tasks recursively (max depth 5). Service rejects violations with INVALID_CHILD_TYPE.
- **Skip the Evolutionary Analytical Feedback** — when CELLM_DEV_MODE is true, reflection after conversion is mandatory
