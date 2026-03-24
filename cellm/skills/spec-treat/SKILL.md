---
description: "Treat a CellmOS check end-to-end with SCE preflight, execution loop, and write-back. Use when: 'treat this spec', 'work the check', 'spec-treat'."
user-invocable: true
argument-hint: "query: check title or search term"
allowed-tools: mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_get_counters, mcp__cellm-oracle__context_preflight, mcp__cellm-oracle__context_record_outcome, mcp__cellm-oracle__context_certify, mcp__plugin_cellm_cellm-oracle__quality_gate, AskUserQuestion, Read, Edit, Bash, Grep, Glob
---

# spec-treat

Thin skill contract:

1. Intent
- Resolve target check and execute pending tasks in order.
- Keep user-visible progress while preserving spec state consistency.

2. Policy
- Always run `context_preflight` before the first task and when scope changes.
- Enforce `context_certify` before phase completion.
- Persist outcomes through `context_record_outcome` with `flow: "orchestrate"`.
- Fail-open only when policy explicitly allows and log degraded source.

3. Routing
- Spec state and DAG: `spec_*`.
- Context intelligence and write-back: `context_*`.
- Runtime quality evidence: `quality_gate` + scoped tests/typecheck.

## Execution Loop

1. Detect project and locate check with `spec_search`.
2. Load tree with `spec_get_tree`.
3. Run `context_preflight` once per phase boundary.
4. Execute leaf tasks, transition states, and persist outcome per task.
5. Run `context_certify` + `quality_gate` before phase completion.
6. Complete check only when counters and verifications are consistent.

## NEVER

- Duplicate ranking/merge logic inside the skill.
- Bypass `context_preflight` and `context_record_outcome`.
- Complete phase/check without certification evidence.
- Hide blocked transitions; surface and document blockers.
