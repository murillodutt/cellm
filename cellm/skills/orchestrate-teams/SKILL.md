---
description: "Execute CellmOS spec tasks using Agent Teams with parallel phase execution. Creates a coordinated team of specialist agents (implementer, reviewer, auditor) that work simultaneously on independent DAG phases in isolated worktrees. Use when: 'orchestrate-teams', 'run with teams', 'parallel execution', 'agent teams', 'swarm execute'. Prefer over /cellm:orchestrate when the spec has 3+ independent phases or when maximum throughput is desired."
user-invocable: true
argument-hint: "[spec check ID or search term]"
allowed-tools: mcp__cellm-oracle__context_preflight, mcp__cellm-oracle__context_certify, mcp__cellm-oracle__context_record_outcome, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_get_counters, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_search, Task, AskUserQuestion
---

# Orchestrate Teams — Parallel Spec Execution via Agent Teams

Run dependency-safe parallel execution for independent phases using Agent teams.

## Intent

- Use when the check has multiple independent phases and you need throughput.
- Keep parallelism bounded by spec dependency edges.

## Policy

- Run `context_preflight` first to get shared SCE context (`flow='orchestrate'`).
- Use `spec_get_tree` and `spec_get_counters` as single source of progress.
- Spawn only executable phase groups (no dependency violation).
- Use `context_certify` for strict critical flows before expansion.
- Persist progress and outcomes (`spec_transition`, `context_record_outcome`).

## Routing

1. Resolve check and DAG status.
2. Build parallel groups from executable phases.
3. Launch team agents for one group at a time.
4. Consolidate results and transition completed nodes.
5. Recompute next executable group and repeat.
6. Finalize check when all leaf tasks are closed.
7. Persist outcome with `context_record_outcome` after execution completes.

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: write feedback to `dev-cellm-feedback/entries/orchestrate-teams-{date}-{seq}.md`. Include:
- Parallelism achieved: how many phases ran simultaneously per group
- Wall-clock time vs sequential estimate
- Merge conflicts encountered
- Agent failures and recovery actions
- Director metrics: emitCount, verifyCount, skipCount
- Which guild activations were effective
- Whether context materialization was sufficient

## Fallback Verification (CELLM_DEV_MODE only)

When `CELLM_DEV_MODE: true` (verify via `get_status` MCP -> `config.devMode`):

Before launching teams, extract the fallback path from the check's `context` field (look for `[fallback: .claude/specs/...]`). If not in context, try `.claude/specs/{check-slug}.yaml`. Check if the file exists:
- If EXISTS: `[+] Fallback YAML found: {path} — Worker crash recoverable`
- If MISSING: `[!] No fallback YAML. Worker crash during team execution = unrecoverable spec loss. Generate with /cellm:plan-to-spec or create manually.`

Do NOT block execution if missing — warn only.

## NEVER

- **Parallelize blocked phases** — respect spec dependencies.
- **Skip preflight** — parallel execution must consume SCE context first.
- **Track progress outside spec tree** — use `spec_*` transitions as truth.
- **Ignore failed agents** — record and escalate blocked paths.
- **Skip outcome write-back** — keep learning loop updated.
