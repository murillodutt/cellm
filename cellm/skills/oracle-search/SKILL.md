---
description: Search Oracle context and observations using semantic vector search. Uses a 3-layer retrieval pattern (search index, timeline context, full observations) to minimize token usage.
user-invocable: true
argument-hint: "query: your search query"
allowed-tools: mcp__cellm-oracle__search, mcp__cellm-oracle__timeline, mcp__cellm-oracle__get_observations
context: fork
agent: Explore
---

3-layer retrieval pattern — escalate depth only as needed to minimize tokens.

## Layers

| Layer | Tool | Tokens/result | Use when |
|-------|------|---------------|----------|
| 1. Index | `search(query, limit: 20, project)` | ~50-100 | Always start here |
| 2. Timeline | `timeline(anchor: <id>, depth_before: 5, depth_after: 5)` | ~200-300 | Need surrounding context |
| 3. Full | `get_observations(ids: [...])` | ~500-1000 | Need complete content |

## Filters

| Parameter | Options |
|-----------|---------|
| type | bugfix, feature, refactor, change, discovery, decision |
| project | Filter by project name |
| dateStart/dateEnd | Date range |

## NEVER

- **Skip Layer 1** — always search index first
- **Fetch all observations** — only escalate to Layer 3 for specific IDs
