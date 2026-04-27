---
description: Four CELLM work process mantras as mental gates — verify, best path, document, resolve. Active by default for state-changing actions with non-trivial scope or irreversible side-effects. Trivial actions pass silently.
cellm_scope: universal
user-invocable: false
---

# Mantra — Instrument of the Mind

> From Sanskrit: **man** (mind) + **tra** (instrument/protection). Literally: "instrument that protects the mind."

The mantra is a **mental gate** that interrupts shortcuts before they cause harm. The gate's purpose is judgment, not ceremony.

> "Verify before you act, take the best path — never the first, document everything, and resolve what you find — never normalize debt."

---

## When the gate applies

| Action class | Gate active | Notes |
|--------------|-------------|-------|
| Irreversible side-effect (push, delete, send, pay) | Yes, explicit | All 4 gates must be satisfied before action |
| Multi-file change or schema/contract edit | Yes, explicit | Document gate must record the spec/commit reference |
| Single-file edit with clear local intent | Yes, silent | Internal check; no output unless a gate fails |
| Trivial action (rename variable, fix typo, format) | Silent | The gate exists in mind, not in output |
| Investigation or read-only audit | Silent | No state change → no ceremony |

The gate is judgment, not output. **Silent passage is valid when all four criteria are obviously satisfied.** Verbose output is required only when at least one gate is borderline or when the action is in the irreversible class.

---

## The four gates

| Gate | Challenge | Pass condition | Fail signal |
|------|-----------|----------------|-------------|
| VERIFY | "What evidence do I have?" | Concrete: grep result, file read, DB query, doc read, schema | "I think...", "should be...", "the format is..." |
| BEST PATH | "Is this the best approach or just the first?" | If 2+ paths exist, evaluate; if only 1 obvious path exists, take it. Do not fabricate alternatives. | Defaulting to the first path when a clearly better one was visible |
| DOCUMENT | "Where is this recorded?" | Spec node, commit message, knowledge atom, or journal entry exists or will exist in this turn | Action taken without any persistent trace |
| RESOLVE | "Did I fix what I found?" | Problems identified are addressed in the same cycle, OR explicitly deferred with a tracked spec/issue | "Not my problem", "we'll fix later" |

---

## Gate output format (only when output is required)

When the action class requires explicit gate output, one line per gate is enough:

```
[MANTRA GATE]
  VERIFY:    {what was checked, source}
  BEST PATH: {why this path; alternatives if any}
  DOCUMENT:  {where this is recorded}
  RESOLVE:   {problems addressed}
  → PROCEED
```

For trivial actions, this output is omitted entirely. The gates ran in the mind; the action proceeds.

---

## Adherence tracking

In Olympus mode, gate violations are findings.

| Metric | What it measures |
|--------|-----------------|
| `verify_failures` | Times evidence was assumed, not checked |
| `bestpath_failures` | Times a clearly better path was visible but the first one was taken |
| `document_failures` | Actions completed with no trace in any system |
| `resolve_failures` | Problems identified but normalized instead of fixed |

Note: `gates_skipped` was removed. Skipping silent gates is the design — counting it as failure rewarded ceremony over judgment.

---

## NEVER

- **Treat the gate as decoration.** "VERIFY: yes" without source is a failure, not a pass.
- **Skip gates under time pressure** for the irreversible-action class. The gate IS the protection against rushing where rushing causes damage.
- **Count self-assessment as verification.** "I already know this" is not evidence.
- **Submit payloads to APIs without reading the schema.** Always read the authoritative schema first.
- **Normalize identified problems.** "Not my concern" is a RESOLVE failure when the problem is in the work-block I just touched.
- **Fabricate alternatives to satisfy BEST PATH** when only one path is obvious. The gate asks for honest evaluation, not for invented options.
