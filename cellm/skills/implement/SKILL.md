---
description: Generate code from a specification or direct instruction. Reads spec context, checks for reusable code, implements following project patterns, and self-reviews for rule compliance.
argument-hint: "[task description or spec-folder-path]"
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(npx *), Bash(bun *), AskUserQuestion
---

Spec folder path → implement next pending task. Direct description → implement directly. No argument → ask.

## Thinking Framework

1. **Absorb** — Read spec.md + tasks.md + patterns.md, or parse description + search codebase.
2. **Reuse** — Search shared/, composables/, components/, server/utils/. >= 70% match = reuse/extend.
3. **Constrain** — Load `cellm-core/patterns/core/` + `anti/` (always).
4. **Implement** — Write code.
5. **Self-review** — Typecheck: `npx tsc --noEmit` or `npx nuxt typecheck`. Update tasks.md if applicable.

## Mandatory Rules

| Rule | Constraint |
|------|-----------|
| No `any` | Use specific type or `unknown` |
| No hardcoded colors | Semantic tokens only |
| No sync I/O | async/await |
| Composition API | `<script setup lang="ts">` |
| Code limits | 1000 lines/file, 50/function |
| Error handling | try/catch on every async op |
| Return types | Explicit on every function |

## NEVER

- **`any` type** — use specific types or `unknown` with guards
- **Hardcode colors** — semantic tokens only
- **Create without reuse check** — search first, >= 70% = reuse
- **Exceed limits** — 1000 lines/file, 50/function
- **Skip error handling** — every async op needs try/catch
- **Options API** — always `<script setup lang="ts">`
