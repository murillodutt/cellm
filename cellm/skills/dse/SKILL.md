---
name: dse
description: |
  Design System Engine — project-specific design decisions and context routing.
  Use when: creating or editing UI components.
  Triggers: .vue files, styling, component composition.
paths:
  - "**/*.vue"
allowed-tools: Read, Grep, Glob, Edit, Write
model: inherit
---

# Design System Engine

This project has a Design System with project-specific decisions: tokens, patterns, compositions, and avoid rules. These decisions override generic framework defaults.

## Before Creating or Editing UI

1. Call `dse_search` with your intent (e.g. "card layout", "badge styling", "kpi metrics")
2. Apply the returned patterns, compositions, and avoid rules
3. For component API (props, slots, events), use the appropriate MCP tool

## Where to Find Answers

| Question | Source |
|----------|--------|
| How does THIS project compose UI? | MCP `dse_search("your context")` |
| Component API (props, slots)? | MCP `nuxt-ui-remote` or `context7` |
| Framework patterns (SSR, routing)? | MCP `nuxt-remote` |
| Library reference (Tailwind, Pinia)? | MCP `context7` |

## Rules

1. Project decisions from `dse_search` take priority over generic patterns
2. Never guess styling — search first, then compose
3. Respect `avoid` rules returned by the DSE
4. If `dse_search` returns nothing, use framework defaults
