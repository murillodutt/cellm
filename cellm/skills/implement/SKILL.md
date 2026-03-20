---
description: "Implement code from CellmOS spec context. Loads spec tree from Oracle DB, picks next pending task, writes code, runs quality gate, transitions state on completion. Use when: 'implement next task', 'implement spec', 'pick next task'."
user-invocable: true
argument-hint: "[task description or check title]"
allowed-tools: mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_get_verifications, mcp__cellm-oracle__spec_record_verification, mcp__plugin_cellm_cellm-oracle__quality_gate, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, mcp__plugin_cellm_cellm-oracle__directive_emit, mcp__plugin_cellm_cellm-oracle__directive_emit_for_phase, mcp__plugin_cellm_cellm-oracle__directive_verify, mcp__plugin_cellm_cellm-oracle__directive_list, Read, Grep, Glob, Write, Edit, Bash(npx *), Bash(bun *), AskUserQuestion
---

# Implementation Thinking — Before Writing Code

Context lives in the database. Load it before touching any file.

## Framework

1. **Detect Project** — `git rev-parse --show-toplevel` → last segment = project name.
2. **Load** — `spec_get_tree` for the check. Absorb check briefing (context/problem/principle), phases, tasks.
   For the current phase: read `body.briefing` (objective, successCriteria, keyFiles, constraints) and `body.specialist` (role, focus, tools). Adopt the specialist persona and respect phase constraints throughout.
   **Guild adoption**: If `specialist.role` is `"frontend"`, engage GDU Framework (DSE cascade, semantic tokens, Nuxt UI MCP contracts). If `"backend"`, enforce Drizzle patterns and Zod boundary validation. If `"database"`, enforce migration safety and index strategy.
2. **DSE** — `dse_search` for task-relevant design decisions (layout, components, patterns, breakpoints). Absorb `avoid` rules and `decisions[]` before writing any code. If DSE has an existing component for what the task describes, use it — do not create a new one.
3. **Director Emit (MANDATORY PRE-FLIGHT)** — Before starting work on any spec task, call `directive_list(specNodeId, state='active')` for the phase. If zero active directives AND `specialist.role` has a registered Director (`frontend`, `backend`, `fullstack`) → MUST call `directive_emit_for_phase({ project, specNodeId: phaseId, projectRoot, objective, specialistRole, pathGlob? })`. This applies whether invoked by orchestrate or directly. After emit, load active directives — respect them as hard requirements throughout implementation. If no Director exists for the role (e.g., `database`, `audit`), this is a no-op.
4. **Pick** — First pending leaf task in dependency order (skip tasks that have sub-tasks — those are containers, auto-completed via rollup). `spec_transition(event: "started", project: "<project>")` to activate. Always pass `project` for isolation validation.
4. **Start** — `spec_transition(event: "started", project: "<project>")` again to mark in_progress. (Or call `completed` directly — the service auto-chains through intermediate states.)
   > **B1 dependency enforcement**: `spec_transition(event: "started")` will fail with `BLOCKED_BY_DEPENDENCY` if upstream `depends_on` edges are not satisfied. The orchestrator ensures correct ordering — if you hit this error, check predecessor phase status.
5. **Reuse** — Search codebase first. >= 70% match = extend, don't duplicate.
6. **Implement** — Write code. Follow project patterns, rules, and DSE decisions. Respect phase `constraints` as hard limits — if a constraint says "API response must match CommentSchema", verify that your code satisfies it before proceeding.
7. **Self-Check** — Before any verification or quality gate, run the phase's `successCriteria` as a concrete command (grep, test, typecheck). If it fails, your implementation is incomplete — fix before proceeding. This is the phase author's definition of "done", not yours.
8. **Verify** — `spec_get_verifications(nodeId)`. If pending verifications exist, run each command via Bash, then `spec_record_verification(verificationId, actual, result)`. All pass/skip → proceed to Director Verify. Any fail → fix and re-run (max 3 attempts), then mark blocked. No verifications → proceed to Director Verify.
9. **Director Verify** — If directives were emitted in step 3, call `directive_verify(specNodeId, worktreePath)` before completing. If violations exist: fix them, re-verify (max 3 attempts). On 4th failure (`DIRECTIVE_ESCALATION`), escalate to user via AskUserQuestion. If no directives were emitted, skip this step.
10. **Close** — `quality_gate({ scope: 'typecheck' })` passes → `spec_transition(event: "completed", project: "<project>", metadata: { worktreePath })`. Fails → fix errors and re-run. Still failing → `spec_transition(event: "failed", project: "<project>")`. Discovery → `spec_create_node(nodeType: "gap", sessionId: <current-session-id>)`. **Auto-rollup**: when all tasks in a phase/parent-task complete, the parent auto-completes — but YOU must call `spec_transition` on each leaf task for rollup to trigger.

## Framework Conventions (Nuxt)

- `app/composables/` and `app/utils/` are **auto-imported** by Nuxt. NEVER add runtime imports for these — only `import type` for TypeScript types.
- Call composables directly: `const { data } = useFetch(...)` — no import statement needed.
- Same applies to Vue APIs (`ref`, `computed`, `watch`) — auto-imported by Nuxt.
- If unsure whether a module is auto-imported, check `nuxt.config.ts` imports section or `.nuxt/types/imports.d.ts`.

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after implementation, write feedback entry to `dev-cellm-feedback/entries/implement-{date}-{seq}.md`. Note which DSE decisions influenced code, whether reuse search found matches, and which quality gate failures required iteration. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## NEVER

- **Code without spec context** — always `spec_get_tree` first
- **Code without DSE context** — always `dse_search` for relevant decisions before creating UI components, choosing layout, or picking breakpoints
- **Skip Director Emit** — when `specialist.role` has a registered Director, always emit directives before implementation. Without directives, violations pass silently through the gate. Emit is now scope-aware (derives `effectivePathGlob` from phase fileRefs/keyFiles). Repo-wide mode requires explicit absence of scope — see orchestrate SKILL.md for full Directive Scope Contract
- **Skip Director Verify** — always `directive_verify` before completing tasks when directives were emitted. The server gate rejects anyway, but previewing avoids surprise `DIRECTIVE_VIOLATION` errors
- **Ignore DIRECTIVE_VIOLATION errors** — fix the violations or escalate to the user, never force-skip
- **Forget state transitions** — `started` to activate, `started` again for in_progress, `completed`/`failed` to close. Always pass `project` param. Auto-chain supported: calling `completed` from `pending` or `active` resolves intermediate hops automatically.
- **Swallow discoveries** — unexpected findings become gap nodes
- **Skip typecheck** — `quality_gate({ scope: 'typecheck' })` before completing (fallback: `npx nuxt typecheck` or `npx tsc --noEmit` if Oracle offline)
- **Non-English spec content** — gap and decision node titles/descriptions must be in English
- **Omit sessionId** — always pass `sessionId` to `spec_create_node` for audit trail
- **Invalid parent-child hierarchies** — check→phase/task/gap/decision/requirement/verification, phase→task/gap/decision/verification, task→task/gap/verification. Service rejects violations with INVALID_CHILD_TYPE.
- **Execute container tasks** — skip tasks that have sub-tasks. Only execute leaf tasks. Containers auto-complete via rollup.
- **Skip the Evolutionary Analytical Feedback** — when CELLM_DEV_MODE is true, reflection after implementation is mandatory
