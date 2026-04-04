---
description: "Execute CellmOS specs with autonomous agent swarm — N parallel Claude instances claiming tasks from a shared backlog via spec_claim_next. Inspired by Anthropic's C compiler pattern. Each agent loops independently: claim task, execute in worktree, commit, claim next. No central orchestrator bottleneck. Use when: 'swarm', 'swarm execute', 'parallel swarm', 'autonomous agents', 'agent army', 'max throughput'. Premium execution mode — higher token cost, dramatically faster completion."
user-invocable: true
argument-hint: "[spec check ID or path] [--agents N] [--model sonnet|opus|haiku]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__context_preflight, mcp__plugin_cellm_cellm-oracle__context_certify, mcp__plugin_cellm_cellm-oracle__context_record_outcome, mcp__plugin_cellm_cellm-oracle__spec_claim_next, mcp__plugin_cellm_cellm-oracle__spec_get_counters, mcp__plugin_cellm_cellm-oracle__spec_get_node, mcp__plugin_cellm_cellm-oracle__spec_search, mcp__plugin_cellm_cellm-oracle__spec_transition, Task, AskUserQuestion
---

# Swarm Execution — Autonomous Agent Army

Execute a high-throughput autonomous run using shared CellmOS backlog claiming.

## Intent

- Use swarm when throughput is the primary objective and the backlog has enough parallel work.
- Keep coordination in the spec database, not in local orchestration memory.

## Policy

- Run `context_preflight` before launch (`flow='swarm'`).
- For strict runs, run `context_certify` before dispatch.
- Use `spec_claim_next` as the only task allocation mechanism.
- Persist task state with `spec_transition` and emit outcomes with `context_record_outcome`.
- Escalate to user when backlog is blocked or strict policy fails.

## Routing

1. Resolve target check (`spec_search` / `spec_get_node`) and backlog (`spec_get_counters`).
2. Run SCE preflight and certify if required.
3. Launch N agents with isolated execution.
4. Each agent claims tasks via `spec_claim_next` until no work remains.
5. Consolidate results and finalize unresolved blockers.
6. Persist outcome with `context_record_outcome` after execution completes.
7. Emit user-facing completion summary.

## Fallback Verification (CELLM_DEV_MODE only)

When `CELLM_DEV_MODE: true` (verify via `get_status` MCP -> `config.devMode`):

Before launching agents, extract the fallback path from the check's `context` field (look for `[fallback: .claude/specs/...]`). If not in context, try `.claude/specs/{check-slug}.yaml`. Check if the file exists:
- If EXISTS: `[+] Fallback YAML found: {path} — Worker crash recoverable`
- If MISSING: `[!] No fallback YAML found. Worker crash during swarm = unrecoverable spec loss. Generate with /cellm:plan-to-spec or create manually.`

Do NOT block execution if missing — warn only. The user decides whether to proceed.

## NC Reference Metrics (Design System Defaults)

When agents receive NC migration or UI alignment tasks, include these **reference defaults** from Timeline (canonical page). These are Tailwind utility classes, not absolute pixel values. Responsive utilities may override at narrow breakpoints.

| Element | Class | Purpose |
|---------|-------|---------|
| Page sections | `gap-3` | Vertical gap between header, KPI, filters, scroll |
| Filter bar | `py-3 border-b border-default` | Filter toolbar separator |
| Scroll area top | `pt-2` | Space between filter bar and first card |
| Card wrapper | `px-2 pb-2` | Per-card horizontal + bottom spacing |
| Card surface | `nc-glass nc-bracket nc-interactive` | Glass surface with bracket corners |
| Inner content | `p-3` | Padding inside clickable card element |
| Page container | `flex flex-col overflow-hidden` | Full-height flex layout |
| Scroll container | `flex-1 min-h-0 overflow-y-auto` | Fills remaining space |

## DAG Validation Runbook (Before Launching Swarm)

The `spec_claim_next` mechanism correctly validates `depends_on` edges at claim time. However, **malformed DAG edges** during decomposition can cause unexpected task ordering. Before launching a swarm:

1. **Verify edges**: `spec_get_tree` — confirm `depends_on`/`blocks` edges reflect the intended execution order.
2. **Complete prerequisites**: If Phase 0 is a prerequisite for all other phases, complete it sequentially before launching the swarm.
3. **Confirm counters**: `spec_get_counters` — verify Phase 0 (or prerequisite phase) shows `done` before dispatching agents.
4. **Watch for orphans**: Tasks with no incoming edges will be claimed immediately — ensure they are truly independent.

> This is NOT a bug in `spec_claim_next`. It is a risk of poorly modeled DAG edges during `spec_decompose`. Quality of the decomposition determines quality of the swarm execution.

## NEVER

- **Skip SCE gates** — no swarm launch without preflight/certify policy.
- **Bypass spec claiming** — never assign tasks outside `spec_claim_next`.
- **Ignore blocked tasks** — blocked paths must be surfaced and tracked.
- **Lose transitions** — every claimed task must end in explicit state.
- **Run swarm on linear backlog** — prefer sequential orchestration when no parallelism.
