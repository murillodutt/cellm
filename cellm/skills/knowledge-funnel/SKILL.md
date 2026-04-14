---
description: Passive CELLM knowledge classifier — routes mid-task discoveries to EPHEMERAL, REUSABLE, or ARCHITECTURAL before moving on. Activates when encountering insights, gotchas, decisions, or non-obvious behavior during any work.
cellm_scope: universal
user-invocable: false
allowed-tools: mcp__plugin_cellm_cellm-oracle__knowledge_add, mcp__plugin_cellm_cellm-oracle__context_record_outcome, mcp__plugin_cellm_cellm-oracle__context_promote, mcp__plugin_cellm_cellm-oracle__record_expertise, mcp__plugin_cellm_cellm-oracle__record_observation
---

# Knowledge Routing — Before Moving On

Classify discoveries and route only reusable/systemic signals to the SCE learning loop.

## Intent

- Prevent loss of high-value discoveries during execution.
- Keep ephemeral noise out of memory stores.
- **Actively persist reusable insights via `knowledge_add`** — not just expertise and observations.

## Policy

- Classify into `EPHEMERAL`, `REUSABLE`, `ARCHITECTURAL`.
- Use `knowledge_add` for reusable atomic facts that benefit future sessions.
- Use `context_record_outcome` for reusable/architectural outcomes.
- Promote evidence only when confidence and repetition justify it (`context_promote`).

## When to call knowledge_add

Call `knowledge_add` when you encounter any of these during work:

| Trigger | Example |
|---------|---------|
| Non-obvious behavior discovered | "libsql requires explicit `readYourWrites: true` for WAL mode consistency" |
| Gotcha resolved after debugging | "bun:sqlite `readonly: false` is not valid — omit the option instead" |
| Pattern confirmed across sessions | "FTS corruption on UPDATE requires try/catch with autoRepairFts" |
| Cross-session insight | "spec_create_node rejects `dependsOnPhase: null` — omit the field" |
| API contract nuance | "knowledge_add MCP deduplicates by title+scope+project — returns existing ID" |
| Architecture decision recorded | "hookGenerateKnowledgeAtoms is a no-op — atoms come from expertise + dot23 + MCP" |

### Example calls

```
knowledge_add({
  title: "bun:sqlite Database constructor rejects readonly:false — omit option for read-write",
  scope: "oracle",
  project: "<project-name>",
  source: "session",
  detail: "Bun v1.3.10 throws SQLITE_MISUSE when readonly:false is passed. Use new Database(path) without options for read-write.",
  confidence: 0.9
})

knowledge_add({
  title: "spec_create_node approval gate rejects phases under pending checks",
  scope: "oracle",
  project: "<project-name>",
  source: "session",
  detail: "CHECK_NOT_APPROVED error when adding phase/task under a check in pending/cancelled/deferred/failed state. Transition to active first.",
  confidence: 0.95
})
```

### When NOT to call knowledge_add

- Routine edits, file reads, or standard operations
- Information already captured in this session's expertise
- Temporary state or progress updates
- Facts specific to one session with no reuse value

## Routing

1. `EPHEMERAL`: continue work, no persistent write.
2. `REUSABLE`: **`knowledge_add`** (atomic fact) + `context_record_outcome` + `record_expertise`.
3. `ARCHITECTURAL`: `knowledge_add` + `record_observation` + `record_expertise` + `context_record_outcome`.
4. Periodically run `context_promote` for evidence-based progression.

## NEVER

- **Let a discovery die unclassified** — if you learned something reusable, capture it
- **Capture ephemeral context** — session progress, temp state, and routine edits are noise
- **Duplicate existing knowledge** — `knowledge_add` deduplicates automatically by title+scope+project
- **Skip SCE write-back** — reusable/architectural signals must go through `context_record_outcome`
- **Block work to capture** — classify inline, call MCP, continue working
- **Skip `knowledge_add` for REUSABLE discoveries** — expertise alone is not searchable cross-session; atoms are
