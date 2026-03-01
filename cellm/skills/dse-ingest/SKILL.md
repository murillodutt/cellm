---
description: Ingest design decisions into the DSE from conversation context. Use when the user describes project-specific design choices, color palettes, component patterns, or UI constraints that should persist as DSE decisions.
user-invocable: true
---

# DSE Ingest

Extract design decisions from conversation and persist them in the DSE.

## Workflow

1. **Identify** — scan conversation for design decisions (colors, spacing, component choices, layout patterns, avoid rules)
2. **Classify** — map each decision to DSE entity type (token, component, pattern, composition)
3. **Search existing** — `dse_search` to check if entity already exists
4. **Update or create** — use `POST /api/design-system/update` to patch the active preset with new decisions[]
5. **Verify** — `dse_search` again to confirm decisions are indexed

## Decision Types

| Type | Example Decision |
|------|-----------------|
| Token | "Primary color is indigo-500 because it matches the brand" |
| Component | "Badges always use soft variant for consistency" |
| Pattern | "All forms use inline validation, never submit-time" |
| Composition | "Dashboard cards use 3-column grid on desktop, stack on mobile" |

## Format

Each decision is a plain English string in `decisions[]`:
- Concise (1 sentence)
- Actionable (tells the agent what to do)
- Project-specific (not generic framework knowledge)

## Examples

```
"Use indigo-500 as primary because it matches the Figma brand kit"
"Badge components always use soft variant, never solid"
"KPI cards: 3-column grid, each card has icon + metric + trend"
```
