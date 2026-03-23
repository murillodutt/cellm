---
description: "Treat a CellmOS spec check interactively — work through phases and tasks sequentially, transitioning states, executing actions, recording gaps, and running verifications. Use when: 'treat this spec', 'work the check', 'step through spec', 'spec-treat'."
user-invocable: true
argument-hint: "query: check title or search term"
allowed-tools: mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_add_verification, mcp__cellm-oracle__spec_get_verifications, mcp__cellm-oracle__spec_record_verification, mcp__cellm-oracle__spec_get_counters, mcp__plugin_cellm_cellm-oracle__quality_gate, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, mcp__plugin_cellm_cellm-oracle__record_observation, mcp__plugin_cellm_cellm-oracle__directive_emit, mcp__plugin_cellm_cellm-oracle__directive_emit_for_phase, mcp__plugin_cellm_cellm-oracle__directive_verify, mcp__plugin_cellm_cellm-oracle__directive_list, AskUserQuestion, Read, Edit, Write, Bash, Grep, Glob
---

Find a check, work through every phase and task sequentially. Transition states via MCP.

## Execution Loop

1. **Detect Project** — `git rev-parse --show-toplevel` → last segment = project name.
2. **Find** — `spec_search(query, nodeType: "check", limit: 5)`. Multiple matches → AskUserQuestion to pick.
2. **Load** — `spec_get_tree(path, format: "json")`.
3. **Brief** — Show Context / Problem / Principle + progress.
4. **Activate** — If pending: `spec_transition(event: "started", project: <current_project>)`. Always pass `project` for isolation validation.
5. **Per phase** — Transition to active/in_progress. Read phase `body.briefing` and `body.specialist`. `dse_search` for phase-relevant decisions (layout, components, patterns, breakpoints).
   - **Director Emit (MANDATORY PRE-FLIGHT)**: Before executing any task in this phase, call `directive_list(specNodeId, state='active')` for the phase. If zero active directives AND `specialist.role` has a registered Director (`frontend`, `backend`, `fullstack`) → MUST call `directive_emit_for_phase({ project, specNodeId: phaseId, projectRoot, objective, specialistRole, pathGlob? })`. This applies whether invoked by orchestrate or directly. After emit, load active directives. Before completing tasks, call `directive_verify(specNodeId)` — violations must be fixed before transition. If no Director exists for the role (e.g., `database`, `audit`), this is a no-op.
   - Announce: specialist role, **focus** (the single priority above all else), objective, constraints, applicable DSE decisions, and **active directives** before executing tasks. The `specialist.focus` guides every task decision in this phase.
6. **Per task:**
   - If a task has sub-tasks, recurse into sub-tasks first (depth-first). Only execute leaf tasks — containers auto-complete via rollup.
   - Show task → `spec_transition(event: "started", project: <current_project>)` to activate, then again for in_progress. (Or call `completed` directly when done — the service auto-chains through intermediate states.) Always pass `project` on every transition for isolation validation. If the response contains `BLOCKED_BY_DEPENDENCY`, the parent phase has an incomplete predecessor — do not proceed; surface the blocker to the user.
   - Execute: fileRef → Read/Edit. Action → Bash/Grep. Evaluation → research + report. For UI tasks: consult DSE `avoid` rules and `decisions[]` — use existing components, never recreate.
   - When modifying a component, also read its parent page (`grep -rn "<ComponentName" pages/`) to understand usage context.
   - **Audit task gate**: if the task title starts with "Scan", "Audit", "Review", or "Check", it requires a verification artifact before completion:
     - Option A: `spec_add_verification(method: "grep", sessionId: <current_session_id>)` with result pass/fail proving the assertion. `sessionId` is required for audit trail.
     - Option B: `record_observation` documenting findings (even if "no changes needed").
     - Without artifact → task stays in `needs_work`. No "I looked and it was fine" without evidence.
   - **Verification gate** (before completing any leaf task): `spec_get_verifications(nodeId)`. If pending verifications exist: run command via Bash → `spec_record_verification(verificationId, actual, result)`. All pass/skip → complete. Any fail → fix + re-run (max 3), then blocked. No verifications → complete normally.
   - AskUserQuestion: completed / needs work / blocked / skip / found gap
   - Transition explicitly: completed → `spec_transition(event: "completed", project: <current_project>)`. Blocked → `spec_transition(event: "blocked", project: <current_project>)`. Failed → `spec_transition(event: "failed", project: <current_project>)`. Gaps → `spec_create_node(nodeType: "gap")`. **Auto-rollup propagates**: when all tasks in a phase or parent-task complete, the parent auto-completes; when all phases complete, the check auto-completes. But YOU must call `spec_transition` on each leaf task — rollup does not trigger without it.
7. **Phase done (close gate)** — Before transitioning phase to completed:
   - Run the phase's `successCriteria` as a concrete command. This is the phase author's acceptance test — if it fails, the phase is not done regardless of what quality_gate says.
   - Run `quality_gate({ scope: 'all' })` — typecheck + tests must pass. Oracle offline → fallback to `npx nuxt typecheck` and `npx vitest run`.
   - Run audit grep on all phase fileRefs: semantic token leaks, pattern violations.
   - Run event gotcha check (see verify skill table) on all .vue files in the phase.
   - All clear → transition phase to completed. Findings → create gap nodes, keep phase in_progress.
8. **All done** — `spec_get_counters` → summary table → transition check to completed.

## Re-entry

Skip completed tasks. Resume from first pending/in_progress. Show: "Resuming: X/Y already completed".

## Interruption

Keep states as-is. Show progress. Suggest re-running to continue.

## Task Types

| Type | Execution |
|------|-----------|
| Evaluate: X | Research, check impact on project code |
| Review changes | Read changelog, grep affected APIs |
| Update file:line | Read, edit, verify |
| Run migration/tests | Bash |

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after treatment, write feedback entry to `dev-cellm-feedback/entries/spec-treat-{date}-{seq}.md`. Note which task types caused friction, whether audit gates caught real issues, and how often users chose skip vs completed. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## Directive Gate

The server gates `spec_transition(completed)` against active directives. Before transitioning tasks to completed, call `directive_verify` as a preview to surface violations early. If `DIRECTIVE_VIOLATION` is returned on transition, read violations, fix the code, retry. Always pass `worktreePath` in metadata: `spec_transition({ nodeId, event: "completed", metadata: { worktreePath } })`. Max 3 attempts before `DIRECTIVE_ESCALATION` — escalate to user. Manual directives pass with a flag (non-blocking).

## Fallback Verification (CELLM_DEV_MODE only)

When `CELLM_DEV_MODE: true` (verify via `get_status` MCP -> `config.devMode`):

Before treating, extract the fallback path from the check's `context` field (look for `[fallback: .claude/specs/...]`). If not in context, try `.claude/specs/{check-slug}.yaml`. Check if the file exists:
- If EXISTS: `[+] Fallback YAML found: {path} — Worker crash recoverable`
- If MISSING: `[!] No fallback YAML. Worker crash = unrecoverable spec loss. Generate with /cellm:plan-to-spec or create manually.`

Do NOT block execution if missing — warn only.

## NEVER

- **Skip briefing** — always show Context/Problem/Principle before starting
- **Skip DSE consultation** — `dse_search` per phase for relevant decisions, avoid rules, and existing components before writing UI code
- **Skip Director Emit** — when `specialist.role` has a registered Director, always `directive_emit_for_phase` at phase start. Without directives, the gate has nothing to enforce. Emit is scope-aware (derives from phase fileRefs/keyFiles). See orchestrate SKILL.md for Directive Scope Contract details
- **Auto-complete tasks** — always ask user to confirm outcome
- **Lose gaps** — every discovery creates a gap node
- **Forget state transitions** — every action must transition via MCP. Auto-chain supported: `completed` from `pending`/`active` resolves intermediate hops automatically.
- **Non-English spec content** — all node titles, gap descriptions, and verification notes must be in English
- **Invalid parent-child hierarchies** — check→phase/task/gap/decision/requirement/verification, phase→task/gap/decision/verification, task→task/gap/verification. Service rejects violations with INVALID_CHILD_TYPE.
- **Ignore DIRECTIVE_VIOLATION errors** — fix the violations or escalate to the user, never force-skip
- **Skip directive verification** — the server enforces it, but previewing with `directive_verify` before transition avoids surprises
- **Skip the Evolutionary Analytical Feedback** — when CELLM_DEV_MODE is true, reflection after treatment is mandatory
