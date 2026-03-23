---
description: "Execute CellmOS spec tasks systematically from the database. Identifies next executable group respecting DAG dependencies, delegates to specialist agents, transitions states, reports progress. Use when: 'orchestrate', 'execute spec', 'run all phases'."
user-invocable: true
argument-hint: "[check title or search term]"
allowed-tools: mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_get_counters, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_verifications, mcp__cellm-oracle__spec_record_verification, mcp__plugin_cellm_cellm-oracle__quality_gate, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, mcp__plugin_cellm_cellm-oracle__directive_emit, mcp__plugin_cellm_cellm-oracle__directive_emit_for_phase, mcp__plugin_cellm_cellm-oracle__directive_verify, mcp__plugin_cellm_cellm-oracle__directive_list, Read, Grep, Glob, Write, Edit, AskUserQuestion, Task
---

# Orchestration Thinking — Before Delegating

The spec tree is the execution plan. Read it, follow it, update it.

## Framework

1. **Detect Project** — `git rev-parse --show-toplevel` → last segment = project name.
2. **Load** — `spec_get_tree` → understand phases, tasks, current states.
2. **Status** — `spec_get_counters` → show progress (completed/total per phase).
3. **Next** — First phase with pending leaf tasks (skip container tasks that have children — execute leaves only). Respect dependency edges.
4. **Execute (5-stage pipeline per phase):**
   - **Stage 0 — Director Emit (MANDATORY PRE-FLIGHT)**:
     Before delegating ANY phase to an implementer:
     1. Call `directive_list(specNodeId, state='active')` for the phase.
     2. If zero active directives AND `specialist.role` has a registered Director → MUST call `directive_emit_for_phase({ project, specNodeId, projectRoot, objective, specialistRole, pathGlob? })`. This is NOT optional — skipping Director emit means violations pass silently through the gate.
     3. Include resulting directives in the Context Envelope passed to the implementer. Directives are mandatory contracts.
     4. After implementation, call `directive_verify(specNodeId)` BEFORE `spec_transition(completed)`. NEVER skip.
     - `frontend` → GDU + Engineering Directors (emits design directives + code quality directives)
     - `backend`, `fullstack` → Engineering Director (emits code quality directives)
     - `database`, `audit` → No Director registered (Stage 0 = no-op)
     - If `directive_emit_for_phase` was called but returned 0 directives, Stage 0 is complete — proceed to Stage 1.
     - **Directive Scope Contract**: Emit is scope-aware. `effectivePathGlob` derives from phase task `fileRefs` + phase `keyFiles`. Three modes: **scoped** (default — narrowed to phase files), **repo_wide** (no fileRefs/keyFiles — uses original rule pathGlob, emits `directiveWarning: invalid_scope`), **baseline_delta** (future). Catalog-change phases (tag `director-catalog` or keyFiles in `server/services/director/`) auto-skip self-referential directives.
   - **Stage 1 — Implement**: `dse_search` for phase-relevant decisions before delegating. Pass phase briefing + specialist + DSE decisions + **active directives** to implementation agents so they adopt the correct persona, respect constraints, and follow existing design patterns. When agents call `spec_create_node`, they must include `sessionId` (current session) and `project` params. Agents execute tasks → transition to completed/failed (always pass `project` to `spec_transition`).
   - **Stage 2 — Director Verify (Mandatory Gate) + Verification Check**: The server gates `spec_transition(completed)` against active directives automatically. Before transitioning tasks to completed, call `directive_verify` as a **preview** to catch violations early. If violations exist: fix them, then retry. Do NOT attempt `spec_transition(completed)` until `directive_verify` returns compliant. If you attempt completion with violated directives, the server rejects with `DIRECTIVE_VIOLATION` — the task stays in `in_progress`. Always pass `worktreePath` in metadata: `spec_transition({ nodeId, event: "completed", metadata: { worktreePath } })`. Max 3 failed attempts — on the 4th, the server returns `DIRECTIVE_ESCALATION`. Escalate to user via AskUserQuestion with violation details and options: "Fix manually", "Skip directive", or "Block task". Manual directives (evidenceType: manual) pass with a flag — surface `manualPending` items to user after completion. After directive gate passes → run `spec_get_verifications` on each completed task. For pending verifications: execute the command via Bash, then `spec_record_verification`. All pass/skip → proceed. Any fail → fix and re-run (max 3 attempts), then mark task as blocked.
   - **Stage 3 — Audit**: dedicated agent scans phase output for pattern violations, semantic token leaks, type errors, and **DSE decision drift** (`dse_search` to compare output against decisions[]). Findings → gap nodes or fix inline. **Skip for test-only phases** — test results ARE the audit. Running a reviewer on test code adds negligible value.
   - **Stage 4 — Verify**: dedicated agent runs `quality_gate({ scope: 'all' })`, event gotcha grep, typecheck baseline diff, and security checklist. Then runs the phase's `successCriteria` as a concrete acceptance test — if briefing says "grep -l 'sub-task' returns all 5 files", execute that command and verify. PASS/CONDITIONAL/FAIL verdict.
   - Phase transitions to completed ONLY after Stage 4 = PASS or CONDITIONAL.
   - Stage 4 FAIL → create gap nodes for findings, loop back to Stage 1 for fixes, then re-run Stage 3+4.
5. **Checkpoint** — Phase done (all 4 stages passed) → ask "Continue to next phase?" via AskUserQuestion.
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
5. **Active Directives**: If Stage 0 emitted directives, call `directive_list(specNodeId, state='active')` and inline all directive rules. Label them as "MANDATORY — violation triggers re-implementation loop."
6. **Guild Mindset**: The role-specific instructions from the Guild Protocol table.

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

When `CELLM_DEV_MODE: true`: after orchestration, write feedback entry to `dev-cellm-feedback/entries/orchestrate-{date}-{seq}.md`. Include:
- Which guild activations were effective
- Whether context materialization was sufficient for subagents
- How many stage 2/3 iterations were needed
- **Director metrics**: `directiveEmitCount` (total directives emitted across phases), `directiveVerifyCount` (total verification attempts), `directiveSkipCount` (phases where Director was skipped or not applicable)

Format and lifecycle: see `dev-cellm-feedback/README.md`.

## Fallback Verification (CELLM_DEV_MODE only)

When `CELLM_DEV_MODE: true` (verify via `get_status` MCP -> `config.devMode`):

Before executing, extract the fallback path from the check's `context` field (look for `[fallback: .claude/specs/...]`). If not in context, try `.claude/specs/{check-slug}.yaml`. Check if the file exists:
- If EXISTS: `[+] Fallback YAML found: {path} — Worker crash recoverable`
- If MISSING: `[!] No fallback YAML. Worker crash = unrecoverable spec loss. Generate with /cellm:plan-to-spec or create manually.`

Do NOT block execution if missing — warn only.

## NEVER

- **Skip Director Stage 0** — when `specialist.role` has a registered Director, always emit directives before implementation. Skipping Director means violations pass silently.
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
