---
description: "Execute CellmOS spec tasks systematically from the database. Identifies next executable group respecting DAG dependencies, delegates to specialist agents, transitions states, reports progress. Use when: 'orchestrate', 'execute spec', 'run all phases'."
cellm_scope: universal
user-invocable: true
argument-hint: "[check title or search term]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__context_preflight, mcp__plugin_cellm_cellm-oracle__context_record_outcome, mcp__plugin_cellm_cellm-oracle__context_certify, mcp__plugin_cellm_cellm-oracle__spec_get_tree, mcp__plugin_cellm_cellm-oracle__spec_get_counters, mcp__plugin_cellm_cellm-oracle__spec_transition, mcp__plugin_cellm_cellm-oracle__spec_search, mcp__plugin_cellm_cellm-oracle__spec_get_verifications, mcp__plugin_cellm_cellm-oracle__spec_record_verification, mcp__plugin_cellm_cellm-oracle__quality_gate, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, mcp__plugin_cellm_cellm-oracle__directive_emit, mcp__plugin_cellm_cellm-oracle__directive_emit_for_phase, mcp__plugin_cellm_cellm-oracle__directive_verify, mcp__plugin_cellm_cellm-oracle__directive_list, Read, Grep, Glob, Write, Edit, AskUserQuestion, Task
---

# Orchestration Thinking — Before Delegating

Orchestrate phase execution from the spec tree using SCE context as the default input.

## Intent

- Use this skill to coordinate end-to-end execution of a check.
- Keep orchestration focused on dependency-safe routing and state progression.

## Policy

- Run `context_preflight` before phase dispatch (`flow='orchestrate'`).
- Use `spec_get_tree` + `spec_get_counters` as source of truth for progress.
- Delegate implementation through subagents/skills without local ranking logic.
- Use `context_certify` for strict/critical execution windows.
- Persist outcomes via `context_record_outcome`.

## Routing

1. Resolve check and current DAG state (`spec_search`, `spec_get_tree`, `spec_get_counters`).
2. Request SCE envelope (`context_preflight`) and pass it to delegated execution.
3. Execute pending leaf tasks respecting dependency edges.
4. Run verification workflow (`spec_get_verifications` + `spec_record_verification`) as needed.
5. Transition states with `spec_transition` and iterate until check completion.
6. Record run outcomes (`context_record_outcome`) and escalate blockers to user.

## Re-entry

Skip completed tasks. Resume from first pending. Show: "Resuming: X/Y completed."

## Fallback Verification (CELLM_DEV_MODE only)

When `CELLM_DEV_MODE: true` (verify via `get_status` MCP -> `config.devMode`):

Before executing, extract the fallback path from the check's `context` field (look for `[fallback: .claude/specs/...]`). If not in context, try `.claude/specs/{check-slug}.yaml`. Check if the file exists:
- If EXISTS: `[+] Fallback YAML found: {path} — Worker crash recoverable`
- If MISSING: `[!] No fallback YAML. Worker crash = unrecoverable spec loss. Generate with /cellm:plan-to-spec or create manually.`

Do NOT block execution if missing — warn only.

## NEVER

- **Skip SCE preflight** — all orchestration starts from SCE envelope.
- **Run custom context merge in-skill** — ranking/merge belongs to SCE.
- **Ignore DAG constraints** — only dispatch executable leaf tasks.
- **Lose state transitions** — progress must be persisted with `spec_transition`.
- **Skip outcome tracking** — orchestration outcomes must feed learning loop.
