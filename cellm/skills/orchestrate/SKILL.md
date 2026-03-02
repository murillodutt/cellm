---
description: Execute spec tasks systematically from the database. Identifies next executable group, delegates to implementer, transitions states, reports progress.
argument-hint: "[check title or search term]"
allowed-tools: mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_get_counters, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_search, Read, Grep, Glob, Write, Edit, AskUserQuestion, Task
---

# Orchestration Thinking — Before Delegating

The spec tree is the execution plan. Read it, follow it, update it.

## Framework

1. **Load** — `spec_get_tree` → understand phases, tasks, current states.
2. **Status** — `spec_get_counters` → show progress (completed/total per phase).
3. **Next** — First phase with pending tasks. Respect dependency edges.
4. **Execute (3-stage pipeline per phase):**
   - **Stage 1 — Implement**: pass phase briefing + specialist to implementation agents so they adopt the correct persona and respect constraints. Agents execute tasks → transition to completed/failed.
   - **Stage 2 — Audit**: dedicated agent scans phase output for pattern violations, semantic token leaks, type errors, and architecture drift. Findings → gap nodes or fix inline.
   - **Stage 3 — Verify**: dedicated agent runs `quality_gate({ scope: 'all' })`, event gotcha grep (see verify skill table), typecheck baseline diff, and security checklist. PASS/CONDITIONAL/FAIL verdict.
   - Phase transitions to completed ONLY after Stage 3 = PASS or CONDITIONAL.
   - Stage 3 FAIL → create gap nodes for findings, loop back to Stage 1 for fixes, then re-run Stage 2+3.
5. **Checkpoint** — Phase done (all 3 stages passed) → ask "Continue to next phase?" via AskUserQuestion.
6. **Complete** — All phases done → `spec_get_counters` final summary → transition check to completed.

## Re-entry

Skip completed tasks. Resume from first pending. Show: "Resuming: X/Y completed."

## NEVER

- **Skip dependency order** — edges define the DAG, respect it
- **Silent failures** — blocked tasks get reason + user notification
- **Auto-continue** — always confirm before next phase
- **Lose progress** — every action transitions state in the DB. Auto-chain supported: `completed`/`failed` from `pending`/`active` resolves intermediate hops automatically.
- **Non-English spec content** — all status reports, gap descriptions, and new nodes must be in English
