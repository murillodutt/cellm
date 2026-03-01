---
description: Design System Engine — injects project-specific design decisions before UI work. Activates on .vue files to ensure project tokens, patterns, and compositions override framework defaults.
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

## Rules

- **decisions[] are hard constraints** — not suggestions, not defaults
- **Search before styling** — never guess colors, spacing, or composition
- **avoid rules are blockers** — if DSE says avoid, do not use
- **All UI goes through DSE** — no exceptions for "simple" components
