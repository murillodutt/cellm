---
description: Passive CELLM knowledge classifier — routes mid-task discoveries to EPHEMERAL, REUSABLE, or ARCHITECTURAL before moving on. Activates when encountering insights, gotchas, decisions, or non-obvious behavior during any work.
user-invocable: false
allowed-tools: mcp__plugin_cellm_cellm-oracle__context_record_outcome, mcp__plugin_cellm_cellm-oracle__context_promote, mcp__plugin_cellm_cellm-oracle__record_expertise, mcp__plugin_cellm_cellm-oracle__record_observation
---

# Knowledge Routing — Before Moving On

Classify discoveries and route only reusable/systemic signals to the SCE learning loop.

## Intent

- Prevent loss of high-value discoveries during execution.
- Keep ephemeral noise out of memory stores.

## Policy

- Classify into `EPHEMERAL`, `REUSABLE`, `ARCHITECTURAL`.
- Use `context_record_outcome` for reusable/architectural outcomes.
- Promote evidence only when confidence and repetition justify it (`context_promote`).

## Routing

1. `EPHEMERAL`: continue work, no persistent write.
2. `REUSABLE`: `context_record_outcome` + `record_expertise`.
3. `ARCHITECTURAL`: `record_observation` + `record_expertise` + `context_record_outcome`.
4. Periodically run `context_promote` for evidence-based progression.

## NEVER

- **Let a discovery die unclassified** — if you learned something reusable, capture it
- **Capture ephemeral context** — session progress, temp state, and routine edits are noise
- **Duplicate existing knowledge** — `record_expertise` deduplicates automatically, trust it
- **Skip SCE write-back** — reusable/architectural signals must go through `context_record_outcome`
- **Block work to capture** — classify inline, call MCP, continue working
