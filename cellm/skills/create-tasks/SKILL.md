---
description: "Decompose checks into dependency-ordered tasks using runtime contracts and SCE context. Use when: 'create tasks', 'decompose check', 'break into phases'."
user-invocable: true
argument-hint: "[check title or search term]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__spec_search, mcp__plugin_cellm_cellm-oracle__spec_get_tree, mcp__plugin_cellm_cellm-oracle__spec_decompose, mcp__plugin_cellm_cellm-oracle__spec_add_edge, mcp__plugin_cellm_cellm-oracle__context_preflight, mcp__plugin_cellm_cellm-oracle__context_record_outcome, AskUserQuestion
---

# create-tasks

Thin skill contract:

1. Intent
- Transform a requirement into executable DAG phases and atomic tasks.

2. Policy
- Preflight context before decomposition.
- Preserve type/contract boundaries across phases.
- Write-back decomposition decision and confidence.

3. Routing
- Task graph creation and dependency edges: `spec_decompose`, `spec_add_edge`.
- Context guidance and policy envelope: `context_preflight`.
- Learning loop and operation telemetry: `context_record_outcome`.

## Completion Criteria

- Every phase has objective and measurable success criteria.
- Dependencies are explicit in graph edges.
- Output is ready for `spec-treat` without manual restructuring.

## NEVER

- Create vague non-verifiable tasks.
- Encode domain ranking logic locally in the skill.
