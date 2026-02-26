---
name: spec-treat
description: Treat a spec check — work through phases and tasks sequentially, transitioning states, executing actions, recording gaps, and running verifications.
argument-hint: "query: check title or search term"
allowed-tools: mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_add_verification, mcp__cellm-oracle__spec_get_counters, AskUserQuestion, Read, Edit, Write, Bash, Grep, Glob
---

Find a check, work through every phase and task sequentially. Transition states via MCP.

## Execution Loop

1. **Find** — `spec_search(query, nodeType: "check", limit: 5)`. Multiple matches → AskUserQuestion to pick.
2. **Load** — `spec_get_tree(path, format: "json")`.
3. **Brief** — Show Context / Problem / Principle + progress.
4. **Activate** — If pending: `spec_transition(event: "started")`.
5. **Per phase** — Transition to active/in_progress.
6. **Per task:**
   - Show task → transition to in_progress
   - Execute: fileRef → Read/Edit. Action → Bash/Grep. Evaluation → research + report.
   - AskUserQuestion: completed / needs work / blocked / skip / found gap
   - Transition accordingly. Gaps → `spec_create_node(nodeType: "gap")`.
7. **Phase done** — All tasks complete → transition phase to completed.
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
- **Auto-complete tasks** — always ask user to confirm outcome
- **Lose gaps** — every discovery creates a gap node
- **Forget state transitions** — every action must transition via MCP
