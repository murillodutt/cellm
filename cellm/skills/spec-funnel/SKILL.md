---
description: Passive work classifier — routes each action to trivial, query, or spec path before execution. Complements the spec command, does not replace it.
user-invocable: false
allowed-tools: mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_create_node
---

# Work Routing — Before Action

Before executing, classify:

| Signal | Classification | Action |
|--------|---------------|--------|
| < 5 lines, single file | TRIVIAL | Execute directly |
| Question, lookup, explanation | QUERY | Answer directly |
| Bug fix, feature, refactor, multi-file | SPEC | Search or create spec |

## SPEC Path

Project: always `git rev-parse --show-toplevel` → last segment. Pass `sessionId` (current session) to all `spec_create_node` calls.

1. `spec_search(project, query)` — match found? Resume it. No match? Create check.
2. During work: `spec_transition(node, status, project)` per task. Auto-chain supported: calling `completed` from `pending`/`active` resolves intermediate states. Discoveries become `gap` nodes. Choices become `decision` nodes.
3. All tasks done: `spec_transition(check, "completed", project)`. Auto-rollup: when all child tasks complete, the parent phase auto-completes — but each leaf task must be explicitly transitioned.

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after funnel processing, write feedback entry to `dev-cellm-feedback/entries/spec-funnel-{date}-{seq}.md`. Note which funnel stages filtered effectively, whether the pipeline produced actionable specs, and which input formats caused parsing issues. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## NEVER

- **Skip classification** — every non-trivial action goes through the funnel
- **Create duplicate specs** — always `spec_search` first
- **Force specs on trivial work** — the funnel is a filter, not a tax
- **Create specs as markdown** — specs live in compass.db only
- **Non-English spec content** — when creating checks, all content must be in English
- **Omit sessionId** — always pass `sessionId` to `spec_create_node` for audit trail
- **Ignore BLOCKED_BY_DEPENDENCY** — if `spec_transition` returns this error, check predecessor phase status
- **Invalid parent-child hierarchies** — check→phase/task/gap/decision/requirement/verification, phase→task/gap/decision/verification, task→gap/verification. Service rejects violations with INVALID_CHILD_TYPE.
- **Skip the Evolutionary Analytical Feedback** — when CELLM_DEV_MODE is true, reflection after funnel processing is mandatory
