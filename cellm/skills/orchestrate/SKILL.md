---
description: Execute spec tasks systematically from the database. Identifies next executable group, delegates to implementer, transitions states, reports progress.
user-invocable: true
argument-hint: "[check title or search term]"
allowed-tools: mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_get_counters, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_verifications, mcp__cellm-oracle__spec_record_verification, mcp__plugin_cellm_cellm-oracle__quality_gate, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, Read, Grep, Glob, Write, Edit, AskUserQuestion, Task
---

# Orchestration Thinking — Before Delegating

The spec tree is the execution plan. Read it, follow it, update it.

## Framework

1. **Detect Project** — `git rev-parse --show-toplevel` → last segment = project name.
2. **Load** — `spec_get_tree` → understand phases, tasks, current states.
2. **Status** — `spec_get_counters` → show progress (completed/total per phase).
3. **Next** — First phase with pending leaf tasks (skip container tasks that have children — execute leaves only). Respect dependency edges.
4. **Execute (3-stage pipeline per phase):**
   - **Stage 0 — Verification Check**: After Stage 1, run `spec_get_verifications` on each completed task. For pending verifications: execute the command via Bash, then `spec_record_verification` with the result. All pass/skip → proceed. Any fail → fix and re-run (max 3 attempts), then mark task as blocked.
   - **Stage 1 — Implement**: `dse_search` for phase-relevant decisions before delegating. Pass phase briefing + specialist + DSE decisions to implementation agents so they adopt the correct persona, respect constraints, and follow existing design patterns. When agents call `spec_create_node`, they must include `sessionId` (current session) and `project` params. Agents execute tasks → transition to completed/failed (always pass `project` to `spec_transition`).
   - **Stage 2 — Audit**: dedicated agent scans phase output for pattern violations, semantic token leaks, type errors, and **DSE decision drift** (`dse_search` to compare output against decisions[]). Findings → gap nodes or fix inline. **Skip for test-only phases** — test results ARE the audit. Running a reviewer on test code adds negligible value.
   - **Stage 3 — Verify**: dedicated agent runs `quality_gate({ scope: 'all' })`, event gotcha grep (see verify skill table), typecheck baseline diff, and security checklist. PASS/CONDITIONAL/FAIL verdict.
   - Phase transitions to completed ONLY after Stage 3 = PASS or CONDITIONAL.
   - Stage 3 FAIL → create gap nodes for findings, loop back to Stage 1 for fixes, then re-run Stage 2+3.
5. **Checkpoint** — Phase done (all 3 stages passed) → ask "Continue to next phase?" via AskUserQuestion.
6. **Complete** — All phases done → `spec_get_counters` final summary → `spec_transition(event: "completed", project: "<project>")` on the check. **Mandatory**: always pass `project` param to `spec_transition` for isolation validation. Verify the check state is `completed` after transition. If any task was missed, transition it first — auto-rollup propagates upward only when all leaf nodes are completed.

## Guild Protocol (Domain-Specialist Routing)

Before Stage 1 (Implement), check `phase.body.specialist.role` and inject the corresponding guild mindset:

| Role | Guild Activation | Context to Inject |
|------|-----------------|-------------------|
| `frontend` | GDU Framework | DSE cascade (dse_search then file fallback then defaults), Nuxt UI MCP for component contracts, semantic tokens only, Degradation Protocol |
| `backend` | Backend Conventions | Drizzle schema patterns, Zod validation at boundaries, H3 event handlers, server/api/ structure |
| `database` | Database Safety | Migration strategy, index review, PRAGMA checklist, backward-compatible schema changes |
| `audit` | Audit Army | audit-discovery for evidence, audit-mirror for judgment, findings as gap nodes |
| `fullstack` / default | Standard implement | No additional guild context — use implement skill as-is |

### Frontend Guild (GDU) Activation

When `specialist.role === "frontend"`:
1. Inject into implementer briefing: "Follow the GDU Framework. Process: Contextual Anchoring (DSE cascade), Architectural Deconstruction (Atomic Design), then Surgical Execution (semantic classes, ui prop customization, auto dark mode)."
2. Before implementation: `dse_search` for component decisions, consult `nuxt-ui-remote` for exact props/slots.
3. During Stage 2 (Audit): verify semantic token usage (no hardcoded colors), DSE decision compliance, Nuxt UI component contract adherence.

### Backend Guild Activation

When `specialist.role === "backend"`:
1. Inject: "Follow Drizzle ORM patterns. Validate at API boundaries with Zod. Use H3 event handlers. Type API responses explicitly."
2. Before implementation: read predecessor phase's schema types from `fileRefs`. Ensure API response types match DB schema.
3. During Stage 2 (Audit): verify Zod schemas match Drizzle types, no `any` in API responses.

### Cross-Domain Type Bridge

At phase boundaries (when current phase depends on a completed predecessor):
1. Read predecessor's output `fileRefs` — locate exported types.
2. Inject into implementer briefing: "Import types from [predecessor fileRefs]. Your output types must be compatible."
3. During Stage 3 (Verify): `quality_gate({ scope: 'typecheck' })` catches type mismatches across boundaries.

## Context Materialization (Mandatory Before Delegation)

Subagents start with an empty context window. Before delegating ANY phase to a subagent (via Agent tool), you MUST construct a Context Envelope in the agent prompt:

### The Context Envelope

1. **Check Briefing**: Copy the check's `context`, `problem`, and `principle` verbatim into the prompt.
2. **Phase Briefing**: Copy the phase's `objective`, `successCriteria`, `keyFiles`, and `constraints` verbatim.
3. **Predecessor Type Contracts**: For each completed predecessor phase (linked by `blocks`/`depends_on` edges):
   - Read the predecessor's `fileRefs` that contain type exports (`.ts` files with `export type/interface`)
   - **INLINE the actual type definitions** into the prompt (not just file paths)
   - Example: "The backend phase produced these types: `export interface Comment { id: string; body: string; authorId: string; createdAt: Date }`"
   - Maximum: 200 lines of inlined types. If more, inline the public API surface only (exported types, not internal helpers).
4. **DSE Decisions**: Run `dse_search` for the phase domain and inline the `decisions[]` arrays.
5. **Guild Mindset**: The role-specific instructions from the Guild Protocol table.

### Why This Is Non-Negotiable

The subagent cannot access the orchestrator's context window. File paths alone are insufficient — the subagent would need to Read each file, parse types, and reconstruct the contract. By inlining types directly, we guarantee the subagent starts with full cross-domain awareness.

### Materialization Limits

| Predecessor Output | Inline Strategy |
|-------------------|-----------------|
| < 50 lines of types | Inline everything |
| 50-200 lines | Inline exported types/interfaces only (skip internal helpers) |
| > 200 lines | Inline public API surface + add fileRef paths for deep dive |
| Non-type files (CSS, config) | Reference path only — subagent can Read |

## Re-entry

Skip completed tasks. Resume from first pending. Show: "Resuming: X/Y completed."

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after orchestration, write feedback entry to `dev-cellm-feedback/entries/orchestrate-{date}-{seq}.md`. Note which guild activations were effective, whether context materialization was sufficient for subagents, and how many stage 2/3 iterations were needed. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## NEVER

- **Skip DSE consultation** — `dse_search` before each phase to surface relevant decisions, avoid rules, and existing components
- **Skip dependency order** — edges define the DAG, respect it. B1 enforcement: phase transitions to `started` will fail with `BLOCKED_BY_DEPENDENCY` if upstream `depends_on` edges are not satisfied. Always check predecessor phase status before delegating.
- **Silent failures** — blocked tasks get reason + user notification
- **Auto-continue** — always confirm before next phase
- **Lose progress** — every action transitions state in the DB. Auto-chain supported: `completed`/`failed` from `pending`/`active` resolves intermediate hops automatically.
- **Non-English spec content** — all status reports, gap descriptions, and new nodes must be in English
- **Invalid parent-child hierarchies** — check→phase/task/gap/decision/requirement/verification, phase→task/gap/decision/verification, task→task/gap/verification. Service rejects violations with INVALID_CHILD_TYPE.
- **Execute container tasks** — tasks with sub-tasks are containers. Execute only leaf tasks (no children). Containers auto-complete via rollup.
- **Skip the Evolutionary Analytical Feedback** — when CELLM_DEV_MODE is true, reflection after orchestration is mandatory
- **Defer feedback generation to "later"** — there is no later. Write the feedback entry BEFORE your final message. Each orchestration session is ephemeral — if the entry is not written during this session, it will never exist
