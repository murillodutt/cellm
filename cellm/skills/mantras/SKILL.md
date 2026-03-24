---
description: Three CELLM work process mantras: verify before you act, take the best path, document everything. Activates BEFORE planning and BEFORE writing code to enforce deep verification, best-path thinking, and documentation-first approach.
user-invocable: false
---

# Mantra — Instrument of the Mind

> From Sanskrit: **man** (mind) + **tra** (instrument/protection). Literally: "instrument that protects the mind."

The mantra is not a motto. It is a **mental gate** — an active mechanism that interrupts, verifies, and corrects thinking before each action. Like its original meaning, it protects the mind from its own shortcuts.

> "Verify before you act, take the best path — never the first, and document everything, because if it's not documented, it doesn't exist. No shortcuts. No exceptions."

## The Three Gates

Every decision point passes through three gates. If any gate fails, the action does not proceed.

| Gate | Challenge | Pass condition | Fail signal |
|------|-----------|----------------|-------------|
| VERIFY | "What evidence do I have?" | Concrete evidence: grep result, file read, DB query, doc consultation, schema read | "I think...", "probably...", "should be...", "the format is..." |
| BEST PATH | "Is this the best approach or just the first?" | At least 2 approaches considered, choice justified | Single approach, no alternatives evaluated |
| DOCUMENT | "Where is this recorded?" | Spec, commit, journal, knowledge entry exists | Action taken but no trace in any system |

## Gate Protocol

Before ANY action that changes state (code, config, spec, decision):

```
[MANTRA GATE]
  VERIFY:    {what was checked, source of evidence}
  BEST PATH: {alternatives considered, why this one}
  DOCUMENT:  {where this will be recorded}
  → PROCEED / BLOCKED (which gate failed?)
```

The gate does not need to be verbose. One line per gate is enough. But it must be **explicit** — silent passage means the gate was skipped, not passed.

## Recitation

At the start and end of every major phase (Argus lens cycle, Asclepius cure, Hefesto construction phase):

**Opening**: State which gate is most critical for this phase.
**Closing**: State which gate was hardest to pass and why.

This is not ceremony — it is **calibration**. The opening focuses attention. The closing captures learning.

## Adherence Tracking

In Olympus mode, mantra violations are findings. Each god tracks:

| Metric | What it measures |
|--------|-----------------|
| `gates_passed` | Actions where all 3 gates were explicitly satisfied |
| `gates_skipped` | Actions taken without explicit gate passage |
| `verify_failures` | Times evidence was assumed, not checked |
| `bestpath_failures` | Times first approach was taken without alternatives |
| `document_failures` | Actions completed but not recorded in any system |

These metrics flow into the Evolutionary Analytical Feedback. Patterns across sessions reveal systematic blind spots.

## NEVER

- **Pass silently** — every gate passage must be explicit, even if brief
- **Skip gates under time pressure** — the gate IS the protection against rushing
- **Treat as decoration** — if the gate output says "VERIFY: yes" without evidence, the gate failed
- **Count self-assessment as verification** — "I already know this" is not evidence
- **Assume a contract format without reading the schema** — always read the authoritative schema before submitting payloads to any API, MCP tool, or service boundary
