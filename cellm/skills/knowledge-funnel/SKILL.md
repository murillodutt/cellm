---
description: Passive CELLM knowledge classifier — routes mid-task discoveries to EPHEMERAL, REUSABLE, or ARCHITECTURAL before moving on. Activates when encountering insights, gotchas, decisions, or non-obvious behavior during any work.
user-invocable: false
---

# Knowledge Routing — Before Moving On

When you discover something non-obvious, classify before continuing:

| Signal | Category | Action |
|--------|----------|--------|
| Session context, temp status, failed attempt without insight | EPHEMERAL | Continue — do not capture |
| "X doesn't work as expected", workaround, gotcha, strategy | REUSABLE | `record_expertise` |
| Design decision, system-level change, new convention | ARCHITECTURAL | `record_observation` + `record_expertise` |

## MCP Routing

| Category | Tool | Parameters |
|----------|------|------------|
| REUSABLE discovery | `record_expertise` | entry_type: `finding`, domain: auto-detect |
| REUSABLE gotcha | `record_expertise` | entry_type: `anti_pattern` |
| REUSABLE strategy | `record_expertise` | entry_type: `strategy` |
| ARCHITECTURAL | `record_observation` | type: `decision` or `discovery` |
| ARCHITECTURAL | `record_expertise` | entry_type: `insight` |

## Trigger Signals by Category

| Category | Signals |
|----------|---------|
| REUSABLE | "X doesn't work as expected", "the fix was Y", "the correct pattern is Z", "docs say W but actual behavior is V", workaround discovered, gotcha confirmed across files |
| ARCHITECTURAL | "We decided to change from A to B", "this component needs redesign", "platform limitation affects the design", new convention established, migration path chosen |
| EPHEMERAL | Task progress updates, temp debugging state, failed attempts without insight, routine file edits, status checks |

## NEVER

- **Let a discovery die unclassified** — if you learned something reusable, capture it
- **Capture ephemeral context** — session progress, temp state, and routine edits are noise
- **Duplicate existing knowledge** — `record_expertise` deduplicates automatically, trust it
- **Block work to capture** — classify inline, call MCP, continue working
