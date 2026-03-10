---
description: "Start an Olympus Triad session — autonomous quality cycle with Argus, Asclepius, and Hefesto. Use when: 'run olympus', 'start triad', 'autonomous quality check', 'olympus on X'."
---

# Olympus — Autonomous Triad Orchestrator

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

## NEVER

- **Start without a target** — the first argument is the block/module to examine
- **Run the triad loop manually** — the engine orchestrates automatically after session creation
- **Skip project detection** — always derive from git root
