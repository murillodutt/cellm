---
description: "Surgical fix engine with SCE-backed context, contract checks, and verifiable cure loop. Use when: 'cure this block', 'fix findings', 'asclepius on X'."
user-invocable: true
argument-hint: "[block or target name]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__spec_search, mcp__plugin_cellm_cellm-oracle__spec_create_node, mcp__plugin_cellm_cellm-oracle__spec_transition, mcp__plugin_cellm_cellm-oracle__spec_get_tree, mcp__plugin_cellm_cellm-oracle__context_preflight, mcp__plugin_cellm_cellm-oracle__context_certify, mcp__plugin_cellm_cellm-oracle__context_record_outcome, Read, Edit, Bash, Grep, Glob
---

# asclepius

Thin skill contract:

1. Intent
- Convert validated findings into executable cure tasks.
- Apply minimal-risk fixes and verify with concrete evidence.

2. Policy
- No cure without validated finding and explicit task context.
- Use `context_preflight` before each cure group.
- Require `context_certify` before promoting cure completion.
- Record every cure outcome via `context_record_outcome` (`flow: "hefesto"` for build-like cures, `flow: "implement"` for surgical fixes).

3. Routing
- Spec lifecycle and task graph: `spec_*`.
- Context intelligence, thresholds, and memory loop: `context_*`.
- Code/test verification: local toolchain.

## Cure Loop

1. Validate finding still exists.
2. Create or select cure spec node.
3. Preflight context and execute the minimal change set.
4. Verify with tests/typecheck/targeted evidence.
5. Certify and record outcome.

## NEVER

- Build new features under cure scope.
- Skip write-back after a fix attempt.
- Mark cured without rerunning original evidence path.
