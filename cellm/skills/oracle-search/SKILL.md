---
description: "Search CELLM Oracle context and observations using semantic vector search. Uses 3-layer retrieval (search index, timeline context, full observations) to minimize tokens. Use when: 'search oracle', 'find in observations', 'oracle search for X'."
cellm_scope: universal
user-invocable: true
argument-hint: "query: your search query"
allowed-tools: mcp__plugin_cellm_cellm-oracle__context_preflight, mcp__plugin_cellm_cellm-oracle__search, mcp__plugin_cellm_cellm-oracle__timeline, mcp__plugin_cellm_cellm-oracle__get_observations
context: fork
background: true
agent: Explore
---

Run Oracle retrieval with SCE-first routing and progressive depth.

## Intent

- Find relevant observations with minimum retrieval cost.
- Escalate only when shallow layers are insufficient.

## Policy

- `context_preflight` is mandatory first layer.
- Retrieval depth is progressive: index -> timeline -> full observations.
- Do not jump directly to full payload unless required.

## Routing

1. `context_preflight(projectKey, intentTags, paths?)`.
2. `search(query, project, limit)` using SCE hints.
3. `timeline(anchor, before, after)` when additional context is required.
4. `get_observations(ids)` only for selected records needing full detail.

## NEVER

- **Skip SCE preflight** — preflight is mandatory before retrieval layers
- **Skip Layer 1** — always search index first after preflight
- **Fetch all observations** — only escalate to Layer 3 for specific IDs
