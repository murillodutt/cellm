---
description: "Refresh the project's convention index by persisting entries to Oracle knowledge atoms. Use when: 'rebuild index', 'summarize conventions', 'refresh pattern index'."
cellm_scope: universal
user-invocable: true
argument-hint: "[scope]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__context_preflight, mcp__plugin_cellm_cellm-oracle__knowledge_add, mcp__plugin_cellm_cellm-oracle__knowledge_search, mcp__plugin_cellm_cellm-oracle__knowledge_archive, Read, Grep, Glob, AskUserQuestion
---

# index

Thin skill contract:

1. Intent
- Refresh the convention index for the current project by delegating all persistence to Oracle.
- Keep each indexed entry short, factual, and evidence-backed.

2. Policy
- Never write to disk. All index entries live as knowledge atoms with `source: "index"` and `scope: "pattern"`.
- Deduplicate via `knowledge_search` before calling `knowledge_add` on a new entry.
- Archive atoms whose source evidence no longer exists via `knowledge_archive`.

3. Routing
- Scope shaping: `context_preflight` + optional user-provided focus argument.
- Evidence extraction: read project files via Read/Grep/Glob to discover conventions.
- Persistence: call `knowledge_add` per entry. Query existing entries via `knowledge_search` before adding to avoid duplicates.
- Cleanup: for each existing atom whose evidence is gone, call `knowledge_archive`.

## NEVER

- Write index files to disk. Persistence is Oracle-only.
- Generate multi-paragraph entries. One factual line per atom, max.
- Skip dedup via `knowledge_search` before `knowledge_add`.
- Leave stale atoms when their source evidence was removed.
