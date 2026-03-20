---
description: "Start a CELLM Olympus Triad session — autonomous quality cycle orchestrating Argus (examine), Asclepius (cure), and Hefesto (build) until convergence. Use when: 'run olympus', 'start triad', 'autonomous quality check', 'olympus on X'."
---

# Olympus — Autonomous Triad Orchestrator

The mantra is the soul of Olympus. Every god carries it as an active mental gate — not a motto, but a protection mechanism (Sanskrit: man + tra = instrument of the mind). The triad cycle IS the mantra made operational: Argus VERIFIES, Asclepius takes the BEST PATH, Hefesto DOCUMENTS everything through construction.

Thin wrapper that starts an Olympus session. The engine handles the rest.

## Scope Detection

After identifying the target, classify its scope to decide the certification mode:

| Signal | Mode | Rationale |
|--------|------|-----------|
| Target is a single SKILL.md, config, or doc file | **Lite** | Text/markdown files need review, not system examination |
| Target is a single small source file (< 200 lines) | **Lite** | Low blast radius, direct fixes sufficient |
| Target is a module, subsystem, or multi-file block | **Full** | System-level examination requires triad machinery |
| Target references a spec check with multiple phases | **Full** | Structured work needs formal tracking |

**Lite Mode** skips the triad session. Instead:
1. Read the target file(s)
2. List findings inline (same classification: operate/construct/monitor)
3. Fix operate+construct findings directly (Asclepius-style)
4. Commit with findings summary in commit message
5. Report results — no `triad_start`, no `triad_register_finding`, no `triad_resolve_finding`

**Full Mode** follows the standard Workflow below.

When in doubt, default to Full. Lite is an optimization, not a shortcut — the mantra still applies in both modes.

## Workflow (Full Mode)

1. Detect project: `git rev-parse --show-toplevel` last segment
2. Target: first argument (required)
3. Scope Detection: classify as Lite or Full (see above). If Lite, execute Lite Mode and skip steps 4+.
4. Call `triad_start` MCP tool with `{ project, target }`
5. Report session ID and how to monitor

## Output (Full Mode)

```
[+] Olympus session {id} started for target "{target}" in project "{project}"
    State: CREATED
    Monitor: triad_status or GET /api/triad/status?project={project}&sessionId={id}
    Stream:  GET /api/triad/stream?sessionId={id}
    Stop:    POST /api/triad/stop with { sessionId: "{id}" }
```

## Spec-Driven Integration

Olympus MUST run in parallel with the spec-driven system. The triad does not exist outside of CellmOS.

| Step | Action |
|------|--------|
| Session start | `spec_search` for active check matching target. Store `specCheckId` for the session |
| Each finding | Link to spec check via finding metadata |
| CERTIFIED | Transition spec check + ALL child phases/tasks to `completed` via `spec_transition`. Use auto-chain (pending->completed resolves intermediate states). Actor: `system`, metadata: `{ reason: "Olympus CERTIFIED (session {id})" }` |
| EXHAUSTED | Do NOT close specs — unresolved work means the check stays active |

If no matching spec check exists, warn: `[!] No spec check found for target "{target}". Create one first with /cellm:spec or /cellm:plan-to-spec.`

## Completion Invariant

The Olympus loop runs until ALL work is complete. Never partial.

| Signal | Action |
|--------|--------|
| Operate findings remain open | Loop continues — Asclepius must cure or block each one |
| Construct findings remain open | Loop continues — Hefesto must build or block each one |
| Argus re-exam finds regressions | Loop continues — new cycle starts |
| ALL findings resolved + Argus converged | Loop ends — session CERTIFIED. Close spec tree (see Spec-Driven Integration) |
| Max cycles exhausted with unresolved work | Session EXHAUSTED, NOT CERTIFIED — flag `[NEED EYES]`. Spec stays active |

A session that stops with operable or constructable findings still open is a **failure**, not a partial success. The mantra applies: if the work is not documented as complete, it does not exist.

## NEVER

- **Start without a target** — the first argument is the block/module to examine
- **Run the triad loop manually** — the engine orchestrates automatically after session creation
- **Skip project detection** — always derive from git root
- **Stop with partial work** — every operate/construct finding must reach a terminal state (cured/built/blocked/false_positive) before the session can end
- **Declare CERTIFIED with open findings** — certification requires ALL operate+construct findings resolved AND Argus convergence (two flat cycles)
- **Accept a session without artifacts** — every god MUST produce its mandatory deliverables (exam, report, feedback for Argus; post-op, journals, feedback for Asclepius; post-construction, journals, feedback for Hefesto). The engine logs `[ARTIFACT GAP]` warnings — these are not informational, they indicate an incomplete execution that must be remediated before certification
- **Certify without closing specs** — CERTIFIED sessions MUST transition the associated spec check and ALL children (phases, tasks) to `completed`. If the spec tree is not closed, the certification is incomplete. This is not optional — undocumented completion does not exist
