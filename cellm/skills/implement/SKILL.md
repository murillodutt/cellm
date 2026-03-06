---
description: Implement code from spec context in the database. Loads spec tree, picks next pending task, writes code, transitions state on completion.
user-invocable: true
argument-hint: "[task description or check title]"
allowed-tools: mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_create_node, mcp__plugin_cellm_cellm-oracle__quality_gate, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, Read, Grep, Glob, Write, Edit, Bash(npx *), Bash(bun *), AskUserQuestion
---

# Implementation Thinking — Before Writing Code

Context lives in the database. Load it before touching any file.

## Framework

1. **Load** — `spec_get_tree` for the check. Absorb check briefing (context/problem/principle), phases, tasks.
   For the current phase: read `body.briefing` (objective, successCriteria, keyFiles, constraints) and `body.specialist` (role, focus, tools). Adopt the specialist persona and respect phase constraints throughout.
   **Guild adoption**: If `specialist.role` is `"frontend"`, engage GDU Framework (DSE cascade, semantic tokens, Nuxt UI MCP contracts). If `"backend"`, enforce Drizzle patterns and Zod boundary validation. If `"database"`, enforce migration safety and index strategy.
2. **DSE** — `dse_search` for task-relevant design decisions (layout, components, patterns, breakpoints). Absorb `avoid` rules and `decisions[]` before writing any code. If DSE has an existing component for what the task describes, use it — do not create a new one.
3. **Pick** — First pending task in dependency order. `spec_transition(event: "started")` to activate.
4. **Start** — `spec_transition(event: "started")` again to mark in_progress. (Or call `completed` directly — the service auto-chains through intermediate states.)
5. **Reuse** — Search codebase first. >= 70% match = extend, don't duplicate.
6. **Implement** — Write code. Follow project patterns, rules, and DSE decisions.
7. **Close** — `quality_gate({ scope: 'typecheck' })` passes → `spec_transition(event: "completed")`. Fails → fix errors and re-run. Still failing → `spec_transition(event: "failed")`. Discovery → `spec_create_node(nodeType: "gap")`.

## Framework Conventions (Nuxt)

- `app/composables/` and `app/utils/` are **auto-imported** by Nuxt. NEVER add runtime imports for these — only `import type` for TypeScript types.
- Call composables directly: `const { data } = useFetch(...)` — no import statement needed.
- Same applies to Vue APIs (`ref`, `computed`, `watch`) — auto-imported by Nuxt.
- If unsure whether a module is auto-imported, check `nuxt.config.ts` imports section or `.nuxt/types/imports.d.ts`.

## NEVER

- **Code without spec context** — always `spec_get_tree` first
- **Code without DSE context** — always `dse_search` for relevant decisions before creating UI components, choosing layout, or picking breakpoints
- **Forget state transitions** — `started` to activate, `started` again for in_progress, `completed`/`failed` to close. Auto-chain supported: calling `completed` from `pending` or `active` resolves intermediate hops automatically.
- **Swallow discoveries** — unexpected findings become gap nodes
- **Skip typecheck** — `quality_gate({ scope: 'typecheck' })` before completing (fallback: `npx nuxt typecheck` or `npx tsc --noEmit` if Oracle offline)
- **Non-English spec content** — gap and decision node titles/descriptions must be in English
