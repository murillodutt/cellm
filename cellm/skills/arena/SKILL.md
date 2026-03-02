---
description: Run ARENA quality checks for any Node.js/Bun project. Detects test runner, runs test suites, typecheck, and health verification with trend reporting via Oracle.
user-invocable: true
argument-hint: "[scope]: all | labs | typecheck | health | file <path> | debug <error>"
allowed-tools: Bash(bun test *), Bash(npx *), Bash(curl *), Bash(cd *), Bash(timeout *), Bash(find *), Read, Grep
context: fork
---

Quality checks for Node.js/Bun projects. Detect tooling automatically from `package.json`.

## Setup Detection

**Project root:** `git rev-parse --show-toplevel`

**Test runner:** Read package.json → vitest (`npx vitest run`) | jest (`npx jest`) | bun (`bun test`) | script (`npm test`) | none (skip).

**Typecheck:** nuxt.config.ts → `npx nuxt typecheck` | tsconfig.json → `npx tsc --noEmit` | neither → skip.

**Oracle:** `curl -sf --max-time 2 http://127.0.0.1:31415/health` → online/offline.

## Scope Routing

| Argument | Action |
|----------|--------|
| (empty) / `all` | Tests + typecheck + health (sequential) |
| `labs` | Find `*-arena.test.ts` files, run only those |
| `typecheck` | TypeScript only |
| `health` | Oracle endpoints: `/health`, `/api/ai-status`, `/api/arena/pending` |
| `file <path>` | Grep for test files referencing basename, run matches |
| `pre-commit` | Run pre-commit pipeline: validate.sh + lint:md + quality_gate(typecheck) + quality_gate(tests) |
| `debug <error>` | Delegate to `/cellm:arena-debug` — stop here |

## Reporting

```
[+] Tests: 42 passed (0 failed) [vitest]
[-] Typecheck: 3 errors
[+] Health: all endpoints responding
```

## Post-Run (Oracle online only)

1. `POST /api/arena/ingest` — ingest snapshots
2. `GET /api/arena/trends` — if available, append diagnostic: stable (delta -10..+5), improving (>+5), regression (<-10, use `[!]`), first-run.

## On Failure

Read failing test + source file → analyze root cause → propose fix → ask before applying.

## NEVER

- **Skip runner detection** — always detect from package.json
- **Silent Oracle failures** — skip silently if offline, never block
