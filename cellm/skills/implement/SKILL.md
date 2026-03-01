---
description: Implement code from spec context in the database. Loads spec tree, picks next pending task, writes code, transitions state on completion.
argument-hint: "[task description or check title]"
allowed-tools: mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_create_node, Read, Grep, Glob, Write, Edit, Bash(npx *), Bash(bun *), AskUserQuestion
---

# Implementation Thinking — Before Writing Code

Context lives in the database. Load it before touching any file.

## Framework

1. **Load** — `spec_get_tree` for the check. Absorb check briefing (context/problem/principle), phases, tasks.
   For the current phase: read `body.briefing` (objective, successCriteria, keyFiles, constraints) and `body.specialist` (role, focus, tools). Adopt the specialist persona and respect phase constraints throughout.
2. **Pick** — First pending task in dependency order. Transition to `started`.
3. **Reuse** — Search codebase first. >= 70% match = extend, don't duplicate.
4. **Implement** — Write code. Follow project patterns and rules.
5. **Close** — Typecheck passes → `spec_transition(completed)`. Fails → fix or `spec_transition(failed)`. Discovery → `spec_create_node(nodeType: "gap")`.

## Framework Conventions (Nuxt)

- `app/composables/` and `app/utils/` are **auto-imported** by Nuxt. NEVER add runtime imports for these — only `import type` for TypeScript types.
- Call composables directly: `const { data } = useFetch(...)` — no import statement needed.
- Same applies to Vue APIs (`ref`, `computed`, `watch`) — auto-imported by Nuxt.
- If unsure whether a module is auto-imported, check `nuxt.config.ts` imports section or `.nuxt/types/imports.d.ts`.

## NEVER

- **Code without spec context** — always `spec_get_tree` first
- **Forget state transitions** — started before, completed/failed after
- **Swallow discoveries** — unexpected findings become gap nodes
- **Skip typecheck** — `npx tsc --noEmit` or `npx nuxt typecheck` before completing
- **Non-English spec content** — gap and decision node titles/descriptions must be in English
