---
description: Treat a spec check — work through phases and tasks sequentially, transitioning states, executing actions, recording gaps, and running verifications.
user-invocable: true
argument-hint: "query: check title or search term"
allowed-tools: mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_add_verification, mcp__cellm-oracle__spec_get_counters, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, AskUserQuestion, Read, Edit, Write, Bash, Grep, Glob
---

Find a check, work through every phase and task sequentially. Transition states via MCP.

## Execution Loop

1. **Find** — `spec_search(query, nodeType: "check", limit: 5)`. Multiple matches → AskUserQuestion to pick.
2. **Load** — `spec_get_tree(path, format: "json")`.
3. **Brief** — Show Context / Problem / Principle + progress.
4. **Activate** — If pending: `spec_transition(event: "started")`.
5. **Per phase** — Transition to active/in_progress. Read phase `body.briefing` and `body.specialist`. `dse_search` for phase-relevant decisions (layout, components, patterns, breakpoints). Announce: specialist role, objective, constraints, and applicable DSE decisions before executing tasks.
6. **Per task:**
   - Show task → `spec_transition(event: "started")` to activate, then `spec_transition(event: "started")` again for in_progress. (Or call `completed` directly when done — the service auto-chains through intermediate states.)
   - Execute: fileRef → Read/Edit. Action → Bash/Grep. Evaluation → research + report. For UI tasks: consult DSE `avoid` rules and `decisions[]` — use existing components, never recreate.
   - When modifying a component, also read its parent page (`grep -rn "<ComponentName" pages/`) to understand usage context.
   - **Audit task gate**: if the task title starts with "Scan", "Audit", "Review", or "Check", it requires a verification artifact before completion:
     - Option A: `spec_add_verification(method: "grep")` with result pass/fail proving the assertion.
     - Option B: `record_observation` documenting findings (even if "no changes needed").
     - Without artifact → task stays in `needs_work`. No "I looked and it was fine" without evidence.
   - AskUserQuestion: completed / needs work / blocked / skip / found gap
   - Transition accordingly. Gaps → `spec_create_node(nodeType: "gap")`.
7. **Phase done (close gate)** — Before transitioning phase to completed:
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

## NEVER

- **Skip briefing** — always show Context/Problem/Principle before starting
- **Skip DSE consultation** — `dse_search` per phase for relevant decisions, avoid rules, and existing components before writing UI code
- **Auto-complete tasks** — always ask user to confirm outcome
- **Lose gaps** — every discovery creates a gap node
- **Forget state transitions** — every action must transition via MCP. Auto-chain supported: `completed` from `pending`/`active` resolves intermediate hops automatically.
- **Non-English spec content** — all node titles, gap descriptions, and verification notes must be in English
