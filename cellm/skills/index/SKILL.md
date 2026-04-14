---
description: "Create a compact convention index from current project evidence and Oracle-backed knowledge. Use when: 'rebuild index', 'summarize conventions', 'refresh pattern index'."
cellm_scope: universal
user-invocable: true
argument-hint: "[scope]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__context_preflight, mcp__plugin_cellm_cellm-oracle__knowledge_add, Read, Grep, Glob, Write, Edit, AskUserQuestion
---

# index

Thin skill contract:

1. Intent
- Build or refresh a concise, searchable convention index for the current project.
- Keep index format portable and repository-local.

2. Policy
- Prefer project-local index location (`.cellm/patterns/index.yml`) when writing files.
- Keep every index line short, factual, and evidence-backed.
- Use Oracle persistence to record the index refresh outcome.

3. Routing
- Scope shaping: `context_preflight` + user-provided focus.
- Evidence extraction: inspect existing convention docs/files in the repo.
- Output: write/update `.cellm/patterns/index.yml` and persist summary via `knowledge_add`.

## NEVER

- Depend on repository-specific legacy paths.
- Generate multi-paragraph index entries.
- Keep stale entries when source evidence no longer exists.
