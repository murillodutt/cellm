---
description: Design System Engine — routes UI decisions to project-specific tokens, patterns, and compositions. Activates on .vue files to ensure project design decisions override generic framework defaults.
paths:
  - "**/*.vue"
user-invocable: false
---

Before creating or editing any UI component, call **`dse_search`** with your intent (e.g. "card layout", "badge styling", "kpi metrics"). Apply the returned tokens, patterns, compositions, and avoid rules. Project decisions from DSE **take priority** over generic framework defaults.

| Question | Source |
|----------|--------|
| How does THIS project compose UI? | MCP `dse_search("your context")` |
| Component API (props, slots, events)? | MCP `nuxt-ui-remote` or `context7` |
| Framework patterns (SSR, routing)? | MCP `nuxt-remote` |
| Library reference (Tailwind, Pinia)? | MCP `context7` |

## NEVER

- **Guess styling** — search DSE first, then compose
- **Ignore avoid rules** — DSE avoid rules are hard constraints, not suggestions
- **Override project tokens** — if DSE returns a token, use it over framework defaults
- **Skip DSE for "simple" components** — all UI goes through DSE, no exceptions
