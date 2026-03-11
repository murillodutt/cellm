---
description: "Start an Olympus Triad session — autonomous quality cycle with Argus, Asclepius, and Hefesto. Use when: 'run olympus', 'start triad', 'autonomous quality check', 'olympus on X'."
---

# Olympus — Autonomous Triad Orchestrator

The mantra is the soul of Olympus. Every god carries it as an active mental gate — not a motto, but a protection mechanism (Sanskrit: man + tra = instrument of the mind). The triad cycle IS the mantra made operational: Argus VERIFIES, Asclepius takes the BEST PATH, Hefesto DOCUMENTS everything through construction.

Thin wrapper that starts an Olympus session. The engine handles the rest.

## Workflow

1. Detect project: `git rev-parse --show-toplevel` last segment
2. Target: first argument (required)
3. Call `triad_start` MCP tool with `{ project, target }`
4. Report session ID and how to monitor

## Output

```
[+] Olympus session {id} started for target "{target}" in project "{project}"
    State: CREATED
    Monitor: triad_status or GET /api/triad/status?project={project}&sessionId={id}
    Stream:  GET /api/triad/stream?sessionId={id}
    Stop:    POST /api/triad/stop with { sessionId: "{id}" }
```

## Completion Invariant

The Olympus loop runs until ALL work is complete. Never partial.

| Signal | Action |
|--------|--------|
| Operate findings remain open | Loop continues — Asclepius must cure or block each one |
| Construct findings remain open | Loop continues — Hefesto must build or block each one |
| Argus re-exam finds regressions | Loop continues — new cycle starts |
| ALL findings resolved + Argus converged | Loop ends — session CERTIFIED |
| Max cycles exhausted with unresolved work | Session EXHAUSTED, NOT CERTIFIED — flag `[NEED EYES]` |

A session that stops with operable or constructable findings still open is a **failure**, not a partial success. The mantra applies: if the work is not documented as complete, it does not exist.

## NEVER

- **Start without a target** — the first argument is the block/module to examine
- **Run the triad loop manually** — the engine orchestrates automatically after session creation
- **Skip project detection** — always derive from git root
- **Stop with partial work** — every operate/construct finding must reach a terminal state (cured/built/blocked/false_positive) before the session can end
- **Declare CERTIFIED with open findings** — certification requires ALL operate+construct findings resolved AND Argus convergence (two flat cycles)
- **Accept a session without artifacts** — every god MUST produce its mandatory deliverables (exam, report, feedback for Argus; post-op, journals, feedback for Asclepius; post-construction, journals, feedback for Hefesto). The engine logs `[ARTIFACT GAP]` warnings — these are not informational, they indicate an incomplete execution that must be remediated before certification
