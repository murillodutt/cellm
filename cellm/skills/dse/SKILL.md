---
description: CELLM Design System Engine — injects project-specific design decisions before UI work. Activates on .vue files to ensure project tokens, patterns, and compositions override framework defaults. Use when creating or editing UI components to check DSE decisions first.
user-invocable: false
---

Before creating or editing any UI component, retrieve this project's design decisions:

1. **`dse_search("your intent")`** — find relevant tokens, patterns, compositions
2. **`dse_get([ids])`** — fetch full payload with decisions[]

Each entity may include `decisions[]` — project-specific constraints that MUST be followed. These override generic framework defaults.

| Question | Source |
|----------|--------|
| Project design decisions? | MCP `dse_search("context")` then `dse_get([ids])` |
| Component API (props, slots)? | MCP `nuxt-ui-remote` or `context7` |
| Framework patterns? | MCP `nuxt-remote` |

## Decision Format (ATOM)

Decisions follow intent + snapshot: `"[INTENT] (currently [IMPLEMENTATION])"`.
- The **intent** (before parenthetical) is the permanent design constraint
- The **snapshot** (in parenthetical) is the current implementation — may change with framework versions
- Follow the intent. Use the snapshot as the current implementation guide.

## Rules

- **decisions[] are hard constraints** — not suggestions, not defaults
- **Intent over snapshot** — if intent and snapshot conflict, intent wins
- **Search before styling** — never guess colors, spacing, or composition
- **avoid rules are blockers** — if DSE says avoid, do not use
- **All UI goes through DSE** — no exceptions for "simple" components
- **L2 only** — DSE holds project decisions. Framework knowledge (L1) comes from Nuxt UI MCP, not DSE
