---
description: "CellmOS command center — list pending specs, create new checks, view status, and manage the atomic spec-driven system in Oracle DB. Entry point for all spec operations. Use when: 'show specs', 'create spec', 'spec status', 'list checks'."
user-invocable: true
argument-hint: "[action]: (empty) | create <title> | status | treat <check>"
allowed-tools: mcp__plugin_cellm_cellm-oracle__spec_create_node, mcp__plugin_cellm_cellm-oracle__spec_transition, mcp__plugin_cellm_cellm-oracle__spec_search, mcp__plugin_cellm_cellm-oracle__spec_get_tree, mcp__plugin_cellm_cellm-oracle__spec_add_edge, mcp__plugin_cellm_cellm-oracle__spec_add_verification, mcp__plugin_cellm_cellm-oracle__spec_get_counters, AskUserQuestion
---

# Spec Thinking — Before Action

Every spec is an atomic puzzle in the database. Never a markdown file.

## Routing

| Argument | Action |
|----------|--------|
| (empty) | `spec_get_counters` + `spec_search(state: "pending"\|"in_progress")` → compact table |
| `create <title>` | Briefing → check → phases → tasks (all in DB) |
| `status` | All checks → counters per check → `[x] [~] [ ] [!]` summary |
| `treat <query>` | Delegate to `/cellm:spec-treat` |

## Create: The Briefing

Before any node exists, commit to a direction:

1. **Context** — Where are we? What exists? One sentence.
2. **Problem** — What is wrong or missing? One sentence.
3. **Principle** — The rule that guides every decision. One sentence.

These three sentences ARE the spec. Everything else is decomposition.

After the check: decompose into phases (work groups) and tasks (atomic actions). Each task has an imperative `action`, optional `fileRef`, optional `diffExpected`. Phases form the dependency DAG.

Project: always `git rev-parse --show-toplevel` → last segment. Pass `sessionId` (current session) to `spec_create_node` for audit trail. Auto-chain supported: calling `completed` from `pending`/`active` resolves intermediate states automatically. Auto-rollup: when all child tasks complete, the parent phase auto-completes — but YOU must call `spec_transition` on each leaf task for rollup to trigger.

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after spec creation or transition, write feedback entry to `dev-cellm-feedback/entries/spec-{date}-{seq}.md`. Note which nodeTypes and transitions caused friction, which body schemas were unclear, and whether deduplication caught real duplicates. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## NEVER

- **Markdown files** — specs live in compass.db, never in cellm-core/specs/
- **Create without all 3 briefing fields** — Context, Problem, Principle are mandatory
- **Skip project detection** — always derive from git root
- **Vague tasks** — every task action is imperative and atomic
- **Write in any language other than English** — all titles, briefings, actions, and descriptions must be in English for optimal LLM processing and tokenization efficiency
- **Omit sessionId** — always pass `sessionId` (current session) to `spec_create_node` and `spec_add_verification` for audit trail
- **Ignore BLOCKED_BY_DEPENDENCY** — if `spec_transition` returns this error, check predecessor phase status before proceeding
- **Invalid parent-child hierarchies** — check→phase/task/gap/decision/requirement/verification, phase→task/gap/decision/verification, task→gap/verification. Service rejects violations with INVALID_CHILD_TYPE.
- **Skip the Evolutionary Analytical Feedback** — when CELLM_DEV_MODE is true, reflection after spec creation or transition is mandatory
