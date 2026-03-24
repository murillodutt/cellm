---
description: "Quality lab entrypoint with SCE-backed prove/debug/gate/stress flows. Use when: 'run tests', 'quality gate', 'debug this', 'stress test'."
user-invocable: true
argument-hint: "[prove|debug|gate|stress] [args]"
allowed-tools: Bash, Read, Grep, Glob, Edit, AskUserQuestion, mcp__plugin_cellm_cellm-oracle__quality_gate, mcp__cellm-oracle__context_preflight, mcp__cellm-oracle__context_certify, mcp__cellm-oracle__context_record_outcome
context: fork
---

# arena

Thin skill contract:

1. Intent
- Execute reproducible quality checks and produce an operational verdict.

2. Policy
- Preflight before each mode execution.
- Certify quality threshold before declaring pass.
- Record outcomes for every run with traceable flow tags.

3. Routing
- Test/typecheck/health execution: local toolchain.
- Quality verdict: `quality_gate`.
- Context intelligence and telemetry: SCE `context_*`.

## Modes

- `prove`: tests + typecheck + health.
- `debug`: bounded hypothesis loop.
- `gate`: PASS/CONDITIONAL/FAIL.
- `stress`: repeated convergence runs.

## NEVER

- Claim PASS with unresolved critical failures.
- Skip write-back for failed runs.
