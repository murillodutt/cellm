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
4. **Execute** — Per task: transition to started → implement (or delegate via Task agent) → transition to completed/failed.
5. **Checkpoint** — Phase done → ask "Continue to next phase?" via AskUserQuestion.
6. **Complete** — All phases done → `spec_get_counters` final summary → transition check to completed.

## Re-entry

Skip completed tasks. Resume from first pending. Show: "Resuming: X/Y completed."

## NEVER

- **Skip dependency order** — edges define the DAG, respect it
- **Silent failures** — blocked tasks get reason + user notification
- **Auto-continue** — always confirm before next phase
- **Lose progress** — every action transitions state in the DB
