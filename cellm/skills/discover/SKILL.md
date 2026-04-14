---
description: "Discover reusable project conventions and persist them as Oracle knowledge atoms. Use when: 'discover patterns', 'extract conventions', 'what should newcomers know here'."
cellm_scope: universal
user-invocable: true
argument-hint: "[focus area]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__context_preflight, mcp__plugin_cellm_cellm-oracle__knowledge_add, mcp__plugin_cellm_cellm-oracle__context_record_outcome, Read, Grep, Glob, AskUserQuestion
---

# discover

Thin skill contract:

1. Intent
- Identify non-obvious, opinionated, reusable conventions in the current project.
- Convert discoveries into durable Oracle knowledge atoms.

2. Policy
- Start with `context_preflight` to constrain scope and reduce noise.
- Ask one focused question at a time; never batch interviews.
- Persist only reusable discoveries via `knowledge_add`.

3. Routing
- Evidence collection: local tools (`Read`, `Grep`, `Glob`) over representative files.
- Discovery loop: AskUserQuestion for focus, rationale, and validation.
- Persistence: `knowledge_add` for each accepted convention + `context_record_outcome` summary.

## NEVER

- Hardcode repository-specific directories.
- Persist low-confidence or ephemeral notes.
- Skip rationale capture before persistence.
