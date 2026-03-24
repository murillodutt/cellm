---
description: "Iterative optimization loop backed by SCE context, measurable deltas, and outcome write-back. Use when: 'iterate', 'optimize', 'improve until done'."
user-invocable: true
argument-hint: "[target to optimize]"
allowed-tools: Read, Edit, Glob, Grep, Bash, WebSearch, WebFetch, mcp__cellm-oracle__context_preflight, mcp__cellm-oracle__context_record_outcome, mcp__cellm-oracle__context_certify
---

# iterate

Thin skill contract:

1. Intent
- Run short optimization cycles with baseline, single-variable change, and delta verification.

2. Policy
- No optimization step without baseline metric.
- Use `context_preflight` to bind scope and constraints.
- Persist every cycle via `context_record_outcome` and certify convergence gates.

3. Routing
- Research and measurement: web/local tools.
- Context budget and policy: SCE `context_*`.
- Final gate: certify outcome quality and decision (keep/revert/next).

## Convergence

- Stop when two consecutive cycles bring no meaningful improvement and no remaining high-confidence hypothesis.

## NEVER

- Batch unrelated changes in one cycle.
- Claim gains without reproducible measurement.
