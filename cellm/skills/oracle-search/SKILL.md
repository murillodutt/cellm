---
name: oracle-search
description: Search Oracle context and observations using semantic search
argument-hint: "query: your search query"
allowed-tools: mcp__cellm-oracle__search, mcp__cellm-oracle__timeline, mcp__cellm-oracle__get_observations
model: inherit
---

# Oracle Search Skill

Search through CELLM Oracle observations and context using semantic vector search.

## When to Use

- Finding past work, decisions, or discoveries
- Looking for context about a specific topic
- Retrieving implementation details from previous sessions

## How to Search

Use the MCP tools in this order (3-layer retrieval pattern):

### Layer 1: Search (Index)

Get compact results with IDs (~50-100 tokens per result):

```
mcp__cellm-oracle__search({
  query: "your search query",
  limit: 20,
  project: "cellm-private"
})
```

### Layer 2: Timeline (Context)

Get observations around a specific result:

```
mcp__cellm-oracle__timeline({
  anchor: 123,  // ID from search
  depth_before: 5,
  depth_after: 5
})
```

### Layer 3: Get Observations (Full Details)

Get complete observation content:

```
mcp__cellm-oracle__get_observations({
  ids: [123, 124, 125]
})
```

## Search Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| query | Natural language search query | Required |
| limit | Max results to return | 20 |
| project | Project filter | Current project |
| type | Filter by type (bugfix, feature, etc) | All |
| dateStart | Filter by start date | None |
| dateEnd | Filter by end date | None |

## Observation Types

| Type | Icon | Description |
|------|------|-------------|
| bugfix | 🔴 | Bug fixes and error resolution |
| feature | 🟣 | New features implemented |
| refactor | 🔄 | Code refactoring work |
| change | ✅ | General changes |
| discovery | 🔵 | Learnings and discoveries |
| decision | ⚖️ | Architectural decisions |

## Token Economy

The 3-layer pattern saves tokens:

1. **Search** returns index (~50-100 tokens/result)
2. **Timeline** adds context (~200-300 tokens/entry)
3. **Get Observations** provides full details (~500-1000 tokens/result)

Only fetch what you need to minimize context usage.

## Examples

### Find recent bugfixes

```
search({ query: "bug fix error", type: ["bugfix"], limit: 10 })
```

### Get context around a decision

```
timeline({ query: "architecture decision", depth_before: 3, depth_after: 3 })
```

### Retrieve specific observations

```
get_observations({ ids: [42, 43, 44] })
```
