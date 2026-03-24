---
description: "Execute CellmOS specs with autonomous agent swarm — N parallel Claude instances claiming tasks from a shared backlog via spec_claim_next. Inspired by Anthropic's C compiler pattern. Each agent loops independently: claim task, execute in worktree, commit, claim next. No central orchestrator bottleneck. Use when: 'swarm', 'swarm execute', 'parallel swarm', 'autonomous agents', 'agent army', 'max throughput'. Premium execution mode — higher token cost, dramatically faster completion."
user-invocable: true
argument-hint: "[spec check ID or path] [--agents N] [--model sonnet|opus|haiku]"
allowed-tools: mcp__cellm-oracle__context_preflight, mcp__cellm-oracle__context_certify, mcp__cellm-oracle__context_record_outcome, mcp__cellm-oracle__spec_claim_next, mcp__cellm-oracle__spec_get_counters, mcp__cellm-oracle__spec_get_node, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_transition, Task, AskUserQuestion
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

## NEVER

- **Skip SCE gates** — no swarm launch without preflight/certify policy.
- **Bypass spec claiming** — never assign tasks outside `spec_claim_next`.
- **Ignore blocked tasks** — blocked paths must be surfaced and tracked.
- **Lose transitions** — every claimed task must end in explicit state.
- **Run swarm on linear backlog** — prefer sequential orchestration when no parallelism.
