---
description: "Start Olympus triad session with SCE policies and operational gates. Use when: 'run olympus', 'start triad', 'autonomous quality check'."
cellm_scope: universal
---

# olympus

Thin skill contract:

1. Intent
- Bootstrap triad session for a target and track it to terminal decision.

2. Policy
- Use SCE preflight before opening session context.
- Require certification (`context_certify`) at each cycle gate.
- Persist all cycle outcomes with flow tagging (`orchestrate`/`swarm`).

3. Routing
- Session orchestration and findings lifecycle: triad runtime/MCP.
- Context quality, thresholds, and write-back: SCE `context_*`.
- Final quality decision: quality gate + operational report.

## Terminal States

- `CERTIFIED`: all operate/construct findings resolved and certified.
- `EXHAUSTED`: unresolved critical items after bounded cycles.
- `BLOCKED`: external dependency prevents safe continuation.

## NEVER

- Certify with open critical findings.
- Skip write-back between cycles.
